'use strict';

const mongoose = require('mongoose');

const config = require('../config');

const configSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guild: {
		id: String,
		name: String,
	},
	dateString: { type: String, default: config.dateString },
	databaseDelay: { type: Number, default: config.databaseDelay },
	admin: {
		ids: { type: Array, default: config.admin.ids },
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
			name: { type: String, default: config.vendor.available.name },
		},
		problems: {
			name: { type: String, default: config.vendor.problems.name },
		},
		processing: {
			name: { type: String, default: config.vendor.processing.name },
		},
		completed: {
			name: { type: String, default: config.vendor.completed.name },
		},
		channels: {
			names: { type: Array, default: config.vendor.channels.names },
		},
		},
	},
	emojis: {
		onward: { type: String, default: config.emojis.onward },
		problem: { type: String, default: config.emojis.problem },
		comment: { type: String, default: config.emojis.comment },
		reverse: { type: String, default: config.emojis.reverse },
		edit: { type: String, default: config.emojis.edit },
		delete: { type: String, default: config.emojis.delete },
		vendor: { type: Array, default: config.emojis.vendor },
	},
	embedColours: {
		available: { type: String, default: config.embedColours.available },
		problems: { type: String, default: config.embedColours.problems },
		processing: { type: String, default: config.embedColours.processing },
		completed: { type: String, default: config.embedColours.completed },
		deleted: { type: String, default: config.embedColours.deleted },
	},
});

module.exports = mongoose.model('config', configSchema, 'configs');