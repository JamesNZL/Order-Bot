'use strict';

const { formatList } = require('./modules');

module.exports = async guild => {
	const { prefix } = await require('./handlers/database')(guild);

	const cmds = {
		earnings: {
			cmd: 'earnings',
			aliases: ['e', 'earn', 'total', 'calculate', 'calc'],
			desc: 'Calculate the total earnings from orders completed within a date range.',
			allowDM: false,
			roles: [guild.roles.everyone.id],
			noRoles: [],
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)}`,
					'Examples': `\n${pCmd(this)}\n${pCmd(this)} 1d\n${pCmd(this)} 14d`,
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