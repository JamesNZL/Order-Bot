'use strict';

const Discord = require('discord.js');

const { pCmd, stripID } = require('../modules');

module.exports = async msg => {
	if (msg.author.bot) return;

	const { bot } = require('../');
	const { dmCmdError, permissionsHandler } = require('./');

	const guild = msg.guild || bot.guilds.cache.filter(_guild => _guild.members.cache.has(msg.author.id)).first();

	const { prefix } = await require('./database')(guild);
	const { help } = await require ('../cmds')(guild);

	const args = msg.content.split(/ +/);

	const hasPrefix = msg.content.toLowerCase().startsWith(prefix.toLowerCase());
	const hasBotMention = stripID(args[0]) === bot.user.id;

	if (!hasPrefix && (!hasBotMention || args.length === 1)) return;

	bot.commands = new Discord.Collection();
	const botCommands = await require('../commands')(guild);

	Object.keys(botCommands).map(key => {
		bot.commands.set(botCommands[key].cmd, botCommands[key]);
	});

	const msgCmd = (stripID(args[0]) === bot.user.id)
		? args.splice(0, 2)[1].toLowerCase()
		: args.shift().toLowerCase().replace(prefix.toLowerCase(), '');

	const helpCmd = bot.commands.get(help.cmd);

	const cmd = bot.commands.get(msgCmd) || bot.commands.find(command => command.aliases && command.aliases.includes(msgCmd));

	if (!cmd) {
		const regExp = /[a-zA-Z]/g;
		return (regExp.test(msgCmd))
			? (!msg.guild)
				? dmCmdError(msg)
				: helpCmd.execute(msg, args)
			: null;
	}

	const hasPerms = await permissionsHandler(msg, cmd);

	if (hasPerms === 'err') return;

	if (msg.guild && !hasPerms) return helpCmd.execute(msg, args);
	else if (!msg.guild && !hasPerms) return dmCmdError(msg, 'noPerms');
	else if (!msg.guild && !cmd.allowDM) return dmCmdError(msg, 'noDM');

	try {
		cmd.execute(msg, args, msgCmd);
	}

	catch (error) {
		console.error(`Error executing ${await pCmd(cmd, guild)}`, error);
	}
};