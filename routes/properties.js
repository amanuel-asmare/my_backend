const express = require('express');
const router = express.Router();
const Property = require('../models/property');

router.post('/property/search', async(req, res) => {
    try {
        console.log('Received search request:', req.body);

        const { type, status, minPrice, maxPrice } = req.body;
        const query = {};

        if (type) {
            query.propertyType = type.toLowerCase();
        }

        if (status) {
            query.propertyStatus = status.toLowerCase();
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        console.log('MongoDB query:', query);

        const properties = await Property.find(query)
            .select('name location area propertyType propertyStatus price image')
            .lean();

        console.log('Found properties:', properties.length);

        if (properties.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No properties found matching your criteria'
            });
        }

        res.status(200).json({
            status: 'success',
            data: properties
        });

    } catch (error) {
        console.error('Property search error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to search properties',
            error: error.message
        });
    }
});

// Add a route to handle property creation from add_new_holders.dart
router.post('/add_holder', async(req, res) => {
    try {
        const {
            name,
            location,
            area,
            propertyType,
            propertyStatus,
            price
        } = req.body;

        let imageUrl = null;
        if (req.files && req.files.image) {
            // Handle image upload here
            // Save image and get URL
            imageUrl = '/uploads/' + req.files.image.name; // Example path
        }

        const property = new Property({
            name,
            location,
            area: parseFloat(area),
            propertyType,
            propertyStatus,
            price: parseFloat(price),
            image: imageUrl
        });

        await property.save();

        res.status(201).json({
            status: 'success',
            message: 'Property added successfully',
            holderId: property._id
        });

    } catch (error) {
        console.error('Error adding property:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add property',
            error: error.message
        });
    }
});

module.exports = router;