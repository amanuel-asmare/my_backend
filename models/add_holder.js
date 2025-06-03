const mongoose = require('mongoose');

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
    propertyType: {
        type: String,
        required: [true, 'Property type is required'],
        enum: ['residential', 'commercial', 'agricultural'],
        default: 'residential'
    },
    propertyStatus: {
        type: String,
        enum: ['available', 'rented', 'sold'],
        default: 'available'
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NewHolderRegistration', HolderSchema);