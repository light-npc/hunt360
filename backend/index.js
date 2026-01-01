const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const reportsRouter = require('./routes/reports');

dotenv.config();
const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/reports', reportsRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
console.log('Mounted /api/auth routes');

// Generic endpoints used by frontend (simple implementations)
app.get('/api/hrhunt', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hrhunt LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Response endpoint used by SavedProfessionals.jsx
app.get('/api/hrhunt/response', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hrhunt LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/corporate', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM corporate LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/campus', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM campus LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend running on ${port}`));
