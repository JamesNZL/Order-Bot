'use strict';

module.exports = {
	events: ['ready'],
	process: [],
	execute() {
		const { bot } = require('../');

		console.log(`Logged in as ${bot.user.tag}!`);
		bot.user.setActivity('for new orders!', { type: 'WATCHING' });
	},
};