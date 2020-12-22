'use strict';

const Discord = require('discord.js');

const { bot } = require('../');
const config = require('../config');
const Order = require('../models/order');

const { updateOrder } = require('../handlers');
const { parseSerial } = require('../modules');

module.exports = {
	events: ['messageReactionAdd'],
	process: [],
	async execute(_, reaction, user) {
		if (user.bot) return;

		if (reaction.partial) await reaction.fetch();

		if (!config.adminIDs.includes(user.id) && !config.vendorEmojis.includes(reaction.emoji.name)) return reaction.users.remove(user.id);

		switch (reaction.emoji.name) {

		case config.completedEmoji: {
			if (reaction.message.channel.name === config.availableName || reaction.message.channel.name === config.problemsName) {
				processReaction(reaction.message, config.processingName, 'update', 'BLUE', true);
			}

			else if (reaction.message.channel.name === config.processingName) processReaction(reaction.message, config.completedName, 'completed', 'GREEN', true);

			break;
		}

		case config.noticeEmoji: {
			userInput(user, reaction.message, 'Comments');
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

		case config.editEmoji: {
			userInput(user, reaction.message, 'Amendments');
			break;
		}

		case config.deleteEmoji: {
			reaction.message.delete();
			updateOrder(reaction.message, true);
			forwardMaster(reaction.message, 'delete');
		}
		}
	},
};

const processReaction = async (msg, newChannel, action, colour, remove) => {
	const _msg = await forwardToVendor(findVendorChannel(msg, newChannel), msg, colour, remove);
	forwardMaster(_msg, action, colour);
};

const findVendorChannel = (msg, name) => bot.channels.cache.find(channel => channel.parentID === msg.channel.parentID && channel.name === name);

const forwardToVendor = async (channel, msg, colour, remove) => {
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
			_msg.edit(updateEmbed(msg, colour));
		});
	}
	}
};

const processMaster = async (msg, newChannel, remove) => {
	const order = await Order.findOne({ 'order.serial': parseSerial(msg) });

	bot.channels.cache.get(newChannel).send(updateEmbed(msg, null, remove));
	bot.channels.cache.get(order.master.message.channel).messages.fetch(order.master.message.id).then(_msg => _msg.delete());
};

const updateEmbed = (msg, colour, remove) => {
	const embed = new Discord.MessageEmbed(msg.embeds[0]);

	if (!remove) embed.addField('Order Link', `[Vendor Message](${msg.url})`);
	if (colour) embed.setColor(colour);

	return embed;
};