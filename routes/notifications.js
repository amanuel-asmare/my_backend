/*const express = require('express');
const router = express.Router();
const SignupNotification = require('../model/SignupNotification');

router.get('/', async(req, res) => {
    try {
        const notifications = await SignupNotification.find({});
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
});

// POST endpoint to create a new notification
router.post('/', async(req, res) => {
    try {
        const { type, name, email, userType } = req.body;
        if (!type || !name || !email || !userType) {
            return res.status(400).json({
                status: 'error',
                message: 'Type, name, email, and userType are required'
            });
        }
        const newNotification = new SignupNotification({
            type,
            name,
            email,
            userType,
            status: 'pending_approval',
            timestamp: new Date()
        });
        const savedNotification = await newNotification.save();
        res.status(201).json({
            status: 'success',
            message: 'Notification created successfully',
            data: savedNotification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create notification',
            error: error.message
        });
    }
});

module.exports = router;*/
const express = require('express');
const router = express.Router();
const SignupNotification = require('../model/SignupNotification');

router.get('/', async(req, res) => {
    try {
        const notifications = await SignupNotification.find({ status: 'pending_approval' });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
});

// POST endpoint to create a new notification
router.post('/', async(req, res) => {
    try {
        const { type, name, email, userType } = req.body;
        if (!type || !name || !email || !userType) {
            return res.status(400).json({
                status: 'error',
                message: 'Type, name, email, and userType are required'
            });
        }
        const newNotification = new SignupNotification({
            type,
            name,
            email,
            userType,
            status: 'pending_approval',
            timestamp: new Date()
        });
        const savedNotification = await newNotification.save();
        res.status(201).json({
            status: 'success',
            message: 'Notification created successfully',
            data: savedNotification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create notification',
            error: error.message
        });
    }
});

module.exports = router;