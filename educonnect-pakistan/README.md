# EduConnect Pakistan

A full-stack web platform that connects students with tutors across Pakistan. EduConnect Pakistan provides a tutor marketplace, session scheduling, earnings tracking, and an admin dashboard — all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Security](#security)
- [Contributing](#contributing)

---

## Features

**Students**
- Browse and filter tutors by subject, location, price, and rating
- Book online or in-person tutoring sessions
- Manage and cancel bookings with a calendar view
- Leave ratings and reviews after completed sessions
- Save favourite tutors to a wishlist

**Tutors**
- Create and manage a public profile with credentials and document uploads
- Set weekly availability and manage booked sessions
- Track earnings and view session statistics
- Go through a verification workflow to display a verified badge

**Admins**
- Review and approve or reject tutor verification requests
- Access reporting dashboards: user growth, session completion rates, popular subjects, and city-level usage
- Manage platform permissions

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Bootstrap, React Router DOM, Formik + Yup, Chart.js, Recharts, React Big Calendar, React Toastify |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **File Uploads** | Multer (PDFs and images, max 10 MB) |
| **Security** | Helmet, CORS, express-rate-limit, express-mongo-sanitize, xss-clean, HPP |
| **Utilities** | Axios, PDFKit, csv-writer, uuid, Morgan |

---

## Project Structure

```
educonnect-pakistan/
├── server/                     # Express backend (default port 5000)
│   ├── server.js               # Entry point
│   ├── api.js                  # Global middleware
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/                 # Mongoose schemas
│   ├── controllers/            # Business logic
│   ├── middleware/
│   │   └── auth.js             # JWT & role-based auth
│   ├── routes/                 # REST API routes
│   ├── scripts/                # Utility scripts
│   └── uploads/                # Uploaded files (PDFs, images)
│
└── client/react/               # React frontend (default port 3000)
    ├── src/
    │   ├── App.jsx             # Root routing component
    │   ├── pages/
    │   │   ├── auth/           # Login, register, profile, password reset
    │   │   ├── student/        # Student dashboard, find tutors, sessions, reviews, wishlist
    │   │   ├── tutor/          # Tutor dashboard, sessions, availability, earnings
    │   │   └── admin/          # Admin dashboard, verifications, reports
    │   ├── components/         # Reusable UI components
    │   ├── context/            # React Context (AuthContext)
    │   ├── hooks/              # Custom React hooks
    │   └── utils/              # Helper utilities
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Waleed-Ahmad20/educonnect-pakistan.git
   cd educonnect-pakistan
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd client/react
   npm install
   ```

### Environment Variables

Create a `.env` file in the project root with the following values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/educonnect
PORT=5000
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
VITE_API_URL=http://localhost:5000
```

> **Note:** Never commit real secrets to version control. Update `JWT_SECRET` and `SESSION_SECRET` with strong random strings before deploying.

### Running the Application

**Start the backend server**

```bash
npm start
# Server runs on http://localhost:5000
```

**Start the frontend development server** (in a separate terminal)

```bash
cd client/react
npm run dev
# App runs on http://localhost:3000
```

**Build the frontend for production**

```bash
cd client/react
npm run build
```

---

## API Overview

The base URL for all API endpoints is `/api`.

| Resource | Base Route |
|----------|-----------|
| Authentication | `/api/auth` |
| Tutors | `/api/tutors` |
| Students | `/api/students` |
| Sessions | `/api/sessions` |
| Reviews | `/api/reviews` |
| Notifications | `/api/notifications` |
| Admin | `/api/admin` |
| Health check | `GET /api/health` |
| Endpoint docs | `GET /api/docs` |

---

## User Roles

| Role | Description |
|------|-------------|
| `student` | Can search tutors, book sessions, write reviews, and manage a wishlist |
| `tutor` | Can manage their profile, availability, sessions, and view earnings |
| `admin` | Can approve tutor verifications and access analytics reports |

Authentication is handled via JWT. Role-based middleware (`studentAuth`, `tutorAuth`, `adminAuth`) protects each group of routes.

---

## Security

- **Rate limiting** — 100 requests per 15 minutes per IP
- **Input sanitization** — MongoDB operator injection and XSS protection on all inputs
- **HTTP headers** — Hardened with Helmet.js
- **HTTP Parameter Pollution** — Prevented with HPP
- **File uploads** — Restricted to PDFs and images with a 10 MB size limit
- **Passwords** — Hashed with bcryptjs before storage

---

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Follow the existing code style and naming conventions.
3. Test your changes before opening a pull request.
4. Open a pull request with a clear description of what you changed and why. 