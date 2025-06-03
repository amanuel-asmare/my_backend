const express = require('express');
const router = express.Router();
const SignupNotification = require('../model/SignupNotification');

// Update notification
router.put('/notifications/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const notification = await SignupNotification.findByIdAndUpdate(
            id, { status, rejectionReason, updatedAt: new Date() }, { new: true }
        );
        if (!notification) {
            return res.status(404).json({
                status: 'error',
                message: 'Notification not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: `Notification ${status} successfully`,
            data: notification,
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update notification',
            error: error.message,
        });
    }
});

// Send rejection email
router.post('/send-rejection-email', async(req, res) => {
    try {
        const { email, name, message } = req.body;
        console.log('Rejection email to:', email, 'Message:', message);
        res.status(200).json({
            status: 'success',
            message: 'Rejection email sent successfully',
        });
    } catch (error) {
        console.error('Error sending rejection email:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send rejection email',
            error: error.message,
        });
    }
});

module.exports = router;