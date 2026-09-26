// Web Audio API Synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playFreeze() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playBomb() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playWin() {
    if (this.isMuted) return;
    this.init();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.09 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.09);
      osc.stop(this.ctx.currentTime + idx * 0.09 + 0.22);
    });
  }
}

const sounds = new SoundEngine();

// Helper Getar (Vibration API)
function triggerVibrate(pattern) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignored if device blocks auto vibrate
    }
  }
}

// Firebase Config
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
  console.log("Firebase Mode Offline");
}

// Global States
let levelsData = [];
let stickersData = [];
let currentLevelIndex = 0;
let score = 0;
let levelKills = 0;
let lives = 3;
let isGameRunning = false;
let monsters = [];
let particles = [];
let isFrozen = false;
let screenShake = 0;
let cannonAngle = 0;
let comboCount = 0;
let lastHitTime = 0;

let currentActor = localStorage.getItem('pahlawan_actor') || 'cannon';
let playerName = localStorage.getItem('pahlawan_nama') || 'Pahlawan';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let deferredPrompt;

const actorMap = {
  cannon: { name: 'Meriam Bintang', icon: '🚀' },
  robot: { name: 'Robot Cyber', icon: '🤖' },
  unicorn: { name: 'Unicorn Ajaib', icon: '🦄' },
  cat: { name: 'Kucing Ninja', icon: '🐱' },
  dragon: { name: 'Naga Api Imut', icon: '🐲' }
};

window.addEventListener('load', async () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.getElementById('player-name-input').value = playerName;
  updateActorSelectionUI();

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
    console.error('Gagal mengambil file JSON:', err);
  }
}

function setupEventListeners() {
  // Tombol Main -> Buka Prompt Fullscreen
  document.getElementById('btn-prepare-play').onclick = () => {
    document.getElementById('screen-main-menu').classList.add('hidden');
    document.getElementById('modal-fullscreen-prompt').classList.remove('hidden');
  };

  // Trigger Fullscreen & Landscape API
  document.getElementById('btn-start-fullscreen').onclick = () => {
    requestFullscreenAndLandscape();
    document.getElementById('modal-fullscreen-prompt').classList.add('hidden');
    startGame();
  };

  document.getElementById('btn-skip-fullscreen').onclick = () => {
    document.getElementById('modal-fullscreen-prompt').classList.add('hidden');
    startGame();
  };

  document.getElementById('btn-select-actor').onclick = () => document.getElementById('modal-actors').classList.remove('hidden');
  document.getElementById('btn-close-actors').onclick = () => document.getElementById('modal-actors').classList.add('hidden');
  
  document.getElementById('btn-leaderboard').onclick = openLeaderboard;
  document.getElementById('btn-close-leaderboard').onclick = () => document.getElementById('modal-leaderboard').classList.add('hidden');
  
  document.getElementById('btn-stickers').onclick = openStickerAlbum;
  document.getElementById('btn-close-stickers').onclick = () => document.getElementById('modal-stickers').classList.add('hidden');

  document.querySelectorAll('.actor-card').forEach(card => {
    card.onclick = () => {
      document.querySelectorAll('.actor-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentActor = card.dataset.actor;
      localStorage.setItem('pahlawan_actor', currentActor);
      updateActorSelectionUI();
    };
  });

  document.getElementById('btn-audio').onclick = () => {
    sounds.isMuted = !sounds.isMuted;
    document.getElementById('audio-icon').innerText = sounds.isMuted ? '🔇' : '🔊';
  };

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

  canvas.addEventListener('pointerdown', handleCanvasTouch);

  document.getElementById('btn-freeze').onclick = () => {
    if (isFrozen) return;
    isFrozen = true;
    sounds.playFreeze();
    triggerVibrate([50, 50, 50]);
    spawnFloatingText(canvas.width / 2, canvas.height / 2, 'BEKU! ❄️', '#1e90ff');
    setTimeout(() => isFrozen = false, 3000);
  };

  document.getElementById('btn-bomb').onclick = () => {
    screenShake = 18;
    sounds.playBomb();
    triggerVibrate([100, 50, 100]);
    monsters.forEach(m => createBurstParticles3D(m.x, m.y, m.color));
    
    let pointsGained = monsters.length * 100;
    score += pointsGained;
    levelKills += monsters.length;
    
    spawnFloatingText(canvas.width / 2, canvas.height / 2, `BOOM! +${pointsGained}`, '#ff4757');
    monsters = [];
    
    updateHUDValues();
    checkLevelObjectives();
  };
}

function requestFullscreenAndLandscape() {
  const doc = document.documentElement;
  if (doc.requestFullscreen) {
    doc.requestFullscreen().catch(() => {});
  } else if (doc.webkitRequestFullscreen) {
    doc.webkitRequestFullscreen();
  }

  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}

function updateActorSelectionUI() {
  document.getElementById('selected-actor-name').innerText = actorMap[currentActor].name;
  document.getElementById('actor-avatar').innerText = actorMap[currentActor].icon;
}

function startGame() {
  sounds.init();
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
  levelKills = 0;
  comboCount = 0;
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  
  updateHUDValues();
  updateLivesDisplay();

  monsters = [];
  particles = [];
  isGameRunning = true;

  spawnMonsterLoop();
  gameLoop();
}

function updateHUDValues() {
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  document.getElementById('hud-level').innerText = levelConfig.level;
  document.getElementById('hud-score').innerText = score;
  document.getElementById('hud-mission').innerText = `${levelKills}/${levelConfig.targetKills}`;
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
    const algo = levelConfig.algorithm;
    let countToSpawn = (algo === 'swarm') ? 2 : 1;

    for (let c = 0; c < countToSpawn; c++) {
      const isBoss = (algo === 'boss_hybrid' && Math.random() < 0.25);
      monsters.push({
        x: Math.random() * (canvas.width - 100) + 50,
        startX: Math.random() * (canvas.width - 100) + 50,
        y: -60,
        speed: (1.2 + Math.random() * 1.3) * levelConfig.speed,
        size: isBoss ? 55 : 34,
        hp: isBoss ? 6 : 1,
        maxHp: isBoss ? 6 : 1,
        color: isBoss ? '#8854d0' : ['#ff4757', '#2ed573', '#ffa502', '#1e90ff'][Math.floor(Math.random() * 4)],
        algorithm: algo,
        timeAlive: 0,
        opacity: 1
      });
    }
  }

  setTimeout(spawnMonsterLoop, levelConfig.spawnRate);
}

