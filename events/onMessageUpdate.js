'use strict';

const { commandHandler } = require('../handlers');

module.exports = {
	events: ['messageUpdate'],
	process: [],
	async execute(_, oldMessage, newMessage) {
		if (newMessage.partial) return commandHandler(await newMessage.fetch());
		if (oldMessage.content !== newMessage.content) return commandHandler(newMessage);
	},
};