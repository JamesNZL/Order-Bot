'use strict';

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	serial: Number,
	details: String,
	comments: { type: String, default: '' },
	amendments: { type: String, default: '' },
	time: Number,
	state: { type: String, default: 'available' },
	cost: { type: Number, default: 0 },
	vendor: {
		id: String,
		category: String,
		serial: Number,
		message: {
			id: String,
			url: String,
			channel: String,
		},
	},
	master: {
		serial: Number,
		message: {
			id: String,
			url: String,
			channel: String,
		},
	},
});

module.exports = mongoose.model('order', orderSchema, 'orders');