const express = require('express');
const db = require('../db/init');
const router = express.Router();

// Get random prompt
router.get('/random', (req, res) => {
  try {
    const prompt = db.prepare('SELECT * FROM prompts ORDER BY RANDOM() LIMIT 1').get();
    res.json(prompt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all prompts
router.get('/', (req, res) => {
  try {
    const prompts = db.prepare('SELECT * FROM prompts').all();
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
