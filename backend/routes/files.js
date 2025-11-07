const express = require('express');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid'); 
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadEncryptedFileToS3, getEncryptedFileFromS3, deleteFileFromS3, checkS3Connectivity } = require('../services/s3Service');

const router = express.Router();

// --- Configuration for Encrypted Content Storage ---

const ENCRYPTED_UPLOAD_DIR = path.join(__dirname, '..', 'uploads'); 
const USE_S3 = !!(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID);

console.log(`File storage mode: ${USE_S3 ? 'AWS S3' : 'Local disk'}`);
if (USE_S3) {
    console.log('S3 Bucket:', process.env.AWS_S3_BUCKET, 'Region:', process.env.AWS_REGION);
}

if (!USE_S3 && !fs.existsSync(ENCRYPTED_UPLOAD_DIR)) {
    fs.mkdirSync(ENCRYPTED_UPLOAD_DIR, { recursive: true });
}

// --- Protected Endpoints ---

// POST /api/files/upload - To handle encrypted content upload
router.post('/upload', authMiddleware, async (req, res) => {
    const { fileName, fileSize, encryptedContent } = req.body; 

    if (!fileName || !fileSize || !encryptedContent) {
        return res.status(400).json({ message: 'Missing file metadata or encrypted content.' });
    }

    // Validation: File size limit (25MB for encrypted content)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (fileSize > MAX_FILE_SIZE) {
        return res.status(400).json({ message: 'File size exceeds 25MB limit.' });
    }

    // Validation: Encrypted content size
    const encryptedSize = Buffer.byteLength(encryptedContent, 'utf8');
    if (encryptedSize > 50 * 1024 * 1024) { // 50MB for encrypted string
        return res.status(400).json({ message: 'Encrypted content too large.' });
    }

    let filePath;
    try {
        const s3Key = `${nanoid()}.txt`; 

        if (USE_S3) {
            // Upload to S3
            try {
                await uploadEncryptedFileToS3(s3Key, encryptedContent);
                console.log('✓ File uploaded to S3:', s3Key);
            } catch (s3Error) {
                console.error('S3 upload error:', s3Error);
                if (s3Error.Code === 'NoSuchBucket') {
                    console.warn('Bucket not found. Falling back to local storage for this upload.');
                    const localName = s3Key;
                    const localFullPath = path.join(ENCRYPTED_UPLOAD_DIR, localName);
                    fs.writeFileSync(localFullPath, encryptedContent, 'utf8');
                    const file = new File({
                        fileName: fileName,
                        fileSize: fileSize,
                        userId: req.user.id,
                        localPath: localName,
                        uploadDate: new Date()
                    });
                    await file.save();
                    return res.json({
                        message: 'S3 bucket missing - stored encrypted file locally.',
                        file: { id: file._id, fileName: file.fileName, fileSize: file.fileSize, uploadDate: file.uploadDate }
                    });
                }
                return res.status(500).json({ message: `S3 upload failed: ${s3Error.message}` });
            }
            
            const file = new File({
                fileName: fileName,
                fileSize: fileSize,
                userId: req.user.id,
                s3Key: s3Key,
                uploadDate: new Date()
            });
            await file.save();

            res.json({ 
                message: 'File encrypted and uploaded to S3 successfully', 
                file: {
                    id: file._id,
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    uploadDate: file.uploadDate
                }
            });
        } else {
            // Fallback to local storage
            filePath = path.join(ENCRYPTED_UPLOAD_DIR, s3Key);
            fs.writeFileSync(filePath, encryptedContent, 'utf8');

            const file = new File({
                fileName: fileName,
                fileSize: fileSize,
                userId: req.user.id,
                localPath: s3Key,
                uploadDate: new Date()
            });
            await file.save();

            res.json({ 
                message: 'File encrypted and saved locally successfully', 
                file: {
                    id: file._id,
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    uploadDate: file.uploadDate
                }
            });
        }
    } catch (error) {
        console.error('File upload error:', error);
        if (!USE_S3 && filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ message: 'Server error during file upload.' });
    }
});

// GET /api/files/s3-check - Verify S3 bucket connectivity
router.get('/s3-check', async (req, res) => {
    if (!USE_S3) return res.json({ useS3: false, message: 'S3 disabled; using local storage' });
    try {
        const result = await checkS3Connectivity();
        return res.json({ useS3: true, ...result });
    } catch (err) {
        return res.status(500).json({ useS3: true, ok: false, error: err.message });
    }
});

// GET /api/files/list - List files for the authenticated user
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const files = await File.find({ userId: req.user.id }).sort({ uploadDate: -1 });
        const userFiles = files.map(f => ({
            _id: f._id,
            fileName: f.fileName,
            fileSize: f.fileSize,
            uploadDate: f.uploadDate,
        }));
        res.json(userFiles);
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ message: 'Server error listing files' });
    }
});

// GET /api/files/download/:id - Retrieve encrypted content for decryption
router.get('/download/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findOne({ _id: id, userId: req.user.id });

        if (!file) {
            return res.status(404).json({ message: 'File not found or not owned by user' });
        }

        let encryptedContent;

        if (USE_S3 && file.s3Key) {
            // Download from S3
            encryptedContent = await getEncryptedFileFromS3(file.s3Key);
        } else if (file.localPath) {
            // Read from local disk
            const filePath = path.join(ENCRYPTED_UPLOAD_DIR, file.localPath);
            
            if (!fs.existsSync(filePath)) {
                console.error(`File missing on disk for ID ${id}: ${filePath}`);
                return res.status(404).json({ message: 'Encrypted file missing on disk' });
            }

            encryptedContent = fs.readFileSync(filePath, 'utf8');
        } else {
            return res.status(404).json({ message: 'File storage location not found' });
        }
        
        res.json({
            encryptedContent: encryptedContent,
            fileName: file.fileName,
        });
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ message: 'Server error reading encrypted file.' });
    }
});

// DELETE /api/files/delete/:id - Delete a file
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findOne({ _id: id, userId: req.user.id });
        
        if (!file) {
            return res.status(404).json({ message: 'File not found or not owned by user' });
        }

        // Delete from S3 or local disk
        if (USE_S3 && file.s3Key) {
            try {
                await deleteFileFromS3(file.s3Key);
            } catch (error) {
                console.error('Failed to delete file from S3:', error);
            }
        } else if (file.localPath) {
            const filePath = path.join(ENCRYPTED_UPLOAD_DIR, file.localPath);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath); 
                } catch (error) {
                    console.error('Failed to delete file from disk:', error);
                }
            }
        }

        await File.deleteOne({ _id: id });
        res.json({ message: `${file.fileName} deleted successfully` });
    } catch (error) {
        console.error('File delete error:', error);
        res.status(500).json({ message: 'Server error deleting file' });
    }
});

module.exports = router;