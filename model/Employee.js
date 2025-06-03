const mongoose = require('mongoose');

// Define the employee schema
const employeeSchema = new mongoose.Schema({
    name: String,
    age: Number,
    address: String,
    schoolLevel: String,
    gender: String,
});

// Create a model for the employee registration schema
const EmployeeRegistration = mongoose.model("EmployeeRegistration", employeeSchema);

module.exports = EmployeeRegistration;