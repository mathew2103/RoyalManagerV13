const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    userID:  {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    feedback: String,
    overseer: String,
    voidReason: String,
});

module.exports = mongoose.model('feedBacks', feedbackSchema);