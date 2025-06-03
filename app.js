const express = require('express');
const propertyRoutes = require('./routes/properties');

// ... other existing imports and middleware ...

app.use('/api', propertyRoutes);