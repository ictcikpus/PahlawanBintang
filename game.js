// Konfigurasi Firebase Firestore
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
  console.log("Firebase dalam mode Offline/Lokal");
}

// Global Game States & Animation Variables
let levelsData = [];
let stickersData = [];
let currentLevelIndex = 0;
let score = 0;
let lives = 3;
let isGameRunning = false;
let monsters = [];
let particles = [];
let floatingTexts = [];
let isFrozen = false;
let screenShake = 0;
let cannonAngle = 0;
let playerName = localStorage.getItem('pahlawan_nama') || 'Pahlawan';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let deferredPrompt;

window.addEventListener('load', async () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.getElementById('player-name-input').value = playerName;

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

  document.getElementById('btn-freeze').onclick = () => {
    if (isFrozen) return;
    isFrozen = true;
    spawnFloatingText(canvas.width / 2, canvas.height / 2, 'BEKU! ❄️', '#1e90ff');
    setTimeout(() => isFrozen = false, 3000);
  };

  document.getElementById('btn-bomb').onclick = () => {
    screenShake = 15;
    monsters.forEach(m => createBurstParticles(m.x, m.y, m.color));
    score += monsters.length * 10;
    spawnFloatingText(canvas.width / 2, canvas.height / 2, 'BOOM! 🌈', '#ff4757');
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
      x: Math.random() * (canvas.width - 80) + 40,
      y: -50,
      speed: (1.2 + Math.random() * 1.3) * levelConfig.speed,
      size: 32,
      scaleY: 1,
      color: ['#ff4757', '#2ed573', '#ffa502', '#1e90ff', '#a55eea'][Math.floor(Math.random() * 5)]
    });
  }
  setTimeout(spawnMonsterLoop, levelConfig.spawnRate);
}

function handleCanvasTouch(e) {
  if (!isGameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const touchX = e.clientX - rect.left;
  const touchY = e.clientY - rect.top;

  // Hitung sudut bidikan meriam ke posisi sentuhan
  const cannonX = canvas.width / 2;
  const cannonY = canvas.height - 30;
  cannonAngle = Math.atan2(touchY - cannonY, touchX - cannonX);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    const dist = Math.hypot(m.x - touchX, m.y - touchY);
    if (dist < m.size + 18) {
      createBurstParticles(m.x, m.y, m.color);
      spawnFloatingText(m.x, m.y, '+10', '#ffd700');
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

function spawnFloatingText(x, y, text, color) {
  const container = document.getElementById('popup-container');
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.innerText = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  container.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function createBurstParticles(x, y, color) {
  for (let i = 0; i < 14; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1.0,
      color: color
    });
  }
}

function gameLoop() {
  if (!isGameRunning) return;

  // Screen Shake Effect
  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    screenShake *= 0.9;
    if (screenShake < 0.5) screenShake = 0;
  }

  // Draw Background Gradient (Sky Game)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0c102b');
  bgGrad.addColorStop(1, '#1e2761');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render Istana Bawah
  ctx.fillStyle = '#485460';
  ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
  ctx.fillStyle = '#2ed573';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 5);

  // Render Meriam Merah Vektor
  const cannonX = canvas.width / 2;
  const cannonY = canvas.height - 30;
  ctx.save();
  ctx.translate(cannonX, cannonY);
  ctx.rotate(cannonAngle + Math.PI / 2);
  
  // Laras Meriam
  ctx.fillStyle = '#ff4757';
  ctx.fillRect(-10, -35, 20, 35);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(-12, -38, 24, 6);
  ctx.restore();

  // Dudukan Meriam
  ctx.beginPath();
  ctx.arc(cannonX, cannonY, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#2f3542';
  ctx.fill();

  // Render & Animasi Monster
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    if (!isFrozen) m.y += m.speed;

    // Animasi Squishy/Membal
    m.scaleY = 1 + Math.sin(Date.now() * 0.01 + i) * 0.1;

    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.scale(1, m.scaleY);

    // Badan Monster Glossy
    ctx.beginPath();
    ctx.arc(0, 0, m.size, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Mata Monster Lucu
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, -6, 7, 0, Math.PI * 2);
    ctx.arc(8, -6, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.arc(-8, -6, 3, 0, Math.PI * 2);
    ctx.arc(8, -6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Senyum Monster
    ctx.beginPath();
    ctx.arc(0, 4, 8, 0, Math.PI);
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Tabrakan dengan Istana
    if (m.y > canvas.height - 50) {
      monsters.splice(i, 1);
      lives--;
      screenShake = 10;
      updateLivesDisplay();
      if (lives <= 0) { gameOver(); ctx.restore(); return; }
    }
  }

  // Render Partikel Burst
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.04;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

function levelComplete() {
  isGameRunning = false;
  unlockSticker(currentLevelIndex + 1);
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  document.getElementById('result-badge-icon').innerText = "🎉";
  document.getElementById('result-title').innerText = "LEVEL SELESAI!";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelsData[currentLevelIndex].level;
  document.getElementById('modal-result').classList.remove('hidden');
}

function gameOver() {
  isGameRunning = false;
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  document.getElementById('result-badge-icon').innerText = "💔";
  document.getElementById('result-title').innerText = "GAME OVER";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelsData[currentLevelIndex].level;
  document.getElementById('modal-result').classList.remove('hidden');
}

function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
  let localScores = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  localScores.push({ name: name, score: scoreVal, level: levelVal });
  localScores.sort((a,b) => b.score - a.score);
  localStorage.setItem('pahlawan_scores', JSON.stringify(localScores.slice(0, 10)));

  if (db) {
    db.collection('leaderboard').add({
      name: name,
      score: scoreVal,
      level: levelVal,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.log("Gagal ke Firebase:", err));
  }
}

function openLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Memuat Papan Peringkat...</td></tr>';

  if (db) {
    db.collection('leaderboard').orderBy('score', 'desc').limit(10).get().then(snapshot => {
      if (snapshot.empty) { showLocalScores(tbody); } 
      else {
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
    }).catch(() => showLocalScores(tbody));
  } else {
    showLocalScores(tbody);
  }
}

function showLocalScores(tbody) {
  let localScores = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  if (localScores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Belum ada skor tercatat.</td></tr>';
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
