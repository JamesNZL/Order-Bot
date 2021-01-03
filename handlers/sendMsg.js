'use strict';

module.exports = (channel, msg, additions) => channel.send(msg, additions).catch(error => console.error(`Error sending message to ${channel}.`, error));