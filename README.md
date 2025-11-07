# SecureCloud 🔐

A personal project I built for my FYP and to learn full-stack development - a secure cloud storage app where files are encrypted on your device before uploading. Your data, your key, truly private.


### Key Features

** Client-Side Encryption**
- Files are encrypted with AES-256 on your browser using your personal passphrase
- The passphrase never leaves your device - even I can't access your files
- Optional passphrase saving per user (stored locally)

** User Authentication**
- JWT-based login/registration
- Email verification with tokens
- Password reset functionality (backend ready)
- Rate limiting to prevent brute force attacks

** Cloud Storage**
- Files stored securely in AWS S3
- Automatic fallback to local storage if S3 unavailable
- File size validation (25MB limit)
- Download and delete operations

** Clean UI**
- Modern, responsive design
- Dashboard with file management
- Real-time file list updates
- User-specific passphrase storage

### Tech Stack

**Frontend**
- React (Create React App)
- React Router for navigation
- CryptoJS for AES encryption
- Axios for API calls
- Custom CSS (no UI frameworks)

**Backend**
- Node.js + Express
- MongoDB Atlas for data storage
- Mongoose for database modeling
- AWS S3 SDK for file storage
- JWT for authentication
- bcrypt for password hashing
- Nodemailer for email verification
- express-rate-limit for security

**Infrastructure**
- MongoDB Atlas (free M0 cluster)
- AWS S3 (eu-north-1 region)
- Deployed on Render (backend) + Vercel (frontend)

## How It Works

1. **Register** → Create account with email verification
2. **Set Passphrase** → Choose your encryption key (never sent to server)
3. **Upload** → Files encrypted in browser, then uploaded to S3
4. **Download** → Files retrieved from S3, decrypted in browser with your passphrase
5. **Delete** → Removes both S3 file and database record

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- AWS account with S3 bucket
- SMTP credentials (Ethereal for testing)
### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- AWS account with S3 bucket
- SMTP credentials (Ethereal for testing)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Damsacool/SecureCloud.git
cd SecureCloud
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```

4. **Visit** `http://localhost:3000`

See `AWS_S3_SETUP.md` and `MONGODB_SETUP.md` for detailed setup guides.

## What I Learned

Building this project taught me:
- How client-side encryption actually works
- JWT authentication and security best practices
- AWS S3 SDK integration
- MongoDB schema design with Mongoose
- Email verification flows with tokens
- Rate limiting and input validation
- Full-stack deployment (Render + Vercel)
- Git workflow and version control

## Security Features

-  Client-side AES-256 encryption
-  Passwords hashed with bcrypt (10 rounds)
-  JWT tokens with expiration
-  Email verification required
-  Rate limiting on auth endpoints (5 req/15min)
-  CORS protection
-  File size validation
-  Environment variables for secrets
-  HTTPS in production

## Future Improvements

Things I'd like to add:
- Password strength indicator
- File sharing with encrypted links
- Drag-and-drop upload
- Upload progress bar
- File preview for images
- Toast notifications
- Two-factor authentication
- File version history
- Multiple upload at a time
- Folder creation 

## License

MIT - Feel free to use this for learning!

---

**Built by Akande Samad (Damsacool)** | [GitHub](https://github.com/Damsacool/SecureCloud)