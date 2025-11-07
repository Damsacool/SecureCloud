const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
console.log('Middleware JWT_SECRET in use:', JWT_SECRET); 

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    console.log('Token received (first 10 chars):', token ? token.substring(0, 10) : 'None'); 
    if (!token) return res.status(401).json({ message: 'Token missing' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        console.log('Token Verified. Payload:', payload);
        
        const user = await User.findById(payload.id);
        console.log('User found:', !!user);

        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = { id: user._id, email: user.email, fullName: user.fullName };
        next();

    } catch (err) {
        console.error('JWT Verification Failed:', err.message); 
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware;