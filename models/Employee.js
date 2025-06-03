const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true },
    schoolLevel: { type: String, required: true },
    registrationDate: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.registrationDate = ret.registrationDate.toISOString();
            return ret;
        }
    }
});

module.exports = mongoose.model('Employee', employeeSchema);