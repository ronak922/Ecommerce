const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Adjust path as necessary

// POST /api/orders - Create a new order
router.post('/', async(req, res) => {
    try {
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

        if (!firstName || !lastName || !email || !street || !city || !state || !zipcode || !country || !phone || !paymentMethod || !products) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new order
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
            products,
            date
        });

        // Save the order to the database
        await newOrder.save();

        // Respond with success
        res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
        console.error('Error placing order:', error); // Log error for debugging
        res.status(500).json({ error: 'Failed to place the order' });
    }
});

// GET /api/orders - Get all orders
router.get('/', async(req, res) => {
    try {
        const orders = await Order.find(); // Fetch all orders
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error); // Log error for debugging
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// PUT /api/orders/:id - Update order status
router.put('/:id', async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/orders/:orderId - Delete an order
router.delete('/:orderId', async(req, res) => {
    const { orderId } = req.params;

    try {
        const result = await Order.findByIdAndDelete(orderId);
        if (!result) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;