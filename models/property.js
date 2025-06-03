const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['residential', 'commercial', 'agricultural']
    },
    propertyStatus: {
        type: String,
        required: true,
        default: 'available'
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);