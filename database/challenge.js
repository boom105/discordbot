const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const challengeSchema = new Schema({
    member: {
        discordId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    opponent: {
        discordId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },

    point: {
        type: Number,
        required: true
    }
})



module.exports = new mongoose.model('Challenge', challengeSchema);