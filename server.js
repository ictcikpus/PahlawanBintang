const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

// Helper membaca file JSON skor
function readScores() {
  try {
    if (!fs.existsSync(SCORES_FILE)) {
      const defaultData = [];
      fs.writeFileSync(SCORES_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(SCORES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Gagal membaca scores.json:', err);
    return [];
  }
}

// Helper menulis ke file JSON skor
function writeScores(scores) {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
  } catch (err) {
    console.error('Gagal menulis scores.json:', err);
  }
}

// API: Ambil 10 Skor Terakhir & Teratas
app.get('/api/scores', (req, res) => {
  const scores = readScores();
  // Urutkan berdasarkan skor tertinggi
  scores.sort((a, b) => b.score - a.score);
  res.json(scores.slice(0, 10));
});

// API: Simpan Skor Baru Pemain
app.post('/api/scores', (req, res) => {
  const { name, score, levelReached } = req.body;
  
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Format data skor tidak valid' });
  }

  let scores = readScores();
  
  // Cek apakah pemain sudah ada di database
  const existingIndex = scores.findIndex(s => s.name.toLowerCase() === name.toLowerCase());

  if (existingIndex !== -1) {
    // Update jika skor baru lebih tinggi
    if (score > scores[existingIndex].score) {
      scores[existingIndex].score = score;
      scores[existingIndex].levelReached = Math.max(scores[existingIndex].levelReached || 1, levelReached);
      scores[existingIndex].date = new Date().toISOString();
    }
  } else {
    // Tambahkan pemain baru
    scores.push({
      id: 'P-' + Date.now(),
      name: name.trim(),
      score: score,
      levelReached: levelReached || 1,
      date: new Date().toISOString()
    });
  }

  // Urutkan dan ambil Top 100 tertinggi
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 100);

  writeScores(scores);
  res.json({ success: true, topScores: scores.slice(0, 10) });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Server Game Pahlawan Bintang Aktif di Port ${PORT}`);
  console.log(`🌐 Akses Game: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
