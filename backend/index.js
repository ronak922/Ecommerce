const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/auth');
const Product = require('./models/Product');
const User = require('./models/User'); // Ensure User model is imported
const Admin = require('./models/Admin'); // Ensure Admin model is imported

require('dotenv').config();

const app = express();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Connect to MongoDB
connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});

// Define allowed origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000']; // Add other origins as needed

// Middleware for parsing JSON
app.use(express.json());

// Configure CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static files (e.g., uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/test', async(req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Test route failed' });
    }
});

// POST route for admin login
app.post('/api/admin/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin || !(await admin.validatePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = admin.generateToken(); // Ensure generateToken method is defined
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Something went wrong!' });
});

// Get Product Endpoint
app.get('/api/products/:productId', async(req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Product Endpoint
app.put('/api/products/:id', upload.fields([{ name: 'mainImage' }, { name: 'thumbnails' }]), async(req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, subCategory, sizes } = req.body;
        const mainImage = req.files['mainImage'] ? req.files['mainImage'][0].path : undefined;
        const thumbnails = req.files['thumbnails'] ? req.files['thumbnails'].map(file => file.path) : [];

        // Log the data received for debugging
        console.log({
            id,
            name,
            description,
            price,
            category,
            subCategory,
            sizes: sizes.split(',').map(size => size.trim()),
            mainImage,
            thumbnails,
        });

        const updatedProduct = await Product.findByIdAndUpdate(
            id, {
                name,
                description,
                price,
                category,
                subCategory,
                sizes: sizes.split(',').map(size => size.trim()),
                mainImage,
                thumbnails,
            }, { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.post('/api/orders', upload.single('mainImage'), async(req, res) => {
    const {
        firstName,
        lastName,
        email,
        street,
        city,
        state,
        zipcode,
        country,
        phone,
        paymentMethod,
        products,
        date
    } = req.body;

    // Ensure required fields are present and products is an array
    if (!firstName || !lastName || !email || !street || !city || !state || !zipcode || !country || !phone || !paymentMethod || !Array.isArray(products)) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    // Handle the file upload
    const mainImage = req.file ? req.file.path : undefined;

    // Create the order object
    const newOrder = new Order({
        firstName,
        lastName,
        email,
        street,
        city,
        state,
        zipcode,
        country,
        phone,
        paymentMethod,
        products: products.map(product => ({
            ...product,
            productMainImage: mainImage // This sets the same main image for all products
        })),
        date: date ? new Date(date) : Date.now()
    });

    try {
        // Save the order to the database
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/api/orders', async(req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: Fetch a single order by ID
app.get('/api/orders/:id', async(req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/products/:productId', async(req, res) => {
    try {
        const { productId } = req.params;
        const result = await Product.findByIdAndDelete(productId);

        if (!result) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Server error', error });
    }
});


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});