const mongoose = require('mongoose');
const reqString = {
    type: String,
    required: true,
};


const breakSchema = mongoose.Schema({
    expires: String,
    at: Number,
    user: String,
    accepted: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('breaks', breakSchema);