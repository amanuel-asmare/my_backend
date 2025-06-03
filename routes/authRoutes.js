const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const CLIENT_ID = '216446104200-vr45iltv3l53l3db7a5jrrv2hgmvv1uk.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// Google login
router.post('/google-login', async(req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload['email'];
        const name = payload['name'];

        let user = await User.findOne({ email });
        if (!user) {
            const hashedPassword = await bcrypt.hash('google_default_' + Date.now(), 10);
            user = new User({
                name: name || email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'holder',
                status: 'approved', // Auto-approve
                createdAt: new Date(),
            });
            await user.save();
        }
        if (user.status !== 'approved') {
            return res.status(403).json({
                status: 'error',
                message: `Account is ${user.status}. Please contact the administrator.`,
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Google login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            },
        });
    } catch (error) {
        console.error('Error with Google login:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process Google login',
            error: error.message,
        });
    }
});

module.exports = router;