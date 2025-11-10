const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✓ Connected to MongoDB'))
        .catch(err => console.error('✗ MongoDB connection error:', err));
} else {
    console.warn('⚠ MONGODB_URI not set - using JSON file storage');
}

// CORS configuration - allow frontend access
const allowedOrigins = [
    'http://localhost:3000',  // Local development
    'https://securecloud-azure.vercel.app',  // Production frontend
    process.env.FRONTEND_URL  // Production frontend (from env var)
].filter(Boolean);

console.log('🔒 CORS allowed origins:', allowedOrigins);

app.use(cors({
    origin: function(origin, callback) {
        console.log('📥 Request from origin:', origin);
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow any Vercel preview/deployment URL
        if (origin && origin.includes('.vercel.app')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' })); 

// Mount routes
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('Mounted /api/auth');
} catch (err) {
    console.warn('Auth routes not mounted - ./routes/auth.js not found yet');
}

try {
    const filesRoutes = require('./routes/files');
    app.use('/api/files', filesRoutes);
    console.log('Mounted /api/files');
} catch (err) {
    console.warn('Files routes not mounted - ./routes/files.js not found yet');
}

// Health-check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});