const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

  if ([...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

// GET /api/works — list all works (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM works ORDER BY created_at DESC'
    );
    return res.json({ success: true, works: rows });
  } catch (err) {
    console.error('Get works error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/works/:id — get single work (protected)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM works WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }
    return res.json({ success: true, work: rows[0] });
  } catch (err) {
    console.error('Get work error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/works — create a new work (protected)
router.post('/', authMiddleware, (req, res) => {
  uploadFields(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Work name is required' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = req.files && req.files['image']
        ? `${baseUrl}/uploads/${req.files['image'][0].filename}`
        : null;
      const videoUrl = req.files && req.files['video']
        ? `${baseUrl}/uploads/${req.files['video'][0].filename}`
        : null;

      const [result] = await db.query(
        'INSERT INTO works (name, description, image_url, video_url) VALUES (?, ?, ?, ?)',
        [name, description || null, imageUrl, videoUrl]
      );

      const [newWork] = await db.query('SELECT * FROM works WHERE id = ?', [result.insertId]);

      return res.status(201).json({ success: true, message: 'Work created', work: newWork[0] });
    } catch (dbErr) {
      console.error('Create work error:', dbErr);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// DELETE /api/works/:id — delete a work (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM works WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    // Remove associated files if they exist locally
    const work = rows[0];
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (work.image_url) {
      const imgFile = path.join(uploadsDir, path.basename(work.image_url));
      if (fs.existsSync(imgFile)) fs.unlinkSync(imgFile);
    }
    if (work.video_url) {
      const vidFile = path.join(uploadsDir, path.basename(work.video_url));
      if (fs.existsSync(vidFile)) fs.unlinkSync(vidFile);
    }

    await db.query('DELETE FROM works WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Work deleted' });
  } catch (err) {
    console.error('Delete work error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
