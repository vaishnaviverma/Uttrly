# Speaking Practice Tool - Uttrly

A web app to practice daily speaking with random prompts, thinking timers, speaking timers, audio recording, and session tracking.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT
- **Audio Recording**: Browser Web Audio API (MediaRecorder)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

## Project Structure

```
/Volumes/D/Projects/Uttrly/
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts     # API client with axios
│   │   ├── hooks/
│   │   │   ├── useTimer.ts   # Custom hook for timers
│   │   │   ├── useAudioRecorder.ts  # Custom hook for recording
│   │   │   └── useLocalStorage.ts   # Local storage hook
│   │   ├── pages/
│   │   │   ├── Login.tsx     # Login page
│   │   │   ├── Register.tsx  # Registration page
│   │   │   └── SpeakingPractice.tsx # Main practice page
│   │   ├── styles/
│   │   │   └── SpeakingPractice.css
│   │   ├── App.tsx           # Main app with routing
│   │   └── main.tsx
│   ├── .env.development      # Dev API URL
│   ├── .env.production       # Production API URL
│   └── package.json
│
└── backend/                  # Express server
    ├── src/
    ├── db/
    │   └── init.js          # Database initialization and schema
    ├── middleware/
    │   └── auth.js          # JWT authentication middleware
    ├── routes/
    │   ├── auth.js          # Auth endpoints (register, login)
    │   ├── prompts.js       # Prompts endpoints
    │   └── sessions.js      # Sessions endpoints (CRUD + audio upload)
    ├── uploads/             # Directory for audio files
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

### Registration & Login
1. Go to `http://localhost:5173`
2. Click "Register here" to create a new account
3. Enter username and password (password must be 6+ characters)
4. After registration, you're automatically logged in

### Speaking Practice Flow

1. **Select Duration Mode**: Choose between 1min, 2min, 3min, or 5min practice sessions
2. **Get Random Prompt**: Click to receive a random speaking prompt
3. **Thinking Phase**:
   - Press "Start Thinking" to begin thinking timer
   - Timer counts up showing your thinking time
   - Press "Pause" if needed
   - Click "Ready to Speak →" when ready (both timers reset)
4. **Speaking Phase**:
   - App requests microphone access
   - Starts recording automatically
   - Speaking timer counts up
   - Press "Stop Speaking" when done
5. **Review Session**:
   - See total thinking and speaking durations
   - Play back your recording
   - Press "Save Session" to upload recording and metadata to backend
   - Recordings are stored on the server in `/uploads` folder

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Prompts
- `GET /api/prompts/random` - Get random prompt (requires auth)
- `GET /api/prompts` - Get all prompts (requires auth)

### Sessions
- `POST /api/sessions` - Create session with audio upload (multipart/form-data)
- `GET /api/sessions` - Get user's sessions (requires auth)
- `GET /api/sessions/:id` - Get specific session (requires auth)
- `DELETE /api/sessions/:id` - Delete session (requires auth)

## Database Schema

### users
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Hashed password
- `created_at` - Timestamp

### prompts
- `id` - Primary key
- `text` - Prompt text
- `category` - Category (personal, hypothetical, instructions, storytelling, persuasion, learning, opinion)
- `created_at` - Timestamp

### sessions
- `id` - Primary key
- `user_id` - Foreign key to users
- `prompt_id` - Foreign key to prompts
- `prompt_text` - Text of the prompt (denormalized for easy display)
- `think_duration_seconds` - Time spent thinking
- `speak_duration_seconds` - Time spent speaking
- `audio_file_id` - Filename of recorded audio (WebM format)
- `created_at` - Timestamp when session was saved

## Features Implemented

✅ User authentication with JWT
✅ Random prompt generation from 20+ seeded prompts
✅ Dual timer system (thinking + speaking)
✅ Timer pause/resume functionality
✅ Audio recording with MediaRecorder API (WebM format)
✅ Audio playback with progress tracking
✅ Session saving with metadata
✅ Responsive design (mobile + desktop)
✅ Beautiful gradient UI with smooth animations
✅ Error handling and user feedback

## Future Enhancements

- Session history dashboard with stats
- Daily streak counter
- Ability to edit/create custom prompts
- Speech-to-text transcript
- AI feedback on speech quality
- Playback statistics (average duration, improvement tracking)
- Export sessions as CSV
- Cloud storage for audio files (AWS S3)
- Multi-language support
- User profile and settings page
- Public recording sharing (optional)

## Environment Variables

### Backend (.env)
```
PORT=3001
JWT_SECRET=dev-secret-key-change-in-production
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
- Check that `VITE_API_URL` in frontend .env matches backend port
- Backend has CORS enabled by default

## Running in Production

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Serve built files from backend or separate hosting (Vercel, Netlify)

3. Deploy backend to Railway, Render, or Heroku

4. Update `.env.production` with production API URL

5. Use a production database (Pgptgres, MySQL, or cloud SQLite)

6. Set proper JWT_SECRET and use HTTPS

## License

MIT
