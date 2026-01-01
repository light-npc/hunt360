const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /auth/login
// Expects { identifier, password }
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier can be username or email
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1', [identifier, identifier]);

    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = rows[0];

    // For demo only: plain-text password comparison (do NOT use in production)
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Return a simple token (demo) and user object
    const token = Buffer.from(`${user.id}:${user.username}`).toString('base64');

    res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /auth/logout (no-op for demo)
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// quick test route
router.get('/test', (req, res) => res.json({ ok: true }));

module.exports = router;
