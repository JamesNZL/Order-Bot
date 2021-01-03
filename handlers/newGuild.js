'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');

const Config = require('../models/config');
const { master, vendor, embedColours } = require('../config');

const recentlyCreated = new Set();

module.exports = async guild => {
	const { bot } = require('../');

	const existingConfig = await Config.findOne({ 'guild.id': guild.id });

	if (existingConfig) return existingConfig;
	else if (recentlyCreated.has(guild.id)) return require('../config');

	recentlyCreated.add(guild.id);

	setTimeout(() => {
		recentlyCreated.delete(guild.id);
	}, 10000);

	const config = await createConfig(guild);

	guild.members.cache.filter(member => !member.user.bot && !member.hasPermission('ADMINISTRATOR')).each(member => bot.emit('guildMemberAdd', member));

	const informationEmbed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.displayAvatarURL({ dynamic: true }))
		.setColor(embedColours.bot)
		.setDescription(`**Hi! I'm ${bot.user}, a custom bot designed to make your life easier!**\n\u200b`)
		.addField('Submitting a new order', `To submit a new order, send your formatted message to your **#${config.vendor.available.name}** channel.\n\nOrders being processed will be transferred into **#${config.vendor.processing.name}**, or into **#${config.vendor.problems.name}** if there is an issue.`, true)
		.addField('Editing an active order', `It's super easy to amend orders!\n\nTo amend an active order, simply click the ${config.emojis.edit} reaction!\n\n*Note: I must be able to private message you!*`, true)
		.addField('Deleting an order', `Orders can be deleted from **#${config.vendor.available.name}** before they're processed or from **#${config.vendor.problems.name}** if they're too hard to amend.\n\nTo delete an order, simply click the ${config.emojis.delete} reaction, and I'll do the rest!`, true);

	const formatEmbed = new Discord.MessageEmbed()
		.setColor(embedColours.bot)
		.setTitle('Order Format')
		.setDescription('Here\'s a guideline for speedy processing:\n```Email:                       \nPassword:                    \nCharacter:                   \nAccount name:                \nPayout: $    \n\nNotes:                       ```')
		.setFooter('Don\'t worry, I\'ll still work with any format!');

	const informationChannel = bot.channels.cache.get(await findChannel('bot-information', 'Order Bot', guild, true));

	informationChannel.createOverwrite(guild.roles.everyone, { 'SEND_MESSAGES': false });

	informationChannel.messages.fetch()
		.then(msgs => {
			if (!msgs.some(msg => msg.author.id === bot.user.id)) {
				informationChannel.send(informationEmbed)
					.then(async _msg => {
						await _msg.react(config.emojis.edit);
						await _msg.react(config.emojis.delete);
					});

				informationChannel.send(formatEmbed);
			}
		});

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
			commands: {
				id: await findChannel(master.commands.name, master.category.name, guild),
			},
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

const findChannel = async (name, parent, guild, show) => {
	const { bot } = require('../');
	const { adminList } = require('./');

	const foundChannel = guild.channels.cache.find(channel => channel.name === name && channel.parent.name === parent);

	if (foundChannel) return foundChannel.id;

	let channelParent = guild.channels.cache.find(channel => channel.type === 'category' && channel.name === parent);

	if (!channelParent) {
		await guild.channels.create(parent, { type: 'category' })
			.then(async category => {
				await category.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });

				if (!show) {
					await setChannelVisibility(category, [guild.roles.everyone], false);
					await setChannelVisibility(category, adminList(guild), true);
				}

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