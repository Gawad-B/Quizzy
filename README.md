# Quizzy

Quizzy is a full-stack quiz application with a React + Vite frontend, Express backend, and PostgreSQL database.

## Project Structure

- `src/`: Frontend app (React + TypeScript)
- `backend/`: Backend API (Express + PostgreSQL)
- `database.sql`: Database schema and seed SQL

### Backend Structure

- `backend/src/config/`: environment and database configuration
- `backend/src/middleware/`: auth middleware
- `backend/src/routes/`: API route modules
- `backend/src/app.js`: express app wiring
- `backend/src/server.js`: server bootstrap + graceful shutdown

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+
- Firebase project (Authentication enabled)

## Local Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
npm --prefix backend install
```

3. Configure environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

4. Update `backend/.env` with your real PostgreSQL credentials.
	Set `FIREBASE_API_KEY` from your Firebase project config.
	In Firebase Console, enable Email/Password sign-in method and require email verification in your auth flow.

5. Create database and run schema:

```bash
psql -U postgres -d quizzy -f database.sql
```

6. Start backend API:

```bash
npm --prefix backend run dev
```

7. Start frontend:

```bash
npm run dev
```

## Production Build

Frontend build:

```bash
npm run build
```

Backend run:

```bash
npm --prefix backend run start
```

## Health Check

API health endpoint:

```bash
GET /api/health
```

Example:

```bash
curl http://localhost:3000/api/health
```

## Deployment Notes

- Set `VITE_API_URL` to your deployed API URL.
- Set `CORS_ORIGIN` in backend to your frontend domain.
- Never commit real `.env` files.
- Use a strong random `JWT_SECRET` in production.

## Core API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`
- `POST /api/auth/email-verification/resend`
- `POST /api/auth/action/apply`
- `GET /api/auth/me`
- `GET /api/users/me/quizzes`
- `POST /api/users/seed`
- `GET /api/health`

## Firebase Email Template Setup

Quizzy now supports password recovery, email verification, and email recovery action links.

1. Open Firebase Console -> Authentication -> Templates.
2. For each template (Password reset, Email address verification, Email address change revocation):
	- Customize sender name, sender address, reply-to, subject, and message body.
	- Use placeholders like `%DISPLAY_NAME%`, `%APP_NAME%`, `%LINK%`, `%EMAIL%`, and `%NEW_EMAIL%` where needed.
3. In each template, click Customize action URL and set:
	- `http://localhost:5173/auth/action` for local development.
	- Your production frontend URL for deployed environments.
4. Firebase appends `mode` and `oobCode` automatically, and the app handles:
	- `mode=resetPassword`
	- `mode=verifyEmail`
	- `mode=recoverEmail`
5. Optional: customize sender domain in Firebase Templates by verifying your domain.
