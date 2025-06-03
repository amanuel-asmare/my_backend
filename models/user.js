const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    profilePicture: { type: String },
    role: { type: String, enum: ['holder', 'employee', 'manager', 'author'], default: 'holder' },
    permissions: [{ type: String }],
    area: { type: Number, default: 0 },
    location: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);