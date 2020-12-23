'use strict';

exports = {
	dateString: 'HHMM \'h\' d mmm yy',
	databaseDelay: 1500,
};

exports.admin = {
	ids: ['461320592717774848', '192181901065322496'],
};

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
		name: 'master',
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