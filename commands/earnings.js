'use strict';

const Discord = require('discord.js');
const Order = require('../models/order');

const { sendMsg } = require('../handlers');
const { formatAge } = require('../modules');

module.exports = async guild => {
	const { earnings } = await require('../cmds')(guild);

	earnings.execute = async (msg, args) => {
		let period;

		if (!args[0]) period = 604800000;

		const receivedOrders = await Order.find({ updated: { $gte: (Date.now() - period) }, 'guild.id': msg.guild.id });

		let earnt = 0;
		let completed = 0;
		const unassigned = [];

		receivedOrders.forEach(order => {
			if (order.state === 'completed') {
				earnt += order.cost;
				completed++;

				if (order.cost === 0) {
					(order.vendor.message.url)
						? unassigned.push(`[Order #${order.serial}](${order.vendor.message.url})`)
						: unassigned.push(`Order #${order.serial}`);
				}
			}
		});

		const earningsEmbed = new Discord.MessageEmbed()
			.setTitle(`Report for past ${formatAge(period, true)}:`)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setColor('GREEN')
			.addField('Total Orders', receivedOrders.length)
			.addField('Completed Orders', completed)
			.addField('Unassigned Orders', `> ${unassigned.join('\n> ')}`)
			.addField('Total Earnings', `$${earnt}`)
			.setTimestamp();

		sendMsg(msg.channel, earningsEmbed);
	};

	return earnings;
};