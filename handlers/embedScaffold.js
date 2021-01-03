'use strict';

const Discord = require('discord.js');

const { charLimit } = require('../modules');

module.exports = async (dest, descMsg, colour, type, fieldTitle, fieldContent, errorField) => {
	const { bot } = require('..');
	const { sendDM, sendMsg } = require('./');

	const embed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
		.setColor(colour)
		.setDescription(charLimit(descMsg, 2048))
		.setTimestamp();

	if (fieldTitle) embed.addField(fieldTitle, fieldContent);
	if (errorField) embed.setDescription(charLimit(`${descMsg}\n${errorField}`, 2048));

	try {
		if (dest) {
			if (type === 'dm') sendDM(dest, embed, null);
			else if (type === 'msg') sendMsg(dest, embed);
		}
	}
	catch (error) { console.error(error); }
};