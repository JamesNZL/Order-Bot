'use strict';

const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const Order = require('../models/order');

const { sendDM, updateOrder } = require('../handlers');
const { parseSerial } = require('../modules');

const pendingInput = new Set();

module.exports = {
	events: ['messageReactionAdd'],
	process: [],
	async execute(_, reaction, user) {
		const { bot } = require('../');

		if (user.bot) return;

		if (reaction.partial) await reaction.fetch();

		if (!config.admin.ids.includes(user.id) && !config.emojis.vendor.includes(reaction.emoji.name)) return reaction.users.remove(user.id);

		switch (reaction.emoji.name) {

		case config.emojis.onward: {
			if (reaction.message.channel.name === config.vendor.available.name || reaction.message.channel.name === config.vendor.problems.name) {
				processReaction(bot, reaction.message, config.vendor.processing.name, 'update', 'BLUE', true);
			}

			else if (reaction.message.channel.name === config.vendor.processing.name) processReaction(bot, reaction.message, config.vendor.completed.name, 'completed', 'GREEN', true);

			break;
		}

		case config.emojis.comment: {
			userInput(bot, user, reaction.message, 'Annotating', 'Comments');
			reaction.users.remove(user.id);
			break;
		}

		case config.emojis.problem: {
			processReaction(bot, reaction.message, config.vendor.problems.name, 'update', 'RED', true);
			break;
		}

		case config.emojis.reverse: {
			if (reaction.message.channel.name === config.vendor.completed.name) processReaction(bot, reaction.message, config.vendor.processing.name, 'reverse', 'BLUE', true);

			else if (reaction.message.channel.name === config.vendor.processing.name) processReaction(bot, reaction.message, config.vendor.available.name, 'update', 'GOLD', true);

			break;
		}

		case config.emojis.edit: {
			userInput(bot, user, reaction.message, 'Amending', 'Amendments');
			reaction.users.remove(user.id);
			break;
		}

		case config.emojis.delete: {
			reaction.message.delete();
			updateOrder(reaction.message, true);
			forwardMaster(bot, reaction.message, 'delete');
		}
		}
	},
};

const processReaction = async (bot, msg, newChannel, action, colour, remove) => {
	const _msg = await forwardToVendor(findVendorChannel(bot, msg, newChannel), msg, colour, remove);
	forwardMaster(bot, _msg, action, colour);
};

const findVendorChannel = (bot, msg, name) => bot.channels.cache.find(channel => channel.parentID === msg.channel.parentID && channel.name === name);

const forwardToVendor = async (channel, msg, colour, remove) => {
	if (remove) msg.delete();
	return await channel.send(new Discord.MessageEmbed(msg.embeds[0]).setColor(colour));
};

const forwardMaster = async (bot, msg, action, colour) => {
	switch (action) {

	case 'completed': {
		processMaster(bot, msg, config.master.completed.id);
		break;
	}

	case 'reverse': {
		processMaster(bot, msg, config.master.active.id);
		break;
	}

	case 'delete': {
		processMaster(bot, msg, config.master.deleted.id, true);
		break;
	}

	case 'update': {
		const order = await Order.findOne({ 'guild.id': msg.guild.id, 'serial': parseSerial(msg) });

		bot.channels.cache.get(order.master.message.channel.id).messages.fetch(order.master.message.id).then(_msg => {
			_msg.edit(updateEmbed(msg, colour));
		});
	}
	}
};

const processMaster = async (bot, msg, newChannel, remove) => {
	const order = await Order.findOne({ 'guild.id': msg.guild.id, 'serial': parseSerial(msg) });

	bot.channels.cache.get(newChannel).send(updateEmbed(msg, null, remove));
	bot.channels.cache.get(order.master.message.channel.id).messages.fetch(order.master.message.id).then(_msg => _msg.delete()).catch(() => null);
};

const updateEmbed = (msg, colour, remove) => {
	const embed = new Discord.MessageEmbed(msg.embeds[0]);

	if (!remove) embed.addField('Order Link', `[Vendor Message](${msg.url})`);
	if (colour) embed.setColor(colour);

	return embed;
};

