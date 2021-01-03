'use strict';

const Discord = require('discord.js');

module.exports = async (msg, errMsg, cmdErr, footer) => {
	const { sendMsg } = require('./');

	const authorName = (msg.member)
		? msg.member.displayName
		: msg.author.username;

	const errorEmbed = new Discord.MessageEmbed()
		.setColor('RED')
		.setAuthor(authorName, msg.author.displayAvatarURL({ dynamic: true }))
		.setDescription(`${msg.author} ${errMsg} ${cmdErr}`);

	if (footer) errorEmbed.setFooter(footer);

	sendMsg(msg.channel, errorEmbed);
};