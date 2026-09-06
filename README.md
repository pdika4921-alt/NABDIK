# 💸 Dompetku — Aplikasi Keuangan Gen Z

Aplikasi manajemen keuangan berbasis web yang mobile-friendly, dibangun dengan Node.js + Express + SQLite.

## 🚀 Setup & Jalankan

### 1. Install Node.js
Download dari https://nodejs.org (versi 18+ recommended)

### 2. Install dependencies
```bash
cd dompetku
npm install
```

### 3. Jalankan server
```bash
npm start
# atau
node server.js
```

### 4. Buka di browser
```
http://localhost:3000
```

### 5. Buka di HP (same WiFi)
- Cari IP lokal komputer kamu: `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
- Buka di HP: `http://192.168.x.x:3000`

---

## 📁 Struktur Project

```
dompetku/
├── server.js          ← Entry point Express server
├── db/
│   └── database.js    ← Setup SQLite + seed data
├── routes/
│   ├── transactions.js ← API transaksi (CRUD + summary + report)
│   ├── categories.js   ← API kategori
│   └── budgets.js      ← API budget + progress
└── public/
    └── index.html      ← Frontend (mobile-first, Gen Z style)
```

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| Frontend | Vanilla HTML/CSS/JS |
| Font | Plus Jakarta Sans |

## 📱 Fitur

- ✅ **Catat Pemasukan & Pengeluaran** — quick add dengan kategori
- ✅ **Dashboard Saldo** — balance, income, expense bulan ini
- ✅ **Savings Rate** — persentase tabungan otomatis
- ✅ **Grafik** — trend bulanan, donut chart kategori, bar chart top spending
- ✅ **Budget Manager** — set limit per kategori dengan progress bar
- ✅ **Smart Insight** — analisis 50/30/20, dana darurat, tips keuangan
- ✅ **Filter Bulan** — lihat history bulan manapun
- ✅ **Mobile-First** — UI optimal di HP

## 🔌 API Endpoints

```
GET    /api/transactions          — List transaksi
GET    /api/transactions/summary  — Summary bulan ini
GET    /api/transactions/report   — Report tahunan
POST   /api/transactions          — Tambah transaksi
DELETE /api/transactions/:id      — Hapus transaksi

GET    /api/categories            — List kategori
POST   /api/categories            — Tambah kategori

GET    /api/budgets               — List budget + progress
POST   /api/budgets               — Set/update budget
DELETE /api/budgets/:id           — Hapus budget
```

## 💡 Tips Upgrade (Next Steps)

- [ ] Auth login (JWT) biar data aman
- [ ] Export ke Excel/PDF
- [ ] Notifikasi reminder (Web Push)
- [ ] Multi-user / keluarga
- [ ] Sync ke Google Sheets
- [ ] Deploy ke VPS / Railway.app
