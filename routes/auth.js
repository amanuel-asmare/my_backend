const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/user');

// Initialize the Google OAuth client
const client = new OAuth2Client(
    '216446104200-vr45iltv3l53l3db7a5jrrv2hgmvv1uk.apps.googleusercontent.com'
);

// Google login endpoint
router.post('/google-login', async(req, res) => {
    try {
        const { idToken, email, name, photoUrl } = req.body;

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: '216446104200-vr45iltv3l53l3db7a5jrrv2hgmvv1uk.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const userId = payload['sub']; // Google user ID

        console.log('Google authentication successful for user:', payload.email);

        // Check if user exists in database
        let user = await User.findOne({ email: payload.email });

        if (!user) {
            // Create new user if not exists
            user = new User({
                name: payload.name,
                email: payload.email,
                googleId: userId,
                profilePicture: payload.picture,
                role: 'holder', // Default role
                isApproved: true, // Auto-approve Google users
            });

            await user.save();
            console.log('New user created from Google login:', user.email);
        }

        // Return user data
        res.status(200).json({
            status: 'success',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Authentication failed',
            error: error.message
        });
    }
});

module.exports = router;