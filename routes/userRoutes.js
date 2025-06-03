const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const SignupNotification = require('../model/SignupNotification');

// User registration (for Holders)
router.post('/login_new_cutom', async(req, res) => {
    try {
        const { name, password, email, area, location } = req.body;
        if (!name || !password || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, password, and email are required',
            });
        }
        const existingUser = await User.findOne({
            $or: [{ name }, { email }],
        });
        if (existingUser) {
            if (existingUser.name === name) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Username already exists',
                });
            }
            if (existingUser.email === email) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email already registered',
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            password: hashedPassword,
            email,
            role: 'holder',
            area: area || 0,
            location: location || '',
            status: 'approved', // Auto-approve holders
            createdAt: new Date(),
        });
        await newUser.save();

        // Create signup notification
        const notification = new SignupNotification({
            name,
            email,
            type: 'signup',
            userType: 'holder',
            status: 'approved', // Reflect auto-approval in notification
        });
        await notification.save();

        console.log(`User registered: ${name}, ID: ${newUser._id}`);
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully. You can now log in.',
            userId: newUser._id,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// Admin endpoint to register Employee, Manager, Author
router.post('/register_user', async(req, res) => {
    try {
        const { name, password, email, role, permissions } = req.body;
        if (!name || !password || !email || !role) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, password, email, and role are required',
            });
        }
        if (!['employee', 'manager', 'author', 'holder'].includes(role)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid role',
            });
        }
        const existingUser = await User.findOne({
            $or: [{ name }, { email }],
        });
        if (existingUser) {
            if (existingUser.name === name) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Username already exists',
                });
            }
            if (existingUser.email === email) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email already registered',
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            password: hashedPassword,
            email,
            role,
            permissions: permissions || [],
            status: 'approved',
        });
        await newUser.save();
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// Approve user account
router.post('/approve_user', async(req, res) => {
    try {
        const { userId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID format',
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        if (user.status === 'approved') {
            return res.status(400).json({
                status: 'error',
                message: 'User is already approved',
            });
        }
        user.status = 'approved';
        user.updatedAt = new Date();
        await user.save();
        res.status(200).json({
            status: 'success',
            message: 'User approved successfully',
        });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to approve user',
            error: error.message,
        });
    }
});

// Login check (for all roles)
router.post('/login_check', async(req, res) => {
    try {
        const { name, password } = req.body;
        console.log(`Login attempt for user: ${name}`);
        if (!name || !password) {
            console.log('Missing username or password');
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required',
            });
        }
        const user = await User.findOne({ name });
        if (!user) {
            console.log(`User not found: ${name}`);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username',
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Invalid password for user: ${name}`);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password',
            });
        }
        if (user.status !== 'approved') {
            console.log(`User ${name} has status: ${user.status}`);
            return res.status(403).json({
                status: 'error',
                message: `Account is ${user.status}. Please contact the administrator.`,
            });
        }
        console.log(`Login successful for user: ${name}, role: ${user.role}`);
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                area: user.area,
                location: user.location,
            },
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// Get user information
router.get('/user-info/:username', async(req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: 'success',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            area: user.area,
            location: user.location,
            status: user.status,
        });
    } catch (err) {
        console.error('Error fetching user info:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching user information',
        });
    }
});

// Update user information
router.put('/update-signup-user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const { name, email } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID format',
            });
        }
        if (!name || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Name and email are required',
            });
        }
        const existingUser = await User.findOne({
            email: email,
            _id: { $ne: userId },
        });
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'Email already in use by another user',
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                name: name,
                email: email,
                updatedAt: new Date(),
            }, { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'User information updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({
            status: 'error',
            message: err.name === 'ValidationError' ?
                'Invalid data provided' : 'Internal server error while updating user',
        });
    }
});

// Delete user
router.delete('/delete_signup_user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID format',
            });
        }
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while deleting user',
        });
    }
});

// Fetch all users
router.get('/custom_fetch_login', async(req, res) => {
    try {
        const users = await User.find({}, {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
        });
        if (!users || users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No users found',
            });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

module.exports = router;