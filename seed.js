const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

async function seedUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {});
        console.log('Connected to land_administration MongoDB');

        const users = [
            // Employees
            {
                name: 'abiyu',
                email: 'employee1@example.com',
                password: 'emp@1123',
                role: 'employee',
                permissions: [],
            },
            {
                name: 'employee2',
                email: 'employee2@example.com',
                password: 'emp@456',
                role: 'employee',
                permissions: [],
            },
            {
                name: 'employee3',
                email: 'employee3@example.com',
                password: 'emp@789',
                role: 'employee',
                permissions: [],
            },
            // Managers
            {
                name: 'amanuel',
                email: 'amanuel@example.com',
                password: 'manager@123',
                role: 'manager',
                permissions: ['all_access'],
            },
            {
                name: 'manager2',
                email: 'manager2@example.com',
                password: 'Manager@456',
                role: 'manager',
                permissions: ['limited_access'],
            },
            // Authors
            {
                name: 'author1',
                email: 'author1@example.com',
                password: 'Author@123',
                role: 'author',
                permissions: ['create', 'edit', 'delete', 'publish'],
            },
            {
                name: 'author2',
                email: 'author2@example.com',
                password: 'Author@456',
                role: 'author',
                permissions: ['create', 'edit'],
            },
        ];

        for (const user of users) {
            const existingUser = await User.findOne({ name: user.name });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await User.create({
                    ...user,
                    password: hashedPassword,
                    status: 'approved',
                });
                console.log(`Created user: ${user.name}`);
            } else {
                console.log(`User already exists: ${user.name}`);
            }
        }

        console.log('Seeding completed');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

seedUsers();