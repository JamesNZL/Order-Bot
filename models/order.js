'use strict';

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guild: {
		id: String,
		name: String,
	},
	serial: Number,
	details: String,
	comments: { type: String, default: '' },
	amendments: { type: String, default: '' },
	time: Number,
	updated: Number,
	state: { type: String, default: 'available' },
	deleted: { type: Boolean, default: false },
	cost: { type: Number, default: 0 },
	vendor: {
		id: String,
		category: String,
		serial: Number,
		message: {
			id: String,
			url: String,
			channel: {
				id: String,
				name: String,
			},
		},
	},
	master: {
		serial: Number,
		message: {
			id: String,
			url: String,
			channel: {
				id: String,
				name: String,
			},
		},
	},
});

module.exports = mongoose.model('order', orderSchema, 'orders');