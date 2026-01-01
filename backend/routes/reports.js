const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { name, value } = req.body;
    const [result] = await db.query('INSERT INTO reports (name, value) VALUES (?, ?)', [name, value]);
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
