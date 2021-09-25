const mongoose = require('mongoose')

const votesSchema = mongoose.Schema({
    userID:  {
        type: String,
        required: true
    },
    nextVote: Number,
    reminders: {
        type: Boolean,
        default: true,
        required: true
    },
    votes: Number
})

module.exports = mongoose.model('votes', votesSchema)