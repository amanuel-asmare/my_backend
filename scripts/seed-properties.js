const mongoose = require('mongoose');
const Property = require('../models/property');

// Simplified connection without deprecated options
mongoose.connect('mongodb://localhost:27017/land_administration');

const sampleProperties = [{
        name: "Luxury Villa",
        type: "residential",
        status: "available",
        price: 750000,
        location: "123 Palm Avenue, Beverly Hills",
        area: 3500
    },
    {
        name: "Downtown Office Space",
        type: "commercial",
        status: "available",
        price: 1200000,
        location: "456 Business District, Downtown",
        area: 5000
    },
    {
        name: "Organic Farm",
        type: "agricultural",
        status: "available",
        price: 500000,
        location: "789 Rural Road, Countryside",
        area: 100000
    },
    {
        name: "Modern Apartment",
        type: "residential",
        status: "available",
        price: 350000,
        location: "321 Urban Street, City Center",
        area: 1200
    },
    {
        name: "Shopping Complex",
        type: "commercial",
        status: "available",
        price: 2500000,
        location: "654 Market Street, Shopping District",
        area: 15000
    },
    {
        name: "Vineyard Estate",
        type: "agricultural",
        status: "available",
        price: 1500000,
        location: "987 Wine Valley Road, Napa",
        area: 50000
    }
];

async function seedProperties() {
    try {
        // Clear existing properties
        await Property.deleteMany({});

        // Insert new properties
        const result = await Property.insertMany(sampleProperties);
        console.log(`Successfully seeded ${result.length} properties`);
        console.log('Sample data:', result);
    } catch (error) {
        console.error('Error seeding properties:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedProperties();