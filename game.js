// =============================================================
// 1. KONFIGURASI FIREBASE REALTIME DATABASE
// =============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAJmz9ElKNk5_VaH-R8vIEHSt2VL6wAdms",
  authDomain: "pahlawan-bintang.firebaseapp.com",
  databaseURL: "https://pahlawan-bintang-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pahlawan-bintang",
  storageBucket: "pahlawan-bintang.firebasestorage.app",
  messagingSenderId: "419778211274",
  appId: "1:419778211274:web:552e733aec09076e57f333",
  measurementId: "G-464JNFFTTZ"
};

let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  console.log("🔥 Firebase Realtime Database Terhubung Berhasil!");
} catch(e) {
  console.log("⚠️ Firebase Mode Offline / Config Belum Diisi");
}

// =============================================================
// 2. SYNTHESIZER AUDIO (TANPA FILE SOUND EKSTERNAL)
// =============================================================
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

  playLaser() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(850, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playPowerup() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playBossShoot() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
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

function triggerVibrate(pattern) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

// =============================================================
// 3. GAME STATE & VARIABEL GLOBAL
// =============================================================
let levelsData = [];
let stickersData = [];
let currentLevelIndex = 0;
let score = 0;
let levelKills = 0;
let lives = 3;
let isGameRunning = false;
let isGamePaused = false;

let playerX = 0;
let playerSpeed = 9;
let bullets = [];
let bossBullets = [];
let powerups = [];
let lastShotTime = 0;

let isSuperShot = false;
let superShotTimer = 0;
let isShieldActive = false;
let shieldTimer = 0;

let freezeCharges = 2;
let bombCharges = 2;

let monsters = [];
let particles = [];
let isFrozen = false;
let screenShake = 0;

let isMovingLeft = false;
let isMovingRight = false;

let currentActor = localStorage.getItem('pahlawan_actor') || 'robot';
let playerName = localStorage.getItem('pahlawan_nama') || 'Pahlawan';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let deferredPrompt;

const actorMap = {
  robot: { name: 'Robot Cyber', color: '#1e90ff' },
  cannon: { name: 'Meriam Bintang', color: '#ff4757' },
  dragon: { name: 'Cyber Dragon', color: '#2ed573' },
  cat: { name: 'Ninja Cat', color: '#ffa502' },
  unicorn: { name: 'Unicorn Star', color: '#a55eea' }
};

window.addEventListener('load', async () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.getElementById('player-name-input').value = playerName;
  updateActorSelectionUI();

  await loadGameData();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=7.0').catch(err => console.log('SW Fail:', err));
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
  if (!isGameRunning) playerX = canvas.width / 2;
}

async function loadGameData() {
  try {
    const [resLevels, resStickers] = await Promise.all([
      fetch('./levels.json?v=5.0'),
      fetch('./stickers.json?v=5.0')
    ]);
    levelsData = await resLevels.json();
    stickersData = await resStickers.json();
  } catch (err) {
    console.error('Gagal mengambil file JSON:', err);
  }
}

function setupEventListeners() {
  document.getElementById('btn-prepare-play').onclick = () => {
    document.getElementById('screen-main-menu').classList.add('hidden');
    document.getElementById('modal-fullscreen-prompt').classList.remove('hidden');
  };

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
  document.getElementById('btn-close-leaderboard').onclick = () => {
    document.getElementById('modal-leaderboard').classList.add('hidden');
  };
  
  document.getElementById('btn-stickers').onclick = openStickerAlbum;
  document.getElementById('btn-close-stickers').onclick = () => document.getElementById('modal-stickers').classList.add('hidden');

  // Tombol Menu / Pause di HUD Game
  document.getElementById('btn-pause').onclick = pauseGame;

  // Tombol Lanjutkan Game dari Modal Pause
  document.getElementById('btn-resume-game').onclick = resumeGame;

  // Tombol Ganti Hero dari Modal Pause
  document.getElementById('btn-pause-change-hero').onclick = () => {
    document.getElementById('modal-actors').classList.remove('hidden');
  };

  // Tombol Lihat Papan Peringkat dari Modal Pause
  document.getElementById('btn-pause-leaderboard').onclick = () => {
    openLeaderboard();
  };

  // Tombol Keluar ke Menu Utama dari Modal Pause
  document.getElementById('btn-pause-main-menu').onclick = () => {
    document.getElementById('modal-pause').classList.add('hidden');
    document.getElementById('hud-overlay').classList.add('hidden');
    document.getElementById('screen-main-menu').classList.remove('hidden');
    isGameRunning = false;
    isGamePaused = false;
  };

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
  };

  const btnLeft = document.getElementById('btn-move-left');
  const btnRight = document.getElementById('btn-move-right');

  btnLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); isMovingLeft = true; });
  btnLeft.addEventListener('pointerup', () => isMovingLeft = false);
  btnLeft.addEventListener('pointerleave', () => isMovingLeft = false);

  btnRight.addEventListener('pointerdown', (e) => { e.preventDefault(); isMovingRight = true; });
  btnRight.addEventListener('pointerup', () => isMovingRight = false);
  btnRight.addEventListener('pointerleave', () => isMovingRight = false);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') isMovingLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') isMovingRight = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') isMovingLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') isMovingRight = false;
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isGameRunning || isGamePaused) return;
    if (e.buttons > 0 || e.pointerType === 'touch') {
      const rect = canvas.getBoundingClientRect();
      playerX = e.clientX - rect.left;
    }
  });

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
    isGamePaused = false;
  };

  document.getElementById('btn-freeze').onclick = () => {
    if (freezeCharges <= 0 || isFrozen || isGamePaused) return;
    freezeCharges--;
    isFrozen = true;
    sounds.playFreeze();
    triggerVibrate([50, 50, 50]);
    updateSkillButtonsUI();

    spawnFloatingText(canvas.width / 2, canvas.height / 2, 'BEKU! ❄️', '#1e90ff');
    setTimeout(() => isFrozen = false, 3500);
  };

  document.getElementById('btn-bomb').onclick = () => {
    if (bombCharges <= 0 || isGamePaused) return;
    bombCharges--;
    screenShake = 18;
    sounds.playBomb();
    triggerVibrate([100, 50, 100]);
    updateSkillButtonsUI();

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

function pauseGame() {
  if (!isGameRunning) return;
  isGamePaused = true;
  document.getElementById('modal-pause').classList.remove('hidden');
}

function resumeGame() {
  isGamePaused = false;
  document.getElementById('modal-pause').classList.add('hidden');
  requestAnimationFrame(gameLoop);
}

function requestFullscreenAndLandscape() {
  const doc = document.documentElement;
  if (doc.requestFullscreen) { doc.requestFullscreen().catch(() => {}); }
  else if (doc.webkitRequestFullscreen) { doc.webkitRequestFullscreen(); }

  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}

function updateActorSelectionUI() {
  const name = actorMap[currentActor].name;
  document.getElementById('selected-actor-name').innerText = name;
  const pauseHero = document.getElementById('pause-hero-name');
  if (pauseHero) pauseHero.innerText = name;
}

function updateSkillButtonsUI() {
  const btnFreeze = document.getElementById('btn-freeze');
  const btnBomb = document.getElementById('btn-bomb');
  
  document.getElementById('freeze-count').innerText = freezeCharges;
  document.getElementById('bomb-count').innerText = bombCharges;

  if (freezeCharges <= 0) btnFreeze.classList.add('disabled');
  else btnFreeze.classList.remove('disabled');

  if (bombCharges <= 0) btnBomb.classList.add('disabled');
  else btnBomb.classList.remove('disabled');
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
  playerX = canvas.width / 2;
  bullets = [];
  bossBullets = [];
  powerups = [];

  isSuperShot = false;
  superShotTimer = 0;
  isShieldActive = false;
  shieldTimer = 0;

  freezeCharges = 2;
  bombCharges = 2;
  updateSkillButtonsUI();

  updateHUDValues();
  updateLivesDisplay();

  monsters = [];
  particles = [];
  isGameRunning = true;
  isGamePaused = false;

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
  const container = document.getElementById('hud-lives');
  let html = '';
  for(let i=0; i<lives; i++) {
    html += `<svg class="heart-icon" viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/></svg>`;
  }
  container.innerHTML = html;
}

function spawnMonsterLoop() {
  if (!isGameRunning) return;
  
  if (!isGamePaused && !isFrozen) {
    const levelConfig = levelsData[currentLevelIndex];
    if (levelConfig) {
      const algo = levelConfig.algorithm;
      const typeList = levelConfig.types || ['jelly'];

      if (algo === 'boss_10' || algo === 'boss_20' || algo === 'boss_30') {
        if (monsters.length === 0 && levelKills < levelConfig.targetKills) {
          let hpVal = algo === 'boss_10' ? 25 : (algo === 'boss_20' ? 50 : 100);
          let colorVal = algo === 'boss_10' ? '#e67e22' : (algo === 'boss_20' ? '#9b59b6' : '#e74c3c');
          
          monsters.push({
            x: canvas.width / 2,
            startX: canvas.width / 2,
            y: -80,
            speed: 1.2,
            size: 70,
            hp: hpVal,
            maxHp: hpVal,
            color: colorVal,
            type: typeList[0],
            algorithm: algo,
            shootTimer: 0,
            timeAlive: 0,
            opacity: 1
          });
        }
      } else {
        let countToSpawn = (algo === 'swarm') ? 2 : 1;
        for (let c = 0; c < countToSpawn; c++) {
          const chosenType = typeList[Math.floor(Math.random() * typeList.length)];
          monsters.push({
            x: Math.random() * (canvas.width - 120) + 60,
            startX: Math.random() * (canvas.width - 120) + 60,
            y: -60,
            speed: (1.2 + Math.random() * 1.2) * levelConfig.speed,
            size: (chosenType === 'donut' ? 36 : 30),
            hp: (chosenType === 'donut' ? 2 : 1),
            maxHp: (chosenType === 'donut' ? 2 : 1),
            color: ['#ff4757', '#2ed573', '#ffa502', '#1e90ff'][Math.floor(Math.random() * 4)],
            type: chosenType,
            algorithm: algo,
            shootTimer: 0,
            timeAlive: 0,
            opacity: 1
          });
        }
      }
    }
  }

  setTimeout(spawnMonsterLoop, levelsData[currentLevelIndex]?.spawnRate || 1500);
}

function trySpawnPowerup(x, y) {
  if (Math.random() < 0.30) {
    const types = ['supershot', 'shield', 'bomb', 'freeze', 'heart'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    powerups.push({
      x: x,
      y: y,
      type: chosenType,
      speed: 2.2,
      size: 16
    });
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
  for (let i = 0; i < 18; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14,
      size: Math.random() * 7 + 3,
      life: 1.0,
      color: color
    });
  }
}

function checkLevelObjectives() {
  const levelConfig = levelsData[currentLevelIndex];
  if (levelKills >= levelConfig.targetKills) {
    if (score >= levelConfig.targetScore) {
      levelComplete();
    } else {
      levelFailed("SKOR BELUM MENCAPAI TARGET!");
    }
  }
}

function drawHeroVector(ctx, x, y, type) {
  ctx.save();
  ctx.translate(x, y);

  if (type === 'robot') {
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(-18, -10, 36, 28);
    ctx.fillStyle = '#70a1ff';
    ctx.fillRect(-12, -26, 24, 16);
    ctx.fillStyle = '#00d2d3';
    ctx.fillRect(-8, -22, 16, 6);
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-24, -8, 6, 16);
    ctx.fillRect(18, -8, 6, 16);

    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(-10, 18); ctx.lineTo(0, 30 + Math.random()*6); ctx.lineTo(10, 18);
    ctx.fill();
  } 
  else if (type === 'cannon') {
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(24, 15); ctx.lineTo(-24, 15);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-16, -18, 5, 20); ctx.fillRect(11, -18, 5, 20);

    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI*2); ctx.fill();
  }
  else if (type === 'dragon') {
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(16, 10); ctx.lineTo(28, -5); ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18); ctx.lineTo(-28, -5); ctx.lineTo(-16, 10);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#ff4757';
    ctx.fillRect(-7, -12, 4, 4); ctx.fillRect(3, -12, 4, 4);
  }
  else if (type === 'cat') {
    ctx.fillStyle = '#ffa502';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-8, -24); ctx.lineTo(-2, -12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(8, -24); ctx.lineTo(2, -12); ctx.fill();

    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-12, -6, 24, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -4, 4, 4); ctx.fillRect(4, -4, 4, 4);
  }
  else {
    ctx.fillStyle = '#a55eea';
    ctx.beginPath(); ctx.arc(0, 2, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(5, -12); ctx.lineTo(-5, -12); ctx.closePath(); ctx.fill();
  }

  if (isShieldActive) {
    ctx.beginPath();
    ctx.arc(0, -2, 34, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 210, 211, 0.25)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00d2d3';
    ctx.stroke();
  }

  ctx.restore();
}

