'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const { mongoose } = require('./handlers');

const config = require('./config');

const TOKEN = process.env.TOKEN;
const MONGOURI = process.env.MONGOURI;

const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

bot.login(TOKEN);
mongoose.login(MONGOURI);

bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}!`));
bot.on('message', msg => onMessage(msg));
bot.on('messageReactionAdd', (reaction, user) => onReaction(reaction, user));
bot.on('guildMemberAdd', member => onMemberJoin(member));
bot.on('guildMemberUpdate', (oldMember, newMember) => onMemberUpdate(oldMember, newMember));
process.on('unhandledRejection', (...args) => console.error(...args));

const { newOrder, updateOrder } = require('./handlers');
const { parseSerial } = require('./modules');
const Order = require('./models/order');

const onMessage = async msg => {
	if (msg.partial) return;

	if (!msg.embeds[0] && msg.channel.name === config.availableName) {
		msg.delete();
		return newOrder(bot, msg);
	}

	if (msg.author.id === bot.user.id) {
		updateOrder(msg);

		switch (msg.channel.name) {

		case config.availableName: {
			applyReactions(msg, [config.completedEmoji, config.problemEmoji, config.deleteEmoji]);
			break;
		}
		case config.problemsName: {
			applyReactions(msg, [config.completedEmoji, config.deleteEmoji]);
			break;
		}
		case config.processingName: {
			applyReactions(msg, [config.completedEmoji, config.problemEmoji, config.reverseEmoji]);
			break;
		}
		case config.completedName: {
			applyReactions(msg, [config.reverseEmoji]);
		}
		}
	}
};

const onReaction = async (reaction, user) => {
	if (user.bot) return;

	if (reaction.partial) await reaction.fetch();

	if (!config.adminIDs.includes(user.id) && reaction.emoji.name !== config.deleteEmoji) return reaction.users.remove(user.id);

	switch (reaction.emoji.name) {

	case config.completedEmoji: {
		if (reaction.message.channel.name === config.availableName || reaction.message.channel.name === config.problemsName) {
			processReaction(reaction.message, config.processingName, 'update', 'BLUE', true);
		}

		else if (reaction.message.channel.name === config.processingName) processReaction(reaction.message, config.completedName, 'completed', 'GREEN', true);

		break;
	}

	case config.problemEmoji: {
		processReaction(reaction.message, config.problemsName, 'update', 'RED', true);
		break;
	}

	case config.reverseEmoji: {
		if (reaction.message.channel.name === config.completedName) processReaction(reaction.message, config.processingName, 'reverse', 'BLUE', true);

		else if (reaction.message.channel.name === config.processingName) processReaction(reaction.message, config.availableName, 'update', 'GOLD', true);

		break;
	}

	case config.deleteEmoji: {
		reaction.message.delete();
		updateOrder(reaction.message, true);
		forwardMaster(reaction.message, 'delete');
	}
	}
};

const onMemberJoin = async member => {
	const existingCategory = findCategory(member.guild, member.user.tag);

	if (existingCategory) existingCategory.createOverwrite(member.id, { 'VIEW_CHANNEL': true });

	await member.guild.channels.create(member.user.tag, { type: 'category' })
		.then(async category => {
			await category.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
			await setChannelVisibility(category, [member.guild.roles.everyone], false);
			await setChannelVisibility(category, [member.id, ...config.adminIDs], true);

			createChannels(member.guild, [config.availableName, config.problemsName, config.processingName, config.completedName], category);
		});
};

const onMemberUpdate = (_, newMember) => {
	const memberCategory = newMember.guild.channels.cache.find(category => category.type === 'category' && category.permissionOverwrites.has(newMember.id));

	if (memberCategory.name === newMember.user.tag) return;

	memberCategory.edit({ name: newMember.user.tag });
};

const applyReactions = (msg, reactions) => reactions.forEach(async reaction => await msg.react(reaction));

const processReaction = async (msg, newChannel, action, colour, remove) => {
	const _msg = await forwardTo(findVendorChannel(msg, newChannel), msg, colour, remove);
	forwardMaster(_msg, action, colour);
};

const findVendorChannel = (msg, name) => bot.channels.cache.find(channel => channel.parentID === msg.channel.parentID && channel.name === name);

const forwardTo = async (channel, msg, colour, remove) => {
	if (remove) msg.delete();
	return await channel.send(new Discord.MessageEmbed(msg.embeds[0]).setColor(colour));
};

const forwardMaster = async (msg, action, colour) => {
	switch (action) {

	case 'completed': {
		processMaster(msg, config.masterCompletedID);
		break;
	}

	case 'reverse': {
		processMaster(msg, config.masterOrdersID);
		break;
	}

	case 'delete': {
		processMaster(msg, config.masterDeletedID, true);
		break;
	}

	case 'update': {
		const order = await Order.findOne({ 'order.serial': parseSerial(msg) });

		bot.channels.cache.get(order.master.message.channel).messages.fetch(order.master.message.id).then(_msg => {
			_msg.edit(new Discord.MessageEmbed(_msg.embeds[0]).setURL(msg.url).setColor(colour));
		});
	}
	}
};

const processMaster = async (msg, newChannel, remove) => {
	const order = await Order.findOne({ 'order.serial': parseSerial(msg) });

	bot.channels.cache.get(newChannel).send(new Discord.MessageEmbed(msg.embeds[0]).setURL(msg.url));
	bot.channels.cache.get(order.master.message.channel).messages.fetch(order.master.message.id).then(_msg => _msg.delete());
};

const findCategory = (guild, name) => guild.channels.cache.find(channel => channel.type === 'category' && channel.name === name);

const setChannelVisibility = async (channel, users, show) => await users.forEach(user => channel.createOverwrite(user, { 'VIEW_CHANNEL': show }));

const createChannels = (guild, channels, category) => channels.forEach(channel => guild.channels.create(channel, { parent: category }));