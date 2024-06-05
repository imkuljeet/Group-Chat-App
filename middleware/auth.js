const jwt = require('jsonwebtoken');

const User = require('../models/users');


const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = {authenticate}