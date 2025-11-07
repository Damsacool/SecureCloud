# AWS S3 Setup Guide for SecureCloud

## Quick Setup (5-10 minutes)

### 1. Create AWS Account (if you don't have one)
- Go to: https://aws.amazon.com
- Sign up for free tier (requires credit card but won't charge for early usage)
- Verify email and complete setup

### 2. Create an S3 Bucket
1. Go to AWS Console → Search for "S3"
2. Click "Create bucket"
3. **Bucket name**: `securecloud-files-<your-unique-id>` (must be globally unique)
4. **Region**: Choose closest to you (e.g., `us-east-1`)
5. **Block Public Access**: Keep all boxes CHECKED 
6. **Encryption**: Enable (default SSE-S3 is fine)
7. Click "Create bucket"

### 3. Create IAM User with S3 Access
1. Go to AWS Console → Search for "IAM"
2. Click "Users" → "Create user"
3. **User name**: `securecloud-backend`
4. Click "Next"
5. **Permissions**: Select "Attach policies directly"
6. Search and select: `AmazonS3FullAccess` (for development)
   - For production, create a custom policy with only your bucket access
7. Click "Next" → "Create user"

### 4. Create Access Keys
1. Click on your newly created user 
2. Go to "Security credentials" tab
3. Scroll to "Access keys" → Click "Create access key"
4. **Use case**: Select "Application running outside AWS"
5. Click "Next" → "Create access key"
6. **IMPORTANT**: Download the CSV or copy both:
   - Access key ID (looks like: `AKIAIOSFODNN7EXAMPLE`)
   - Secret access key (looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
7. **SAVE THESE SECURELY** - you won't see the secret again!

### 5. Add to .env
Add these to your `backend/.env`:
```
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=securecloud-files-your-unique-id
```

## Cost Estimate (Free Tier)
- First 5 GB storage: **FREE** (12 months)
- 20,000 GET requests: **FREE** (12 months)
- 2,000 PUT requests: **FREE** (12 months)
- After free tier: ~$0.023/GB/month (very cheap)

## Security Best Practices
- Never commit .env to Git 
- Use IAM user (not root account)
- Keep bucket private
- For production: create custom IAM policy limited to your bucket only

## Production IAM Policy (Optional - for later)
Replace `AmazonS3FullAccess` with this custom policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## Alternative: Cloudflare R2 
- R2 is S3-compatible and has better free tier
- 10 GB storage FREE forever
- No egress fees
- Setup at: https://www.cloudflare.com/products/r2/
