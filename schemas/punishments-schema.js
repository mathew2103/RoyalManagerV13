const mongoose = require('mongoose');

const punishmentSchema = mongoose.Schema({
	guild: {
		type: String,
		required: true,
	},
	user: {
		type: String,
		required: true,
	},
	author: String,
	at: String,
	punishmentId: String,
	channel: String,
	appealed: {
		type: Boolean,
		default: false,
	},
	belongsto: String,
	reason: String,
});


module.exports = mongoose.model('punishments', punishmentSchema);