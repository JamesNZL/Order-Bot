'use strict';

module.exports = msg => msg.embeds[0].title.split(' ')[1].replace('#', '');