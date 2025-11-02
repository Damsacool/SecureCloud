const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { readDB, writeDB } = require('../db');
require('dotenv').config(); 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
console.log('Auth Route JWT_SECRET in use:', JWT_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST api/auth/register
router.post('/register', (req, res) => {
    const { fullName, email, password } = req.body;
    if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'fullName, email and password required'});
    }

    const db = readDB();
    const existing = db.users.find(u => u.email === email.toLowerCase());
    if (existing) return res.status(400).json({message: 'User already exists'});

    const hashed = bcrypt.hashSync(password, 10);
    const user = {
        id: nanoid(),
        fullName,
        email: email.toLowerCase(),
        password: hashed,
        createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === (email || '').toLowerCase());
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(400).json({message: 'Invalid credentials'});

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName } });
});

module.exports = router;