// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    landArea: {
        type: Number,
        required: true
    },
    taxAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'USD'
    },
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    transactionId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Payment', paymentSchema);