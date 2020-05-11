const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    point: {
        type: Number,
        required: true
    },
    gamble: {
        lsd: [
            {
                num: Number,
                amount: Number
            }
        ],
        dmt: [
            {
                num: Number,
                amount: Number
            }
        ]
    }
});

userSchema.methods.clearGamble = () => {
    this.gamble.lsd = [];
    this.gamble.dmt = [];
    return this.save();
}


module.exports = new mongoose.model('User', userSchema);