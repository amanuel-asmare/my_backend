const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CustomLogin = require('./models/CustomLogin');
const User = require('./models/User');

async function migrateCustomLoginToUser() {
    try {
        await mongoose.connect('mongodb://localhost:27017/land_administration', {});
        console.log('Connected to MongoDB');

        const customLogins = await CustomLogin.find({});
        for (const login of customLogins) {
            const existingUser = await User.findOne({ name: login.name });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(login.password, 10);
                await User.create({
                    name: login.name,
                    email: login.email,
                    password: hashedPassword,
                    role: 'holder',
                    area: login.area,
                    location: login.location,
                    status: login.status || 'pending',
                    createdAt: login.createdAt,
                    updatedAt: login.updatedAt,
                });
                console.log(`Migrated user: ${login.name}`);
            } else {
                console.log(`User already exists: ${login.name}`);
            }
        }

        console.log('Migration completed');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error migrating users:', error);
    }
}

migrateCustomLoginToUser();