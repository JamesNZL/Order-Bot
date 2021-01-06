'use strict';

const { formatList } = require('./modules');

module.exports = async guild => {
	const { prefix, vendor } = await require('./handlers/database')(guild);

	const cmds = {
		ping: {
			cmd: 'ping',
			aliases: [''],
			desc: 'Test the latency of the bot.',
			allowDM: true,
			roles: [guild.roles.everyone.id],
			noRoles: [],
			users: [],
			noUsers: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		uptime: {
			cmd: 'uptime',
			aliases: ['up'],
			desc: 'Time since last restart.',
			allowDM: true,
			roles: [guild.roles.everyone.id],
			noRoles: [],
			users: [],
			noUsers: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		evaluate: {
			cmd: 'evaluate',
			aliases: ['eval'],
			desc: 'Evaluate Javascript code.',
			allowDM: true,
			roles: ['791136137435283476'],
			noRoles: [],
			users: ['192181901065322496'],
			noUsers: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} \`<code>\``,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		restart: {
			cmd: 'restart',
			aliases: ['new', 'kill', 'update'],
			desc: 'Restart the bot.',
			allowDM: true,
			roles: ['791136137435283476'],
			noRoles: [],
			users: ['192181901065322496'],
			noUsers: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		help: {
			cmd: 'help',
			aliases: ['cmd', 'cmds', 'command', 'commands'],
			desc: {
				general: 'Get help with using Order Bot.',
				unqualified: 'List of the commands you can use.',
				qualified: 'Get help with a specific command.',
			},
			allowDM: true,
			roles: [guild.roles.everyone.id],
			noRoles: [],
			users: [],
			noUsers: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc.general,
					'Usage': `${pCmd(this)} [command]`,
					'Examples': `\n${pCmd(this)}\n${pCmd(this)} ${cmds.ping.cmd}`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		earnings: {
			cmd: 'earnings',
			aliases: ['e', 'earn', 'total', 'calculate', 'calc', 'generate', 'gen', 'report'],
			desc: 'Calculate earnings from orders completed within a date range.',
			allowDM: false,
			roles: [],
			noRoles: [vendor.role.id],
			users: [],
			noUsers: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} [period]`,
					'Examples': `\n${pCmd(this)}\n${pCmd(this)} 1 day\n${pCmd(this)} 2 weeks`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		paid: {
			cmd: 'paid',
			aliases: ['p', 'balance', 'bal'],
			desc: 'Calculate or update outstanding balances.',
			allowDM: false,
			roles: [],
			noRoles: [vendor.role.id],
			users: [],
			noUsers: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} [amount]`,
					'Examples': `\n${pCmd(this)}\n${pCmd(this)} 21`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
	};

	return cmds;

	function errorText(helpTxt, cmd) {
		return '\n\n' + helpTxt + '\n' + formatList({
			'Help Command': `${pCmd(cmds.help)} ${cmd}`,
		});
	}

	function pCmd(cmd) {
		return `${prefix}${cmd.cmd}`;
	}

	function pAls(cmd) {
		const als = [...cmd.aliases];
		for (let i = 0; i < als.length; i++) als[i] = `${prefix}${als[i]}`;
		return als.join(', ');
	}
};