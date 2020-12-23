'use strict';

module.exports = msg => (msg.embeds[0])
	? (msg.embeds[0].title)
		? (msg.embeds[0].title.includes('Order #'))
			? true
			: false
		: false
	: false;