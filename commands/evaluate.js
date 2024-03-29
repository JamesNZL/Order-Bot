/* eslint-disable no-unused-vars */
'use strict';

const Discord = require('discord.js');
const { js, ...modules } = require('../modules');
const { cmdError, delMsg, sendMsg, ...handlers } = require('../handlers');

module.exports = async guild => {
	const { evaluate, cmds } = await require('../cmds')(guild);
	const { embedColours, _doc: config, ...db } = await require('../handlers/database')(guild);

	evaluate.execute = async (msg, args) => {
		const { bot } = require('../');

		const codeBlock = (args.includes('-nocode') || args.includes('-nc'))
			? false
			: true;

		const silent = (args.includes('-silent') || args.includes('-s'))
			? true
			: false;

		if (args.includes('-delete') || args.includes('-del')) delMsg(msg);

		args = args.filter(arg => !arg.startsWith('-'));

		if (args.length === 0) return cmdError(msg, 'You must enter something to evaluate.', evaluate.error);

		if (args[0].includes('```')) {
			const _args = args.join(' ').split('\n');
			args = _args.slice(1, _args.length - 1);
		}

		const code = args.join(' ');

		try {
			const embed = new Discord.MessageEmbed();

			let evaled = '*'.repeat(bot.token.length);

			if (!code.toLowerCase().includes('token')) evaled = await eval(code);

			if (code.includes('embed.')) sendMsg(msg.channel, embed);

			if (silent) return;

			if (typeof evaled !== 'string') evaled = convertToString(evaled);

			evaled = removeSensitive(bot, evaled, code);

			msgSplit(evaled.replace(/```/g, ''), '},');
		}

		catch (error) { msgSplit(error.stack, ')'); }

		function msgSplit(str, char) {
			while (str) {
				const breakAt = findBreakIndex(str, char);

				(codeBlock)
					? sendMsg(msg.channel, js(str.substr(0, breakAt)))
					: sendMsg(msg.channel, str.substr(0, breakAt));

				str = str.substr(breakAt);
			}
		}
	};

	return evaluate;
};

function convertToString(obj) {
	return require('util').inspect(obj);
}

function removeSensitive(bot, str) {
	const sensitives = [bot.token];

	for (let i = 0; i < sensitives.length; i++) {
		str = str.replace(new RegExp(sensitives[i], 'g'), '*'.repeat(sensitives[i].length));
	}

	return str;
}

function findBreakIndex(str, char) {
	const softLimit = 1985;

	const charIndex = str.lastIndexOf(char, softLimit);
	const hasChar = charIndex !== -1;

	const spaceIndex = str.lastIndexOf(' ', softLimit);
	const hasSpace = spaceIndex !== -1;

	return (str.length > softLimit)
		? (hasChar)
			? charIndex + char.length
			: (hasSpace)
				? spaceIndex + 1
				: softLimit
		: softLimit;
}