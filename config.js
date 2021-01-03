'use strict';


exports.dateString = 'HHMM \'h\' d mmm yy',
exports.databaseDelay = 1500;

exports.master = {
	commands: {
		name: 'commands',
	},
	active: {
		name: 'active-orders',
	},
	completed: {
		name: 'completed-orders',
	},
	deleted: {
		name: 'deleted-orders',
	},
	category: {
		name: 'Master',
	},
};

exports.vendor = {
	available: {
		name: 'available',
	},
	problems: {
		name: 'problems',
	},
	processing: {
		name: 'processing',
	},
	completed: {
		name: 'completed',
	},
	channels: {
		names: ['available', 'problems', 'processing', 'completed'],
	},
	role: {
		name: 'Vendor',
		permissions: 104189441,
	},
};

exports.emojis = {
	onward: '✅',
	problem: '❌',
	comment: '💬',
	reverse: '🔄',
	edit: '📝',
	delete: '🗑️',
	vendor: ['📝', '🗑️'],
};

exports.embedColours = {
	available: 'GOLD',
	problems: 'RED',
	processing: 'BLUE',
	completed: 'GREEN',
	deleted: '',
};

exports.prices = {
	three: {
		name: '03',
		url: 'https://i.imgur.com/cMSP3OC.png',
	},
	five: {
		name: '05',
		url: 'https://i.imgur.com/dBWNHcu.png',
	},
	eight: {
		name: '08',
		url: 'https://i.imgur.com/S6XJls1.png',
	},
	ten: {
		name: '10',
		url: 'https://i.imgur.com/p5IGfFh.png',
	},
	thirteen: {
		name: '13',
		url: 'https://i.imgur.com/6M9uLFc.png',
	},
	sixteen: {
		name: '16',
		url: 'https://i.imgur.com/1pBpLit.png',
	},
	eighteen: {
		name: '18',
		url: 'https://i.imgur.com/ImYAB9z.png',
	},
	twenty: {
		name: '20',
		url: 'https://i.imgur.com/otcWUXf.png',
	},
	twentyone: {
		name: '21',
		url: 'https://i.imgur.com/gb3sz7g.png',
	},
	twentyfour: {
		name: '24',
		url: 'https://i.imgur.com/AkfJbar.png',
	},
	twentynine: {
		name: '29',
		url: 'https://i.imgur.com/WzkMsFa.png',
	},
};