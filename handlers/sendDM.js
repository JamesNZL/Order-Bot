'use strict';

const Discord = require('discord.js');

const recentErrors = new Set();

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

			if (recentErrors.has(user.id)) return;

			channel.send(errorEmbed);

			recentErrors.add(user.id);

			setTimeout(() => {
				recentErrors.delete(user.id);
			}, 1000);
		});
};