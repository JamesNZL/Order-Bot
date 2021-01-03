'use strict';

const Discord = require('discord.js');
const Order = require('../models/order');

module.exports = async guild => {
	const { earnings } = await require('../cmds')(guild);

	earnings.execute = async msg => {
		const orders = await Order.find({ updated: { $gte: (Date.now() - 604800000) }, 'guild.id': msg.guild.id });

		let total = 0;
		orders.forEach(order => total += order.cost);

		msg.channel.send(total);
	};

	return earnings;
};