const userInput = async (bot, user, msg, action, type) => {
	if (pendingInput.has(user.id)) return msg.channel.send(promptEmbed(`You're already ${action.toLowerCase()} another order!`, 'RED'));

	const editingEmbed = new Discord.MessageEmbed()
		.setTitle(`${action} Order #${parseSerial(msg)}...`)
		.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
		.setColor('GREEN')
		.setDescription('Type `restart` to start again, or `cancel` to exit.')
		.addField('Order Details', msg.embeds[0].description)
		.setTimestamp();

	['Comments', 'Amendments'].forEach(field => {
		const foundField = msg.embeds[0].fields.find(_field => _field.name === field);
		if (foundField) editingEmbed.addField(field, foundField.value);
	});

	const dm = await sendDM(user, editingEmbed.addField('Order Link', `[Order Message](${msg.url})`), msg.channel);

	if (!dm) return;

	pendingInput.add(user.id);

	const neededInputs = {
		[type.toLowerCase()]: {
			prompt: `Please reply with your ${type.toLowerCase()}:`,
			type: 'txt',
		},
	};

	const input = await getInput(user, neededInputs, msg.channel);

	if (input === 'cancel') {
		const cancelEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor('RED')
			.setDescription('**Cancelled.**')
			.setTimestamp();

		pendingInput.delete(user.id);

		return sendDM(user, cancelEmbed, msg.channel);
	}

	else processUpdate(bot, input, type, user, msg);
};

async function getInput(user, needed, channel) {
	const input = {};

	for (const [key, value] of Object.entries(needed)) {
		input[key] = await msgPrompt(promptEmbed(value.prompt), user, channel);

		try {
			if (input[key].toLowerCase() === 'restart') return await getInput(user, needed, channel);
			else if (input[key].toLowerCase() === 'cancel') return 'cancel';
		}
		catch { null; }
	}

	return input;
}

async function msgPrompt(prompt, user, channel) {
	const promises = [];
	const filter = message => message.author.id === user.id;

	promises.push(
		sendDM(user, prompt, channel)
			.then(async () => {
				promises.push(
					await user.dmChannel.awaitMessages(filter, { max: 1 })
						.then(collected => collected),
				);
			}),
	);

	await Promise.all(promises);
	const reply = promises[1].first();

	try {
		if (!reply.content) {
			sendDM(user, promptEmbed('You must enter something!', 'RED'), channel);
			throw await msgPrompt(prompt, user, channel);
		}

		throw reply.content;
	}

	catch (thrown) { return thrown; }
}

const promptEmbed = (prompt, colour) => new Discord.MessageEmbed()
	.setDescription(prompt)
	.setColor(colour || 'GOLD');

const processUpdate = async (bot, input, type, user, msg) => {
	const updatedEmbed = new Discord.MessageEmbed(msg.embeds[0])
		.setColor('GREEN')
		.setTitle(`Updated ${msg.embeds[0].title}`);

	const existingIndex = updatedEmbed.fields.findIndex(field => field.name === type);

	(existingIndex !== -1)
		? updatedEmbed.fields[existingIndex].value += `\n${dateFormat(config.dateString)} — ${input[type.toLowerCase()]}`
		: updatedEmbed.addField(type, `\n${dateFormat(config.dateString)} — ${input[type.toLowerCase()]}`);

	await sendDM(user, new Discord.MessageEmbed(updatedEmbed).addField('Order Link', `[Order Message](${msg.url})`).setTimestamp(), msg.channel);

	updatedEmbed.setTitle(msg.embeds[0].title);
	updatedEmbed.setColor(msg.embeds[0].color);

	const updatedMessage = await msg.edit(updatedEmbed);
	forwardMaster(bot, updatedMessage, 'update', msg.embeds[0].color);

	pendingInput.delete(user.id);

	const order = await Order.findOne({ 'guild.id': msg.guild.id, 'serial': parseSerial(msg) });

	order[type.toLowerCase()] = updatedEmbed.fields.find(field => field.name === type).value;
	order.save();
};

module.exports['forwardMaster'] = forwardMaster;