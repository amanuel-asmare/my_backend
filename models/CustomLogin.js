const customLoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'holder',
        enum: ['holder', 'employee', 'manager', 'author'],
    },
    status: {
        type: String,
        default: 'pending', // Changed to 'pending' for new users
        enum: ['pending', 'verified', 'rejected'],
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('CustomLogin', customLoginSchema);