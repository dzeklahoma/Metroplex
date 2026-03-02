# Metroplex 🌍  
**Production-Ready Travel Itinerary Planner**

Metroplex is a full-stack travel planning web application that automatically generates structured, day-by-day itineraries based on user preferences and constraints.

Users select a destination, trip duration, interests, and optional budget — the system distributes optimized activities across days and stores the generated itinerary in a managed PostgreSQL database.

This project demonstrates production-level architecture, authentication, role management, database migrations, CI integration, and cloud deployment.

---

## 🚀 Live Application

**Frontend**  
https://metroplex-frontend.onrender.com  

**Backend API**  
https://metroplex-backend.onrender.com  

**Swagger Documentation**  
https://metroplex-backend.onrender.com/api/docs  

**Health Endpoint**  
https://metroplex-backend.onrender.com/health  

---

## 🏗 Architecture Overview

```
Frontend (React + Vite, Render Static Site)
        ↓
Backend API (Express + Prisma, Dockerized)
        ↓
Managed PostgreSQL (Render)
        ↓
External APIs (Weather + Geocoding)
```

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (Render Managed DB)
- JWT Authentication
- Helmet (Security Headers)
- Rate Limiting
- Zod Validation

### DevOps
- Docker (multi-stage production builds)
- Render (Web Service + Static Site + Managed DB)
- GitHub Actions CI
- Branch protection rules

---

## 🔐 Core Features

- User registration & login (JWT)
- Role-based access control (ADMIN / EDITOR / USER)
- Automatic itinerary generation
- Trip regeneration
- Activity management (ADMIN / EDITOR)
- Revoked token blacklist (JWT invalidation)
- Strict CORS configuration
- Input validation
- Rate limiting
- Swagger API documentation
- Health check endpoint for deployment verification

---

## 🧪 Continuous Integration

All changes are merged via Pull Request.

CI pipeline:
- Installs dependencies
- Runs tests
- Prevents merge if checks fail

---

## 🧑‍💻 Running Locally

### Option 1 — Docker (Recommended)

```bash
docker compose up --build
```

- Backend → http://localhost:3001  
- Frontend → http://localhost:5173  

---

### Option 2 — Manual Setup

#### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### backend/.env

```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/metroplex
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173
```

### frontend/.env

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 🌍 Production Details

- Deployed on Render
- Backend auto-runs Prisma migrations on startup
- Managed PostgreSQL database
- Production CORS restricted to frontend domain
- Data importable via pg_dump / pg_restore
- CI-protected main branch

---

## 🔄 Git Workflow

- `main` → production
- `develop` → integration
- `feature/*` → feature branches

All merges require passing CI checks.

---

## 🎯 Why This Project Is Portfolio-Ready

Metroplex demonstrates:

- Full-stack architecture
- Production deployment
- Secure authentication flow
- Role-based authorization
- Database migration strategy
- CI integration
- Managed cloud database
- Dockerized backend
- Real external API integrations
- Strict security practices

This is not a demo-only app — it is deployed, production-configured, and fully operational.

<img width="934" height="782" alt="image" src="https://github.com/user-attachments/assets/5fc9ab70-0e39-4adc-8e1f-74b5911c92a4" />
<img width="1228" height="851" alt="image" src="https://github.com/user-attachments/assets/df39ca0c-6dfa-4a52-8c49-6866657d932e" />
<img width="966" height="905" alt="image" src="https://github.com/user-attachments/assets/3b510968-b87b-47be-a1ad-4bda1b759141" />
<img width="905" height="906" alt="image" src="https://github.com/user-attachments/assets/fc7a75bb-8d22-44b6-ac62-18c14bfed07e" />
<img width="964" height="878" alt="image" src="https://github.com/user-attachments/assets/84cd8ea7-d28b-4efc-8732-96a9f9f9a271" />





