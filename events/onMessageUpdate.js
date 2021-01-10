'use strict';

const { commandHandler } = require('../handlers');

module.exports = {
	events: ['messageUpdate'],
	process: [],
	async execute(_, oldMessage, newMessage) {
		const msg = await newMessage.fetch();

		const config = await require('../handlers/database')(msg.guild);

		const validChannel = msg.channel.id === config.master.commands.id || !msg.guild;
		const contentChanged = (oldMessage.partial)
			? true
			: oldMessage.content !== newMessage.content;

		if (validChannel && contentChanged) return commandHandler(msg);
	},
};