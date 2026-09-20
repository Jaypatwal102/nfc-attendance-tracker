# NFC Attendance Tracker — Full-Stack Academic Platform

A production-ready, full-stack **NFC Attendance Tracker** built with **Next.js**, **Express.js**, **Prisma ORM**, and **PostgreSQL**. Features role-based dashboards (`STUDENT`, `TEACHER`, `ADMIN`), automated NFC attendance scan validation, attendance percentage math engines, low-attendance alert triggers, and email notification logging.

---

## 🚀 Key Features

* **Role-Based Portals**: Completely separated dashboard layouts and navigation for Students, Teachers, and Admins.
* **Backend Security**: Enforced Role-Based Access Control (RBAC) via JWT Bearer authentication, prohibiting unauthorized frontend or API URL tampering.
* **NFC Attendance Engine**: 6-step backend NFC validation pipeline checking tag ID, active session, student batch matching, subject enrollment, and composite unique duplicate prevention `(session_id, student_id)`.
* **Attendance Math**: Real-time percentage math calculation $(N_{\text{present}} / N_{\text{total}}) \times 100$, subject breakdowns, and low-attendance ($< 75\%$) threshold filtering.
* **Automated Low-Attendance Warnings**: Faculty email dispatch trigger with database audit logs (`email_logs`).
* **Admin Management**: Full CRUD management of users, role promotion (auto-generating Teacher profiles), student profiles, courses, batches, and teacher/student assignments.

---

## 🔑 Demo Login Credentials

The system includes pre-seeded demo accounts with realistic academic data:

| System Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin.demo@nfc-tracker.local` | `DemoAdmin@2026!` | Full system administration and role management |
| **TEACHER** | `teacher.demo@nfc-tracker.local` | `DemoTeacher@2026!` | Faculty dashboard, session creation, NFC scanner, low attendance alerts |
| **STUDENT (Good)** | `student.demo@nfc-tracker.local` | `DemoStudent@2026!` | Student portal with 90% attendance record |
| **STUDENT (Low)** | `student2.demo@nfc-tracker.local` | `DemoStudent@2026!` | Student portal with 60% attendance (Triggers Low Attendance alerts) |

*Alternative default credentials: `admin@attendancetracker.com` / `teacher@attendancetracker.com` / `student@attendancetracker.com` (password: `DemoAdmin@2026!`, `DemoTeacher@2026!`, `DemoStudent@2026!`)*

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Axios.
* **Backend API**: Node.js, Express.js, JWT, bcryptjs, nodemailer.
* **Database & ORM**: PostgreSQL, Prisma ORM.

---

## ⚙️ Local Development Setup

### 1. Prerequisites
* Node.js v18+ & npm
* PostgreSQL database instance running locally (e.g., port 5432) or cloud-hosted (Neon / Supabase).

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and update DATABASE_URL
cp .env.example .env

# Push Prisma schema to PostgreSQL database
npx prisma db push

# Generate Prisma Client
npm run prisma:generate

# Seed initial system configuration and demo accounts
npm run db:seed

# Start backend server (Default port: 5000)
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env.local
cp .env.example .env.local

# Start Next.js development server (Default port: 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference Overview

### Auth (`/api/auth`)
* `POST /api/auth/register` — Registers new student (forces `STUDENT` role).
* `POST /api/auth/login` — Authenticates credentials, returns JWT token.
* `GET /api/auth/me` — Returns current authenticated user profile.

### Admin (`/api/admin`) `[ADMIN Role Required]`
* `GET /api/admin/users` — List users with filters (`role`, `is_active`, `search`).
* `PATCH /api/admin/users/:id/role` — Update user role (auto-creates Teacher profile if promoted to `TEACHER`).
* `PATCH /api/admin/users/:id/status` — Activate or deactivate user account.
* `POST /api/admin/teachers` — Register new faculty teacher account.
* `GET /api/admin/students` / `PATCH /api/admin/students/:id` — Manage student directory and NFC tag IDs.
* `POST /api/admin/subjects` / `POST /api/admin/batches` — Course and batch setup.
* `POST /api/admin/teacher-subject-mappings` — Map teachers to subject and batch.
* `POST /api/admin/student-subject-mappings` — Enroll students in course subjects.

### Teacher (`/api/teacher`) `[TEACHER Role Required]`
* `GET /api/teacher/assignments` — View assigned subject & batch pairs.
* `POST /api/teacher/attendance-sessions` — Start class session with initialized student records.
* `PATCH /api/teacher/attendance/:id` — Manually adjust attendance status (`PRESENT`/`ABSENT`).
* `GET /api/teacher/statistics` — Subject & batch aggregate attendance metrics.
* `GET /api/teacher/low-attendance` — Identify students below attendance threshold ($< 75\%$).
* `POST /api/teacher/low-attendance/send-email` — Dispatch warning emails to low-attendance students.

### NFC Scan (`/api/attendance`)
* `POST /api/attendance/nfc` — Process NFC card tap with body `{ "session_id": "...", "nfc_id": "DEMO-NFC-001" }`.

### Student (`/api/student`) `[STUDENT Role Required]`
* `GET /api/student/profile` — View student credentials and active batch.
* `GET /api/student/attendance` — Student attendance history.
* `GET /api/student/attendance/summary` — Calculated overall and subject-wise attendance percentages.

---

## 🌐 Production Cloud Deployment Guide

### Frontend Deployment (Vercel)
1. Push code to GitHub repository.
2. Import `frontend` project into [Vercel](https://vercel.com).
3. Set Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com`.
4. Deploy.

### Backend Deployment (Render / Railway)
1. Import `backend` project into [Render](https://render.com) or [Railway](https://railway.app) as a Web Service.
2. Build Command: `npm install && npx prisma db push && npm run prisma:generate && npm run db:seed`.
3. Start Command: `npm start`.
4. Set Environment Variables:
   * `DATABASE_URL` (PostgreSQL connection string from Neon/Supabase)
   * `JWT_SECRET` (Secure random key)
   * `PORT` (5000)

### Production PostgreSQL (Neon / Supabase)
1. Create a free managed PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the connection string to `DATABASE_URL`.
