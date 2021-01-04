'use strict';

const Discord = require('discord.js');
const chrono = require('chrono-node');

const Order = require('../models/order');

const { sendMsg } = require('../handlers');
const { formatAge } = require('../modules');

module.exports = async guild => {
	const { earnings } = await require('../cmds')(guild);

	earnings.execute = async (msg, args) => {
		const parsedDate = chrono.parseDate(`${args.join(' ')} ago`);

		const date = (parsedDate)
			? parsedDate.getTime()
			: Date.now() - 604800000;

		const receivedOrders = await Order.find({ updated: { $gte: date }, 'guild.id': msg.guild.id });

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

		const unassignedList = (unassigned.length)
			? `> ${unassigned.join('\n> ')}`
			: '0';

		const earningsEmbed = new Discord.MessageEmbed()
			.setTitle(`Report for past ${formatAge(date)}:`)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setColor('GREEN')
			.addField('Total Orders', receivedOrders.length)
			.addField('Completed Orders', completed)
			.addField('Unassigned Orders', unassignedList)
			.addField('Total Earnings', `$${earnt}`)
			.setTimestamp();

		sendMsg(msg.channel, earningsEmbed);
	};

	return earnings;
};