const express = require('express');
const { login, refreshToken } = require('../controllers/authController');

const router = express.Router();

// Route for user login
router.post('/login', login);

// Route for refreshing token
router.post('/refresh-token', refreshToken);

module.exports = router;