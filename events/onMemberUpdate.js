'use strict';

module.exports = {
	events: ['guildMemberUpdate'],
	process: [],
	execute(_, __, newMember) {
		const memberCategory = newMember.guild.channels.cache.find(category => category.type === 'category' && category.permissionOverwrites.has(newMember.id));

		if (memberCategory.name === newMember.user.tag) return;

		memberCategory.edit({ name: newMember.user.tag });
	},
};