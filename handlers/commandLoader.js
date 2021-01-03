'use strict';

module.exports = async (dir, guild) => {
	const fs = require('fs');

	const files = fs.readdirSync(dir).filter(file => file.endsWith('.js') && file !== 'index.js');

	const processedObject = {};

	for (const file of files) {
		const key = file.replace('.js', '');
		processedObject[key] = await require(`.${dir}/${key}`)(guild);
	}

	return processedObject;
};