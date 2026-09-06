const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'dompetku.db');
let db = null;

function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      return buf;
    }
  } catch (e) {}
  return null;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

async function initDB() {
  const SQL = await initSqlJs();
  const existing = loadDB();
  db = existing ? new SQL.Database(existing) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT DEFAULT '💰',
      color TEXT DEFAULT '#6366f1',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category_id INTEGER,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  const result = db.exec('SELECT COUNT(*) as c FROM categories');
  const count = result.length > 0 ? result[0].values[0][0] : 0;
  if (count === 0) {
    const cats = [
      ['Gaji', 'income', '💼', '#10b981'],
      ['Freelance', 'income', '💻', '#06b6d4'],
      ['Bonus', 'income', '🎁', '#8b5cf6'],
      ['Investasi', 'income', '📈', '#f59e0b'],
      ['Lainnya', 'income', '✨', '#6366f1'],
      ['Makan & Minum', 'expense', '🍜', '#ef4444'],
      ['Transport', 'expense', '🚗', '#f97316'],
      ['Belanja', 'expense', '🛍️', '#ec4899'],
      ['Hiburan', 'expense', '🎮', '#a855f7'],
      ['Tagihan', 'expense', '📱', '#64748b'],
      ['Kesehatan', 'expense', '💊', '#14b8a6'],
      ['Pendidikan', 'expense', '📚', '#3b82f6'],
      ['Lainnya', 'expense', '💸', '#6b7280'],
    ];
    const stmt = db.prepare('INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)');
    cats.forEach(c => { stmt.run(c); });
    stmt.free();
    saveDB();
  }

  return db;
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
  const lastId = queryOne('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: lastId ? lastId.id : null, changes: db.getRowsModified() };
}

module.exports = { initDB, queryAll, queryOne, run, saveDB };
