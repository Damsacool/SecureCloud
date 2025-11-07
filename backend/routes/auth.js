const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
console.log('Auth Route JWT_SECRET in use:', JWT_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for password operations
const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit to 3 attempts per hour
    message: 'Too many password reset attempts, please try again later.',
});

// POST api/auth/register
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'fullName, email and password required'});
        }

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({message: 'User already exists'});

        const hashed = bcrypt.hashSync(password, 10);
        const verificationToken = nanoid(32);
        
        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password: hashed,
            emailVerified: false,
            verificationToken,
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });
        
        await user.save();

        // Send verification email (non-blocking, log errors)
        try {
            await sendVerificationEmail(user.email, verificationToken);
        } catch (err) {
            console.error('Failed to send verification email:', err.message);
            // Don't block registration if email fails
        }

        // Return token so user can access dashboard
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.json({ 
            token, 
            user: { id: user._id, email: user.email, fullName: user.fullName, emailVerified: user.emailVerified },
            message: 'Registration successful. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: (email || '').toLowerCase() });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(400).json({message: 'Invalid credentials'});

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.json({ 
            token, 
            user: { id: user._id, email: user.email, fullName: user.fullName, emailVerified: user.emailVerified }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});

// GET /api/auth/verify-email/:token (path style)
router.get('/verify-email/:token', async (req, res) => {
    try {
        const token = req.params.token;
        if (!token) return res.status(400).json({ message: 'Missing verification token.' });
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ message: 'Invalid or expired verification token.' });
        if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
            return res.status(400).json({ message: 'Verification token has expired.' });
        }
        user.emailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();
        return res.json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ message: 'Server error during verification' });
    }
});

// GET /api/auth/verify-email?token=... (query param style)
router.get('/verify-email', async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).json({ message: 'Missing verification token.' });
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ message: 'Invalid or expired verification token.' });
        if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
            return res.status(400).json({ message: 'Verification token has expired.' });
        }
        user.emailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();
        return res.json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ message: 'Server error during verification' });
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

        // Generate new token
        const verificationToken = nanoid(32);
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        try {
            await sendVerificationEmail(user.email, verificationToken);
            return res.json({ message: 'Verification email sent.' });
        } catch (err) {
            console.error('Failed to resend verification email:', err.message);
            return res.status(500).json({ message: 'Failed to send verification email' });
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', passwordLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal whether user exists
            return res.json({ message: 'If that email exists, a password reset link has been sent.' });
        }

        const resetToken = nanoid(32);
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        try {
            await sendPasswordResetEmail(user.email, resetToken);
            return res.json({ message: 'If that email exists, a password reset link has been sent.' });
        } catch (err) {
            console.error('Failed to send password reset email:', err.message);
            return res.status(500).json({ message: 'Failed to send reset email' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required' });

        const user = await User.findOne({ passwordResetToken: token });
        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

        if (new Date(user.passwordResetExpires) < new Date()) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        user.password = bcrypt.hashSync(newPassword, 10);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        return res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;