function gameLoop() {
  if (!isGameRunning || isGamePaused) return;

  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    screenShake *= 0.88;
    if (screenShake < 0.5) screenShake = 0;
  }

  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0a0d24');
  bgGrad.addColorStop(1, '#1a224d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#2f3640';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = '#1e90ff';
  ctx.fillRect(0, canvas.height - 45, canvas.width, 5);

  if (isMovingLeft) playerX -= playerSpeed;
  if (isMovingRight) playerX += playerSpeed;
  playerX = Math.max(40, Math.min(canvas.width - 40, playerX));

  if (isSuperShot) {
    superShotTimer--;
    if (superShotTimer <= 0) isSuperShot = false;
  }
  if (isShieldActive) {
    shieldTimer--;
    if (shieldTimer <= 0) isShieldActive = false;
  }

  const now = Date.now();
  if (now - lastShotTime > 160) {
    if (isSuperShot) {
      bullets.push({ x: playerX - 16, y: canvas.height - 65, vx: -2.5, vy: 12, color: '#00d2d3' });
      bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#ffd700' });
      bullets.push({ x: playerX + 16, y: canvas.height - 65, vx: 2.5, vy: 12, color: '#00d2d3' });
    } else {
      bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: actorMap[currentActor].color });
    }
    sounds.playLaser();
    lastShotTime = now;
  }

  for (let b = bullets.length - 1; b >= 0; b--) {
    const bullet = bullets[b];
    bullet.y -= bullet.vy;
    bullet.x += bullet.vx;

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    if (bullet.y < -10) {
      bullets.splice(b, 1);
      continue;
    }

    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      const dist = Math.hypot(m.x - bullet.x, m.y - bullet.y);
      if (dist < m.size + 8) {
        bullets.splice(b, 1);
        m.hp--;
        sounds.playPop();
        triggerVibrate(20);

        if (m.hp <= 0) {
          createBurstParticles3D(m.x, m.y, m.color);
          trySpawnPowerup(m.x, m.y);

          score += 150;
          levelKills++;
          spawnFloatingText(m.x, m.y, '+150', '#ffd700');

          if (m.algorithm === 'splitter' && m.size > 22) {
            monsters.push(
              { x: m.x - 20, startX: m.x - 20, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 },
              { x: m.x + 20, startX: m.x + 20, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 }
            );
          }

          monsters.splice(i, 1);
          updateHUDValues();
          checkLevelObjectives();
        } else {
          spawnFloatingText(m.x, m.y, 'HIT!', '#ff4757');
        }
        break;
      }
    }
  }

  for (let p = powerups.length - 1; p >= 0; p--) {
    const pw = powerups[p];
    pw.y += pw.speed;

    ctx.save();
    ctx.translate(pw.x, pw.y);

    ctx.beginPath();
    ctx.arc(0, 0, pw.size, 0, Math.PI * 2);
    let pwColor = '#00d2d3';
    let pwLabel = 'S';

    if (pw.type === 'shield') { pwColor = '#1e90ff'; pwLabel = '🛡️'; }
    else if (pw.type === 'bomb') { pwColor = '#ff4757'; pwLabel = '💣'; }
    else if (pw.type === 'freeze') { pwColor = '#70a1ff'; pwLabel = '❄️'; }
    else if (pw.type === 'heart') { pwColor = '#ff78ae'; pwLabel = '❤️'; }
    else { pwColor = '#2ed573'; pwLabel = '⚡'; }

    ctx.fillStyle = pwColor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(pwLabel, 0, 0);

    ctx.restore();

    const distPlayer = Math.hypot(playerX - pw.x, (canvas.height - 45) - pw.y);
    if (distPlayer < pw.size + 25) {
      sounds.playPowerup();
      triggerVibrate([40, 40]);

      if (pw.type === 'supershot') {
        isSuperShot = true;
        superShotTimer = 450;
        spawnFloatingText(playerX, canvas.height - 70, 'SUPER SHOT 3X!', '#2ed573');
      }
      else if (pw.type === 'shield') {
        isShieldActive = true;
        shieldTimer = 550;
        spawnFloatingText(playerX, canvas.height - 70, 'PERISAI AKTIF!', '#00d2d3');
      }
      else if (pw.type === 'bomb') {
        bombCharges = Math.min(5, bombCharges + 1);
        updateSkillButtonsUI();
        spawnFloatingText(playerX, canvas.height - 70, '+1 EXTRA BOMB!', '#ff4757');
      }
      else if (pw.type === 'freeze') {
        freezeCharges = Math.min(5, freezeCharges + 1);
        updateSkillButtonsUI();
        spawnFloatingText(playerX, canvas.height - 70, '+1 EXTRA BEKU!', '#1e90ff');
      }
      else if (pw.type === 'heart') {
        lives = Math.min(5, lives + 1);
        updateLivesDisplay();
        spawnFloatingText(playerX, canvas.height - 70, '+1 EKSTRA NYAWA!', '#ff78ae');
      }

      powerups.splice(p, 1);
      continue;
    }

    if (pw.y > canvas.height) powerups.splice(p, 1);
  }

  for (let bb = bossBullets.length - 1; bb >= 0; bb--) {
    const bBullet = bossBullets[bb];
    bBullet.y += bBullet.vy;
    bBullet.x += bBullet.vx;

    ctx.beginPath();
    ctx.arc(bBullet.x, bBullet.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffd700';
    ctx.stroke();

    const distHero = Math.hypot(playerX - bBullet.x, (canvas.height - 45) - bBullet.y);
    if (distHero < 30) {
      bossBullets.splice(bb, 1);

      if (isShieldActive) {
        spawnFloatingText(playerX, canvas.height - 60, 'PERISAI TAHAN!', '#00d2d3');
        sounds.playPop();
      } else {
        lives--;
        screenShake = 16;
        triggerVibrate([100, 50, 100]);
        updateLivesDisplay();
        spawnFloatingText(playerX, canvas.height - 60, '-1 NYAWA!', '#ff4757');
        if (lives <= 0) { 
          levelFailed("GAME OVER! NYAWA HABIS"); 
          ctx.restore(); 
          return; 
        }
      }
      continue;
    }

    if (bBullet.y > canvas.height) bossBullets.splice(bb, 1);
  }

  drawHeroVector(ctx, playerX, canvas.height - 45, currentActor);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    m.timeAlive += 0.05;
    m.shootTimer++;

    if (!isFrozen) {
      if (m.algorithm === 'boss_10') {
        m.y = Math.min(100, m.y + m.speed);
        m.x = canvas.width / 2 + Math.sin(m.timeAlive * 2) * 120;

        if (m.shootTimer > 90) {
          bossBullets.push({ x: m.x, y: m.y + m.size, vx: 0, vy: 5 });
          sounds.playBossShoot();
          m.shootTimer = 0;
        }
      }
      else if (m.algorithm === 'boss_20') {
        m.y = Math.min(120, m.y + m.speed);
        m.x = canvas.width / 2 + Math.sin(m.timeAlive * 3) * 160;

        if (m.shootTimer > 70) {
          bossBullets.push({ x: m.x - 20, y: m.y + m.size, vx: 0, vy: 6 });
          bossBullets.push({ x: m.x + 20, y: m.y + m.size, vx: 0, vy: 6 });
          sounds.playBossShoot();
          m.shootTimer = 0;
        }
      }
      else if (m.algorithm === 'boss_30') {
        m.y = Math.min(130, m.y + m.speed);
        m.x = canvas.width / 2 + Math.sin(m.timeAlive * 2.5) * 200;

        if (m.shootTimer > 50) {
          bossBullets.push({ x: m.x, y: m.y + m.size, vx: -2, vy: 7 });
          bossBullets.push({ x: m.x, y: m.y + m.size, vx: 0, vy: 7 });
          bossBullets.push({ x: m.x, y: m.y + m.size, vx: 2, vy: 7 });
          sounds.playBossShoot();
          m.shootTimer = 0;
        }
      }
      else {
        switch (m.algorithm) {
          case 'zigzag': m.y += m.speed; m.x = m.startX + Math.sin(m.timeAlive * 3) * 65; break;
          case 'gravity': m.speed += 0.04; m.y += m.speed; break;
          case 'stealth': m.y += m.speed; m.opacity = 0.3 + Math.abs(Math.sin(m.timeAlive * 2)) * 0.7; break;
          case 'swarm': m.y += m.speed; break;
          default: m.y += m.speed; break;
        }
      }
    }

    ctx.save();
    ctx.globalAlpha = m.opacity || 1.0;

    ctx.beginPath();
    ctx.ellipse(m.x, canvas.height - 38, m.size * 0.7, m.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    ctx.translate(m.x, m.y);

    if (m.type === 'boss10' || m.type === 'boss20' || m.type === 'boss30') {
      ctx.beginPath();
      ctx.arc(0, 0, m.size, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-30, -m.size); ctx.lineTo(-15, -m.size - 25); ctx.lineTo(0, -m.size - 10);
      ctx.lineTo(15, -m.size - 25); ctx.lineTo(30, -m.size);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(-20, -10, 12, 0, Math.PI*2); ctx.arc(20, -10, 12, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff4757';
      ctx.beginPath(); ctx.arc(-20, -10, 5, 0, Math.PI*2); ctx.arc(20, -10, 5, 0, Math.PI*2); ctx.fill();
    }
    else if (m.type === 'donut') {
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI * 2); ctx.fillStyle = '#fa8231'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size * 0.8, 0, Math.PI * 2); ctx.fillStyle = '#ff78ae'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size * 0.35, 0, Math.PI * 2); ctx.fillStyle = '#0a0d24'; ctx.fill();
    } 
    else if (m.type === 'cloud') {
      ctx.fillStyle = '#f1f2f6';
      ctx.beginPath();
      ctx.arc(-12, 0, m.size * 0.6, 0, Math.PI * 2); ctx.arc(12, 0, m.size * 0.6, 0, Math.PI * 2);
      ctx.arc(0, -10, m.size * 0.7, 0, Math.PI * 2); ctx.fill();
    } 
    else if (m.type === 'crystal') {
      ctx.beginPath();
      ctx.moveTo(0, -m.size); ctx.lineTo(m.size, 0); ctx.lineTo(0, m.size); ctx.lineTo(-m.size, 0);
      ctx.closePath(); ctx.fillStyle = '#00d2d3'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.stroke();
    } 
    else {
      const radGrad = ctx.createRadialGradient(-m.size * 0.3, -m.size * 0.3, m.size * 0.1, 0, 0, m.size);
      radGrad.addColorStop(0, '#ffffff'); radGrad.addColorStop(0.3, m.color); radGrad.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI * 2); ctx.fillStyle = radGrad; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
    }

    if (m.maxHp > 1) {
      let widthBar = m.size * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-widthBar/2, -m.size - 18, widthBar, 8);
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(-widthBar/2, -m.size - 18, (m.hp / m.maxHp) * widthBar, 8);
    }

    ctx.restore();

    if (m.y > canvas.height - 55 && !m.algorithm.startsWith('boss')) {
      monsters.splice(i, 1);
      
      if (isShieldActive) {
        spawnFloatingText(playerX, canvas.height - 60, 'PERISAI TAHAN!', '#00d2d3');
      } else {
        lives--;
        screenShake = 14;
        triggerVibrate([100, 50, 100]);
        updateLivesDisplay();
        if (lives <= 0) { 
          levelFailed("GAME OVER! NYAWA HABIS"); 
          ctx.restore(); 
          return; 
        }
      }
    }
  }

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

