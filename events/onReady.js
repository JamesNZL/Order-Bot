'use strict';

module.exports = {
	events: ['ready'],
	process: [],
	execute() {
		const { bot } = require('../');

		console.log(`Logged in as ${bot.user.tag}!`);
		bot.user.setActivity('for new orders!', { type: 'WATCHING' });

		const emojis = require('../config').prices;

		bot.guilds.cache.each(guild => {
			for (const emoji of Object.values(emojis)) {
				if (!guild.emojis.cache.some(guildEmoji => guildEmoji.name === emoji.name)) {
					guild.emojis.create(emoji.url, emoji.name);
				}
			}
		});
	},
};