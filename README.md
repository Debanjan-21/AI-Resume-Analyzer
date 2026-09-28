# AI Resume Analyzer & ATS Optimizer

An intelligent, full-stack AI Resume Analyzer and ATS Optimizer that evaluates resumes for Applicant Tracking System (ATS) compliance, extracts actionable insights, rewrites bullet points using the STAR method, and delivers personalized career & skill recommendations using Google Gemini and Python FastAPI.

![Project Banner](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## Key Features

- **Native PDF Parsing**: Direct upload and multi-column parsing of PDF resumes using `PyMuPDF` (`fitz`).
- **Comprehensive ATS Scoring**: Overall score, letter grade (A+, A, B, C, D), and component metrics for Keyword Match, Impact Quantification, Readability, and Brevity.
- **Section-by-Section ATS Health Audit**: Scans and audits Contact & Header, Professional Summary, Work Experience, Projects, Technical Skills, and Education with ATS compliance badges and actionable tips.
- **STAR Bullet Optimizer**: Pinpoints weak duty-based bullet points and automatically rewrites them into high-impact STAR (Situation, Task, Action, Result) accomplishments with quantifiable metrics.
- **6-Second Recruiter Impression**: Evaluates first-glance seniority impression, estimated reading time, top strengths, and critical red flags.
- **Job Role & Skill Recommendations**: Analyzes detected skills, projects, and qualifications to recommend matching career roles and high-ROI skills to learn.
- **Export to PDF / Print Report**: One-click professional formatted report export for job seekers.

---

## Tech Stack

### Backend
- **Framework**: FastAPI, Uvicorn, Pydantic v2
- **AI & LLM**: Google Gemini API (`google-genai` SDK)
- **Document Extraction**: PyMuPDF (`fitz`), pdfminer
- **Database (Optional)**: MongoDB Atlas via Motor async driver
- **Authentication**: JWT (Jose), Passlib (Bcrypt)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **State Management**: React Hooks & LocalStorage History

---

## Project Structure

```
AI-Resume-Analyzer/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI API endpoints (analysis, recommendations, auth)
│   │   ├── config/          # Environment & Database settings
│   │   ├── schemas/         # Pydantic data models
│   │   ├── services/        # AI Service, ATS scoring, skill extraction
│   │   └── utils/           # PyMuPDF parser, text cleaner
│   ├── main.py              # Application entrypoint & CORS configuration
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Backend environment template
│   └── uploads/             # Temporary upload directory (.gitkeep)
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI cards & modals
│   │   ├── services/        # API client & client-side analyzer engine
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── App.tsx          # Main dashboard view
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- A Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/))

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY

# Start the FastAPI backend server
uvicorn main:app --reload --port 8000
```

Backend will be running at `http://127.0.0.1:8000`  
Interactive API docs (Swagger): `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend will be running at `http://localhost:3000`

---

## Environment Variables

In `backend/.env`:

```ini
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: MongoDB URL (defaults to local/offline fallback if not set)
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ai_resume_analyzer

# JWT Auth Secret
JWT_SECRET_KEY=your_secure_random_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## Deploying to Render

This application is fully optimized for 1-click deployment on [Render](https://render.com/) using the included [`render.yaml`](./render.yaml).

- **Backend**: Deployed as a Python Web Service running FastAPI with automatic `$PORT` binding.
- **Frontend**: Deployed as a high-speed Static Site served via Render's global CDN (100% Free).

For the step-by-step walkthrough, see the [Render Deployment Guide](./RENDER_DEPLOYMENT.md).

---

## License

This project is licensed under the MIT License.

