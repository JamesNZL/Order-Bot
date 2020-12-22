'use strict';

const Order = require('../models/order');

const { parseSerial } = require('../modules');

module.exports = async (msg, deleted) => {
	const order = await Order.findOne({ 'serial': parseSerial(msg) }, error => {
		if (error) console.error(error);
	});

	if (!order) return;

	if (deleted) updateField(order, { id: '', url: '', channel: { id: '', name: 'deleted' } }, 'vendor');
	else if (msg.channel.parentID === order.vendor.category) updateField(order, msg, 'vendor');
	else updateField(order, msg, 'master');
};

const updateField = (order, msg, field) => {
	order[field].message.id = msg.id;
	order[field].message.url = msg.url;
	order[field].message.channel = msg.channel.id;

	order.markModified(`${field}.message.id`);
	order.markModified(`${field}.message.url`);
	order.markModified(`${field}.message.channel`);

	if (field === 'vendor') {
		order.state = msg.channel.name;
		order.markModified('state');
	}

	order.save();
};