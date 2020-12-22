'use strict';

const config = require('../config');

const { newOrder, updateOrder } = require('../handlers');

module.exports = {
	events: ['message'],
	process: [],
	async execute(_, msg) {
		const { bot } = require('../');

		if (msg.partial) return;

		if (!msg.embeds[0] && msg.channel.name === config.availableName) {
			msg.delete();
			return newOrder(bot, msg);
		}

		else if (msg.author.id === bot.user.id && (config.vendorChannels.includes(msg.channel.name) || config.masterChannels.includes(msg.channel.id)) && msg.embeds[0].title && msg.embeds[0].title.includes('Order')) {
			updateOrder(msg);

			switch (msg.channel.name) {

			case config.availableName: {
				applyReactions(msg, [config.completedEmoji, config.problemEmoji, config.editEmoji, config.deleteEmoji]);
				break;
			}
			case config.problemsName: {
				applyReactions(msg, [config.noticeEmoji, config.completedEmoji, config.editEmoji, config.deleteEmoji]);
				break;
			}
			case config.processingName: {
				applyReactions(msg, [config.completedEmoji, config.problemEmoji, config.reverseEmoji, config.editEmoji]);
				break;
			}
			case config.completedName: {
				applyReactions(msg, [config.reverseEmoji]);
			}
			}
		}
	},
};

const applyReactions = (msg, reactions) => reactions.forEach(async reaction => await msg.react(reaction).catch(() => null));