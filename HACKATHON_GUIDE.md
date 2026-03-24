# ET — The Personalized Newsroom (Hackathon Project)

## 📌 Project Overview
We are building a fundamentally new way to consume business news for 2026. The platform consists of 5 core features. 

### ✅ Phase 1: Completed
**Story Arc Tracker (Built entirely by Mayank)**
- **Feature**: AI builds a complete visual narrative of any ongoing business story.
- **Backend Components**: 
  - `app/api/routes/story_routes.py`: Compiles the master JSON payload.
  - `app/services/`: Contans AI logic (`timeline.py`, `sentiment.py`, `players.py`, `contrarian.py`, `predictions.py`).
- **Frontend Components**: 
  - `app/story/[id]/page.tsx`: The main dynamic GUI.
  - `app/globals.css`: Contains the master dark-mode, gold-accented typography and layout system.

---

### 🚀 Phase 2: Handoff Guide for the Team

The rest of the team will be building the remaining 4 features. **Please DO NOT touch or modify Mayank's existing `Story Arc Tracker` files, as they are fully functional and heavily deployed.**

Here is what each of you will need to build and exactly where your code should go:

#### 1. My ET — The Personalized Newsroom
*A fundamentally different news experience based on user personas (Mutual Fund Investor, Startup Founder, Student, etc).*
- **Backend Rules**: Create `backend/app/api/routes/personalization_routes.py` to handle profile creation and RAG feed filtering.
- **Frontend Rules**: Create `frontend/app/my-et/page.tsx` to display the customized feed. Re-use `.article-item` CSS from `globals.css` to keep the UI consistent.

#### 2. News Navigator — Interactive Intelligence Briefings
*Synthesizes all ET coverage of an event into an explorable document with follow-up Q&A.*
- **Backend Rules**: Create `backend/app/api/routes/navigator_routes.py` connected to a langchain/RAG script in `backend/app/services/qa.py` for answering follow-up questions.
- **Frontend Rules**: Create `frontend/app/navigator/page.tsx`. Build a floating chat widget or split-screen reading interface.

#### 3. AI News Video Studio
*Automatically transform any breaking news into a broadcast-quality short video.*
- **Backend Rules**: Create `backend/app/api/routes/video_routes.py`. Create scripts in `backend/app/services/video_gen.py` combining APIs (like ElevenLabs for voiceover and a video compositing library).
- **Frontend Rules**: Create `frontend/app/studio/page.tsx` to handle the video generation loading states and a video playback player.

#### 4. Vernacular Business News Engine
*Real-time, context-aware localized translation of ET's English news.*
- **Backend Rules**: Create `backend/app/api/routes/vernacular_routes.py`. Create `backend/app/services/translation.py` using LLMs for context-aware (non-literal) Hindi/Tamil/Telugu localization.
- **Frontend Rules**: Create `frontend/app/vernacular/page.tsx` featuring a language selector dropdown.

---

## 🎨 UI/UX Guidelines
We have established a highly premium, dark-mode aesthetic for this project. 
- Please thoroughly read through `frontend/app/globals.css`. 
- **CRITICAL:** Re-use the master CSS custom variables (`var(--gold)`, `var(--bg1)`, `var(--text)`) instead of hardcoding any hex colors.
- The UI automatically adapts to Light Mode via CSS media queries. **Do NOT break this.**

## 🚢 Deployment Protocol
- Our Backend is currently deployed dynamically on **Render**. If you add any new Python packages (like `langchain`, `moviepy`, etc.), you **MUST** run `pip freeze > requirements.txt` before pushing to GitHub.
- Our Frontend is deployed on **Vercel**.
