require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI); // Check if URI is loaded

const mongoose = require('mongoose');
const Admin = require('../models/Admin'); // Adjust path as needed

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async() => {
        console.log('Connected to MongoDB');

        // Create an admin user
        const adminData = {
            email: 'demo@gmail.com', // Changed from username to email
            password: 'demo'
        };

        try {
            let admin = await Admin.findOne({ email: adminData.email }); // Changed from username to email
            if (admin) {
                console.log('Admin user already exists');
                return;
            }

            admin = new Admin(adminData);
            await admin.save();

            console.log('Admin user created successfully');
        } catch (error) {
            console.error('Error creating admin user:', error);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });