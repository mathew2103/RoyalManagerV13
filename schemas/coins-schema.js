const mongoose = require('mongoose');
const reqString = {
	type: String,
	required: true,
};


const coinsSchema = mongoose.Schema({
	userID: reqString,
	balance: Number,
});

module.exports = mongoose.model('coins', coinsSchema);