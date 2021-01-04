'use strict';

const Discord = require('discord.js');
const Order = require('../models/order');

const { updateOrder } = require('../handlers');
const { isOrderEmbed, parseSerial } = require('../modules');
const { forwardMaster } = require('./onReaction');

module.exports = {
	events: ['messageDelete'],
	process: [],
	async execute(_, msg) {
		const { bot } = require('../');

		if (!msg.partial && !msg.author.bot) return;

		let config = await require('../handlers/database')(msg.guild);

		if (msg.partial) {
			return setTimeout(async () => {
				const vendorMatch = await Order.findOne({ 'vendor.message.id': msg.id });
				const masterMatch = await Order.findOne({ 'master.message.id': msg.id });

				const findMatch = field => {
					return (vendorMatch)
						? vendorMatch.vendor.message[field]
						: masterMatch.master.message[field];
				};

				const order = vendorMatch || masterMatch;

				if (!order) return;

				config = await require('../handlers/database')(bot.guilds.cache.get(order.guild.id));

				msg = {
					id: msg.id,
					url: findMatch('url'),
					channel: bot.channels.cache.get(findMatch('channel').id),
					guild: {
						id: bot.channels.cache.get(findMatch('channel').id).guild.id,
					},
					embeds: [new Discord.MessageEmbed({
						title: `Order #${order.serial}`,
						description: order.details,
						color: config.embedColours[order.state],
						timestamp: order.time,
						author: {
							name: bot.channels.cache.get(findMatch('channel')).guild.members.cache.get(order.vendor.id).displayName,
							iconURL: bot.users.cache.get(order.vendor.id).displayAvatarURL({ dynamic: true }),
						},
					})],
				};

				['Comments', 'Amendments'].forEach(field => {
					if (order[field.toLowerCase()]) msg.embeds[0].addField(field, order[field.toLowerCase()]);
				});

				if (msg.channel.id === config.master.deleted.id) return;

				else if (config.master.channels.ids.includes(msg.channel.id)) {
					msg.embeds[0].addField('Order Link', `[Vendor Message](${order.vendor.message.url})`);
				}

				processDeletion(bot, config, msg, order);
			}, config.databaseDelay);
		}

		if (msg.channel.id === config.master.deleted.id) return;

		const fetchedLogs = await msg.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' });

		const deletionLog = (fetchedLogs)
			? fetchedLogs.entries.first()
			: null;

		if (deletionLog) {
			const { executor, target } = deletionLog;

			if (target.id === msg.author.id && executor.id !== bot.user.id && isOrderEmbed(msg)) {
				setTimeout(async () => {
					processDeletion(bot, config, msg, await Order.findOne({ 'guild.id': msg.guild.id, 'serial': parseSerial(msg) }));
				}, config.databaseDelay);
			}
		}
	},
};

const processDeletion = (bot, config, msg, order) => {
	if (!order) return;

	checkApparentMessage(bot, order, 'vendor', () => {
		updateOrder(msg, true);
		forwardMaster(bot, config, msg, 'delete');
	});

	checkApparentMessage(bot, order, 'master', () => msg.channel.send(msg.embeds[0]));
};

const checkApparentMessage = async (bot, order, path, callback) => {
	if (order[path].message.channel.id) {
		await bot.channels.cache.get(order[path].message.channel.id).messages.fetch(order[path].message.id)
			.catch(error => {
				if (error.message === 'Unknown Message' && !order.deleted) callback();
			});
	}
};