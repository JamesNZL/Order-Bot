// create master channels
// create vendor role
// for guild memnber not a bot and not admin.ids and not has perm admin, create vendor channels

'use strict';

const mongoose = require('mongoose');

const Config = require('../models/config');
const { master, vendor } = require('../config');

const recentlyCreated = new Set();

module.exports = async guild => {
	const existingConfig = await Config.findOne({ 'guild.id': guild.id });

	if (existingConfig) return existingConfig;
	else if (recentlyCreated.has(guild.id)) return require('../config');

	recentlyCreated.add(guild.id);

	setTimeout(() => {
		recentlyCreated.delete(guild.id);
	}, 10000);

	const config = await createConfig(guild);

	return config;
};

const createConfig = async guild => {
	const config = await new Config({
		_id: mongoose.Types.ObjectId(),
		guild: {
			id: guild.id,
			name: guild.name,
		},
		master: {
			active: {
				id: await findChannel(master.active.name, master.category.name, guild),
			},
			completed: {
				id: await findChannel(master.completed.name, master.category.name, guild),
			},
			deleted: {
				id: await findChannel(master.deleted.name, master.category.name, guild),
			},
			channels :{
				ids: await findChannels([master.active.name, master.completed.name, master.deleted.name], master.category.name, guild),
			},
		},
		vendor: {
			role: {
				id: await findRole(vendor.role.name, vendor.role.permissions, guild),
			},
		},
	});

	return await config.save();
};

const findChannel = async (name, parent, guild) => {
	const { bot } = require('../');
	const { adminList } = require('./');

	const foundChannel = guild.channels.cache.find(channel => channel.name === name && channel.parent.name === parent);

	if (foundChannel) return foundChannel.id;

	let channelParent = guild.channels.cache.find(channel => channel.type === 'category' && channel.name === parent);

	if (!channelParent) {
		await guild.channels.create(parent, { type: 'category' })
			.then(async category => {
				await category.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				await setChannelVisibility(category, [guild.roles.everyone], false);
				await setChannelVisibility(category, adminList(guild), true);
				category.setPosition(0);
				channelParent = category;
			});
	}

	const createdChannel = await guild.channels.create(name, { parent: channelParent });

	return createdChannel.id;
};

const findChannels = async (names, parent, guild) => [...guild.channels.cache.filter(channel => names.includes(channel.name) && channel.parent.name === parent).keys()];

const findRole = async (name, permissions, guild) => {
	const foundRole = guild.roles.cache.find(role => role.name === name);

	if (foundRole) return foundRole.id;

	const createdRole = await guild.roles.create({ data: { name: name, permissions: permissions } });

	return createdRole.id;
};


const setChannelVisibility = async (channel, users, show) => await users.forEach(user => channel.createOverwrite(user, { 'VIEW_CHANNEL': show }));