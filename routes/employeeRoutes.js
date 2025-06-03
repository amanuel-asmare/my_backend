const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/emp_register', async(req, res) => {
    try {
        const employees = await Employee.find({});
        console.log('Found employees:', employees);
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch employees',
            error: error.message,
        });
    }
});

// Register a new employee
router.post('/emp_register', async(req, res) => {
    try {
        const { name, age, address, schoolLevel, gender } = req.body;
        if (!name || !age || !address || !schoolLevel || !gender) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required',
            });
        }
        const existingEmployee = await Employee.findOne({ name });
        if (existingEmployee) {
            return res.status(409).json({
                status: 'error',
                message: 'Employee already exists with this name',
            });
        }
        const newEmployee = new Employee({ name, age, address, schoolLevel, gender });
        const savedEmployee = await newEmployee.save();
        console.log('Employee saved:', savedEmployee);
        res.status(201).json({
            status: 'success',
            message: 'Employee registered successfully',
            _id: savedEmployee._id,
            data: savedEmployee,
        });
    } catch (error) {
        console.error('Error registering employee:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// Delete an employee
router.delete('/emp_register/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const deletedEmployee = await Employee.findByIdAndDelete(id);
        if (!deletedEmployee) {
            return res.status(404).json({
                status: 'error',
                message: 'Employee not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Employee deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete employee',
            error: error.message,
        });
    }
});

// Update an employee
router.put('/emp_register/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { name, age, address, schoolLevel, gender } = req.body;
        if (!name || !age || !address || !schoolLevel || !gender) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required',
            });
        }
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id, { name, age, address, schoolLevel, gender }, { new: true, runValidators: true }
        );
        if (!updatedEmployee) {
            return res.status(404).json({
                status: 'error',
                message: 'Employee not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Employee updated successfully',
            data: updatedEmployee,
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update employee',
            error: error.message,
        });
    }
});

module.exports = router;
/*const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/emp_register', async(req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update employee
router.put('/emp_register/:id', async(req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true }
        );
        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete employee
router.delete('/emp_register/:id', async(req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;*/