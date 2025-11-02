const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
