const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.AWS_S3_BUCKET;

// Initialization of S3 Client (reads from env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
const s3Client = new S3Client({ 
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Upload encrypted file content to S3
const uploadEncryptedFileToS3 = async (key, encryptedContent) => {
    const uploadParams = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: encryptedContent,
        ContentType: 'text/plain', 
    };

    const command = new PutObjectCommand(uploadParams);
    return s3Client.send(command);
};

// Retrieve encrypted file content from S3
const getEncryptedFileFromS3 = async (key) => {
    const downloadParams = {
        Bucket: S3_BUCKET,
        Key: key,
    };

    const command = new GetObjectCommand(downloadParams);
    const response = await s3Client.send(command);
    
    // Read the stream and convert to a string
    return response.Body.transformToString();
};

// Delete a file from S3
const deleteFileFromS3 = async (key) => {
    const deleteParams = {
        Bucket: S3_BUCKET,
        Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    return s3Client.send(command);
};

module.exports = {
    uploadEncryptedFileToS3,
    getEncryptedFileFromS3,
    deleteFileFromS3,
    // Simple connectivity check to verify bucket exists and creds/region are valid
    checkS3Connectivity: async () => {
        try {
            const cmd = new HeadBucketCommand({ Bucket: S3_BUCKET });
            await s3Client.send(cmd);
            return { ok: true, bucket: S3_BUCKET, region: AWS_REGION };
        } catch (err) {
            return { ok: false, bucket: S3_BUCKET, region: AWS_REGION, error: err.message, code: err.name || err.Code };
        }
    }
};