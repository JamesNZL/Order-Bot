'use strict';

module.exports = dir => {
	const fs = require('fs');

	const files = fs.readdirSync(dir).filter(file => file.endsWith('.js') && file !== 'index.js');

	const processedObject = {};

	for (const file of files) {
		const key = file.replace('.js', '');
		processedObject[key] = require(`.${dir}/${key}`);
	}

	return processedObject;
};