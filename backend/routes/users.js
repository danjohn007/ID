const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/users — save chatbot user info (public endpoint for chatbot)
router.post('/', async (req, res) => {
  try {
    const { name, company, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const [result] = await db.query(
      'INSERT INTO users (name, company, email) VALUES (?, ?, ?)',
      [name, company || null, email]
    );

    return res.status(201).json({
      success: true,
      message: 'User registered',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users — list chatbot users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    return res.json({ success: true, users: rows });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/works — public endpoint for chatbot to retrieve portfolio
router.get('/works', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, description, image_url, video_url, created_at FROM works ORDER BY created_at DESC'
    );
    return res.json({ success: true, works: rows });
  } catch (err) {
    console.error('Get public works error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
