'use strict';

const { bot } = require('../');
const config = require('../config');

module.exports = {
	events: ['guildMemberAdd'],
	process: [],
	async execute(_, member) {
		const existingCategory = findCategory(member.guild, member.user.tag);

		if (existingCategory) existingCategory.createOverwrite(member.id, { 'VIEW_CHANNEL': true });

		await member.guild.channels.create(member.user.tag, { type: 'category' })
			.then(async category => {
				await category.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				await setChannelVisibility(category, [member.guild.roles.everyone], false);
				await setChannelVisibility(category, [member.id, ...config.adminIDs], true);

				createChannels(member.guild, [config.availableName, config.problemsName, config.processingName, config.completedName], category);
			});
	},
};


const findCategory = (guild, name) => guild.channels.cache.find(channel => channel.type === 'category' && channel.name === name);

const setChannelVisibility = async (channel, users, show) => await users.forEach(user => channel.createOverwrite(user, { 'VIEW_CHANNEL': show }));

const createChannels = (guild, channels, category) => channels.forEach(channel => guild.channels.create(channel, { parent: category }));