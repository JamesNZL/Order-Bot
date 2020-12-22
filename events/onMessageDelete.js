'use strict';

const Order = require('../models/order');

const { updateOrder } = require('../handlers');
const { parseSerial } = require('../modules');
const { forwardMaster } = require('./onReaction');

const config = require('../config');

module.exports = {
	events: ['messageDelete'],
	process: [],
	async execute(_, msg) {
		const { bot } = require('../');

		if (!msg.partial && !msg.author.bot) return;
		if (msg.partial) console.log(msg);

		if (msg.channel.id === config.masterDeletedID) return msg.channel.send(msg.embeds[0]);

		const fetchedLogs = await msg.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' });

		const deletionLog = (fetchedLogs)
			? fetchedLogs.entries.first()
			: null;

		if (deletionLog) {
			const { executor, target } = deletionLog;

			if (target.id === msg.author.id && executor.id !== bot.user.id && msg.embeds[0] && msg.embeds[0].title.includes('Order')) {
				setTimeout(async () => {
					const order = await Order.findOne({ 'serial': parseSerial(msg) }, error => {
						if (error) console.error(error);
					});

					if (!order) return;

					checkApparentMessage(bot, order, 'vendor', () => {
						updateOrder(msg, true);
						forwardMaster(bot, msg, 'delete');
					});

					checkApparentMessage(bot, order, 'master', () => msg.channel.send(msg.embeds[0]));
				}, 5000);
			}
		}
	},
};

const checkApparentMessage = async (bot, order, path, callback) => {
	if (order[path].message.channel) {
		await bot.channels.cache.get(order[path].message.channel).messages.fetch(order[path].message.id)
			.catch(error => {
				if (error.message === 'Unknown Message' && order.state !== 'deleted') callback();
			});
	}
};