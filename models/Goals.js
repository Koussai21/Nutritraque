const mongoose = require('mongoose');

const goalsSchema = new mongoose.Schema({
    calories: {
        type: Number,
        required: true,
        min: 0
    },
    proteines: {
        type: Number,
        required: true,
        min: 0
    },
    glucides: {
        type: Number,
        required: true,
        min: 0
    },
    lipides: {
        type: Number,
        required: true,
        min: 0
    },
    dateCreation: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Goals', goalsSchema); 