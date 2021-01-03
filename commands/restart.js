'use strict';

module.exports = async guild => {
	const { restart } = await require('../cmds')(guild);

	restart.execute = () => process.exit();

	return restart;
};