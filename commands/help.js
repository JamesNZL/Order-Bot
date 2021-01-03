'use strict';

const Discord = require('discord.js');
const { formatList, pCmd } = require('../modules');
const { dmCmdError, embedScaffold, getRoleError, permissionsHandler, sendDM, sendMsg } = require('../handlers');

module.exports = async guild => {
	const { logo, embedColours } = await require('../handlers/database')(guild);
	const { help, ...cmds } = await require('../cmds')(guild);

	help.execute = async (msg, args) => {
		const { bot } = require('../');

		const helpEmbed = new Discord.MessageEmbed();

		const msgCmd = (args[0])
			? args[0].toLowerCase()
			: null;

		if (!msg.guild && !guild.available) return embedScaffold(guild, msg.author, 'There was an error reaching the server, please try again later.', 'RED', 'dm');

		const memberRoles = (msg.guild)
			? msg.member.roles.cache
			: await guild.members.fetch(msg.author.id).then(member => member.roles.cache);

		if (!memberRoles) return getRoleError(msg);

		const cmd = bot.commands.get(msgCmd) || bot.commands.find(_cmd => _cmd.aliases && _cmd.aliases.includes(msgCmd));

		(cmd)
			? await permissionsHandler(msg, cmd)
				? sendHelpEmbed(cmd)
				: (msg.guild)
					? sendCmdList()
					: dmCmdError(msg, 'noPerms')
			: sendCmdList();

		async function sendHelpEmbed(_cmd) {
			helpEmbed.setTitle(`Command: ${await pCmd(_cmd, guild)}`);
			helpEmbed.setColor(embedColours.bot);
			helpEmbed.setDescription(_cmd.help);

			if (msg.guild) {
				helpEmbed.setFooter(`Requested by ${msg.member.displayName}`, msg.author.displayAvatarURL({ dynamic: true }));
				return sendMsg(msg.channel, helpEmbed);
			}

			else if (!helpEmbed.description.includes('Allowed Roles')) {
				return sendDM(msg.author, helpEmbed, msg.channel);
			}

			else return dmCmdError(msg, 'hasRole');
		}

		async function sendCmdList() {
			const obj = {
				[await pCmd(help, guild)]: help.desc.unqualified,
				[`${await pCmd(help, guild)} [command]`]: help.desc.qualified,
			};

			for (const command of Object.values(cmds)) {
				if (await permissionsHandler(msg, command) && command.showList) obj[`${await pCmd(command, guild)}`] = command.desc;
			}

			const commandsList = formatList(obj, true);

			const james = await bot.users.fetch('192181901065322496');

			helpEmbed.setTitle('Commands List');
			helpEmbed.setAuthor(guild.name, guild.iconURL({ dynamic: true }));
			helpEmbed.setThumbnail(logo);
			helpEmbed.setColor(embedColours.bot);
			helpEmbed.setDescription(commandsList);
			helpEmbed.setFooter(`Developed by ${james.tag}`, james.avatarURL({ dynamic: true }));

			sendDM(msg.author, helpEmbed, msg.channel);
		}
	};

	return help;
};