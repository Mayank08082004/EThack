# ET — The Personalized Newsroom

Welcome to the ET Personalized Newsroom repository!

This repository contains the ongoing work for the **ET — The Personalized Newsroom** Hackathon project. This README serves as a living document of **what is already built** and **what needs to be built next**.

Please refer to the original `HACKATHON_GUIDE.md` for context and architecture rules.

---

## 🚀 Quick Start / Setup

Follow these steps to get the ET Intelligence Newsroom running on your local machine.

### 1. Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)
- **Supabase Account** (for database & vector storage)
- **Gemini API Key** (for AI analysis)

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Update with your Supabase & Gemini keys
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local # Update with your Supabase keys
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🟢 What is DONE (Current Progress)

### 1. The Core Infrastructure & Phase 1 (100% Complete)

Built by Mayank, the **Story Arc Tracker** is fully complete and functional.

- **Backend:** `story_routes.py` along with all its AI services (`timeline.py`, `sentiment.py`, `players.py`, `contrarian.py`, `predictions.py`) are fully integrated.
- **Frontend:** The `/frontend/app/story/` module and the global design tokens (`globals.css`) are complete and set the design system.

### 2. My ET — The Personalized Newsroom (Backend 80% Complete)

The backend logic required for fetching and analyzing user preferences is mostly complete.

- **Backend:** `preferences_routes.py` (saves user genres to Supabase) and `news_routes.py` (fetches personalized news and syncs it via embeddings) are operational.

### 3. News Navigator (Backend Logic 50% Complete)

The core logic for interacting with intelligence briefings is built.

- **Backend:** `services/chatbot.py` exists and successfully integrates `gemini-2.5-flash` to answer user questions using story context and chat history.

---

## 🏃 What to Do NEXT (Team Action Items)

Here is exactly what the remainder of the team needs to work on next to complete Phase 2:

### Immediate Priority: Connect "My ET" to the Frontend

1. **Frontend:** You need to create `/frontend/app/my-et/page.tsx`.
2. **Task:** This page needs to fetch the data from the newly built `news_routes.py` and `preferences_routes.py` endpoints and display the customized news feed using the pre-existing `.article-item` UI styles.

### Immediate Priority: Wire up "News Navigator"

1. **Backend:** You have the logic (`services/chatbot.py`), but you need to expose it! Create `backend/app/api/routes/navigator_routes.py` to handle the HTTP requests for the chatbot. Make sure to register this route in `backend/app/main.py`.
2. **Frontend:** Create `/frontend/app/navigator/page.tsx` and build the floating chat widget to interact with this new route.

### High Priority: Start "AI News Video Studio" from Scratch

1. **Status:** 0% Complete.
2. **Backend:** Create `backend/app/api/routes/video_routes.py` and `backend/app/services/video_gen.py`. You will need to install and use text-to-speech (e.g. ElevenLabs) and video frameworks. **Don't forget to run `pip freeze > requirements.txt` afterwards.**
3. **Frontend:** Create `/frontend/app/studio/page.tsx` with loading states for video generation.

### High Priority: Start "Vernacular Business News Engine" from Scratch

1. **Status:** 0% Complete.
2. **Backend:** Create `backend/app/api/routes/vernacular_routes.py` and `backend/app/services/translation.py`. Utilize LLMs (Gemini/OpenAI) to handle contextual news localization.
3. **Frontend:** Create `/frontend/app/vernacular/page.tsx` with a multi-language selector UI.

---

*For UI development, please stick to the premium dark-mode aesthetic provided in `globals.css`.*
