'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');
const Order = require('../models/order');

const config = require('../config');

const recentOrderSerials = new Set();
const recentMasterSerials = new Set();
const recentVendorSerials = new Set();

module.exports = async (bot, msg) => {
	const orderSerial = await generateSerial(async () => await randomSerial('serial'), recentOrderSerials);
	const masterSerial = await generateSerial(async () => calculateSerial(await findGreatest('master.serial'), 'master'), recentMasterSerials);
	const vendorSerial = await generateSerial(async () => calculateSerial(await findGreatest('vendor.serial', { 'vendor.id': msg.author.id }), 'vendor'), recentVendorSerials, msg.author.id);

	const availableMessage = await msg.channel.send(messageToEmbed());
	const masterMessage = await bot.channels.cache.get(config.masterOrdersID).send(messageToEmbed(true));

	const order = await new Order({
		_id: mongoose.Types.ObjectId(),
		serial: orderSerial,
		details: msg.content,
		time: Date.now(),
		vendor: {
			id: msg.author.id,
			category: msg.channel.parentID,
			serial: vendorSerial,
			message: {
				id: availableMessage.id,
				url: availableMessage.url,
				channel: {
					id: availableMessage.channel.id,
					name: availableMessage.channel.name,
				},
			},
		},
		master: {
			serial: masterSerial,
			message: {
				id: masterMessage.id,
				url: masterMessage.url,
				channel: {
					id: masterMessage.channel.id,
					name: masterMessage.channel.name,
				},
			},
		},
	});

	return await order.save();

	function messageToEmbed(url) {
		const embed = new Discord.MessageEmbed()
			.setColor('GOLD')
			.setTitle(`Order #${orderSerial}`)
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

const generateSerial = async (generator, set, additions) => {
	const serial = await generator();

	if (set.has(`${additions}${serial}`)) return await generateSerial(generator, set, additions);

	set.add(`${additions}${serial}`);

	setTimeout(() => {
		set.delete(`${additions}${serial}`);
	}, config.databaseDelay);

	return serial;
};