const mongoose = require('mongoose')
const HolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    area: {
        type: Number,
        required: [true, 'Area is required'],
        min: [0, 'Area cannot be negative']
    },
    image: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NewHolderRegistration', HolderSchema);