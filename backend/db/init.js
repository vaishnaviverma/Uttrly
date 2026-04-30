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

// Seed prompts idempotently so existing databases pick up new library items.
const prompts = [
  { text: 'Describe your favorite childhood memory', category: 'personal' },
  { text: 'What would you do with a million dollars?', category: 'hypothetical' },
  { text: 'Explain how to make your favorite dish', category: 'instructions' },
  { text: 'Tell a funny story from your life', category: 'storytelling' },
  { text: 'What are your career aspirations?', category: 'personal' },
  { text: 'Describe an ideal vacation', category: 'personal' },
  { text: 'How do you handle stress?', category: 'personal' },
  { text: "What's the best advice you've ever received?", category: 'personal' },
  { text: 'Describe your ideal day', category: 'personal' },
  { text: "What's something you've learned recently?", category: 'learning' },
  { text: 'Persuade me to visit your favorite city', category: 'persuasion' },
  { text: "What's your take on remote work?", category: 'opinion' },
  { text: 'Tell me about a challenge you overcame', category: 'storytelling' },
  { text: 'What hobby brings you joy?', category: 'personal' },
  { text: 'Describe a person who inspires you', category: 'personal' },
  { text: "What's your philosophy on work-life balance?", category: 'opinion' },
  { text: 'Tell a story about meeting someone interesting', category: 'storytelling' },
  { text: 'What drives your daily motivation?', category: 'personal' },
  { text: 'Describe your ideal learning experience', category: 'learning' },
  { text: "What's something you'd like to improve about yourself?", category: 'personal' },
  { text: 'Explain a time you had to adapt quickly to change', category: 'storytelling' },
  { text: 'Pitch a product that would make your morning easier', category: 'persuasion' },
  { text: 'Describe a teammate you learned a lot from', category: 'personal' },
  { text: 'What makes a presentation memorable?', category: 'opinion' },
  { text: 'Tell the story of a goal you did not reach and what you learned', category: 'storytelling' },
  { text: 'Describe a skill you want to master this year', category: 'learning' },
  { text: 'How would you improve your city for young professionals?', category: 'opinion' },
  { text: 'Explain how you stay organized during busy weeks', category: 'personal' },
  { text: 'Describe a time you solved a problem with limited resources', category: 'storytelling' },
  { text: 'What would you change about the first day at a new job?', category: 'opinion' },
  { text: 'Teach me something useful in under one minute', category: 'instructions' },
  { text: 'Describe a book, podcast, or article that changed your thinking', category: 'learning' },
  { text: 'Convince a skeptical friend to try your favorite hobby', category: 'persuasion' },
  { text: 'What does great customer service look like?', category: 'opinion' },
  { text: 'Tell a story about a time you had to lead without a title', category: 'storytelling' },
  { text: 'Describe your approach to giving constructive feedback', category: 'personal' },
  { text: 'How do you make difficult decisions when the answer is not obvious?', category: 'opinion' },
  { text: 'Explain a process you improved at work or school', category: 'storytelling' },
  { text: 'What trend do you think will matter most in the next five years?', category: 'opinion' },
  { text: 'Describe an experience that made you more confident', category: 'personal' },
  { text: 'Share the most interesting place you have ever visited and why', category: 'storytelling' },
  { text: 'What is one habit you would recommend to almost anyone?', category: 'learning' },
  { text: 'Imagine you could redesign your daily commute. What would it look like?', category: 'hypothetical' },
  { text: 'Describe a time you had to explain a complex idea simply', category: 'storytelling' },
  { text: 'What makes a team trust each other?', category: 'opinion' },
  { text: 'Tell a story about a time you said yes before you felt ready', category: 'storytelling' },
  { text: 'How would you introduce yourself to a room full of strangers?', category: 'personal' },
  { text: 'If you could learn one new skill instantly, what would it be?', category: 'hypothetical' },
  { text: 'Describe a decision that changed your perspective', category: 'storytelling' },
  { text: 'What is the best way to stay curious as an adult?', category: 'opinion' },
  { text: 'Explain a time you turned feedback into improvement', category: 'storytelling' },
  { text: 'What would you do if you had to start a project with zero budget?', category: 'hypothetical' },
  { text: 'Describe the most useful thing you have learned from a mistake', category: 'learning' },
  { text: 'Pitch your favorite local spot to someone visiting for the first time', category: 'persuasion' },
  { text: 'What kind of leader do people remember?', category: 'opinion' },
  { text: 'Explain how you prepare before an important conversation', category: 'personal' },
  { text: 'Tell a story about working with someone very different from you', category: 'storytelling' },
  { text: 'Describe a goal that is ambitious but realistic for you', category: 'personal' },
  { text: 'What do you think people misunderstand about success?', category: 'opinion' },
  { text: 'Teach a child how to do something you know well', category: 'instructions' },
];

const stmt = db.prepare('INSERT OR IGNORE INTO prompts (text, category) VALUES (?, ?)');
const seedPrompts = db.transaction((items) => {
  items.forEach((prompt) => stmt.run(prompt.text, prompt.category));
});

seedPrompts(prompts);

module.exports = db;
