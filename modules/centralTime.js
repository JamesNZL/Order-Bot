'use strict';

const moment = require('moment-timezone');
const dateFormat = require('dateformat');

module.exports = (timestamp, format) => dateFormat(moment.tz(timestamp, 'America/Chicago').format().slice(0, -6), format);