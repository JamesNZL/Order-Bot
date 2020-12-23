'use strict';

module.exports = async guild => {
	const Config = require('../models/config');
	const { newGuild } = require('./');

	if (!guild) return require('../config');

	const database = await Config.findOne({ 'guild.id': guild.id }, error => {
		if (error) console.error(error);
	});

	return database || await newGuild(guild);
};