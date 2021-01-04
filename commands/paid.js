'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');

const Balance = require('../models/balance');
const Order = require('../models/order');

const { cmdError, sendMsg } = require('../handlers');
const { centralTime, formatAge, getTimestamp } = require('../modules');

module.exports = async guild => {
	const { paid } = await require('../cmds')(guild);

	paid.execute = async (msg, args) => {
		try {
			if (args[0] && !Number(args[0])) throw 'Please enter a plain number.';
		}

		catch (error) { return cmdError(msg, error, paid.error); }

		let balance = await Balance.findOne({ 'guild.id': guild.id });

		const friday = getTimestamp(3, true);
		const tuesday = (getTimestamp(6) > friday)
			? getTimestamp(6)
			: getTimestamp(-1);

		const _paid = Number(args[0]) || 0;

		const receivedOrders = await Order.find({ updated: { $gte: friday, $lte: tuesday }, 'guild.id': msg.guild.id });

		let earnt = 0;

		receivedOrders.forEach(order => {
			if (order.state === 'completed') earnt += order.cost;
		});

		if (!balance) {
			balance = await new Balance({
				_id: mongoose.Types.ObjectId(),
				guild: {
					id: guild.id,
					name: guild.name,
				},
				paid: _paid,
				updated: Date.now(),
			});
		}

		else {
			if (getTimestamp(5) > balance.updated) balance.paid = _paid;
			else balance.paid += _paid;

			balance.updated = Date.now();
		}

		balance.save();

		const paidEmbed = new Discord.MessageEmbed()
			.setTitle(`Payment report for last ${formatAge(friday)} (${centralTime(friday, 'shortDate')} – ${centralTime(Date.now(), 'shortDate')}):`)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setColor('GREEN')
			.addField('Total Balance', `$${earnt}`)
			.addField('Paid Balance', `$${balance.paid}`)
			.addField('Outstanding Balance', `$${earnt - balance.paid}`)
			.setTimestamp();

		sendMsg(msg.channel, paidEmbed);
	};

	return paid;
};