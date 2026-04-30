const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/init');
const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Create session with audio upload
router.post('/', upload.single('audio'), (req, res) => {
  try {
    const { promptId, promptText, thinkDuration, speakDuration } = req.body;
    const audioFileId = req.file ? req.file.filename : null;

    const stmt = db.prepare(`
      INSERT INTO sessions (user_id, prompt_id, prompt_text, think_duration_seconds, speak_duration_seconds, audio_file_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(1, promptId, promptText, thinkDuration, speakDuration, audioFileId);

    res.json({
      sessionId: result.lastInsertRowid,
      audioFileId,
      message: 'Session saved successfully',
    });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {}); // Clean up file on error
    }
    res.status(500).json({ error: err.message });
  }
});

// Get all sessions
router.get('/', (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT * FROM sessions
      ORDER BY created_at DESC
      LIMIT 100
    `).all();

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single session
router.get('/:sessionId', (req, res) => {
  try {
    const session = db.prepare(`
      SELECT * FROM sessions
      WHERE id = ?
    `).get(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete session
router.delete('/:sessionId', (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete audio file if exists
    if (session.audio_file_id) {
      const filePath = path.join(__dirname, '../uploads', session.audio_file_id);
      fs.unlink(filePath, () => {});
    }

    db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.sessionId);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
