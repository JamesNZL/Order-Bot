'use strict';

module.exports = async msg => {
	const { embedScaffold } = require('./');

	const verifyErr = 'There was an error verifying permissions, please try again later.';

	(msg.guild)
		? embedScaffold(msg.channel, verifyErr, 'RED', 'msg')
		: embedScaffold(msg.author, verifyErr, 'RED', 'dm');

	return 'err';
};