// =============================================================
// 4. LOGIKA KELULUSAN & INTEGRASI FIREBASE REALTIME DATABASE
// =============================================================
function levelComplete() {
  isGameRunning = false;
  isGamePaused = false;
  sounds.playWin();
  triggerVibrate([50, 50, 50, 50, 100]);
  unlockSticker(currentLevelIndex + 1);
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  const levelConfig = levelsData[currentLevelIndex];
  document.getElementById('result-title').innerText = "MISI SELESAI!";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelConfig.level;
  document.getElementById('result-kills').innerText = `${levelKills} Target`;
  
  document.getElementById('btn-next-level').classList.remove('hidden');
  document.getElementById('modal-result').classList.remove('hidden');
}

function levelFailed(reasonTitle = "MISI GAGAL!") {
  isGameRunning = false;
  isGamePaused = false;
  triggerVibrate([200, 100, 200]);
  saveScoreToGlobalLeaderboard(playerName, score, currentLevelIndex + 1);

  const levelConfig = levelsData[currentLevelIndex];
  document.getElementById('result-title').innerText = reasonTitle;
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-level').innerText = levelConfig.level;
  document.getElementById('result-kills').innerText = `${levelKills} Target`;
  
  document.getElementById('btn-next-level').classList.add('hidden');
  document.getElementById('modal-result').classList.remove('hidden');
}

