'use strict';

const Order = require('../models/order');

const { adminList } = require('../handlers');

module.exports = {
	events: ['guildMemberAdd'],
	process: [],
	async execute(_, member) {
		const { bot } = require('../');
		const config = await require('../handlers/database')(member.guild);

		if (member.user.bot) return;

		member.roles.add(config.vendor.role.id);

		const vendorOrder = await Order.findOne({ 'guild.id': member.guild.id, 'vendor.id': member.id });

		const existingCategory = (vendorOrder)
			? member.guild.channels.cache.find(channel => channel.type === 'category' && channel.id === vendorOrder.vendor.category)
			: member.guild.channels.cache.find(channel => channel.type === 'category' && channel.name === member.user.tag);

		if (existingCategory) {
			if (existingCategory.name !== member.user.tag) existingCategory.edit({ name: member.user.tag });

			existingCategory.createOverwrite(member.id, { 'VIEW_CHANNEL': true });
			existingCategory.children.each(channel => channel.createOverwrite(member.id, { 'VIEW_CHANNEL': true }));

			return;
		}

		await member.guild.channels.create(member.user.tag, { type: 'category' })
			.then(async category => {
				await category.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				await setChannelVisibility(category, [member.guild.roles.everyone], false);
				await setChannelVisibility(category, [member.id, ...adminList(member.guild)], true);

				createChannels(member.guild, [config.vendor.available.name, config.vendor.problems.name, config.vendor.processing.name, config.vendor.completed.name], category);
			});
	},
};

const setChannelVisibility = async (channel, users, show) => await users.forEach(user => channel.createOverwrite(user, { 'VIEW_CHANNEL': show }));

const createChannels = (guild, channels, category) => channels.forEach(channel => guild.channels.create(channel, { parent: category }));