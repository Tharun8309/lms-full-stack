import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Middleware to protect routes (verify JWT token)
export const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
}

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req, res, next) => {
    try {
        if (req.user.role !== 'educator') {
            return res.status(403).json({ success: false, message: 'Unauthorized Access - Educator role required' });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}