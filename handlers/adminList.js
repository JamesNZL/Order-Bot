'use strict';

module.exports = guild => [...guild.members.cache.filter(member => member.hasPermission('ADMINISTRATOR') && !member.user.bot).keys()];