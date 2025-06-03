/*const mongoose = require('mongoose');

const signupNotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'rejected'],
        default: 'pending_approval'
    },
    userType: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SignupNotification', signupNotificationSchema); */
const mongoose = require('mongoose');

const signupNotificationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending_approval', 'approved', 'rejected'], default: 'pending_approval' },
    userType: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SignupNotification', signupNotificationSchema);