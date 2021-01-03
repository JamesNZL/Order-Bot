'use strict';

module.exports = async (msg, cmd) => {
	const { bot } = require('../');
	const { getRoleError, permissionsCheck } = require('./');

	const guild = bot.guilds.cache.find(_guild => _guild.members.cache.has(msg.author.id));

	const member = (msg.guild)
		? msg.member
		: await guild.members.fetch(msg.author.id);

	const memberRoles = member.roles.cache;

	return (memberRoles)
		? permissionsCheck(memberRoles, cmd)
		: await getRoleError(msg);
};