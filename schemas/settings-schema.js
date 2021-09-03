const mongoose = require('mongoose');
const reqString = {
	type: String,
	required: true,
};
const settingsSchema = mongoose.Schema({
	guildId: reqString,
	reasons: {
		type: [String],
	},
	modMsg: String,
	logs: String,
	applications: {
		currentApps: String,
		tocontact: String,
		buttonID: String,
		channelID: String,
	},
	economy: {
		items: [Object],
	},
});

module.exports = mongoose.model('settings', settingsSchema);