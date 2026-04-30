const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'speaking_practice.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt_id INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    think_duration_seconds INTEGER,
    speak_duration_seconds INTEGER,
    audio_file_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
  );
`;

// Execute schema
schema.split(';').forEach(sql => {
  if (sql.trim()) {
    db.exec(sql);
  }
});

// Seed prompts if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM prompts').get();
if (count.count === 0) {
  const prompts = [
    { text: "Describe your favorite childhood memory", category: "personal" },
    { text: "What would you do with a million dollars?", category: "hypothetical" },
    { text: "Explain how to make your favorite dish", category: "instructions" },
    { text: "Tell a funny story from your life", category: "storytelling" },
    { text: "What are your career aspirations?", category: "personal" },
    { text: "Describe an ideal vacation", category: "personal" },
    { text: "How do you handle stress?", category: "personal" },
    { text: "What's the best advice you've ever received?", category: "personal" },
    { text: "Describe your ideal day", category: "personal" },
    { text: "What's something you've learned recently?", category: "learning" },
    { text: "Persuade me to visit your favorite city", category: "persuasion" },
    { text: "What's your take on remote work?", category: "opinion" },
    { text: "Tell me about a challenge you overcame", category: "storytelling" },
    { text: "What hobby brings you joy?", category: "personal" },
    { text: "Describe a person who inspires you", category: "personal" },
    { text: "What's your philosophy on work-life balance?", category: "opinion" },
    { text: "Tell a story about meeting someone interesting", category: "storytelling" },
    { text: "What drives your daily motivation?", category: "personal" },
    { text: "Describe your ideal learning experience", category: "learning" },
    { text: "What's something you'd like to improve about yourself?", category: "personal" },
  ];

  const stmt = db.prepare('INSERT INTO prompts (text, category) VALUES (?, ?)');
  prompts.forEach(p => stmt.run(p.text, p.category));
}

module.exports = db;
