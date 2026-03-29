# ET Intelligence Newsroom

An AI-native business news experience built for hackathon speed and real-world relevance.

## Problem Statement

Business news is still consumed like it is 2005: static articles, same homepage for everyone, minimal interactivity.

Readers today need context, personalization, and actionable intelligence, not just headlines.

## Our Hackathon Pitch

ET Intelligence Newsroom turns traditional business coverage into a living intelligence product.

Instead of reading disconnected articles, users get:

- personalized newsroom based on their interests
- AI-generated story arcs for ongoing events
- conversational story briefings
- sentiment and contrarian analysis
- multilingual accessibility support

## What We Built

### 1. Personalized Newsroom (My ET)
- Supabase-authenticated user sessions
- genre-based preference onboarding
- personalized news feed retrieval
- background sync pipeline with embeddings for relevance

### 2. Story Arc Tracker
- clustering and aggregation of related business stories
- AI-generated summary and dynamic story title
- event timeline extraction
- sentiment shifts across article evolution
- key player detection
- contrarian perspective surfacing
- "what to watch next" predictions

### 3. Interactive Story Chat (News Navigator Style)
- chat with the context of a specific tracked story
- vector-similarity retrieval over relevant article chunks
- Gemini-powered responses grounded in retrieved context

### 4. Search-First Story Navigation
- query-driven story discovery endpoint
- direct jump from search query to deep story intelligence view

### 5. Vernacular Assistance Layer
- integrated Google Translate widget across the app shell
- quick multi-language support for improved accessibility

## Why This Feels Different

- Not a feed. A personalized intelligence workspace.
- Not article-by-article reading. A full evolving narrative.
- Not passive consumption. Interactive follow-up with AI.

## High-Level Architecture

### Frontend
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- GSAP
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Supabase (Auth + data access)
- PostgreSQL (including vector similarity queries)
- Uvicorn

### AI Layer
- Gemini (OpenAI-compatible endpoint)
- local embedding generation with FastEmbed
- custom intelligence services for summary, timeline, sentiment, player extraction, contrarian analysis, and predictions

## Repository Layout

- backend: FastAPI routes, services, schemas, DB integration
- frontend: Next.js app with auth, dashboard, story intelligence, and article reader flows

## Prerequisites

- Node.js 18+
- npm
- Python 3.10+
- pip
- Supabase project credentials
- Gemini API key

## Environment Setup

Use backend/.env.example as reference.

Create backend/.env with:

- DATABASE_URL
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY

Create frontend/.env.local with:

- NEXT_PUBLIC_API_URL=http://localhost:8000

## Run Locally

### 1. Start Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: http://localhost:8000

### 2. Start Frontend (Next.js)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

