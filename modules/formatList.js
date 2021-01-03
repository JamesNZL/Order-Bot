'use strict';

module.exports = (object, forList) => {
	let helpString = '';

	const [startFormat, endFormat] = (forList)
		? ['`', '` - ']
		: ['**', ':** '];

	for (const [key, value] of Object.entries(object)) {
		helpString += `${startFormat}${key}${endFormat}${value}\n`;
	}

	return helpString.replace(/\n+$/, '');
};