const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin'); // Adjust the path as needed
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ACCESS_TOKEN_SECRET } = process.env; // Ensure this is loaded correctly

// Route for admin login
router.post('/login', async(req, res) => {
    const { email, username, password } = req.body;

    console.log('Login attempt with email:', email, 'and username:', username);

    try {
        // Find admin by either email or username
        const admin = await Admin.findOne({ $or: [{ email }, { username }] });

        if (!admin) {
            console.log('Admin not found');
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log('Invalid password');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin._id, role: admin.role }, ACCESS_TOKEN_SECRET, { expiresIn: '4h' });
        console.log('Token generated:', token);

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to change admin password
router.put('/change-password', async(req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Check if authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('No authorization header found');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Extract token from the authorization header
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('No token found in authorization header');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify token and find admin
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        console.log('Decoded token:', decoded);

        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            console.log('Admin not found');
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            console.log('Current password is incorrect');
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password and update it
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;

        // Save the updated admin document
        await admin.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/settings', async(req, res) => {
    const { siteTitle, siteDescription, theme, email } = req.body;

    try {
        // Fetch the token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        // Verify the token and get admin ID
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        // Update fields if they are provided
        if (siteTitle) admin.siteTitle = siteTitle;
        if (siteDescription) admin.siteDescription = siteDescription;
        if (theme) admin.theme = theme;
        if (email) admin.email = email; // Only update email if provided

        // Save updated admin document
        await admin.save();
        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





module.exports = router;