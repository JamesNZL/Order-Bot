'use strict';

const mongoose = require('mongoose');

const configSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guild: {
		id: String,
		name: String,
	},
	dateString: { type: String, default: 'HHMM \'h\' d mmm yy' },
	databaseDelay: { type: Number, default: 1500 },
	admin: {
		ids: { type: Array, default: ['461320592717774848', '192181901065322496'] },
	},
	master: {
		active: {
			id: String,
		},
		completed: {
			id: String,
		},
		deleted: {
			id: String,
		},
		channels: {
			ids: Array,
		},
	},
	vendor: {
		available: {
			name: { type: String, default: 'available' },
		},
		problems: {
			name: { type: String, default: 'problems' },
		},
		processing: {
			name: { type: String, default: 'processing' },
		},
		completed: {
			name: { type: String, default: 'completed' },
		},
		channels: {
			names: { type: Array, default: ['available', 'problems', 'processing', 'completed'] },
		},
	},
	emojis: {
		onward: { type: String, default: '✅' },
		problem: { type: String, default: '❌' },
		comment: { type: String, default: '💬' },
		reverse: { type: String, default: '🔄' },
		edit: { type: String, default: '📝' },
		delete: { type: String, default: '🗑️' },
		vendor: { type: Array, default: ['📝', '🗑️'] },
	},
	embedColours: {
		available: { type: String, default: 'GOLD' },
		problems: { type: String, default: 'RED' },
		processing: { type: String, default: 'BLUE' },
		completed: { type: String, default: 'GREEN' },
		deleted: { type: String, default: '' },
	},
});

module.exports = mongoose.model('config', configSchema, 'configs');