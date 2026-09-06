const express = require('express');
const router = express.Router();
const { queryAll, queryOne, run } = require('../db/database');

// GET budgets with spending progress
router.get('/', (req, res) => {
  const { month } = req.query;
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  const budgets = queryAll(`
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
      COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.category_id = b.category_id AND strftime('%Y-%m', t.date) = b.month AND t.type = 'expense'
      ), 0) as spent
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.month = ?
    ORDER BY b.amount DESC
  `, [currentMonth]);

  const withPercent = budgets.map(b => ({
    ...b,
    percent: b.amount > 0 ? Math.min(((b.spent / b.amount) * 100).toFixed(1), 200) : 0,
    remaining: b.amount - b.spent,
    status: b.spent >= b.amount ? 'over' : b.spent >= b.amount * 0.8 ? 'warning' : 'safe'
  }));

  res.json({ success: true, data: withPercent });
});

// POST create/update budget
router.post('/', (req, res) => {
  const { category_id, amount, month } = req.body;
  if (!category_id || !amount || !month) return res.status(400).json({ success: false, message: 'Semua field wajib!' });

  const existing = queryOne('SELECT id FROM budgets WHERE category_id = ? AND month = ?', [parseInt(category_id), month]);
  if (existing) {
    run('UPDATE budgets SET amount = ? WHERE id = ?', [parseFloat(amount), existing.id]);
    return res.json({ success: true, message: 'Budget diupdate! ✅' });
  }
  run('INSERT INTO budgets (category_id, amount, month) VALUES (?, ?, ?)', [parseInt(category_id), parseFloat(amount), month]);
  res.json({ success: true, message: 'Budget dibuat! 🎯' });
});

// DELETE budget
router.delete('/:id', (req, res) => {
  run('DELETE FROM budgets WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true, message: 'Budget dihapus!' });
});

module.exports = router;
