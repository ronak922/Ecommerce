const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: [{ type: String }],
    mainImage: { type: String }, // Path to main image
    thumbnails: [{ type: String }], // Paths to thumbnail images
    imageUrl: { type: String }, // New field for image URL
    status: { type: String, default: 'Available' }, // New field for product status
    bestseller: { type: Boolean, default: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', ProductSchema);