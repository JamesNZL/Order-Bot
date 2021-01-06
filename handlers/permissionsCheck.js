'use strict';

module.exports = (user, memberRoles, cmd) => {
	try {
		if (cmd.users.includes(user.id)) throw true;
		else if (cmd.noUsers.includes(user.id)) throw false;
		else if (memberRoles.some(roles => cmd.roles.includes(roles.id))) throw true;
		else if (memberRoles.some(roles => cmd.noRoles.includes(roles.id))) throw false;
		else if (cmd.noUsers.length || cmd.noRoles.length) throw true;
		else if (cmd.users.length || cmd.roles.length) throw false;
	}

	catch (result) { return result; }
};