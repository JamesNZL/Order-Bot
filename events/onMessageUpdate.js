'use strict';

const { commandHandler } = require('../handlers');

module.exports = {
	events: ['messageUpdate'],
	process: [],
	async execute(_, __, newMessage) {
		commandHandler(await newMessage.fetch());
	},
};