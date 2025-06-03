// Transaction Notification Model (if not already defined)
cons
const TransactionNotification = mongoose.Route('TransactionNotification', new mongoose.Schema({
    oldHolderName: { type: String, required: true },
    newHolderName: { type: String, required: true },
    transactionType: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}));

// Transfer Land Endpoint
app.post('/api/transfer_land', async(req, res) => {
    try {
        const { oldHolderName, newHolderName, area, location, transactionType, price, transactionDate } = req.body;

        // Validate required fields
        if (!oldHolderName || !newHolderName || !area || !location || !transactionType) {
            return res.status(400).json({
                status: 'error',
                message: 'All required fields must be provided',
            });
        }

        // Find the property owned by oldHolderName
        const property = await Holder.findOne({
            name: oldHolderName.trim(),
            location: location.trim(),
            area: Number(area),
        });

        if (!property) {
            return res.status(404).json({
                status: 'error',
                message: 'Property not found for the old holder',
            });
        }

        // Update property to new holder
        property.name = newHolderName.trim();
        property.price = price ? Number(price) : property.price;
        property.updatedAt = new Date(transactionDate || Date.now());

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

// Transaction Notification Endpoint
app.post('/api/transactions', async(req, res) => {
    try {
        const { oldHolderName, newHolderName, transactionType, type } = req.body;

        // Validate required fields
        if (!oldHolderName || !newHolderName || !transactionType || !type) {
            return res.status(400).json({
                status: 'error',
                message: 'All required fields must be provided',
            });
        }

        // Save transaction notification
        const notification = new TransactionNotification({
            oldHolderName: oldHolderName.trim(),
            newHolderName: newHolderName.trim(),
            transactionType,
            type,
        });

        await notification.save();

        res.status(201).json({
            status: 'success',
            message: 'Transaction notification saved successfully',
            data: notification,
        });
    } catch (error) {
        console.error('Error saving transaction notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to save transaction notification',
            error: error.message,
        });
    }
});