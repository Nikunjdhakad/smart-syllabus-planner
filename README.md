# Smart Syllabus Planner

AI-powered academic planning for students — syllabus organization, study schedules, progress tracking, revisions, and an AI assistant.

## Stack

- **Frontend:** Next.js 16, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT sessions (httpOnly cookies) + bcrypt
- **AI (later):** Google Gemini API

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in:

   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — long random secret (32+ characters)
   - `GEMINI_API_KEY` — optional until AI features are built

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login & register
│   ├── (dashboard)/     # Protected app screens
│   └── api/             # REST API routes
├── components/          # UI & layout
├── lib/                 # DB, auth, utilities
├── models/              # Mongoose schemas
└── types/               # Shared TypeScript types
```

## API (base)

| Method | Route                | Description        |
|--------|----------------------|--------------------|
| GET    | `/api/health`        | Health check       |
| POST   | `/api/auth/register` | Create account     |
| POST   | `/api/auth/login`    | Sign in            |
| POST   | `/api/auth/logout`   | Sign out           |
| GET    | `/api/auth/me`       | Current user       |

## Build phases (planned)

1. **Base** — auth, DB models, navigation, placeholders *(current)*
2. Syllabus upload & AI extraction
3. Study planner generation
4. Progress tracking & analytics
5. Revision scheduling
6. AI assistant & dynamic rescheduling

## Deploy

Deploy to [Vercel](https://vercel.com) and set the same environment variables in the project settings.
