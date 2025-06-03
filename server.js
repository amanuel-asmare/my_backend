const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

// Import routes
const holderRouter = require('./routes/holderInformation');
const addHolderRoutes = require('./routes/holders');
const notificationRoutes = require('./routes/notifications');

// Import models
const SignupNotification = require('./model/SignupNotification');
const Employee = require('./models/Employee');
const User = require('models/User');
const Holder = require('./models/add_holder');
const Task = require('./models/Task');

const CLIENT_ID = '216446104200-vr45iltv3l53l3db7a5jrrv2hgmvv1uk.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const app = express();

const ALLOWED_ORIGINS = [
    'http://localhost:2000',
    'http://localhost:3000',
    'http://localhost:54673',
    'http://localhost:5000',
    'http://192.168.157.198:2000',
    'http://10.0.2.2:2000',
    'http://localhost:8000',
];

const PORT = process.env.PORT || 2000;

// Create uploads directory
const uploadDir = 'Uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, and .jpeg formats allowed!'));
    },
});

// Middleware
app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// MongoDB connection url
mongoose
    .connect(process.env.MONGO_URL, {})
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/holders', addHolderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', holderRouter);

// Employee endpoints
app.get('/api/emp_register', async(req, res) => {
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

app.post('/api/emp_register', async(req, res) => {
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

app.delete('/api/emp_register/:id', async(req, res) => {
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

app.put('/api/emp_register/:id', async(req, res) => {
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

// Task endpoints
app.get('/api/tasks', async(req, res) => {
    try {
        const { status } = req.query;
        let query = { category: { $in: ['Land Surveying', 'Title Registration', 'Property Inspection', 'Land Valuation', 'Dispute Resolution'] } };
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

app.post('/api/add-task', async(req, res) => {
    try {
        const { taskName, category, salary } = req.body;
        if (!taskName || !category || !salary) {
            return res.status(400).json({
                status: 'error',
                message: 'Task name, category, and salary are required',
            });
        }
        if (!['Land Surveying', 'Title Registration', 'Property Inspection', 'Land Valuation', 'Dispute Resolution'].includes(category)) {
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

app.post('/api/assign-task', async(req, res) => {
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

// Transfer Land Endpoint
app.post('/api/transfer_land', upload.single('image'), async(req, res) => {
    try {
        const { oldHolderName, newHolderName, area, location, transactionType, price, transactionDate } = req.body;

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

// User registration endpoint (for Holders)
app.post('/api/login_new_cutom', async(req, res) => {
    try {
        const { name, password, email, area, location } = req.body;
        if (!name || !password || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, password, and email are required',
            });
        }
        const existingUser = await User.findOne({
            $or: [{ name }, { email }],
        });
        if (existingUser) {
            if (existingUser.name === name) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Username already exists',
                });
            }
            if (existingUser.email === email) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email already registered',
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            password: hashedPassword,
            email,
            role: 'holder',
            area: area || 0,
            location: location || '',
            status: 'approved', // Auto-approve holders
            createdAt: new Date(),
        });
        await newUser.save();

        // Create signup notification
        const notification = new SignupNotification({
            name,
            email,
            type: 'signup',
            userType: 'holder',
            status: 'approved', // Reflect auto-approval in notification
        });
        await notification.save();

        console.log(`User registered: ${name}, ID: ${newUser._id}`);
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully. You can now log in.',
            userId: newUser._id,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// Admin endpoint to register Employee, Manager, Author
app.post('/api/register_user', async(req, res) => {
    try {
        const { name, password, email, role, permissions } = req.body;
        if (!name || !password || !email || !role) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, password, email, and role are required',
            });
        }
        if (!['employee', 'manager', 'author', 'holder'].includes(role)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid role',
            });
        }
        const existingUser = await User.findOne({
            $or: [{ name }, { email }],
        });
        if (existingUser) {
            if (existingUser.name === name) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Username already exists',
                });
            }
            if (existingUser.email === email) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email already registered',
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            password: hashedPassword,
            email,
            role,
            permissions: permissions || [],
            status: 'approved',
        });
        await newUser.save();
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// New endpoint to approve user accounts
app.post('/api/approve_user', async(req, res) => {
    try {
        const { userId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID format',
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        if (user.status === 'approved') {
            return res.status(400).json({
                status: 'error',
                message: 'User is already approved',
            });
        }
        user.status = 'approved';
        user.updatedAt = new Date();
        await user.save();
        res.status(200).json({
            status: 'success',
            message: 'User approved successfully',
        });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to approve user',
            error: error.message,
        });
    }
});

// Login check endpoint (for all roles)
app.post('/api/login_check', async(req, res) => {
    try {
        const { name, password } = req.body;
        console.log(`Login attempt for user: ${name}`);
        if (!name || !password) {
            console.log('Missing username or password');
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required',
            });
        }
        const user = await User.findOne({ name });
        if (!user) {
            console.log(`User not found: ${name}`);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username',
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Invalid password for user: ${name}`);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password',
            });
        }
        if (user.status !== 'approved') {
            console.log(`User ${name} has status: ${user.status}`);
            return res.status(403).json({
                status: 'error',
                message: `Account is ${user.status}. Please contact the administrator.`,
            });
        }
        console.log(`Login successful for user: ${name}, role: ${user.role}`);
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                area: user.area,
                location: user.location,
            },
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// GET API for user information
app.get('/api/user-info/:username', async(req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: 'success',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            area: user.area,
            location: user.location,
            status: user.status,
        });
    } catch (err) {
        console.error('Error fetching user info:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching user information',
        });
    }
});

// PUT API for updating user information
app.put('/api/update-signup-user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const { name, email } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID format',
            });
        }
        if (!name || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Name and email are required',
            });
        }
        const existingUser = await User.findOne({
            email: email,
            _id: { $ne: userId },
        });
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'Email already in use by another user',
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                name: name,
                email: email,
                updatedAt: new Date(),
            }, { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'User information updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({
            status: 'error',
            message: err.name === 'ValidationError' ? 'Invalid data provided' : 'Internal server error while updating user',
        });
    }
});

// DELETE API endpoint
app.delete('/api/delete_signup_user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID format',
            });
        }
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while deleting user',
        });
    }
});

app.get('/api/custom_fetch_login', async(req, res) => {
    try {
        const users = await User.find({}, {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
        });
        if (!users || users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No users found',
            });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// Holder endpoint
app.post('/api/add_holder', upload.single('image'), async(req, res) => {
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

// Notification endpoints
app.put('/api/notifications/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const notification = await SignupNotification.findByIdAndUpdate(
            id, { status, rejectionReason, updatedAt: new Date() }, { new: true }
        );
        if (!notification) {
            return res.status(404).json({
                status: 'error',
                message: 'Notification not found',
            });
        }
        res.status(200).json({
            status: 'success',
            message: `Notification ${status} successfully`,
            data: notification,
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update notification',
            error: error.message,
        });
    }
});

app.post('/api/send-rejection-email', async(req, res) => {
    try {
        const { email, name, message } = req.body;
        console.log('Rejection email to:', email, 'Message:', message);
        res.status(200).json({
            status: 'success',
            message: 'Rejection email sent successfully',
        });
    } catch (error) {
        console.error('Error sending rejection email:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send rejection email',
            error: error.message,
        });
    }
});

// Search properties
app.get('/api/search-properties', async(req, res) => {
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
            image: prop.image && typeof prop.image === 'string' && prop.image.startsWith('/Uploads') ?
                `${baseUrl}${prop.image}` : prop.image || '',
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

app.post('/api/google-login', async(req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload['email'];
        const name = payload['name'];

        let user = await User.findOne({ email });
        if (!user) {
            const hashedPassword = await bcrypt.hash('google_default_' + Date.now(), 10);
            user = new User({
                name: name || email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'holder',
                status: 'approved', // Auto-approve
                createdAt: new Date(),
            });
            await user.save();
        }
        if (user.status !== 'approved') {
            return res.status(403).json({
                status: 'error',
                message: `Account is ${user.status}. Please contact the administrator.`,
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Google login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            },
        });
    } catch (error) {
        console.error('Error with Google login:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process Google login',
            error: error.message,
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

module.exports = app;