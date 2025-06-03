const express = require('express');
const router = express.Router();
const Holder = require('../models/add_holder');

router.get('/getholderList', async(req, res) => {
    try {
        const holders = await Holder.find({});
        console.log('Fetched holders:', holders);
        if (!holders || holders.length === 0) {
            console.log('No holders found in database');
            return res.status(404).json({
                status: 'error',
                message: 'No holders found',
            });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const holdersWithFullImageUrl = holders.map((holder) => ({
            ...holder._doc,
            image: holder.image && typeof holder.image === 'string' && holder.image.startsWith('/uploads') ?
                `${baseUrl}${holder.image}` : holder.image || '', // Default to empty string if image is missing
        }));
        console.log('Sending holders to client:', holdersWithFullImageUrl);
        res.status(200).json(holdersWithFullImageUrl);
    } catch (error) {
        console.error('Error fetching holders:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch holders',
            error: error.message,
        });
    }
});

router.put('/update-user-info/:id', async(req, res) => {
    try {
        const { name, location, price } = req.body;
        const holder = await Holder.findByIdAndUpdate(
            req.params.id, { name, location, price }, { new: true, runValidators: true }
        );
        if (!holder) {
            return res.status(404).json({
                status: 'error',
                message: 'Holder not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Holder updated successfully',
            data: holder,
        });
    } catch (error) {
        console.error('Error updating holder:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update holder',
            error: error.message,
        });
    }
});

router.delete('/delete_custom/:id', async(req, res) => {
    try {
        const holder = await Holder.findByIdAndDelete(req.params.id);
        if (!holder) {
            return res.status(404).json({
                status: 'error',
                message: 'Holder not found',
            });
        }
        if (holder.image && typeof holder.image === 'string') {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '..', holder.image.replace(/^\/uploads/, 'Uploads'));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        res.status(200).json({
            status: 'success',
            message: 'Holder deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting holder:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete holder',
            error: error.message,
        });
    }
});

module.exports = router;