const mongoose = require('mongoose');

const autoadschema = mongoose.Schema({
	interval: {
		type: Number,
		required: true,
	},
	ads: [],
});
module.exports = mongoose.model('auto-ads', autoadschema);