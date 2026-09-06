const express = require('express');
const router = express.Router();
const { queryAll, queryOne, run } = require('../db/database');

// GET all transactions with filters
router.get('/', (req, res) => {
  const { month, type, category_id, limit = 50 } = req.query;
  let query = `
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (month) {
    query += ` AND strftime('%Y-%m', t.date) = ?`;
    params.push(month);
  }
  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }
  if (category_id) {
    query += ` AND t.category_id = ?`;
    params.push(category_id);
  }

  query += ` ORDER BY t.date DESC, t.created_at DESC LIMIT ?`;
  params.push(parseInt(limit));

  const transactions = queryAll(query, params);
  res.json({ success: true, data: transactions });
});

// GET summary stats
router.get('/summary', (req, res) => {
  const { month } = req.query;
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  const income = queryOne(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE type = 'income' AND strftime('%Y-%m', date) = ?
  `, [currentMonth]);

  const expense = queryOne(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
  `, [currentMonth]);

  const byCategory = queryAll(`
    SELECT c.name, c.icon, c.color, t.type, SUM(t.amount) as total, COUNT(*) as count
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE strftime('%Y-%m', t.date) = ?
    GROUP BY t.category_id, t.type
    ORDER BY total DESC
  `, [currentMonth]);

  const dailyTrend = queryAll(`
    SELECT strftime('%d', date) as day, type, SUM(amount) as total
    FROM transactions
    WHERE strftime('%Y-%m', date) = ?
    GROUP BY day, type
    ORDER BY day
  `, [currentMonth]);

  const incomeTotal = income ? income.total : 0;
  const expenseTotal = expense ? expense.total : 0;
  const savingsRate = incomeTotal > 0
    ? (((incomeTotal - expenseTotal) / incomeTotal) * 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      month: currentMonth,
      income: incomeTotal,
      expense: expenseTotal,
      balance: incomeTotal - expenseTotal,
      savingsRate: parseFloat(savingsRate),
      byCategory,
      dailyTrend
    }
  });
});

// GET monthly report
router.get('/report', (req, res) => {
  const { year } = req.query;
  const currentYear = year || new Date().getFullYear();

  const monthly = queryAll(`
    SELECT 
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE strftime('%Y', date) = ?
    GROUP BY month
    ORDER BY month
  `, [String(currentYear)]);

  res.json({ success: true, data: monthly });
});

// POST create transaction
router.post('/', (req, res) => {
  const { type, amount, category_id, description, date } = req.body;

  if (!type || !amount || !date) {
    return res.status(400).json({ success: false, message: 'Type, amount, dan date wajib diisi!' });
  }

  const result = run(
    `INSERT INTO transactions (type, amount, category_id, description, date) VALUES (?, ?, ?, ?, ?)`,
    [type, parseFloat(amount), category_id || null, description || null, date]
  );

  const newTx = queryOne(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `, [result.lastInsertRowid]);

  res.json({ success: true, data: newTx, message: 'Transaksi berhasil ditambah! 🎉' });
});

// PUT update transaction
router.put('/:id', (req, res) => {
  const { type, amount, category_id, description, date } = req.body;
  const { id } = req.params;

  const existing = queryOne('SELECT id FROM transactions WHERE id = ?', [parseInt(id)]);
  if (!existing) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

  run(
    `UPDATE transactions SET type=?, amount=?, category_id=?, description=?, date=? WHERE id=?`,
    [type, parseFloat(amount), category_id || null, description || null, date, parseInt(id)]
  );

  res.json({ success: true, message: 'Transaksi diupdate! ✅' });
});

// DELETE transaction
router.delete('/:id', (req, res) => {
  run('DELETE FROM transactions WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true, message: 'Transaksi dihapus! 🗑️' });
});

module.exports = router;
