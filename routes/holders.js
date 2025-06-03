const express = require('express');
const router = express.Router();
const HolderModel = require('../models/add_holder');

router.get('/:username/land-area', async(req, res) => {
    try {
        const { username } = req.params;
        console.log('Searching for holder:', username);

        const holder = await HolderModel.findOne({ name: username });
        console.log('Holder found:', holder);

        if (!holder) {
            return res.status(404).json({
                status: 'error',
                message: 'Holder not found'
            });
        }

        res.json({
            status: 'success',
            area: holder.area
        });
    } catch (error) {
        console.error('Error in /:username/land-area:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

router.get('/api/holders/:username/land-area', async(req, res) => {
    try {
        const { username } = req.params;
        // Query your database for the user's land area
        const holder = await HolderModel.findOne({ username });

        if (!holder) {
            return res.status(404).json({
                status: 'error',
                message: 'Holder not found'
            });
        }

        res.json({
            status: 'success',
            area: holder.landArea
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;