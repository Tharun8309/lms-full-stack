## Project Description link : https://lms-frontend-pearl-ten.vercel.app/
An end‑to‑end Learning Management System (LMS) where learners can discover courses, enroll via Stripe Checkout, watch lectures, track progress, and leave ratings. Educators can create and manage courses and view enrolled students.

### Core Functionalities
- Student
  - Register/Login
  - Browse and view course details
  - Secure checkout with Stripe
  - My Enrollments and Course Player
  - Progress tracking and resume
  - Rate purchased courses
- Educator
  - Dashboard overview
  - Create and publish courses (chapters/lectures)
  - Manage my courses
  - View students enrolled

## Tech Stack
- React 18, Vite, React Router, Tailwind CSS
- Node.js, Express, MongoDB (Mongoose)
- JWT authentication, Multer (uploads), Cloudinary (media)
- Stripe Checkout + Webhooks (payments)

## How to Run
1) Install dependencies
```bash
cd client && npm install
cd ../server && npm install
```

2) Set environment variables
- Server (`server/.env`): `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CURRENCY`, optionally Cloudinary creds
- Client (`client/.env`): `VITE_API_BASE_URL` (e.g., `http://localhost:5000`)

3) Start the backend
```bash
cd server
npm run server   # or: npm start
```

4) Start the frontend
```bash
cd client
npm run dev
```

5) Payments (optional for testing)
- Ensure Stripe keys and webhook secret are set
- If local, use Stripe CLI: `stripe listen --forward-to localhost:5000/stripe`

