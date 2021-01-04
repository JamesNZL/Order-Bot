'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');
const Order = require('../models/order');

const recentOrderSerials = new Set();
const recentMasterSerials = new Set();
const recentVendorSerials = new Set();

module.exports = async msg => {
	const { bot } = require('../');
	const config = await require('../handlers/database')(msg.guild);

	const orderSerial = await generateSerial(async () => await randomSerial('serial', msg.guild), recentOrderSerials, `${msg.guild.id}-`, config.databaseDelay);
	const masterSerial = await generateSerial(async () => calculateSerial(await findGreatest('master.serial', { 'guild.id': msg.guild.id }), 'master'), recentMasterSerials, `${msg.guild.id}-`, config.databaseDelay);
	const vendorSerial = await generateSerial(async () => calculateSerial(await findGreatest('vendor.serial', { 'guild.id': msg.guild.id, 'vendor.id': msg.author.id }), 'vendor'), recentVendorSerials, `${msg.guild.id}-${msg.author.id}-`, config.databaseDelay);

	const availableMessage = await msg.channel.send(messageToEmbed());
	const masterMessage = await bot.channels.cache.get(config.master.active.id).send(messageToEmbed(true));

	const order = await new Order({
		_id: mongoose.Types.ObjectId(),
		guild: {
			id: msg.guild.id,
			name: msg.guild.name,
		},
		serial: orderSerial,
		details: msg.content,
		time: Date.now(),
		updated: Date.now(),
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
			.setDescription(`\`\`\`${msg.content}\`\`\``)
			.setTimestamp();

		if (url) embed.addField('Order Link', `[Vendor Message](${availableMessage.url})`);

		return embed;
	}
};

const randomSerial = async (field, guild) => {
	const generatedSerial = Number(('' + Math.random()).substring(2, 7));
	const existingSerial = await Order.findOne({ 'guild.id': guild.id, [field]: generatedSerial }).exec();

	if (existingSerial) return randomSerial(field, guild);
	else return generatedSerial;
};

const findGreatest = async (field, options) => await Order.find(options).sort({ [field]:-1 }).limit(1).exec();

const calculateSerial = (latestOrder, path) => {
	if (latestOrder.length) return latestOrder[0][path].serial + 1;
	else return 1;
};

const generateSerial = async (generator, set, additions, delay) => {
	const serial = await generator();

	if (set.has(`${additions}${serial}`)) return await generateSerial(generator, set, additions, delay);

	set.add(`${additions}${serial}`);

	setTimeout(() => {
		set.delete(`${additions}${serial}`);
	}, delay);

	return serial;
};