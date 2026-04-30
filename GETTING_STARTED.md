# Getting Started - Uttrly Speaking Practice Tool

This guide explains how to start and stop the backend and frontend servers for development.

## Prerequisites

- Node.js 16+ installed
- Two terminal windows (or tabs)
- Project located at `/Volumes/D/Projects/Uttrly`

## Quick Start

### Start Both Servers (Fastest Way)

**Terminal 1: Backend (Port 3001)**
```bash
bash -c "cd /Volumes/D/Projects/Uttrly/backend && npm run dev"
```

**Terminal 2: Frontend (Port 5173)**
```bash
bash -c "cd /Volumes/D/Projects/Uttrly/frontend && npm run dev"
```

Then open your browser to: **http://localhost:5173**

---

## Detailed Instructions

### Starting the Backend Server

1. **Open a new terminal window**

2. **Navigate to backend directory:**
   ```bash
   cd /Volumes/D/Projects/Uttrly/backend
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **You should see output like:**
   ```
   > backend@1.0.0 dev
   > node --watch server.js
   
   ◇ injected env (3) from .env
   Server running on http://localhost:3001
   Completed running 'server.js'. Waiting for file changes before restarting...
   ```

✅ **Backend is now running on `http://localhost:3001`**

### Stopping the Backend Server

1. **Press `Ctrl + C`** in the terminal where the backend is running
2. You should see: `^C`
3. The process will terminate and return to the command prompt

---

### Starting the Frontend Server

1. **Open a new terminal window** (keep the backend running in the first one)

2. **Navigate to frontend directory:**
   ```bash
   cd /Volumes/D/Projects/Uttrly/frontend
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **You should see output like:**
   ```
   > frontend@0.0.0 dev
   > vite
   
   VITE v8.0.10  ready in 604 ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   press h + enter to show help
   ```

✅ **Frontend is now running on `http://localhost:5173`**

### Stopping the Frontend Server

1. **Press `Ctrl + C`** in the terminal where the frontend is running
2. You should see: `^C`
3. The process will terminate and return to the command prompt

---

## Full Workflow

### Development Session

```
Terminal 1: Backend
$ cd /Volumes/D/Projects/Uttrly/backend
$ npm run dev
Server running on http://localhost:3001

Terminal 2: Frontend  
$ cd /Volumes/D/Projects/Uttrly/frontend
$ npm run dev
VITE v8.0.10  ready in 604 ms
➜  Local:   http://localhost:5173/

Browser:
Open http://localhost:5173
```

### Ending Development Session

```
Terminal 1 (Backend):
Press Ctrl + C

Terminal 2 (Frontend):
Press Ctrl + C

Done!
```

---

## Important Notes

### Port Conflicts

- **Backend runs on port 3001** (NOT 5000 - that port is reserved by macOS AirTunes)
- **Frontend runs on port 5173** (Vite's default)

If ports are already in use:
- **Backend**: Update `PORT` in `/backend/.env` and update `VITE_API_URL` in `/frontend/.env.development`
- **Frontend**: Vite will automatically try the next available port

### Hot Reload

Both servers support automatic reload:
- **Backend**: Changes to files trigger automatic restart (node --watch)
- **Frontend**: Changes are reflected instantly in the browser (Vite HMR)

### Environment Files

Make sure these files exist:

**Backend:**
- `/backend/.env` - Contains `PORT=3001`, `JWT_SECRET=...`, `NODE_ENV=development`

**Frontend:**
- `/frontend/.env.development` - Contains `VITE_API_URL=http://localhost:3001/api`

### Database

- Automatically initializes on first backend start
- Located at `/backend/speaking_practice.db`
- Pre-seeded with 20 prompts

---

## Troubleshooting

### Backend Won't Start

**Error:** `EACCES: permission denied`
```bash
# Make sure you're in the backend directory
cd /Volumes/D/Projects/Uttrly/backend

# Try again
npm run dev
```

**Error:** `Port 3001 already in use`
```bash
# Change the port in .env
# Edit /backend/.env and change PORT to 3002 (or any available port)

# Then update frontend
# Edit /frontend/.env.development and change VITE_API_URL to http://localhost:3002/api
```

### Frontend Won't Start

**Error:** `Module not found`
```bash
# Install dependencies
cd /Volumes/D/Projects/Uttrly/frontend
npm install
```

**Error:** `Port 5173 already in use`
- Vite will automatically use 5174, 5175, etc.
- Check the terminal output for the correct URL

### Can't Connect Backend and Frontend

**Check 1:** Both servers are running
```bash
# In new terminal, test backend health
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

**Check 2:** Frontend env file is correct
```bash
# Check /frontend/.env.development
cat /Volumes/D/Projects/Uttrly/frontend/.env.development
# Should show: VITE_API_URL=http://localhost:3001/api
```

**Check 3:** Reload browser
- Press `Cmd + Shift + R` (hard refresh with cache clear)

---

## Keyboard Shortcuts

### In Terminal

| Key | Action |
|-----|--------|
| `Ctrl + C` | Stop the running server |
| `Ctrl + L` | Clear terminal screen |
| `↑` | Previous command |
| `↓` | Next command |

### In Vite (Frontend Dev Server)

Press `h + Enter` in the terminal to see Vite help:
- `r` - Restart server
- `u` - Show file URL
- `c` - Clear console
- `q` - Quit

---

## Quick Reference

### One-Liner Commands

**Start both (in separate terminals):**
```bash
# Terminal 1
bash -c "cd /Volumes/D/Projects/Uttrly/backend && npm run dev"

# Terminal 2
bash -c "cd /Volumes/D/Projects/Uttrly/frontend && npm run dev"
```

**Test backend health:**
```bash
curl http://localhost:3001/health
```

**View backend logs:**
```bash
# Check most recent database operations
ls -la /Volumes/D/Projects/Uttrly/backend/speaking_practice.db
```

**Clear browser cache:**
```bash
# macOS - Clear Chrome cache
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cache
```

---

## Next Steps

1. ✅ Start both servers following the instructions above
2. 🌐 Open http://localhost:5173 in your browser
3. 📝 Create an account
4. 🎤 Start practicing with a random prompt!

For more details, see [README.md](./README.md)
