'use strict';

const { commandHandler, newOrder, updateOrder } = require('../handlers');
const { isOrderEmbed } = require('../modules');

module.exports = {
	events: ['message'],
	process: [],
	async execute(_, msg) {
		const { bot } = require('../');
		const config = await require('../handlers/database')(msg.guild);

		if (msg.partial || !msg.guild) return;

		const isOrderChannel = config.vendor.channels.names.includes(msg.channel.name) || config.master.channels.ids.includes(msg.channel.id);

		if (msg.channel.id === config.master.commands.id) return commandHandler(msg);

		else if (!msg.embeds[0] && msg.channel.name === config.vendor.available.name) {
			msg.delete();
			return newOrder(msg);
		}

		else if (msg.author.id === bot.user.id && isOrderChannel && isOrderEmbed(msg)) {
			updateOrder(msg);

			switch (msg.channel.name) {

			case config.vendor.available.name: {
				applyReactions(msg, [config.emojis.onward, config.emojis.problem, config.emojis.edit, config.emojis.delete]);
				break;
			}
			case config.vendor.problems.name: {
				applyReactions(msg, [config.emojis.comment, config.emojis.onward, config.emojis.edit, config.emojis.delete]);
				break;
			}
			case config.vendor.processing.name: {
				applyReactions(msg, [config.emojis.onward, config.emojis.problem, config.emojis.reverse, config.emojis.edit]);
				break;
			}
			case config.vendor.completed.name: {
				applyReactions(msg, [config.emojis.reverse]);
			}
			}
		}
	},
};

const applyReactions = (msg, reactions) => reactions.forEach(async reaction => await msg.react(reaction).catch(() => null));