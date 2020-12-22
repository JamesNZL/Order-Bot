'use strict';

const Discord = require('discord.js');

module.exports = (user, msg, channel) => {
	const { bot } = require('../');

	const support = '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)';

	return user.send(msg)
		.catch(() => {
			const errorEmbed = new Discord.MessageEmbed()
				.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
				.setColor('RED')
				.setDescription(`${user} I can't send direct messages to you!`)
				.addField('More Information', support)
				.setTimestamp();

			channel.send(errorEmbed);
		});
};