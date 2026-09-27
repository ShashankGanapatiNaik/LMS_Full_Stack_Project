# LMS Frontend (React + Tailwind CSS)

## Setup
```bash
cd lms-frontend
npm install
npm start
```
Runs on `http://localhost:3000` and expects the backend at
`http://localhost:8080/api` (override with a `.env` file setting
`REACT_APP_API_URL`).

## Pages
- `/login`, `/register` — auth
- `/courses` — public course catalog
- `/courses/:id` — materials, assignments, enroll, submit
- `/dashboard` — role-aware landing page (my courses / my enrollments)
- `/progress` — student progress bars per course
- `/manage` — instructor/admin: create courses, add materials & assignments, grade submissions

## Auth flow
`AuthContext` stores the JWT + user info in `localStorage` and attaches the
token to every API call via an axios interceptor (`src/api/axios.js`). A 401
response anywhere logs the user out automatically.

## Styling
Tailwind CSS utility classes throughout; brand color scale defined in
`tailwind.config.js`.
