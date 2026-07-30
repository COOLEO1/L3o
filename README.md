# L3o AI 🇲🇼

A full-stack, ChatGPT-style AI assistant powered by **Mistral AI (Codestral)**.

**Created by Leon Mapelera — Malawi 🇲🇼**

L3o AI ships with a dark, futuristic React chat interface (splash screen,
Markdown + syntax-highlighted code rendering, mobile-first responsive layout)
and a lightweight FastAPI backend that talks to the Mistral AI API.

---

## ✨ Features

- **Splash screen** — animated neural-orb intro showing "L3o AI — Created by Leon Mapelera 🇲🇼"
- **ChatGPT-style chat UI** — smooth scrolling, streaming responses, typing indicator
- **Markdown + code rendering** — automatic language detection (`python`, `javascript`,
  `html`, `css`, `json`, `bash`, etc.) with VS Code–style syntax highlighting and a copy button
- **Mobile-first, responsive, dark futuristic theme**
- **FastAPI backend** with secure `.env`-based API key handling
- **Streaming and non-streaming** chat endpoints
- **Ready for Termux, GitHub, and Render** out of the box

---

## 📁 Project Structure

```
L3o_AI/
├── backend/
│   ├── main.py            # FastAPI server + Mistral AI integration
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # SplashScreen, ChatWindow, Message, CodeBlock, InputBox
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/favicon.svg
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── render.yaml
├── .gitignore
└── README.md
```

---

## 🔑 1. Get a Mistral AI API key

1. Go to https://console.mistral.ai and create an account.
2. Generate an API key.
3. Keep it handy — you'll paste it into `backend/.env` in the next step.

---

## 📲 2. Run it in Termux

Install prerequisites (once):

```bash
pkg update && pkg upgrade -y
pkg install python nodejs-lts git -y
```

Unzip the project (if you downloaded the zip) and enter it:

```bash
unzip L3o_AI.zip
cd L3o_AI
```

### Backend setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
nano .env          # paste your MISTRAL_API_KEY, save with CTRL+O, exit with CTRL+X
python main.py
```

The backend will start on `http://localhost:8000`.

### Frontend setup (open a second Termux session/tab)

```bash
cd L3o_AI/frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000 is fine for local use
npm run dev -- --host
```

Vite will print a local URL (e.g. `http://localhost:5173`) — open it in your
phone's browser to use L3o AI.

---

## 🐙 3. Push to GitHub

From the `L3o_AI` project root:

```bash
git init
git add .
git commit -m "Initial commit: L3o AI by Leon Mapelera"
git branch -M main
git remote add origin https://github.com/<your-username>/L3o_AI.git
git push -u origin main
```

> The `.gitignore` already excludes `.env` files and `node_modules`, so your
> API key will never be committed.

---

## 🚀 4. Deploy on Render

### Option A — One-click Blueprint (recommended)

1. Push this repo to GitHub (step 3 above).
2. On https://dashboard.render.com, click **New +** → **Blueprint**.
3. Select your `L3o_AI` repository. Render will read `render.yaml` and create
   two services automatically:
   - `l3o-ai-backend` (FastAPI web service)
   - `l3o-ai-frontend` (static site)
4. When prompted, paste your `MISTRAL_API_KEY` into the backend service's
   environment variables (it's marked `sync: false` so Render will ask for it).
5. After the backend deploys, copy its public URL (e.g.
   `https://l3o-ai-backend.onrender.com`) and set it as `VITE_API_URL` on the
   frontend service (already pre-filled in `render.yaml` — update if your
   service name differs), then redeploy the frontend.

### Option B — Manual setup

**Backend (Web Service):**
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `MISTRAL_API_KEY`, `MISTRAL_MODEL=codestral-latest`, `ALLOWED_ORIGINS=*`

**Frontend (Static Site):**
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-backend>.onrender.com`
- Add a rewrite rule: `/*` → `/index.html` (for client-side routing)

---

## 🧠 API Reference (backend)

| Method | Endpoint            | Description                                  |
|--------|---------------------|-----------------------------------------------|
| GET    | `/`                 | Health/info banner                            |
| GET    | `/api/health`       | Server + API key status                       |
| GET    | `/api/about`        | App identity (name, creator, country)         |
| POST   | `/api/chat`         | Non-streaming chat completion                 |
| POST   | `/api/chat/stream`  | Streaming chat completion (SSE-style chunks)  |

Example request body for `/api/chat` and `/api/chat/stream`:

```json
{
  "messages": [
    { "role": "user", "content": "Write a hello world in Python" }
  ]
}
```

---

## 🛠️ Customization

- Change the model in `backend/.env` via `MISTRAL_MODEL` (defaults to `codestral-latest`).
- Adjust the AI's persona/system prompt in `backend/main.py` (`SYSTEM_PROMPT`).
- Theme colors and fonts are defined as CSS variables in `frontend/src/index.css`.

---

## 📄 License

This project was generated for **Leon Mapelera** as a personal AI assistant
project. Use and modify freely.

---

Built with ❤️ from Malawi 🇲🇼 — **L3o AI**, created by **Leon Mapelera**.
