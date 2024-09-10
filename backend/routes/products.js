const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth'); // Adjust the path as needed
const Product = require('../models/Product'); // Adjust the path as needed

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure 'uploads/' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage: storage });

// Route to handle product creation without images
router.post('/products', async(req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create product' });
    }
});

// Route to handle fetching all products (if needed)
router.get('/products', async(req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// Route to add a new product with images
router.post('/add', authenticateToken, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'thumbnails', maxCount: 4 }
]), async(req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, status } = req.body;

        // Handle main image and thumbnails
        const mainImage = req.files['mainImage'] ? req.files['mainImage'][0].path : null;
        const thumbnails = req.files['thumbnails'] ? req.files['thumbnails'].map(file => file.path) : [];

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller,
            mainImage,
            thumbnails,
            status // Add status field
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Failed to add product' });
    }
});

// Delete product by ID
router.delete('/products/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const result = await Product.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;