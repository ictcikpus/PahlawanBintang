// Konfigurasi Firebase (Ganti dengan kunci Firebase milik Anda jika ingin membuat database sendiri)
// Jika tidak diganti, sistem secara otomatis beralih ke Mode Lokal offline.
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForGitHubPagesTesting123",
  authDomain: "pahlawan-bintang.firebaseapp.com",
  projectId: "pahlawan-bintang",
  storageBucket: "pahlawan-bintang.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
} catch(e) {
  console.log("Firebase berjalan dalam mode Offline/Lokal");
}

// Global Game States
let levelsData = [];
let stickersData = [];
let currentLevelIndex = 0;
let score = 0;
let lives = 3;
let isGameRunning = false;
let monsters = [];
let particles = [];
let isFrozen = false;
let playerName = localStorage.getItem('pahlawan_nama') || 'Pahlawan';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let deferredPrompt;

window.addEventListener('load', async () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.getElementById('player-name-input').value = playerName;

  // Fetch file JSON terpisah di GitHub Pages
  await loadGameData();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Fail:', err));
  }

  setupEventListeners();
  updateStickerAlbumUI();
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('btn-pwa-install').classList.remove('hidden');
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Mengambil JSON Statis dari Repository GitHub Pages
async function loadGameData() {
  try {
    const [resLevels, resStickers] = await Promise.all([
      fetch('./levels.json'),
      fetch('./stickers.json')
    ]);
    levelsData = await resLevels.json();
    stickersData = await resStickers.json();
  } catch (err) {
    console.error('Gagal mengambil data levels/stickers.json:', err);
  }
}

function setupEventListeners() {
  document.getElementById('btn-start').onclick = startGame;
  document.getElementById('btn-leaderboard').onclick = openLeaderboard;
  document.getElementById('btn-close-leaderboard').onclick = () => document.getElementById('modal-leaderboard').classList.add('hidden');
  document.getElementById('btn-stickers').onclick = openStickerAlbum;
  document.getElementById('btn-close-stickers').onclick = () => document.getElementById('modal-stickers').classList.add('hidden');

  document.getElementById('btn-next-level').onclick = () => {
    document.getElementById('modal-result').classList.add('hidden');
    currentLevelIndex++;
    if (currentLevelIndex >= levelsData.length) currentLevelIndex = 0;
    startCurrentLevel();
  };

  document.getElementById('btn-restart').onclick = () => {
    document.getElementById('modal-result').classList.add('hidden');
    startCurrentLevel();
  };

  document.getElementById('btn-menu').onclick = () => {
    document.getElementById('modal-result').classList.add('hidden');
    document.getElementById('hud-overlay').classList.add('hidden');
    document.getElementById('screen-main-menu').classList.remove('hidden');
    isGameRunning = false;
  };

  document.getElementById('btn-pwa-install').onclick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        document.getElementById('btn-pwa-install').classList.add('hidden');
      });
    }
  };

  canvas.addEventListener('pointerdown', handleCanvasTouch);
  document.getElementById('btn-freeze').onclick = () => { isFrozen = true; setTimeout(() => isFrozen = false, 3000); };
  document.getElementById('btn-bomb').onclick = () => {
    monsters.forEach(m => createBurstParticles(m.x, m.y, m.color));
    score += monsters.length * 10;
    monsters = [];
    document.getElementById('hud-score').innerText = score;
    if (score >= levelsData[currentLevelIndex].targetScore) levelComplete();
  };
}

function startGame() {
  const inputName = document.getElementById('player-name-input').value.trim();
  playerName = inputName || 'Pahlawan';
  localStorage.setItem('pahlawan_nama', playerName);
  document.getElementById('player-name-display').innerText = playerName;

  currentLevelIndex = 0;
  score = 0;
  lives = 3;

  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  startCurrentLevel();
}

function startCurrentLevel() {
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  document.getElementById('hud-level').innerText = levelConfig.level;
  document.getElementById('hud-score').innerText = score;
  updateLivesDisplay();

  monsters = [];
  particles = [];
  isGameRunning = true;

  spawnMonsterLoop();
  gameLoop();
}

function updateLivesDisplay() {
  let hearts = '';
  for(let i=0; i<lives; i++) hearts += '❤️';
  document.getElementById('hud-lives').innerText = hearts;
}

function spawnMonsterLoop() {
  if (!isGameRunning) return;
  const levelConfig = levelsData[currentLevelIndex];
  if (!isFrozen) {
    monsters.push({
      x: Math.random() * (canvas.width - 60) + 30,
      y: -50,
      speed: (1.5 + Math.random() * 1.5) * levelConfig.speed,
      size: 30,
      color: ['#ff4757', '#2ed573', '#ffa502', '#1e90ff'][Math.floor(Math.random() * 4)]
    });
  }
  setTimeout(spawnMonsterLoop, levelConfig.spawnRate);
}

function handleCanvasTouch(e) {
  if (!isGameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const touchX = e.clientX - rect.left;
  const touchY = e.clientY - rect.top;

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    const dist = Math.hypot(m.x - touchX, m.y - touchY);
    if (dist < m.size + 15) {
      createBurstParticles(m.x, m.y, m.color);
      monsters.splice(i, 1);
      score += 10;
      document.getElementById('hud-score').innerText = score;

      if (score >= levelsData[currentLevelIndex].targetScore) {
        levelComplete();
      }
      break;
    }
  }
}

function createBurstParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1.0,
      color: color
    });
  }
}

function gameLoop() {
  if (!isGameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    if (!isFrozen) m.y += m.speed;

    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    if (m.y > canvas.height - 40) {
      monsters.splice(i, 1);
      lives--;
      updateLivesDisplay();
      if (lives <= 0) { gameOver(); return; }
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.04;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  requestAnimationFrame(gameLoop);
}

function levelComplete() {
  isGameRunning = false;
  unlockSticker(currentLevelIndex + 1);
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  document.getElementById('result-title').innerText = "LEVEL SELESAI! 🎉";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelsData[currentLevelIndex].level;
  document.getElementById('modal-result').classList.remove('hidden');
}

function gameOver() {
  isGameRunning = false;
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  document.getElementById('result-title').innerText = "GAME OVER 💔";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelsData[currentLevelIndex].level;
  document.getElementById('modal-result').classList.remove('hidden');
}

// Simpan Skor ke Firebase Firestore Realtime (Aman untuk GitHub Pages)
function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
  // Simpan Lokal sebagai cadangan
  let localScores = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  localScores.push({ name: name, score: scoreVal, level: levelVal, date: new Date().toLocaleDateString() });
  localScores.sort((a,b) => b.score - a.score);
  localStorage.setItem('pahlawan_scores', JSON.stringify(localScores.slice(0, 10)));

  // Kirim ke Firebase Firestore
  if (db) {
    db.collection('leaderboard').add({
      name: name,
      score: scoreVal,
      level: levelVal,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.log("Gagal mengirim skor ke Firebase:", err));
  }
}

// Membaca Papan Peringkat Top 10 Realtime
function openLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '<tr><td colspan="4">Memuat data Papan Peringkat...</td></tr>';

  if (db) {
    db.collection('leaderboard').orderBy('score', 'desc').limit(10).get().then(snapshot => {
      if (snapshot.empty) {
        showLocalScores(tbody);
      } else {
        tbody.innerHTML = snapshot.docs.map((doc, index) => {
          const s = doc.data();
          return `
            <tr>
              <td>${index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}</td>
              <td><strong>${s.name}</strong></td>
              <td>Lvl ${s.level || 1}</td>
              <td><strong>${s.score}</strong></td>
            </tr>
          `;
        }).join('');
      }
    }).catch(err => {
      showLocalScores(tbody);
    });
  } else {
    showLocalScores(tbody);
  }
}

function showLocalScores(tbody) {
  let localScores = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  if (localScores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">Belum ada skor tercatat.</td></tr>';
  } else {
    tbody.innerHTML = localScores.map((s, index) => `
      <tr>
        <td>${index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}</td>
        <td><strong>${s.name}</strong></td>
        <td>Lvl ${s.level}</td>
        <td><strong>${s.score}</strong></td>
      </tr>
    `).join('');
  }
}

function unlockSticker(id) {
  let unlocked = JSON.parse(localStorage.getItem('pahlawan_stickers') || '[]');
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem('pahlawan_stickers', JSON.stringify(unlocked));
    updateStickerAlbumUI();
  }
}

function updateStickerAlbumUI() {
  const unlocked = JSON.parse(localStorage.getItem('pahlawan_stickers') || '[]');
  document.getElementById('unlocked-count').innerText = unlocked.length;
}

function openStickerAlbum() {
  const unlocked = JSON.parse(localStorage.getItem('pahlawan_stickers') || '[]');
  const grid = document.getElementById('sticker-grid');

  grid.innerHTML = stickersData.map(sticker => {
    const isUnlocked = unlocked.includes(sticker.id);
    return `
      <div class="sticker-card ${isUnlocked ? '' : 'locked'}">
        <div class="sticker-icon">${isUnlocked ? sticker.icon : '🔒'}</div>
        <div class="sticker-title">${isUnlocked ? sticker.title : 'Terkunci'}</div>
      </div>
    `;
  }).join('');

  document.getElementById('modal-stickers').classList.remove('hidden');
}
