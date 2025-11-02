const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid');
const { readDB, writeDB } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// --- Multer Configuration for File Uploads ---

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const id = nanoid();
        const ext = path.extname(file.originalname);
        cb(null, id + ext);
    }
});

const upload = multer({ storage });

// --- Protected Endpoints ---

// POST /api/files/upload - To handle file upload
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const db = readDB();
    const fileMeta = {
        id: path.parse(req.file.filename).name, 
        filename: req.file.filename, 
        originalname: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadDate: new Date().toISOString(),
        ownerId: req.user.id 
    };

    db.files.push(fileMeta);
    writeDB(db);

    res.json({ message: 'File uploaded successfully', file: fileMeta });
});

// GET /api/files - List files for the authenticated user
router.get('/', authMiddleware, (req, res) => {
    const db = readDB();
    const userFiles = db.files.filter(f => f.ownerId === req.user.id);
    res.json(userFiles);
});

// GET /api/files/:id/download - Download a file
router.get('/:id/download', authMiddleware, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    
    const file = db.files.find(f => f.id === id && f.ownerId === req.user.id);
    if (!file) return res.status(404).json({ message: 'File not found or not owned by user' });

    const filePath = path.join(UPLOAD_DIR, file.filename);
    
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on disk' });

    res.download(filePath, file.originalname);
});

// DELETE /api/files/:id - Delete a file
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const db = readDB();

    const idx = db.files.findIndex(f => f.id === id && f.ownerId === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'File not found or not owned by user' });

    const [file] = db.files.splice(idx, 1);

    const filePath = path.join(UPLOAD_DIR, file.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
    }

    writeDB(db);
    res.json({ message: 'File deleted successfully' });
});

module.exports = router;