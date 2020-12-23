'use strict';


exports.dateString = 'HHMM \'h\' d mmm yy',
exports.databaseDelay = 1500;

exports.master = {
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