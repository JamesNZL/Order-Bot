'use strict';

const { newGuild } = require('../handlers');

module.exports = {
	events: ['guildCreate'],
	process: [],
	async execute(_, guild) {
		await newGuild(guild);
	},
};