'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');
const Order = require('../models/order');

const config = require('../config');

const recentMasterSerials = new Set();
const recentVendorSerials = new Set();

module.exports = async (bot, msg) => {
	let masterSerial, vendorSerial;

	try {
		masterSerial = calculateSerial(await findGreatest('order.serial'), 'order');
		vendorSerial = calculateSerial(await findGreatest('vendor.serial', { 'vendor.id': msg.author.id }), 'vendor');

		if (recentMasterSerials.has(masterSerial)) masterSerial++;
		if (recentVendorSerials.has(`${msg.author.id}-${vendorSerial}`)) vendorSerial++;

		recentMasterSerials.add(masterSerial);
		recentVendorSerials.add(`${msg.author.id}-${vendorSerial}`);

		setTimeout(() => {
			recentMasterSerials.delete(masterSerial);
			recentVendorSerials.delete(`${msg.author.id}-${vendorSerial}`);
		}, 10000);
	}

	catch (error) { console.error(error); }

	const availableMessage = await msg.channel.send(messageToEmbed());
	const masterMessage = await bot.channels.cache.get(config.masterOrdersID).send(messageToEmbed(true));

	const order = await new Order({
		_id: mongoose.Types.ObjectId(),
		order: {
			serial: masterSerial,
			details: msg.content,
			time: Date.now(),
		},
		vendor: {
			id: msg.author.id,
			category: msg.channel.parentID,
			serial: vendorSerial,
			message: {
				id: availableMessage.id,
				url: availableMessage.url,
				channel: availableMessage.channel.id,
			},
		},
		master: {
			serial: masterSerial,
			message: {
				id: masterMessage.id,
				url: masterMessage.url,
				channel: masterMessage.channel.id,
			},
		},
	});

	return await order.save();

	function messageToEmbed(url) {
		const embed = new Discord.MessageEmbed()
			.setDescription(msg.content)
			.setColor('GOLD')
			.setTitle(`Order #${masterSerial} | Vendor Order #${vendorSerial}`)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp();

		if (url) embed.setURL(availableMessage.url);

		return embed;
	}
};

const findGreatest = async (field, options) => await Order.find(options).sort({ [field]:-1 }).limit(1).exec();

const calculateSerial = (latestOrder, path) => {
	if (latestOrder.length) return latestOrder[0][path].serial + 1;
	else return 1;
};