# Admission Automation and Tracking System

A full-stack college/university **Admission Automation and Tracking System** built with React + Vite, Tailwind CSS, Node.js + Express, and MongoDB + Mongoose. It manages the end-to-end admission lifecycle from student registration to document verification, merit evaluation, seat reservation, fee payment, and final admission confirmation.

## Features & Role-Based Dashboards

### 1. Student Dashboard
- Registration and JWT-based authentication
- Personal & academic details management
- Course and branch selection with fee structure details
- Automated eligibility check with alternative eligible course suggestions
- Merit score calculation and rank tracking
- Document upload, verification status tracking, and re-upload support
- End-to-end application progress tracker
- Admission fee payment (Razorpay test mode) and downloadable PDF payment receipt

### 2. Admission Admin Dashboard
- Analytics overview with interactive Recharts visualizations
- Application management, filtering, and status transitions
- Course & branch management with seat capacity tracking
- Eligibility rules & weighted merit formula configuration
- Merit list generation, seat allocation (atomic overbooking prevention), and offer issuance
- Reports and audit logs

### 3. Document Verification Officer Dashboard
- Dedicated verification queue for submitted documents
- Document preview and verification actions (Verify, Reject with mandatory reason, Request Re-upload)
- Verification history tracking

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Zustand, Axios, Recharts, Lucide React
- **Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs, Multer, Nodemailer, PDFKit, Razorpay, Zod
- **Database:** MongoDB (with automatic `mongodb-memory-server` fallback in development if local MongoDB is not running)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (optional for local development — falls back to in-memory MongoDB automatically)

### 1. Backend Setup
```bash
cd server
npm install
```
Copy `.env.example` from the project root into `server/.env` and configure your environment variables:
```bash
cp ../.env.example .env
```
Start the backend server:
```bash
node server.js
```
The API will run on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173` (proxying `/api` requests to `http://localhost:5000`).

## Environment Variables (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/admission_automation` |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | JWT expiration duration | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Nodemailer SMTP settings | `smtp.ethereal.email` |
| `EMAIL_FROM` | Sender address for emails | — |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay test mode credentials | — |
| `UPLOAD_DIR` | Local upload directory | `uploads` |
| `MAX_FILE_SIZE_MB` | Max document upload size | `5` |

## Demo Credentials (Development Seed)

When running with the in-memory database or after running `node server/seed.js`:

| Role | Email | Password |
|---|---|---|
| Student | `student@demo.com` | `demo1234` |
| Admission Admin | `admin@demo.com` | `demo1234` |
| Verification Officer | `officer@demo.com` | `demo1234` |
