'use strict';

module.exports = (memberRoles, cmd) => {
	const noDisallowedRoles = !cmd.devOnly && cmd.noRoles.length && !memberRoles.some(roles => cmd.noRoles.includes(roles.id));
	const hasAllowedRoles = !cmd.devOnly && cmd.roles.length && memberRoles.some(roles => cmd.roles.includes(roles.id));

	return (noDisallowedRoles || hasAllowedRoles)
		? true
		: false;
};