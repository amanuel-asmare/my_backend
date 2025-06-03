const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Employee = require('../models/Employee');

// Get all tasks
router.get('/tasks', async(req, res) => {
    try {
        const { status } = req.query;
        let query = {
            category: {
                $in: [
                    'Land Surveying',
                    'Title Registration',
                    'Property Inspection',
                    'Land Valuation',
                    'Dispute Resolution',
                ],
            },
        };
        if (status) query.status = status;
        const tasks = await Task.find(query);
        res.status(200).json({
            status: 'success',
            data: tasks,
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tasks',
            error: error.message,
        });
    }
});

// Add a new task
router.post('/add-task', async(req, res) => {
    try {
        const { taskName, category, salary } = req.body;
        if (!taskName || !category || !salary) {
            return res.status(400).json({
                status: 'error',
                message: 'Task name, category, and salary are required',
            });
        }
        if (![
                'Land Surveying',
                'Title Registration',
                'Property Inspection',
                'Land Valuation',
                'Dispute Resolution',
            ].includes(category)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid task category',
            });
        }
        const newTask = new Task({
            taskName,
            category,
            salary: Number(salary),
        });
        const savedTask = await newTask.save();
        res.status(201).json({
            status: 'success',
            message: 'Task added successfully',
            data: savedTask,
        });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add task',
            error: error.message,
        });
    }
});

// Assign a task to an employee
router.post('/assign-task', async(req, res) => {
    try {
        const { employeeId, taskId } = req.body;
        if (!employeeId || !taskId) {
            return res.status(400).json({
                status: 'error',
                message: 'Employee ID and Task ID are required',
            });
        }
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found',
            });
        }
        if (task.status !== 'unassigned') {
            return res.status(400).json({
                status: 'error',
                message: 'Task is already assigned or completed',
            });
        }
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                status: 'error',
                message: 'Employee not found',
            });
        }
        task.employeeId = employeeId;
        task.status = 'assigned';
        task.updatedAt = new Date();
        await task.save();
        res.status(200).json({
            status: 'success',
            message: 'Task assigned successfully',
        });
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to assign task',
            error: error.message,
        });
    }
});

module.exports = router;