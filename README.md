# Authentication System

A full-stack authentication system with secure user registration, login, email verification, and OTP-based verification. Built with modern technologies including TypeScript, React, Express, MongoDB, and Redis.

## 🌟 Features

- **User Registration** – Sign up with name, email, and password
- **Email Verification** – Email verification using secure verification tokens
- **OTP-Based Login** – Secure login with one-time password (OTP) verification
- **JWT Authentication** – Secure access and refresh token authentication
- **CSRF Protection** – Built-in CSRF protection for secure requests
- **Redis Session Management** – Store and manage user sessions with Redis
- **Single Active Session** – A user can only be logged in on one device/session at a time
- **Password Security** – Passwords hashed securely using bcrypt
- **Input Validation** – Request validation with Zod schemas
- **Centralized Error Handling** – Consistent API error responses
- **CORS Configuration** – Secure frontend-backend communication

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Security**: 
  - Bcrypt for password hashing
  - JWT for token-based authentication
  - CSRF protection
  - Input sanitization with mongo-sanitize
- **Email**: Nodemailer
- **Validation**: Zod

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Linting**: ESLint

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: Local instance or MongoDB Atlas connection
- **Redis**: Local instance or Redis Cloud connection
- **Git**: For version control
- **Gmail Account**: For email notifications (SMTP)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sushantg339/Auth-System.git
cd Auth-System
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

## Configuration

### Backend Environment Variables (`.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/auth_system

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_specific_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
ACCESS_TOKEN_SECRET=your_secure_access_token_secret_key
REFRESH_TOKEN_SECRET=your_secure_refresh_token_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables (`.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1
```

### Gmail SMTP Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the generated password as `MAIL_PASS`

## Running the Application

### Option 1: Without Docker

#### Terminal 1 - Backend Server

```bash
cd backend
npm run build    # Build TypeScript
npm start        # Start production server
# or for development with auto-rebuild
npm run dev
```

Backend will run at: `http://localhost:3000`

#### Terminal 2 - Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run at: `http://localhost:5173`

### Option 2: With Docker: only for backend (if configured)

```bash
docker-compose up --build
```

## API Endpoints

### Authentication Routes (`/api/v1/user/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/signup` | Register new user | ❌ |
| POST | `/verify/:token` | Verify email with token | ❌ |
| POST | `/login` | Login with email & password | ❌ |
| POST | `/verify` | Verify OTP after login | ❌ |
| GET | `/profile` | Get user profile | ✅ |
| POST | `/refresh` | Refresh access token | ❌ |
| POST | `/logout` | Logout user | ✅ |
| POST | `/refresh-csrf` | Refresh CSRF token | ✅ |

### Request/Response Examples

#### Signup
```json
POST /api/v1/user/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login
```json
POST /api/v1/user/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Verify OTP
```json
POST /api/v1/user/verify
{
  "email" : "abc@abc.com",
  "otp": "123456"
}
```

## Project Structure

```
Auth-System/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express server entry point
│   │   ├── config/                # Configuration files
│   │   │   ├── db.config.ts       # MongoDB connection
│   │   │   ├── mail.config.ts     # Email configuration
│   │   │   └── redis.config.ts    # Redis connection
│   │   ├── controllers/           # Route controllers
│   │   │   └── user.controller.ts
│   │   ├── models/                # Mongoose schemas
│   │   │   └── user.model.ts
│   │   ├── routes/                # API routes
│   │   │   ├── main.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── middlewares/           # Express middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── csrf.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── lib/                   # Utility functions
│   │   │   ├── asyncHandler.ts
│   │   │   ├── csrf.ts
│   │   │   ├── generateToken.ts
│   │   │   ├── sendMail.ts
│   │   │   └── validation.ts
│   │   ├── types/                 # TypeScript types
│   │   │   └── zod.types.ts
│   │   └── assets/                # Static assets
│   │       └── mail.html.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.tsx               # React entry point
    │   ├── App.tsx                # Root component
    │   ├── pages/                 # Page components
    │   │   ├── Home.tsx
    │   │   ├── Signup.tsx
    │   │   ├── Login.tsx
    │   │   ├── VerifyOtp.tsx
    │   │   ├── VerifyToken.tsx
    │   │   └── Dashboard.tsx
    │   ├── components/            # Reusable components
    │   │   ├── Loader.tsx
    │   │   └── MainRoutes.tsx
    │   ├── context/               # React Context
    │   │   └── AppContext.tsx
    │   ├── lib/                   # Utilities
    │   │   └── axios.ts
    │   ├── index.css              # Global styles
    │   └── assets/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── eslint.config.js
    └── .env.example
```

## Authentication Flow

### Registration Flow
1. User fills signup form (name, email, password)
2. Backend hashes password with bcrypt
3. User document created in MongoDB
4. Verification email sent via Nodemailer
5. User clicks verification link
6. User account activated

### Login Flow
1. User enters email and password
2. Backend validates credentials
3. OTP generated and sent to email
4. User enters OTP on verification page
5. JWT tokens (access & refresh) generated
6. Tokens stored in cookies
7. User redirected to dashboard

### Session Management
- **Access Token**: Short-lived (expires in ~15 minutes)
- **Refresh Token**: Long-lived (expires in ~7 days)
- **Token Refresh**: Automatic refresh using refresh token endpoint
- **CSRF Protection**: Token regenerated on every request

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based authentication with expiration
- ✅ CSRF protection middleware
- ✅ Input validation with Zod schemas
- ✅ MongoDB injection prevention with mongo-sanitize
- ✅ CORS configuration for trusted domains
- ✅ HTTP-only cookies for token storage
- ✅ Email verification for new accounts
- ✅ OTP-based login verification

## 📝 Available Scripts

### Backend
```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm run dev      # Build and start in development mode
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🚧 Development Tips

- Use `npm run dev` in backend for automatic recompilation on changes
- Use Vite's hot module replacement (HMR) in frontend for instant updates
- Check Redis connection status: `redis-cli ping`
- Check MongoDB connection: `mongosh <MONGODB_URI>`
- View email templates in `backend/src/assets/mail.html.ts`

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env` is correct

### Redis Connection Error
- Ensure Redis is running: `redis-server`
- Verify `REDIS_URL` in `.env` is correct

### Email Not Sending
- Check Gmail App Password is correct
- Enable "Less secure app access" or use App Password
- Verify SMTP host/port configuration

### CORS Error
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check origin in CORS configuration

## 📄 License

ISC

## 👨‍💻 Author

- **GitHub**: [Sushantg339](https://github.com/Sushantg339/Auth-System)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Happy Coding! 🎉**