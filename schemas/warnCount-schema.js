const mongoose = require('mongoose');

const warnCountSchema = mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	guildId: {
		type: String,
		required: true,
	},
	current: Number,
	total: Number,
});

module.exports = mongoose.model('warncount', warnCountSchema);