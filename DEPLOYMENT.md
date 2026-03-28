# Deployment Guide

## 1. Environment Variables

Frontend (.env):

- VITE_API_URL=https://your-api-domain.com

Backend (backend/.env):

- DATABASE_URL=postgresql://user:password@host:5432/quizzy
- JWT_SECRET=use-a-long-random-secret
- FIREBASE_API_KEY=your_firebase_web_api_key
- PORT=3000
- CORS_ORIGIN=https://your-frontend-domain.com

## 2. Database

Run schema and seed data:

```bash
psql -U your_user -d quizzy -f database.sql
```

## 3. Build and Run

Frontend build:

```bash
npm install
npm run build
```

Backend run:

```bash
npm --prefix backend install
npm --prefix backend run start
```

## 4. Health Verification

```bash
curl https://your-api-domain.com/api/health
```

Expected response: success true.

## 5. Hosting Suggestions

- Frontend: Vercel, Netlify, or static hosting behind CDN
- Backend: Render, Railway, Fly.io, VPS, or container platform
- Database: Managed PostgreSQL (Neon, Supabase, RDS, Railway)

## 6. Security Checklist

- Use HTTPS for frontend and backend
- Keep JWT_SECRET private and strong
- Restrict CORS_ORIGIN to trusted domains only
- Do not commit .env files
- Rotate database credentials if leaked

## 7. Firebase Email Verification

- In Firebase Console, open `Authentication` -> `Sign-in method`.
- Enable `Email/Password` provider.
- Use your signup/login backend flow that sends verification email after registration.
- New users must verify email before they can log in.

