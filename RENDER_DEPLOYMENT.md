# Render Hosting & Deployment Guide

This guide provides step-by-step instructions to deploy the **AI Resume Analyzer & ATS Optimizer** on [Render](https://render.com/).

---

## Architecture on Render

| Component | Render Service Type | Runtime | Cost | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | **Web Service** | Python 3.11 | Free Tier eligible | Runs FastAPI, Uvicorn, PyMuPDF, and Gemini AI |
| **Frontend** | **Static Site** | Node / Static CDN | **100% Free** (No spin-down) | Vite + React + Tailwind build, served via Render global CDN |

---

## Pre-Deployment Verification Checklist

All code in this repository has been prepared and verified for Render compatibility:

- [x] **Dynamic Port Binding**: `uvicorn` listens on `0.0.0.0` and port `$PORT` provided by Render.
- [x] **CORS Support**: `backend/main.py` is configured to accept requests from your Render frontend domain with credentials enabled.
- [x] **Dynamic Frontend API Endpoint**: `frontend` reads `VITE_BACKEND_URL` so that API calls route to the live Render backend instead of `localhost`.
- [x] **Python 3.11 Pinned**: `.python-version` files specify Python `3.11.9` to ensure modern typing and `datetime.UTC` compatibility.
- [x] **SPA Rewrite Configured**: Render routes `/*` to `/index.html` to prevent 404s on browser reload.
- [x] **Dependencies Tested**: All packages in `backend/requirements.txt` are verified against PyPI.

---

## Method 1: 1-Click Deployment via Render Blueprint (Recommended)

Render Blueprints use the included [`render.yaml`](./render.yaml) file to automatically configure both the backend and frontend services.

### Step 1: Push your latest changes to GitHub

Ensure all files (including `render.yaml` and `.python-version`) are pushed to your GitHub repository:

```bash
git add .
git commit -m "feat: configure repository for Render deployment"
git push origin main
```

### Step 2: Create a Blueprint on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. In the top-right corner, click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `Debanjan-21/AI-Resume-Analyzer`.
4. Render will read `render.yaml` and display the blueprint plan with two services:
   - `ai-resume-analyzer-backend` (Web Service)
   - `ai-resume-analyzer-frontend` (Static Site)

### Step 3: Enter Environment Variables

Render will prompt you for variables marked with `sync: false`:

- `GEMINI_API_KEY`: Paste your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/).
- `MONGODB_URL`: *(Optional)* Enter your MongoDB Atlas connection string (or leave empty to use the built-in local store fallback).
- `FRONTEND_URL`: Leave empty initially; you can fill this in once the frontend URL is assigned.

Click **Apply**. Render will start provisioning and building both services.

### Step 4: Link Frontend to Backend URL

1. Once the backend deployment completes, copy your backend URL (e.g. `https://ai-resume-analyzer-backend.onrender.com`).
2. Go to your **ai-resume-analyzer-frontend** service in the Render Dashboard.
3. Open **Environment** tab.
4. Set or verify:
   ```
   VITE_BACKEND_URL = https://ai-resume-analyzer-backend.onrender.com
   ```
5. Click **Save Changes** and trigger a **Manual Deploy > Clear build cache & deploy** so the new backend URL is baked into the frontend bundle.

---

## Method 2: Manual Dashboard Deployment

If you prefer configuring each service manually via the Render UI:

### Step 1: Deploy Backend Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository** and pick `AI-Resume-Analyzer`.
3. Configure the following fields:
   - **Name**: `ai-resume-analyzer-backend`
   - **Region**: Any (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Expand **Advanced**:
   - **Health Check Path**: `/api/health`
5. In **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` | Ensures Python 3.11 is used |
   | `GEMINI_API_KEY` | `your_actual_gemini_api_key` | From Google AI Studio |
   | `JWT_SECRET_KEY` | `generate-a-random-32-char-string` | Used for session & auth signing |
   | `JWT_ALGORITHM` | `HS256` | Token algorithm |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token validity |
   | `DATABASE_NAME` | `ai_resume_analyzer` | Database name |
   | `MONGODB_URL` | *(Optional)* `mongodb+srv://...` | Leave blank for built-in local store fallback |
6. Click **Create Web Service**.
7. Copy the assigned URL once live: e.g. `https://ai-resume-analyzer-backend.onrender.com`.

---

### Step 2: Deploy Frontend Static Site

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Select your repository `AI-Resume-Analyzer`.
3. Configure the following fields:
   - **Name**: `ai-resume-analyzer-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In **Redirects / Rewrites** tab:
   - Click **Add Rewrite**
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. In **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_BACKEND_URL` | `https://ai-resume-analyzer-backend.onrender.com` | Paste your backend Web Service URL |
6. Click **Create Static Site**.

---

### Step 3: Set `FRONTEND_URL` on Backend (Optional but Recommended)

Now that you have your frontend URL (e.g. `https://ai-resume-analyzer-frontend.onrender.com`):

1. Go back to your `ai-resume-analyzer-backend` Web Service.
2. Go to **Environment** tab.
3. Add or update:
   ```
   FRONTEND_URL = https://ai-resume-analyzer-frontend.onrender.com
   ```
4. Click **Save Changes** (Render will automatically redeploy the backend).

---

## Post-Deployment Verification

Once both services show **Live**:

1. **Verify Backend Health**:
   Open in your browser:
   ```
   https://<your-backend-name>.onrender.com/api/health
   ```
   You should see:
   ```json
   {
     "status": "healthy",
     "service": "AI Resume Analyzer Backend",
     "port": ...
   }
   ```

2. **Verify Interactive API Documentation**:
   Open Swagger UI:
   ```
   https://<your-backend-name>.onrender.com/docs
   ```

3. **Verify Frontend**:
   Open:
   ```
   https://<your-frontend-name>.onrender.com
   ```
   - Check the **FastAPI Status indicator** in the top header. It should show a green **Connected** badge.
   - Upload a sample PDF resume, paste a target job description, and click **Analyze Resume**.
   - Verify that ATS scoring, STAR bullet optimizations, and Gemini recommendations populate properly.

---

## Important Render Free Tier Tips

> [!NOTE]
> **Free Tier Sleep Behavior**:
> - Render **Static Sites** (frontend) are hosted on Render's global CDN and **never sleep**. They load instantly at all times.
> - Render **Web Services** (backend) on the free plan spin down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to boot up (cold start). Subsequent requests will be fast.

> [!TIP]
> **Keeping the Backend Warm (Optional)**:
> If you want to eliminate cold starts on the free tier, you can configure a free uptime monitoring service like [UptimeRobot](https://uptimerobot.com/) or [cron-job.org](https://cron-job.org/) to ping `https://<your-backend-name>.onrender.com/api/health` every 10 minutes.
