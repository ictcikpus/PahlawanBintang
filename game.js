// Global Config & State
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

// PWA Deferred Prompt
let deferredPrompt;

window.addEventListener('load', async () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Set nama di input
  document.getElementById('player-name-input').value = playerName;

  // Load Data JSON dari Server
  await loadGameData();
  
  // Register Service Worker PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW Fail:', err));
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

// Fetch JSON Data terpisah
async function loadGameData() {
  try {
    const [resLevels, resStickers] = await Promise.all([
      fetch('/data/levels.json'),
      fetch('/data/stickers.json')
    ]);
    levelsData = await resLevels.json();
    stickersData = await resStickers.json();
  } catch (err) {
    console.error('Gagal memuat file JSON data:', err);
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

  // PWA Install Button
  document.getElementById('btn-pwa-install').onclick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        document.getElementById('btn-pwa-install').classList.add('hidden');
      });
    }
  };

  // Touch/Click Canvas Handler
  canvas.addEventListener('pointerdown', handleCanvasTouch);

  // Powerups
  document.getElementById('btn-freeze').onclick = useFreezePowerup;
  document.getElementById('btn-bomb').onclick = useBombPowerup;
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
      // Pop Monster
      createBurstParticles(m.x, m.y, m.color);
      monsters.splice(i, 1);
      score += 10;
      document.getElementById('hud-score').innerText = score;

      // Cek Target Level Complete
      if (score >= levelsData[currentLevelIndex].targetScore) {
        levelComplete();
      }
      break;
    }
  }
}

function useFreezePowerup() {
  if (isFrozen) return;
  isFrozen = true;
  setTimeout(() => { isFrozen = false; }, 3000);
}

function useBombPowerup() {
  monsters.forEach(m => createBurstParticles(m.x, m.y, m.color));
  score += monsters.length * 10;
  monsters = [];
  document.getElementById('hud-score').innerText = score;
  if (score >= levelsData[currentLevelIndex].targetScore) {
    levelComplete();
  }
}

function createBurstParticles(x, y, color) {
  for (let i = 0; i < 12; i++) {
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

  // Render & Move Monsters
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    if (!isFrozen) m.y += m.speed;

    // Draw Monster Vector
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(m.x - 8, m.y - 5, 5, 0, Math.PI * 2);
    ctx.arc(m.x + 8, m.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(m.x - 8, m.y - 5, 2, 0, Math.PI * 2);
    ctx.arc(m.x + 8, m.y - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bottom Wall Collision (Istana)
    if (m.y > canvas.height - 40) {
      monsters.splice(i, 1);
      lives--;
      updateLivesDisplay();
      if (lives <= 0) {
        gameOver();
        return;
      }
    }
  }

  // Render Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  requestAnimationFrame(gameLoop);
}

async function levelComplete() {
  isGameRunning = false;
  unlockSticker(currentLevelIndex + 1);

  // Submit Skor ke Server Database
  const rank = await submitScoreToServer(score, currentLevelIndex + 1);

  document.getElementById('result-title').innerText = "LEVEL SELESAI! 🎉";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelsData[currentLevelIndex].level;
  document.getElementById('result-rank').innerText = "#" + rank;

  document.getElementById('modal-result').classList.remove('hidden');
}

async function gameOver() {
  isGameRunning = false;
  const rank = await submitScoreToServer(score, currentLevelIndex + 1);

  document.getElementById('result-title').innerText = "GAME OVER 💔";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelsData[currentLevelIndex].level;
  document.getElementById('result-rank').innerText = "#" + rank;

  document.getElementById('modal-result').classList.remove('hidden');
}

// Realtime Sync dengan Backend API
async function submitScoreToServer(currentScore, level) {
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName, score: currentScore, levelReached: level })
    });
    const data = await res.json();
    const myRank = data.topScores.findIndex(s => s.name.toLowerCase() === playerName.toLowerCase()) + 1;
    return myRank > 0 ? myRank : '10+';
  } catch (err) {
    console.error('Gagal sinkron skor ke server:', err);
    return '-';
  }
}

async function openLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '<tr><td colspan="4">Memuat data real-time...</td></tr>';

  try {
    const res = await fetch('/api/scores');
    const topScores = await res.json();

    tbody.innerHTML = topScores.map((s, index) => `
      <tr>
        <td>${index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}</td>
        <td><strong>${s.name}</strong></td>
        <td>Lvl ${s.levelReached}</td>
        <td><strong>${s.score}</strong></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4">Gagal memuat papan peringkat.</td></tr>';
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
