const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Land Surveying', 'Title Registration', 'Property Inspection', 'Land Valuation', 'Dispute Resolution'],
    },
    salary: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['unassigned', 'assigned', 'completed'],
        default: 'unassigned',
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Task', taskSchema);