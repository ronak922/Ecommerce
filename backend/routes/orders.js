const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: String,
        productMainImage: String,
        price: Number,
        quantity: Number,
        size: String,
        status: {
            type: String,
            enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending'
        },
    }],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);