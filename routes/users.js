// routes/users.js
// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '216446104200-vr45iltv3l53l3db7a5jrrv2hgmvv1uk.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// Login Route
router.post('/login_check', async(req, res) => {
    try {
        console.log('Login request body:', req.body);
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required',
            });
        }

        const user = await User.findOne({ name });
        if (!user) {
            console.log('User not found:', name);
            return res.status(401).json({
                status: 'error',
                message: 'User not found',
            });
        }

        if (user.status === 'pending') {
            return res.status(403).json({
                status: 'error',
                message: 'Account is pending approval',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for:', user.name);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password',
            });
        }

        console.log('Login successful for:', user.name);
        res.status(200).json({
            status: 'success',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions || [],
            },
        });
    } catch (error) {
        console.error('Login error:', error.stack);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Registration Route
router.post('/login_new_customer', async(req, res) => {
    try {
        console.log('Registration request body:', req.body);
        const { name, password, email, area, location } = req.body;

        if (!name || !password || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, password, and email are required',
            });
        }

        const existingUser = await User.findOne({ $or: [{ name }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            password: hashedPassword,
            email,
            area: area || 0,
            location: location || '',
            role: 'holder',
            status: 'pending',
        });

        await newUser.save();
        console.log('User registered:', name);

        res.status(201).json({
            status: 'success',
            message: 'Registration successful. Your account is pending approval.',
        });
    } catch (error) {
        console.error('Registration error:', error.stack);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Google Sign-In Route
router.post('/google-login', async(req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({
                status: 'error',
                message: 'ID token is required',
            });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name,
                email,
                password: '',
                role: 'holder',
                status: 'approved',
            });
            await user.save();
        }

        if (user.status === 'pending') {
            return res.status(403).json({
                status: 'error',
                message: 'Account is pending approval',
            });
        }

        res.status(200).json({
            status: 'success',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions || [],
            },
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Google login failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

module.exports = router;