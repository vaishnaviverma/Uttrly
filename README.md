# Uttrly - Daily Speaking Practice

A minimal, distraction-free web app to practice speaking with random prompts and built-in timers. No sign-ups, no saving—just speak.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Audio Recording**: Browser Web Audio API (MediaRecorder) - for playback only

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
   - Speaking timer counts up
   - Press "Stop Speaking" when done
5. **Review Session**:
   - See total thinking and speaking durations
   - Play back your recording
   - Click "Start New Session" to practice again
   - Nothing is saved—it's just for your practice!

## API Endpoints

### Prompts
- `GET /api/prompts/random` - Get random prompt
- `GET /api/prompts` - Get all prompts

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
