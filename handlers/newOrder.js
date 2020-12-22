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
		masterSerial = await randomSerial('order.serial');
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
			.setColor('GOLD')
			.setTitle(`Order #${masterSerial}`)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setDescription(msg.content)
			.setTimestamp();

		if (url) embed.addField('Order Link', `[Vendor Message](${availableMessage.url})`);

		return embed;
	}
};

const randomSerial = async field => {
	const generatedSerial = Number(('' + Math.random()).substring(2, 7));
	const existingSerial = await Order.findOne({ [field]: generatedSerial }).exec();

	if (existingSerial) return randomSerial(field);
	else return generatedSerial;
};

const findGreatest = async (field, options) => await Order.find(options).sort({ [field]:-1 }).limit(1).exec();

const calculateSerial = (latestOrder, path) => {
	if (latestOrder.length) return latestOrder[0][path].serial + 1;
	else return 1;
};