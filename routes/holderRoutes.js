const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Holder = require('../models/add_holder');
const User = require('../models/User');
const upload = require('../middleware/multerConfig');

// Transfer land
router.post('/transfer_land', upload.single('image'), async(req, res) => {
    try {
        const { oldHolderName, newHolderName, area, location, transactionType, price, transactionDate } =
        req.body;

        // Validate required fields
        if (!oldHolderName || !newHolderName || !area || !location || !transactionType) {
            return res.status(400).json({
                status: 'error',
                message: 'All required fields must be provided',
            });
        }

        // Require image for Buy transactions
        if (transactionType === 'Buy' && !req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'Image is required for Buy transactions',
            });
        }

        // Check if old holder exists in Holder model
        let property = await Holder.findOne({
            name: oldHolderName.trim(),
            location: location.trim(),
            area: Number(area),
        });

        // If not found in Holder, check User for unregistered user
        if (!property) {
            const oldHolder = await User.findOne({ name: oldHolderName.trim() });
            if (!oldHolder) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Old holder not found in registered holders or users',
                });
            }

            // Create a new Holder entry for the unregistered user
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const imageUrl = req.file ? `${baseUrl}/Uploads/${req.file.filename}` : '';
            property = new Holder({
                name: oldHolderName.trim(),
                location: location.trim(),
                area: Number(area),
                propertyType: 'residential',
                propertyStatus: 'available',
                price: price ? Number(price) : 0,
                image: imageUrl,
                createdAt: new Date(),
            });
            await property.save();
        }

        // Check if new holder exists in User (registered user)
        let newHolder = await User.findOne({ name: newHolderName.trim() });
        if (!newHolder) {
            // Create a new User entry for the new holder
            newHolder = new User({
                name: newHolderName.trim(),
                email: `${newHolderName.trim().toLowerCase().replace(/\s+/g, '')}@example.com`,
                password: await bcrypt.hash('default_password', 10),
                role: 'holder',
                status: 'pending', // Ensure new holders need approval
                createdAt: new Date(),
            });
            await newHolder.save();
        }

        // Update property to new holder
        property.name = newHolderName.trim();
        property.price = price ? Number(price) : property.price;
        property.updatedAt = new Date(transactionDate || Date.now());
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            property.image = `${baseUrl}/Uploads/${req.file.filename}`;
        }

        await property.save();

        res.status(200).json({
            status: 'success',
            message: 'Land transferred successfully',
            data: {
                holderId: property._id,
                newHolderName,
                location,
                area,
                transactionType,
                image: property.image,
            },
        });
    } catch (error) {
        console.error('Error transferring land:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to transfer land',
            error: error.message,
        });
    }
});

// Add a new holder
router.post('/add_holder', upload.single('image'), async(req, res) => {
    try {
        const { name, location, area, propertyType, propertyStatus, price } = req.body;
        if (!name || !location || !area || !propertyType || !price || !req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields including image are required',
            });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/Uploads/${req.file.filename}`;
        const newHolder = new Holder({
            name: name.trim(),
            location: location.trim(),
            area: Number(area),
            propertyType,
            propertyStatus: propertyStatus || 'available',
            price: Number(price),
            image: imageUrl,
        });
        const savedHolder = await newHolder.save();
        console.log('Saved holder:', savedHolder);
        res.status(201).json({
            status: 'success',
            message: 'Holder added successfully',
            holderId: savedHolder._id,
        });
    } catch (error) {
        console.error('Error adding holder:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to add holder',
        });
    }
});

// Search properties
router.get('/search-properties', async(req, res) => {
    try {
        const { location, propertyType, minPrice, maxPrice, minArea, maxArea } = req.query;
        let query = {};
        if (location) query.location = { $regex: location, $options: 'i' };
        if (propertyType) query.propertyType = propertyType;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (minArea || maxArea) {
            query.area = {};
            if (minArea) query.area.$gte = Number(minArea);
            if (maxArea) query.area.$lte = Number(maxArea);
        }
        const properties = await Holder.find(query);
        if (properties.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No properties found matching your criteria',
            });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const propertiesWithFullImageUrl = properties.map((prop) => ({
            ...prop._doc,
            image: prop.image &&
                typeof prop.image === 'string' &&
                prop.image.startsWith('/Uploads') ?
                `${baseUrl}${prop.image}` :
                prop.image || '',
        }));
        res.status(200).json({
            status: 'success',
            data: propertiesWithFullImageUrl,
        });
    } catch (error) {
        console.error('Error searching properties:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to search properties',
            error: error.message,
        });
    }
});

module.exports = router;