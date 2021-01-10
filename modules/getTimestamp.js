'use strict';

const moment = require('moment-timezone');

module.exports = (lastWeekDay, startOfDay) => {
	const currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

	const monday = (currentDate.getDay() <= 4)
		? currentDate.getDate() - currentDate.getDay() + 1
		: currentDate.getDate() - currentDate.getDay() + 8;

	const date = currentDate.setDate(monday - lastWeekDay);
	return (startOfDay)
		? moment.tz(date, 'America/Chicago').startOf('day').valueOf()
		: moment.tz(date, 'America/Chicago').endOf('day').valueOf();
};