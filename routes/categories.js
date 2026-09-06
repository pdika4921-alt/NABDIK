const express = require('express');
const router = express.Router();
const { queryAll, queryOne, run } = require('../db/database');

// GET all categories
router.get('/', (req, res) => {
  const { type } = req.query;
  let query = 'SELECT * FROM categories WHERE 1=1';
  const params = [];
  if (type) { query += ' AND type = ?'; params.push(type); }
  query += ' ORDER BY type, name';
  res.json({ success: true, data: queryAll(query, params) });
});

// POST create category
router.post('/', (req, res) => {
  const { name, type, icon, color } = req.body;
  if (!name || !type) return res.status(400).json({ success: false, message: 'Name dan type wajib!' });
  const result = run('INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)', [name, type, icon || '💰', color || '#6366f1']);
  res.json({ success: true, data: queryOne('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]) });
});

// DELETE category
router.delete('/:id', (req, res) => {
  run('DELETE FROM categories WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true, message: 'Kategori dihapus!' });
});

module.exports = router;
