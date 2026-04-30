# Uttrly 

A minimal, distraction-free web app to practice speaking with random prompts, built-in timers, live browser transcription, and STAR analysis against your responses. No sign-ups, no saving—just speak.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Audio Recording**: Browser Web Audio API (MediaRecorder) - for playback only
- **Transcription**: Browser Speech Recognition API when supported

## Project Structure

```
/Volumes/D/Projects/Uttrly/
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts     # API client with axios
│   │   ├── hooks/
│   │   │   ├── useTimer.ts   # Custom hook for timers
│   │   ├── pages/
│   │   │   └── SpeakingPractice.tsx # Main practice page (only page)
│   │   ├── styles/
│   │   │   └── SpeakingPractice.css
│   │   ├── App.tsx           # Renders SpeakingPractice directly
│   │   └── main.tsx
│   ├── .env.development      # Dev API URL
│   └── package.json
│
└── backend/                  # Express server
    ├── db/
    │   └── init.js          # Database initialization with prompts
    ├── routes/
    │   └── prompts.js       # Prompts endpoint (no auth required)
    ├── server.js            # Main Express server
    ├── .env                 # Environment variables
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 16+
- npm or yarn
- macOS/Linux/Windows

### Backend Setup

1. Navigate to backend directory:
```bash
cd /Volumes/D/Projects/Uttrly/backend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` and automatically reload on file changes.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd /Volumes/D/Projects/Uttrly/frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` and supports hot module replacement.

## Usage

### Get Started
1. Go to `http://localhost:5173`
2. No login needed—you're ready to practice immediately!
3. Select your duration mode (1min, 2min, 3min, or 5min)
4. Click "Get Random Prompt" to begin

### Speaking Practice Flow

1. **Select Duration Mode**: Choose between 1min, 2min, 3min, or 5min practice sessions
2. **Get Random Prompt**: Click to receive a random speaking prompt
3. **Thinking Phase**:
   - Press "Start Thinking" to begin thinking timer
   - Timer counts up showing your thinking time
   - Press "Pause" if needed
   - Click "Ready to Speak →" when ready
4. **Speaking Phase**:
   - App requests microphone access
   - Starts recording automatically
   - Starts live transcription automatically in supported browsers
   - Speaking timer counts up
   - Press "Stop Speaking" when done
5. **Review Session**:
   - See total thinking and speaking durations
   - Review the captured transcript
   - Play back your recording
   - Click "Start New Session" to practice again
   - Nothing is saved—it's just for your practice!

## API Endpoints

### Prompts
- `GET /api/prompts/random` - Get random prompt
- `GET /api/prompts` - Get all prompts

### Evaluation (STAR Format)
- `POST /api/evaluate` - Evaluate transcript using STAR format (requires local LLM)
  - Request: `{ "transcript": "string" }`
  - Response: `{ "scores": { "situation": 1-5, "task": 1-5, "action": 1-5, "result": 1-5 }, "feedback": "string" }`

## STAR Evaluation Setup

The app supports AI-powered STAR format evaluation of your responses. It runs locally with `llama-cli` when a model path is configured, and falls back to a simple offline heuristic when it is not.

### Prerequisites
- Homebrew (on macOS): `brew install llama.cpp`
- ~5-7GB free disk space for the Mistral-7B model
- ~8GB RAM recommended

### Installation & Setup

1. **Install llama.cpp via Homebrew** (macOS):
```bash
brew install llama.cpp
```

2. **Download Mistral-7B-Instruct model** (quantized version ~4.8GB):
```bash
cd ~/models  # or your preferred directory
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
```

3. **Point Uttrly at the model** by setting `LLAMA_MODEL_PATH` in `backend/.env`:
```bash
LLAMA_MODEL_PATH=/Users/you/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf
```

4. **Start Uttrly** (in separate terminals):
```bash
# In one terminal: backend
cd backend && npm run dev

# In another terminal: frontend
cd frontend && npm run dev
```

5. Open `http://localhost:5173` and practice! After each response, STAR scores will be generated.

### STAR Format Explanation

- **Situation**: How well did you set the context? (clarity of scene/setup)
- **Task**: How well did you define the challenge or goal?
- **Action**: How well did you describe your approach/steps?
- **Result**: How well did you explain the outcome/impact?

Each dimension is scored 1-5, with feedback explaining strengths and areas to improve.

### Troubleshooting

- **No model configured**: Set `LLAMA_MODEL_PATH` in `backend/.env` to enable real local LLM scoring
- **Slow evaluation**: Normal for first run; Q4_K_M quantization takes ~10-15s per eval on M-series Mac
- **Out of memory**: If you have <8GB RAM, try `Q3_K_S` quantization instead (smaller, faster)

## Database Schema

### prompts
- `id` - Primary key
- `text` - Prompt text
- `category` - Category (personal, hypothetical, instructions, storytelling, persuasion, learning, opinion)
- `created_at` - Timestamp

20 prompts pre-seeded on first run across all categories.

## Features Implemented

✅ Random prompt generation from 20 seeded prompts
✅ Dual timer system (thinking + speaking)
✅ Timer pause/resume functionality
✅ Audio recording with MediaRecorder API (WebM format)
✅ Audio playback with progress tracking
✅ Live browser transcription in supported browsers
✅ STAR analysis of your responses with 1-5 scoring for Situation, Task, Action, and Result
✅ Multiple duration modes (1min, 2min, 3min, 5min)
✅ Responsive design (mobile + desktop)
✅ Beautiful gradient UI with smooth animations
✅ No setup, no login—just practice

## Possible Future Enhancements

- Optional local session history (IndexedDB)
- Daily streak counter
- Custom prompt lists
- Speech-to-text transcript (Whisper API)
- AI feedback on speech quality
- Speech analytics
- Multi-language support
- Timer presets customization

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
LLAMA_MODEL_PATH=/Users/you/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf
```

### Frontend (.env.development)
```
VITE_API_URL=http://localhost:3001/api
```

## Troubleshooting

### Port Already in Use
If port 3001 or 5173 is already in use:
- Backend: Change PORT in `.env` and update frontend `.env.development`
- Frontend: Vite will automatically use next available port

### Microphone Access Denied
- Check browser permissions for localhost
- Some browsers require HTTPS in production
- On macOS, check System Preferences → Security & Privacy → Microphone

### Database Lock Error
- Make sure only one backend instance is running
- Database file is at `/backend/speaking_practice.db`

### CORS Errors
- Verify both servers are running
- Check that `VITE_API_URL` in frontend .env.development matches backend port
- Backend has CORS enabled by default

## Deployment

For production deployment:

1. **Frontend**: Deploy built files to Vercel, Netlify, or GitHub Pages
   ```bash
   cd frontend
   npm run build
   # Deploy the `dist` folder
   ```

2. **Backend**: Deploy to Railway, Render, Fly.io, or similar
   - Set `NODE_ENV=production` in `.env`
   - Set `PORT` to the service's port (usually auto-assigned)
   - Update frontend `VITE_API_URL` to point to production backend

3. **Use HTTPS** in production (automatic on most hosting platforms)

## License

MIT
