'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const { mongoose } = require('./handlers');

const TOKEN = process.env.TOKEN;
const MONGOURI = process.env.MONGOURI;

const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

bot.login(TOKEN).then(() => exports.bot = bot);
mongoose.login(MONGOURI);

bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}!`));
process.on('unhandledRejection', (...args) => console.error(...args));

const eventHandler = (process, event, module) => process.on(event, (...args) => module.execute(event, ...args));

const events = require('./events');

Object.keys(events).map(key => {
	if (events[key].events.length) events[key].events.forEach(event => eventHandler(bot, event, events[key]));
	if (events[key].process.length) events[key].process.forEach(event => eventHandler(process, event, events[key]));
});