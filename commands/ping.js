'use strict';

const Discord = require('discord.js');
const { sendMsg } = require('../handlers');

module.exports = async guild => {
	const { ping } = await require('../cmds')(guild);

	ping.execute = msg => {
		let pingValue = 'Pinging...';

		sendMsg(msg.channel, '**Pong!**')
			.then(async reply => {
				const pingTimestamp = (msg.editedTimestamp - msg.createdTimestamp > 0)
					? msg.editedTimestamp
					: msg.createdTimestamp;

				pingValue = reply.createdTimestamp - pingTimestamp;

				const pingEmbed = new Discord.MessageEmbed()
					.setColor('GREEN')
					.setFooter(`${pingValue} ms`)
					.setTimestamp();

				reply.edit(pingEmbed);
			});
	};

	return ping;
};