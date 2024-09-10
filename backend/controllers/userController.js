const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import your user model

// Generate token function
const generateToken = (user) => {
    const payload = {
        id: user.id,
        role: user.role,
    };

    const options = {
        expiresIn: '1h', // Set expiration time for the token
    };

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
};

// Login route handler
const login = async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.validatePassword(password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({ token });
};

// Refresh token route handler
const refreshToken = async(req, res) => {
    const { token } = req.body;

    if (!token) return res.sendStatus(401);

    try {
        const { id, role } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const newToken = generateToken({ id, role });
        res.json({ token: newToken });
    } catch (err) {
        res.sendStatus(403);
    }
};

module.exports = {
    login,
    refreshToken,
};