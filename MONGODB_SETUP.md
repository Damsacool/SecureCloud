# MongoDB Atlas Setup Guide

## Steps to set up your free MongoDB Atlas cluster:

1. **Sign up for MongoDB Atlas**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account (no credit card required)

2. **Create a free M0 cluster**
   - Choose "Shared" tier (free forever)
   - Select AWS as provider
   - Choose a region close to your users (e.g., us-east-1)
   - Keep default cluster name or customize it
   - Click "Create Cluster" (takes 1-3 minutes to provision)

3. **Set up database access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `securecloud_user` (or your choice)
   - Generate a secure password (save it!)
   - Select "Read and write to any database" role
   - Click "Add User"

4. **Configure network access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IPs (your Render backend IP)
   - Click "Confirm"

5. **Get your connection string**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials
   - Add your database name after `.net/`: 
     ```
     mongodb+srv://securecloud_user:yourpassword@cluster0.xxxxx.mongodb.net/securecloud?retryWrites=true&w=majority
     ```

6. **Add to your backend .env file**
   ```
   MONGODB_URI=mongodb+srv://securecloud_user:yourpassword@cluster0.xxxxx.mongodb.net/securecloud?retryWrites=true&w=majority
   ```

## Notes:
- Free M0 cluster includes: 512 MB storage, shared RAM, no backup
- This is perfect for development and small production apps
- You can upgrade anytime if you need more resources
- The connection string should be kept secret (never commit to Git)


