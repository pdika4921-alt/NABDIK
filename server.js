const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function start() {
  await initDB();

  app.use('/api/transactions', require('./routes/transactions'));
  app.use('/api/categories', require('./routes/categories'));
  app.use('/api/budgets', require('./routes/budgets'));

  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`\n🚀 Dompetku running at http://localhost:${PORT}`);
    console.log(`📱 Buka di HP: scan QR atau akses IP lokal kamu\n`);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
