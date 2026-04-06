# Portfolio Dashboard

A full-stack portfolio management system with an admin dashboard. Built with **React** (frontend), **Node.js/Express** (backend), and **MySQL** (database).

## Features

- 🔐 Admin login with JWT authentication
- 📁 Portfolio view — browse all uploaded works
- ⬆️ Upload new works with images and/or videos
- 🗑️ Delete works from the dashboard
- 🚪 Logout button returning to the login screen
- 🤖 Future chatbot support: `users` table ready for chatbot user registration

---

## Project Structure

```
ID/
├── backend/           # Node.js / Express API
│   ├── middleware/
│   │   └── auth.js    # JWT middleware
│   ├── routes/
│   │   ├── auth.js    # POST /api/auth/login
│   │   ├── works.js   # GET/POST/DELETE /api/works
│   │   └── users.js   # POST /api/users  (chatbot)
│   ├── uploads/       # Uploaded media files
│   ├── db.js          # MySQL connection pool
│   ├── server.js      # Express app entry point
│   ├── .env.example   # Environment variables template
│   └── package.json
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── context/   # AuthContext (JWT state)
│   │   ├── components/# Portfolio, UploadWork, ProtectedRoute
│   │   ├── pages/     # Login, Dashboard
│   │   └── App.jsx    # React Router configuration
│   └── package.json
└── database/
    └── schema.sql     # MySQL database schema
```

---

## Prerequisites

- Node.js ≥ 18
- MySQL ≥ 5.7 or MariaDB ≥ 10.4

---

## Setup

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

This creates the `portfolio_db` database with three tables:
- `admins` — admin accounts
- `works` — portfolio items (name, description, image_url, video_url)
- `users` — chatbot visitor registrations (name, company, email)

Default credentials: **username:** `admin` / **password:** `admin123`

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and a secure JWT_SECRET
npm install
npm start
```

The API runs on `http://localhost:5000`.

#### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Admin login |
| GET | `/api/works` | ✅ JWT | List all works |
| POST | `/api/works` | ✅ JWT | Upload new work (multipart) |
| DELETE | `/api/works/:id` | ✅ JWT | Delete a work |
| GET | `/api/health` | — | Health check |
| POST | `/api/users` | — | Register chatbot user |
| GET | `/api/users` | ✅ JWT | List chatbot users |
| GET | `/api/users/works` | — | Public portfolio for chatbot |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` and proxies `/api` requests to the backend.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
DB_PORT=3306

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=24h

PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Future: Chatbot Integration

The system is ready for chatbot integration. A chatbot can:

1. **Register users** via `POST /api/users` (name, company, email)
2. **Retrieve the portfolio** via `GET /api/users/works` (public endpoint)

These endpoints are already implemented and ready to use.