function handleCanvasTouch(e) {
  if (!isGameRunning) return;
  sounds.init();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.clientX - rect.left;
  const touchY = e.clientY - rect.top;

  const cannonX = canvas.width / 2;
  const cannonY = canvas.height - 35;
  cannonAngle = Math.atan2(touchY - cannonY, touchX - cannonX);

  const now = Date.now();
  if (now - lastHitTime < 1200) {
    comboCount++;
  } else {
    comboCount = 1;
  }
  lastHitTime = now;

  const comboMultiplier = comboCount > 5 ? 5 : comboCount > 2 ? 3 : comboCount > 1 ? 2 : 1;

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    const dist = Math.hypot(m.x - touchX, m.y - touchY);
    if (dist < m.size + 20) {
      m.hp--;
      sounds.playPop();
      triggerVibrate(25);

      if (m.hp <= 0) {
        createBurstParticles3D(m.x, m.y, m.color);
        
        let earnedPoints = 50 * comboMultiplier;
        score += earnedPoints;
        levelKills++;

        spawnFloatingText(m.x, m.y, `+${earnedPoints}${comboMultiplier > 1 ? ' ('+comboMultiplier+'x)' : ''}`, '#ffd700');

        if (m.algorithm === 'splitter' && m.size > 22) {
          monsters.push(
            { x: m.x - 25, startX: m.x - 25, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', algorithm: 'linear', timeAlive: 0, opacity: 1 },
            { x: m.x + 25, startX: m.x + 25, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', algorithm: 'linear', timeAlive: 0, opacity: 1 }
          );
        }

        monsters.splice(i, 1);
        updateHUDValues();
        checkLevelObjectives();

      } else {
        m.size *= 0.95;
        spawnFloatingText(m.x, m.y, 'HIT!', '#ff4757');
        triggerVibrate([15, 15]);
      }
      break;
    }
  }
}

function checkLevelObjectives() {
  const levelConfig = levelsData[currentLevelIndex];
  if (levelKills >= levelConfig.targetKills && score >= levelConfig.targetScore) {
    levelComplete();
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

function createBurstParticles3D(x, y, color) {
  for (let i = 0; i < 16; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      size: Math.random() * 6 + 3,
      life: 1.0,
      color: color
    });
  }
}

function gameLoop() {
  if (!isGameRunning) return;

  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    screenShake *= 0.88;
    if (screenShake < 0.5) screenShake = 0;
  }

  // Render Background Grid 3D Perspektif
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0a0d24');
  bgGrad.addColorStop(1, '#1a224d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Benteng Lantai 3D
  ctx.fillStyle = '#2f3640';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = '#44bd32';
  ctx.fillRect(0, canvas.height - 45, canvas.width, 5);

  // Render Aktor Utama (3D Specular Model)
  const cannonX = canvas.width / 2;
  const cannonY = canvas.height - 35;
  ctx.save();
  ctx.translate(cannonX, cannonY);
  ctx.rotate(cannonAngle + Math.PI / 2);

  ctx.font = '40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(actorMap[currentActor].icon, 0, -12);
  ctx.restore();

  // Render & Update Musuh (Visual 3D Shading)
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    m.timeAlive += 0.05;

    if (!isFrozen) {
      switch (m.algorithm) {
        case 'zigzag':
          m.y += m.speed;
          m.x = m.startX + Math.sin(m.timeAlive * 3) * 65;
          break;
        case 'gravity':
          m.speed += 0.05;
          m.y += m.speed;
          break;
        case 'stealth':
          m.y += m.speed;
          m.opacity = 0.3 + Math.abs(Math.sin(m.timeAlive * 2)) * 0.7;
          break;
        case 'boss_hybrid':
          m.y += m.speed * 0.45;
          m.x = m.startX + Math.sin(m.timeAlive * 2) * 85;
          break;
        case 'linear':
        default:
          m.y += m.speed;
          break;
      }
    }

    ctx.save();
    ctx.globalAlpha = m.opacity || 1.0;

    // Bayangan 3D di Atas Lantai
    ctx.beginPath();
    ctx.ellipse(m.x, canvas.height - 38, m.size * 0.7, m.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // Bola 3D Monster dengan Radial Gradient
    ctx.translate(m.x, m.y);
    const radGrad = ctx.createRadialGradient(
      -m.size * 0.3, -m.size * 0.3, m.size * 0.1,
      0, 0, m.size
    );
    radGrad.addColorStop(0, '#ffffff');
    radGrad.addColorStop(0.3, m.color);
    radGrad.addColorStop(1, '#000000');

    ctx.beginPath();
    ctx.arc(0, 0, m.size, 0, Math.PI * 2);
    ctx.fillStyle = radGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.stroke();

    // Mata 3D
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, -6, 6, 0, Math.PI * 2);
    ctx.arc(8, -6, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-8, -6, 2.5, 0, Math.PI * 2);
    ctx.arc(8, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Bar Darah 3D
    if (m.maxHp > 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-22, -m.size - 14, 44, 7);
      ctx.fillStyle = '#44bd32';
      ctx.fillRect(-22, -m.size - 14, (m.hp / m.maxHp) * 44, 7);
    }

    ctx.restore();

    // Tabrakan Benteng
    if (m.y > canvas.height - 55) {
      monsters.splice(i, 1);
      lives--;
      screenShake = 14;
      triggerVibrate([100, 50, 100]);
      updateLivesDisplay();
      if (lives <= 0) { gameOver(); ctx.restore(); return; }
    }
  }

  // Partikel 3D
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.04;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

function levelComplete() {
  isGameRunning = false;
  sounds.playWin();
  triggerVibrate([50, 50, 50, 50, 100]);
  unlockSticker(currentLevelIndex + 1);
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  const levelConfig = levelsData[currentLevelIndex];
  document.getElementById('result-badge-icon').innerText = "🎉";
  document.getElementById('result-title').innerText = "MISI SELESAI!";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelConfig.level;
  document.getElementById('result-kills').innerText = `${levelKills} Monster`;
  document.getElementById('modal-result').classList.remove('hidden');
}

function gameOver() {
  isGameRunning = false;
  triggerVibrate([200, 100, 200]);
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  const levelConfig = levelsData[currentLevelIndex];
  document.getElementById('result-badge-icon').innerText = "💔";
  document.getElementById('result-title').innerText = "GAME OVER";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelConfig.level;
  document.getElementById('result-kills').innerText = `${levelKills} Monster`;
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
