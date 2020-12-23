'use strict';

const { newOrder, updateOrder } = require('../handlers');

module.exports = {
	events: ['message'],
	process: [],
	async execute(_, msg) {
		const { bot } = require('../');
		const config = await require('../handlers/database')(msg.guild);

		if (msg.partial || !msg.guild) return;

		const isOrderEmbed = (msg.embeds[0])
			? (msg.embeds[0].title)
				? (msg.embeds[0].title.includes('Order'))
					? true
					: false
				: false
			: false;

		const isOrderChannel = config.vendor.channels.names.includes(msg.channel.name) || config.master.channels.ids.includes(msg.channel.id);

		if (!msg.embeds[0] && msg.channel.name === config.vendor.available.name) {
			msg.delete();
			return newOrder(msg);
		}

		else if (msg.author.id === bot.user.id && isOrderChannel && isOrderEmbed) {
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