'use strict';

const mongoose = require('mongoose');

const balanceSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guild: {
		id: String,
		name: String,
	},
	paid: Number,
	updated: Number,
});

module.exports = mongoose.model('balance', balanceSchema, 'balances');