// SIMPAN SKOR KE REALTIME DATABASE
function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
  let localScores = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  localScores.push({ name: name, score: scoreVal, level: levelVal });
  localScores.sort((a,b) => b.score - a.score);
  localStorage.setItem('pahlawan_scores', JSON.stringify(localScores.slice(0, 10)));

  if (db) {
    db.ref('leaderboard').push({
      name: name,
      score: Number(scoreVal),
      level: Number(levelVal),
      timestamp: Date.now()
    }).catch(err => console.error("Gagal mengirim ke Firebase:", err));
  }
}

// MEMBACA PERINGKAT REALTIME STREAMING DARI REALTIME DATABASE
function openLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Memuat Papan Peringkat Realtime...</td></tr>';

  if (db) {
    db.ref('leaderboard').orderByChild('score').limitToLast(10).on('value', (snapshot) => {
      if (!snapshot.exists()) {
        showLocalScores(tbody);
        return;
      }

      let list = [];
      snapshot.forEach((childSnapshot) => {
        list.push(childSnapshot.val());
      });

      list.sort((a, b) => b.score - a.score);

      tbody.innerHTML = list.map((s, index) => `
        <tr>
          <td>${index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}</td>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td>Lvl ${s.level || 1}</td>
          <td><strong>${s.score}</strong></td>
        </tr>
      `).join('');
    }, (error) => {
      console.error("Firebase Listener Error:", error);
      showLocalScores(tbody);
    });
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
        <td>${index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : index + 1}</td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td>Lvl ${s.level}</td>
        <td><strong>${s.score}</strong></td>
      </tr>
    `).join('');
  }
}

function escapeHtml(text) {
  return String(text || 'Pahlawan').replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
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
        <div class="sticker-title">${isUnlocked ? sticker.title : 'Terkunci'}</div>
      </div>
    `;
  }).join('');

  document.getElementById('modal-stickers').classList.remove('hidden');
}
