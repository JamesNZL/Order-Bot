'use strict';

module.exports = msg => {
	(msg.guild)
		? msg.delete().catch(error => console.error(`Error deleting message in ${msg.channel}.`, error))
		: (msg.author.bot)
			? msg.delete().catch(error => console.error('Error deleting message in DMs', error))
			: null;
};