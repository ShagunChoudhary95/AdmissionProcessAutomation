# Admission Automation System

A full-stack college/university **Admission Automation System** built with React + Vite, Tailwind CSS, Node.js + Express, and MongoDB + Mongoose for **ABESEC Ghaziabad**. It manages the end-to-end admission lifecycle from student registration to document verification, merit evaluation, seat reservation, fee payment, and final admission confirmation.

**Developed & Maintained By:** Shagun, Shivam Tomar (CSE Sec-26) — Full Stack Development Team

## Live Deployment

Live Project URL: Pending Render Deployment (will be updated upon deployment)

**GitHub Repository:** https://github.com/ShagunChoudhary95/AdmissionProcessAutomation

## Main Features & Role-Based Dashboards

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

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, Zustand, Axios, Recharts, Lucide React, React Hook Form, Zod
- **Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs, Multer, Nodemailer, PDFKit, Razorpay, Zod
- **Database:** MongoDB (with automatic `mongodb-memory-server` fallback in local development if local MongoDB is not running)

## User Login Credentials

All roles log in using **email-based authentication** on the `/login` page (seeded via `server/seed.js` or on first run when `SEED_ON_EMPTY=true`):

| User Role | Username (Email) | Password |
|---|---|---|
| Admin | `admin@demo.com` | `demo1234` |
| Student | `student@demo.com` | `demo1234` |
| Document Verification Officer | `officer@demo.com` | `demo1234` |

> Students can also register new accounts directly from `/register`. Admin and Officer accounts are created by the administration/seed script.

## Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- MongoDB (optional for local development — falls back to in-memory MongoDB automatically when `NODE_ENV` is not `production`)

### 1. Clone the Repository
```bash
git clone https://github.com/ShagunChoudhary95/AdmissionProcessAutomation.git
cd AdmissionProcessAutomation
```

### 2. Backend Setup
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

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173` (or build for production with `npm run build` in `client/`, which `server/app.js` serves automatically when `NODE_ENV=production`).

## Environment Variables (`server/.env`)

Do not commit secret values to source control. Configure these in `server/.env` locally or in Render's Environment settings:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/admission_automation` |
| `SEED_ON_EMPTY` | Auto-seed demo users & courses if DB is empty (`true`/`false`) | `false` |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | JWT expiration duration | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Nodemailer SMTP settings | `smtp.ethereal.email` |
| `EMAIL_FROM` | Sender address for emails | — |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay test mode credentials | — |
| `UPLOAD_DIR` | Local upload directory | `uploads` |
| `MAX_FILE_SIZE_MB` | Max document upload size | `5` |

## Render Deployment

This repository includes a `render.yaml` Blueprint for deploying as a Node.js Web Service on Render:
- **Build Command:** `npm --prefix client install && npm --prefix client run build && npm --prefix server install`
- **Start Command:** `npm --prefix server start`
- **Health Check:** `/api/health`
- Configure `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` in Render's Environment Variables.
