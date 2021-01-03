'use strict';

const Discord = require('discord.js');

const { sendMsg } = require('../handlers');
const { formatAge } = require('../modules');

module.exports = async guild => {
	const { uptime } = await require('../cmds')(guild);

	uptime.execute = async msg => {
		const { bot } = require('../');

		const uptimeEmbed = new Discord.MessageEmbed()
			.setColor('GREEN')
			.setFooter(`${formatAge(bot.uptime, true)}`)
			.setTimestamp();

		sendMsg(msg.channel, uptimeEmbed);
	};

	return uptime;
};