// =============================================================
// 1. KONFIGURASI FIREBASE REALTIME DATABASE (COMPAT V9)
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
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("🔥 Firebase Realtime Database Terhubung Berhasil!");
  }
} catch(e) {
  console.log("⚠️ Firebase Mode Offline / Config Belum Diisi:", e);
}

// =============================================================
// DATA LEVEL & STIKER DEFAULT (FALLBACK)
// =============================================================
let levelsData = [];
let stickersData = [];

const DEFAULT_STICKERS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Stiker Level ${i + 1}`,
  desc: `Lulus Misi Level ${i + 1}`
}));

const ENEMY_SCORE_TABLE = {
  jelly: 100, donut: 200, cloud: 250, crystal: 300,
  slime: 220, rocket: 350, star: 280,
  boss5: 2500, boss10: 5000, boss15: 7500,
  boss20: 10000, boss25: 12500, boss30: 20000
};

// =============================================================
// 2. SYNTHESIZER AUDIO (AUDIO FX & BGM RETRO ARCADE)
// =============================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch(e) {
      console.log("Audio Context Error / Belum Diizinkan");
    }
  }

  playLaser() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
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
    if (!this.ctx) return;
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

  playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playHit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playCombo() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playBossWarning() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playBossShoot() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
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
    if (!this.ctx) return;
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
    if (!this.ctx) return;
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
    if (!this.ctx) return;
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
    if (!this.ctx) return;
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

  startBGM() {
    if (this.bgmTimer) return;
    const notes = [130.81, 164.81, 196.00, 261.63, 196.00, 164.81];
    this.bgmStep = 0;

    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !isGameRunning || isGamePaused) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[this.bgmStep % notes.length], this.ctx.currentTime);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);

      this.bgmStep++;
    }, 220);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
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
let currentLevelIndex = 0;
let score = 0;
let levelKills = 0;
let levelCoinsEarned = 0;
let lives = 3;
let isGameRunning = false;
let isGamePaused = false;

// Koin & Upgrade System
let coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
let upgradeFireRate = Number(localStorage.getItem('pahlawan_up_firerate')) || 1;
let upgradeShield = Number(localStorage.getItem('pahlawan_up_shield')) || 1;
let upgradeBomb = Number(localStorage.getItem('pahlawan_up_bomb')) || 2;
let upgradeFreeze = Number(localStorage.getItem('pahlawan_up_freeze')) || 2;

// Combo Multiplier
let combo = 1;
let comboTimer = 0;
const MAX_COMBO = 5;

// Magnet System
let isMagnetActive = false;
let magnetTimer = 0;

let playerX = 0;
let playerSpeed = 9;
let bullets = [];
let bossBullets = [];
let powerups = [];
let coinsOnField = [];
let muzzleFlashes = [];
let lastShotTime = 0;

let isSuperShot = false;
let superShotTimer = 0;
let isShieldActive = false;
let shieldTimer = 0;

let freezeCharges = upgradeFreeze;
let bombCharges = upgradeBomb;

let monsters = [];
let particles = [];
let stars = [];
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
  initStarfield();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  const nameInput = document.getElementById('player-name-input');
  if (nameInput) nameInput.value = playerName;

  updateActorSelectionUI();
  updateShopUI();

  await loadGameData();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=10.0').catch(err => console.log('SW Fail:', err));
  }

  setupEventListeners();
  updateStickerAlbumUI();
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btnPwa = document.getElementById('btn-pwa-install');
  if (btnPwa) btnPwa.classList.remove('hidden');
});

function initStarfield() {
  stars = [];
  const starCount = 80;
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.3,
      color: ['#ffffff', '#70a1ff', '#ffd700', '#00d2d3'][Math.floor(Math.random() * 4)]
    });
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (!isGameRunning) playerX = canvas.width / 2;
}

async function loadGameData() {
  try {
    const [resLevels, resStickers] = await Promise.all([
      fetch('./levels.json?v=10.0'),
      fetch('./stickers.json?v=8.0')
    ]);
    if (resLevels.ok) levelsData = await resLevels.json();
    if (resStickers.ok) stickersData = await resStickers.json();
  } catch (err) {
    console.warn('Gagal memuat JSON eksternal, memakai fallback.');
    stickersData = DEFAULT_STICKERS;
  }
}

function setupEventListeners() {
  const btnPlay = document.getElementById('btn-prepare-play');
  if (btnPlay) {
    btnPlay.onclick = () => {
      requestFullscreenAndLandscape();
      startGame();
    };
  }

  const btnSelectActor = document.getElementById('btn-select-actor');
  if (btnSelectActor) btnSelectActor.onclick = () => document.getElementById('modal-actors').classList.remove('hidden');

  const btnCloseActors = document.getElementById('btn-close-actors');
  if (btnCloseActors) btnCloseActors.onclick = () => document.getElementById('modal-actors').classList.add('hidden');

  const btnShop = document.getElementById('btn-shop');
  if (btnShop) {
    btnShop.onclick = () => {
      updateShopUI();
      document.getElementById('modal-shop').classList.remove('hidden');
    };
  }

  const btnCloseShop = document.getElementById('btn-close-shop');
  if (btnCloseShop) btnCloseShop.onclick = () => document.getElementById('modal-shop').classList.add('hidden');

  const btnLeaderboard = document.getElementById('btn-leaderboard');
  if (btnLeaderboard) btnLeaderboard.onclick = openLeaderboard;

  const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
  if (btnCloseLeaderboard) {
    btnCloseLeaderboard.onclick = () => document.getElementById('modal-leaderboard').classList.add('hidden');
  }

  const btnStickers = document.getElementById('btn-stickers');
  if (btnStickers) btnStickers.onclick = openStickerAlbum;

  const btnCloseStickers = document.getElementById('btn-close-stickers');
  if (btnCloseStickers) {
    btnCloseStickers.onclick = () => document.getElementById('modal-stickers').classList.add('hidden');
  }

  const btnPause = document.getElementById('btn-pause');
  if (btnPause) btnPause.onclick = pauseGame;

  const btnResume = document.getElementById('btn-resume-game');
  if (btnResume) btnResume.onclick = resumeGame;

  const btnPauseHero = document.getElementById('btn-pause-change-hero');
  if (btnPauseHero) btnPauseHero.onclick = () => document.getElementById('modal-actors').classList.remove('hidden');

  const btnPauseLb = document.getElementById('btn-pause-leaderboard');
  if (btnPauseLb) btnPauseLb.onclick = openLeaderboard;

  const btnPauseMenu = document.getElementById('btn-pause-main-menu');
  if (btnPauseMenu) {
    btnPauseMenu.onclick = () => {
      document.getElementById('modal-pause').classList.add('hidden');
      document.getElementById('hud-overlay').classList.add('hidden');
      document.getElementById('screen-main-menu').classList.remove('hidden');
      sounds.stopBGM();
      isGameRunning = false;
      isGamePaused = false;
    };
  }

  const btnBuyFirerate = document.getElementById('btn-buy-firerate');
  if (btnBuyFirerate) btnBuyFirerate.onclick = () => buyUpgrade('firerate');

  const btnBuyShield = document.getElementById('btn-buy-shield');
  if (btnBuyShield) btnBuyShield.onclick = () => buyUpgrade('shield');

  const btnBuyBomb = document.getElementById('btn-buy-bomb');
  if (btnBuyBomb) btnBuyBomb.onclick = () => buyUpgrade('bomb');

  const btnBuyFreeze = document.getElementById('btn-buy-freeze');
  if (btnBuyFreeze) btnBuyFreeze.onclick = () => buyUpgrade('freeze');

  const actorCards = document.querySelectorAll('.actor-card');
  actorCards.forEach(card => {
    card.onclick = () => {
      actorCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentActor = card.dataset.actor;
      localStorage.setItem('pahlawan_actor', currentActor);
      updateActorSelectionUI();
    };
  });

  const btnAudio = document.getElementById('btn-audio');
  if (btnAudio) {
    btnAudio.onclick = () => {
      sounds.isMuted = !sounds.isMuted;
      btnAudio.style.opacity = sounds.isMuted ? '0.5' : '1.0';
    };
  }

  const btnLeft = document.getElementById('btn-move-left');
  const btnRight = document.getElementById('btn-move-right');

  if (btnLeft) {
    btnLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); isMovingLeft = true; });
    btnLeft.addEventListener('pointerup', () => isMovingLeft = false);
    btnLeft.addEventListener('pointerleave', () => isMovingLeft = false);
  }

  if (btnRight) {
    btnRight.addEventListener('pointerdown', (e) => { e.preventDefault(); isMovingRight = true; });
    btnRight.addEventListener('pointerup', () => isMovingRight = false);
    btnRight.addEventListener('pointerleave', () => isMovingRight = false);
  }

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

  const btnNextLevel = document.getElementById('btn-next-level');
  if (btnNextLevel) {
    btnNextLevel.onclick = () => {
      document.getElementById('modal-result').classList.add('hidden');
      currentLevelIndex++;
      if (currentLevelIndex >= levelsData.length) currentLevelIndex = 0;
      startCurrentLevel();
    };
  }

  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.onclick = () => {
      document.getElementById('modal-result').classList.add('hidden');
      startCurrentLevel();
    };
  }

  const btnMenu = document.getElementById('btn-menu');
  if (btnMenu) {
    btnMenu.onclick = () => {
      document.getElementById('modal-result').classList.add('hidden');
      document.getElementById('hud-overlay').classList.add('hidden');
      document.getElementById('screen-main-menu').classList.remove('hidden');
      sounds.stopBGM();
      isGameRunning = false;
      isGamePaused = false;
    };
  }

  const btnFreeze = document.getElementById('btn-freeze');
  if (btnFreeze) {
    btnFreeze.onclick = () => {
      if (freezeCharges <= 0 || isFrozen || isGamePaused) return;
      freezeCharges--;
      isFrozen = true;
      sounds.playFreeze();
      triggerVibrate([50, 50, 50]);
      updateSkillButtonsUI();

      spawnFloatingText(canvas.width / 2, canvas.height / 2, 'BEKU! ❄️', '#1e90ff');
      setTimeout(() => isFrozen = false, 3500);
    };
  }

  const btnBomb = document.getElementById('btn-bomb');
  if (btnBomb) {
    btnBomb.onclick = () => {
      if (bombCharges <= 0 || isGamePaused) return;
      bombCharges--;
      screenShake = 18;
      sounds.playBomb();
      triggerVibrate([100, 50, 100]);
      updateSkillButtonsUI();

      monsters.forEach(m => createBurstParticles3D(m.x, m.y, m.color));
      let totalScoreFromBomb = 0;
      monsters.forEach(m => {
        let baseVal = ENEMY_SCORE_TABLE[m.type] || 150;
        totalScoreFromBomb += baseVal * combo;
      });

      score += totalScoreFromBomb;
      levelKills += monsters.length;
      
      spawnFloatingText(canvas.width / 2, canvas.height / 2, `BOOM! +${totalScoreFromBomb}`, '#ff4757');
      monsters = [];
      
      updateHUDValues();
      checkLevelObjectives();
    };
  }
}

function updateShopUI() {
  const coinEl = document.getElementById('shop-coin-count');
  if (coinEl) coinEl.innerText = coins;

  const firerateLvl = document.getElementById('shop-level-firerate');
  if (firerateLvl) firerateLvl.innerText = upgradeFireRate;

  const shieldLvl = document.getElementById('shop-level-shield');
  if (shieldLvl) shieldLvl.innerText = upgradeShield;

  const bombLvl = document.getElementById('shop-level-bomb');
  if (bombLvl) bombLvl.innerText = upgradeBomb;

  const freezeLvl = document.getElementById('shop-level-freeze');
  if (freezeLvl) freezeLvl.innerText = upgradeFreeze;

  const btnFirerate = document.getElementById('btn-buy-firerate');
  if (btnFirerate) btnFirerate.querySelector('span').innerText = upgradeFireRate >= 5 ? 'MAX' : `${upgradeFireRate * 50} 🪙`;

  const btnShield = document.getElementById('btn-buy-shield');
  if (btnShield) btnShield.querySelector('span').innerText = upgradeShield >= 5 ? 'MAX' : `${upgradeShield * 60} 🪙`;

  const btnBomb = document.getElementById('btn-buy-bomb');
  if (btnBomb) btnBomb.querySelector('span').innerText = upgradeBomb >= 5 ? 'MAX' : `${upgradeBomb * 75} 🪙`;

  const btnFreeze = document.getElementById('btn-buy-freeze');
  if (btnFreeze) btnFreeze.querySelector('span').innerText = upgradeFreeze >= 5 ? 'MAX' : `${upgradeFreeze * 75} 🪙`;
}

function buyUpgrade(type) {
  if (type === 'firerate' && upgradeFireRate < 5) {
    let cost = upgradeFireRate * 50;
    if (coins >= cost) {
      coins -= cost; upgradeFireRate++;
      localStorage.setItem('pahlawan_up_firerate', upgradeFireRate);
    }
  }
  else if (type === 'shield' && upgradeShield < 5) {
    let cost = upgradeShield * 60;
    if (coins >= cost) {
      coins -= cost; upgradeShield++;
      localStorage.setItem('pahlawan_up_shield', upgradeShield);
    }
  }
  else if (type === 'bomb' && upgradeBomb < 5) {
    let cost = upgradeBomb * 75;
    if (coins >= cost) {
      coins -= cost; upgradeBomb++;
      localStorage.setItem('pahlawan_up_bomb', upgradeBomb);
    }
  }
  else if (type === 'freeze' && upgradeFreeze < 5) {
    let cost = upgradeFreeze * 75;
    if (coins >= cost) {
      coins -= cost; upgradeFreeze++;
      localStorage.setItem('pahlawan_up_freeze', upgradeFreeze);
    }
  }
  localStorage.setItem('pahlawan_coins', coins);
  sounds.playCoin();
  updateShopUI();
}

function pauseGame() {
  if (!isGameRunning) return;
  isGamePaused = true;
  sounds.stopBGM();
  document.getElementById('modal-pause').classList.remove('hidden');
}

function resumeGame() {
  isGamePaused = false;
  sounds.startBGM();
  document.getElementById('modal-pause').classList.add('hidden');
  requestAnimationFrame(gameLoop);
}

function requestFullscreenAndLandscape() {
  try {
    const doc = document.documentElement;
    if (doc.requestFullscreen) { doc.requestFullscreen().catch(() => {}); }
    else if (doc.webkitRequestFullscreen) { doc.webkitRequestFullscreen(); }

    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  } catch (e) {
    console.log("Fullscreen / Orientation lock ditolak/tidak didukung.");
  }
}

function updateActorSelectionUI() {
  const name = actorMap[currentActor] ? actorMap[currentActor].name : 'Robot Cyber';
  const selActor = document.getElementById('selected-actor-name');
  if (selActor) selActor.innerText = name;

  const pauseHero = document.getElementById('pause-hero-name');
  if (pauseHero) pauseHero.innerText = name;
}

function updateSkillButtonsUI() {
  const btnFreeze = document.getElementById('btn-freeze');
  const btnBomb = document.getElementById('btn-bomb');
  
  const freezeCount = document.getElementById('freeze-count');
  if (freezeCount) freezeCount.innerText = freezeCharges;

  const bombCount = document.getElementById('bomb-count');
  if (bombCount) bombCount.innerText = bombCharges;

  if (btnFreeze) {
    if (freezeCharges <= 0) btnFreeze.classList.add('disabled');
    else btnFreeze.classList.remove('disabled');
  }

  if (btnBomb) {
    if (bombCharges <= 0) btnBomb.classList.add('disabled');
    else btnBomb.classList.remove('disabled');
  }
}

function startGame() {
  sounds.init();
  const inputEl = document.getElementById('player-name-input');
  const inputName = inputEl ? inputEl.value.trim() : '';
  playerName = inputName || 'Pahlawan';
  localStorage.setItem('pahlawan_nama', playerName);

  const nameDisplay = document.getElementById('player-name-display');
  if (nameDisplay) nameDisplay.innerText = playerName;

  currentLevelIndex = 0;
  score = 0;
  lives = 3;

  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  
  resizeCanvas();
  setTimeout(() => {
    resizeCanvas();
    startCurrentLevel();
  }, 60);
}

function startCurrentLevel() {
  levelKills = 0;
  levelCoinsEarned = 0;
  playerX = canvas.width / 2;
  bullets = [];
  bossBullets = [];
  powerups = [];
  coinsOnField = [];
  muzzleFlashes = [];

  combo = 1;
  comboTimer = 0;

  isMagnetActive = false;
  magnetTimer = 0;

  isSuperShot = false;
  superShotTimer = 0;
  isShieldActive = false;
  shieldTimer = 0;

  freezeCharges = upgradeFreeze;
  bombCharges = upgradeBomb;
  updateSkillButtonsUI();

  updateHUDValues();
  updateLivesDisplay();

  monsters = [];
  particles = [];
  isGameRunning = true;
  isGamePaused = false;

  sounds.startBGM();
  spawnMonsterLoop();
  gameLoop();
}

function updateHUDValues() {
  const levelConfig = levelsData[currentLevelIndex] || { level: 1, targetKills: 10, targetScore: 1000 };
  
  const lvlEl = document.getElementById('hud-level');
  if (lvlEl) lvlEl.innerText = levelConfig.level;

  const scoreEl = document.getElementById('hud-score');
  if (scoreEl) scoreEl.innerText = score;

  const coinsEl = document.getElementById('hud-coins');
  if (coinsEl) coinsEl.innerText = coins;

  const missionEl = document.getElementById('hud-mission');
  if (missionEl) missionEl.innerText = `${levelKills}/${levelConfig.targetKills}`;

  const comboPill = document.getElementById('hud-combo-pill');
  if (comboPill) {
    if (combo > 1) {
      comboPill.classList.remove('hidden');
      const comboText = document.getElementById('hud-combo-text');
      if (comboText) comboText.innerText = `${combo}x COMBO`;
    } else {
      comboPill.classList.add('hidden');
    }
  }
}

function updateLivesDisplay() {
  const container = document.getElementById('hud-lives');
  if (!container) return;
  let html = '';
  for(let i=0; i<lives; i++) {
    html += `<svg class="heart-icon" viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/></svg>`;
  }
  container.innerHTML = html;
}

function triggerBossSiren() {
  const overlay = document.getElementById('boss-warning-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    sounds.playBossWarning();
    triggerVibrate([100, 50, 100, 50, 200]);
    setTimeout(() => overlay.classList.add('hidden'), 2200);
  }
}

function spawnMonsterLoop() {
  if (!isGameRunning) return;
  
  if (!isGamePaused && !isFrozen) {
    const levelConfig = levelsData[currentLevelIndex] || { algorithm: 'linear', types: ['jelly'], spawnRate: 1500, speed: 1.0 };
    if (levelConfig) {
      const algo = levelConfig.algorithm;
      const typeList = levelConfig.types || ['jelly'];

      if (algo.startsWith('boss_')) {
        if (monsters.length === 0 && levelKills < levelConfig.targetKills) {
          triggerBossSiren();

          let hpVal = levelConfig.bossHp || 150;
          let colorVal = '#e74c3c';
          if (levelConfig.level === 5) colorVal = '#e67e22';
          else if (levelConfig.level === 10) colorVal = '#9b59b6';
          else if (levelConfig.level === 15) colorVal = '#3498db';
          else if (levelConfig.level === 20) colorVal = '#1abc9c';
          else if (levelConfig.level === 25) colorVal = '#f1c40f';

          monsters.push({
            x: canvas.width / 2,
            startX: canvas.width / 2,
            y: -80,
            speed: 1.0,
            size: 75,
            hp: hpVal,
            maxHp: hpVal,
            color: colorVal,
            type: `boss${levelConfig.level}`,
            algorithm: algo,
            shootTimer: 0,
            minionTimer: 0,
            enrageTimer: 0,
            timeAlive: 0,
            opacity: 1
          });
        }
      } else {
        let countToSpawn = (algo === 'swarm') ? 2 : 1;
        for (let c = 0; c < countToSpawn; c++) {
          const chosenType = typeList[Math.floor(Math.random() * typeList.length)];
          const hpVal = (chosenType === 'donut' ? 2 : (chosenType === 'crystal' ? 3 : 1));
          monsters.push({
            x: Math.random() * (canvas.width - 120) + 60,
            startX: Math.random() * (canvas.width - 120) + 60,
            y: -60,
            speed: (1.2 + Math.random() * 1.2) * (levelConfig.speed || 1),
            size: (chosenType === 'donut' ? 36 : 30),
            hp: hpVal,
            maxHp: hpVal,
            color: ['#ff4757', '#2ed573', '#ffa502', '#1e90ff', '#a55eea'][Math.floor(Math.random() * 5)],
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

  const currentRate = levelsData[currentLevelIndex] ? levelsData[currentLevelIndex].spawnRate : 1500;
  setTimeout(spawnMonsterLoop, currentRate);
}

function trySpawnDrop(x, y) {
  if (Math.random() < 0.50) {
    coinsOnField.push({ x: x, y: y, vy: 1.8, size: 10, rot: 0 });
  }

  if (Math.random() < 0.35) {
    const types = ['supershot', 'shield', 'bomb', 'freeze', 'heart', 'magnet'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    powerups.push({ x: x, y: y, type: chosenType, speed: 2.2, size: 16 });
  }
}

function spawnFloatingText(x, y, text, color) {
  const container = document.getElementById('popup-container');
  if (!container) return;
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
  for (let i = 0; i < 20; i++) {
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

function triggerBossDeathExplosions(x, y, onComplete) {
  let explosionsCount = 0;
  const interval = setInterval(() => {
    const offsetX = (Math.random() - 0.5) * 120;
    const offsetY = (Math.random() - 0.5) * 120;
    createBurstParticles3D(x + offsetX, y + offsetY, ['#ff4757', '#ffd700', '#2ed573', '#ff78ae'][explosionsCount % 4]);
    sounds.playBomb();
    screenShake = 12;
    triggerVibrate(40);
    explosionsCount++;

    if (explosionsCount >= 8) {
      clearInterval(interval);
      if (onComplete) onComplete();
    }
  }, 180);
}

function checkLevelObjectives() {
  const levelConfig = levelsData[currentLevelIndex] || { targetKills: 10, targetScore: 1000 };
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

  if (isMagnetActive || currentActor === 'cat') {
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
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

  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.opacity;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
  ctx.globalAlpha = 1.0;

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
  if (isMagnetActive) {
    magnetTimer--;
    if (magnetTimer <= 0) isMagnetActive = false;
  }

  if (combo > 1) {
    comboTimer--;
    if (comboTimer <= 0) {
      combo = 1;
      updateHUDValues();
    }
  }

  let baseInterval = Math.max(80, 150 - (upgradeFireRate - 1) * 15);
  if (currentActor === 'cat') baseInterval *= 0.65;

  const now = Date.now();
  if (now - lastShotTime > baseInterval) {
    if (isSuperShot) {
      bullets.push({ x: playerX - 16, y: canvas.height - 65, vx: -2.5, vy: 12, color: '#00d2d3', heroType: currentActor });
      bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#ffd700', heroType: currentActor });
      bullets.push({ x: playerX + 16, y: canvas.height - 65, vx: 2.5, vy: 12, color: '#00d2d3', heroType: currentActor });
    } else {
      switch (currentActor) {
        case 'robot':
          bullets.push({ x: playerX - 10, y: canvas.height - 65, vx: 0, vy: 14, color: '#1e90ff', heroType: 'robot' });
          bullets.push({ x: playerX + 10, y: canvas.height - 65, vx: 0, vy: 14, color: '#1e90ff', heroType: 'robot' });
          break;

        case 'cannon':
          bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 11, color: '#ff4757', heroType: 'cannon', radius: 12, damage: 2 });
          break;

        case 'dragon':
          bullets.push({ x: playerX - 8, y: canvas.height - 65, vx: -2.2, vy: 12, color: '#2ed573', heroType: 'dragon' });
          bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#2ed573', heroType: 'dragon' });
          bullets.push({ x: playerX + 8, y: canvas.height - 65, vx: 2.2, vy: 12, color: '#2ed573', heroType: 'dragon' });
          break;

        case 'cat':
          bullets.push({ x: playerX, y: canvas.height - 65, vx: (Math.random() - 0.5) * 1.5, vy: 15, color: '#ffa502', heroType: 'cat', rot: 0 });
          break;

        case 'unicorn':
          bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#a55eea', heroType: 'unicorn', pierce: 3 });
          break;

        default:
          bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#1e90ff', heroType: 'robot' });
          break;
      }
    }

    muzzleFlashes.push({ x: playerX, y: canvas.height - 65, radius: 14, opacity: 1.0 });
    sounds.playLaser();
    lastShotTime = now;
  }

  for (let mf = muzzleFlashes.length - 1; mf >= 0; mf--) {
    const flash = muzzleFlashes[mf];
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 0, ${flash.opacity})`;
    ctx.fill();
    flash.opacity -= 0.25;
    if (flash.opacity <= 0) muzzleFlashes.splice(mf, 1);
  }

  for (let b = bullets.length - 1; b >= 0; b--) {
    const bullet = bullets[b];
    bullet.y -= bullet.vy;
    bullet.x += bullet.vx;

    if (bullet.heroType === 'cannon') {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius || 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (bullet.heroType === 'cat') {
      bullet.rot = (bullet.rot || 0) + 0.3;
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(bullet.rot);
      ctx.fillStyle = bullet.color;
      ctx.fillRect(-6, -6, 12, 12);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(bullet.x, bullet.y + 12);
      ctx.lineTo(bullet.x, bullet.y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = bullet.color;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    if (bullet.y < -10 || bullet.x < -10 || bullet.x > canvas.width + 10) {
      bullets.splice(b, 1);
      continue;
    }

    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      const dist = Math.hypot(m.x - bullet.x, m.y - bullet.y);
      const hitRadius = (bullet.radius || 6) + m.size;

      if (dist < hitRadius) {
        let dmg = bullet.damage || 1;
        m.hp -= dmg;
        sounds.playPop();
        triggerVibrate(20);

        if (bullet.heroType === 'unicorn' && bullet.pierce > 1) {
          bullet.pierce--;
        } else {
          bullets.splice(b, 1);
        }

        if (m.hp <= 0) {
          createBurstParticles3D(m.x, m.y, m.color);
          trySpawnDrop(m.x, m.y);

          let basePoints = ENEMY_SCORE_TABLE[m.type] || 150;
          let pointsGained = basePoints * combo;
          score += pointsGained;
          levelKills++;

          combo = Math.min(MAX_COMBO, combo + 1);
          comboTimer = 180;
          sounds.playCombo();

          spawnFloatingText(m.x, m.y, `+${pointsGained} (${combo}x)`, '#ffd700');

          if (m.algorithm === 'splitter' && m.size > 22) {
            monsters.push(
              { x: m.x - 20, startX: m.x - 20, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 },
              { x: m.x + 20, startX: m.x + 20, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 }
            );
          }

          if (m.type.startsWith('boss')) {
            const bossX = m.x;
            const bossY = m.y;
            monsters.splice(i, 1);
            triggerBossDeathExplosions(bossX, bossY, () => {
              updateHUDValues();
              checkLevelObjectives();
            });
            break;
          } else {
            monsters.splice(i, 1);
            updateHUDValues();
            checkLevelObjectives();
          }
        } else {
          spawnFloatingText(m.x, m.y, 'HIT!', '#ff4757');
        }
        break;
      }
    }
  }

  for (let c = coinsOnField.length - 1; c >= 0; c--) {
    const coin = coinsOnField[c];
    const magnetActiveNow = isMagnetActive || (currentActor === 'cat');
    const playerY = canvas.height - 45;
    const distToPlayer = Math.hypot(playerX - coin.x, playerY - coin.y);

    if (magnetActiveNow && (isMagnetActive || distToPlayer < 220)) {
      const angle = Math.atan2(playerY - coin.y, playerX - coin.x);
      coin.x += Math.cos(angle) * 8.5;
      coin.y += Math.sin(angle) * 8.5;
    } else {
      coin.y += coin.vy;
    }

    coin.rot += 0.1;

    ctx.save();
    ctx.translate(coin.x, coin.y);
    ctx.rotate(coin.rot);

    ctx.beginPath();
    ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();

    if (distToPlayer < coin.size + 25) {
      coins++;
      levelCoinsEarned++;
      localStorage.setItem('pahlawan_coins', coins);
      sounds.playCoin();
      triggerVibrate(30);
      spawnFloatingText(coin.x, coin.y, '+1 🪙', '#ffd700');
      coinsOnField.splice(c, 1);
      updateHUDValues();
      continue;
    }

    if (coin.y > canvas.height) coinsOnField.splice(c, 1);
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
    else if (pw.type === 'magnet') { pwColor = '#ffd700'; pwLabel = '🧲'; }
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
        shieldTimer = 450 + (upgradeShield - 1) * 80;
        spawnFloatingText(playerX, canvas.height - 70, 'PERISAI AKTIF!', '#00d2d3');
      }
      else if (pw.type === 'bomb') {
        bombCharges = Math.min(upgradeBomb, bombCharges + 1);
        updateSkillButtonsUI();
        spawnFloatingText(playerX, canvas.height - 70, '+1 EXTRA BOMB!', '#ff4757');
      }
      else if (pw.type === 'freeze') {
        freezeCharges = Math.min(upgradeFreeze, freezeCharges + 1);
        updateSkillButtonsUI();
        spawnFloatingText(playerX, canvas.height - 70, '+1 EXTRA BEKU!', '#1e90ff');
      }
      else if (pw.type === 'heart') {
        lives = Math.min(5, lives + 1);
        updateLivesDisplay();
        spawnFloatingText(playerX, canvas.height - 70, '+1 EKSTRA NYAWA!', '#ff78ae');
      }
      else if (pw.type === 'magnet') {
        isMagnetActive = true;
        magnetTimer = 420;
        spawnFloatingText(playerX, canvas.height - 70, 'MAGNET KOIN 7s! 🧲', '#ffd700');
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
        combo = 1;
        updateHUDValues();
        sounds.playHit();
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
    if (m.minionTimer !== undefined) m.minionTimer++;
    if (m.enrageTimer !== undefined) m.enrageTimer++;

    if (!isFrozen) {
      if (m.algorithm.startsWith('boss_')) {
        m.y = Math.min(100, m.y + m.speed);
        m.x = canvas.width / 2 + Math.sin(m.timeAlive * 2) * 140;

        if (m.shootTimer > 60) {
          bossBullets.push({ x: m.x - 20, y: m.y + m.size, vx: -1.5, vy: 6 });
          bossBullets.push({ x: m.x + 20, y: m.y + m.size, vx: 1.5, vy: 6 });
          sounds.playBossShoot();
          m.shootTimer = 0;
        }

        if (m.minionTimer > 300) {
          m.minionTimer = 0;
          monsters.push(
            { x: m.x - 60, startX: m.x - 60, y: m.y + 40, speed: 1.5, size: 28, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 },
            { x: m.x + 60, startX: m.x + 60, y: m.y + 40, speed: 1.5, size: 28, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 }
          );
          spawnFloatingText(m.x, m.y + 60, 'PANGGIL PASUKAN!', '#ff4757');
        }

        if (m.type === 'boss30' && m.enrageTimer > 900) {
          m.enrageTimer = 0;
          let healVal = Math.floor(m.maxHp * 0.10);
          m.hp = Math.min(m.maxHp, m.hp + healVal);
          screenShake = 15;
          sounds.playBossWarning();
          spawnFloatingText(m.x, m.y - 20, `ENRAGE! REGEN +${healVal} HP`, '#2ed573');
        }

        ctx.save();
        let barWidth = Math.min(400, canvas.width * 0.6);
        let barX = (canvas.width - barWidth) / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX, 15, barWidth, 18);
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(barX, 15, (m.hp / m.maxHp) * barWidth, 18);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, 15, barWidth, 18);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS HP: ${m.hp} / ${m.maxHp}`, canvas.width / 2, 29);
        ctx.restore();
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

    if (m.type.startsWith('boss')) {
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

    if (m.maxHp > 1 && !m.type.startsWith('boss')) {
      let widthBar = m.size * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-widthBar/2, -m.size - 18, widthBar, 8);
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(-widthBar/2, -m.size - 18, (m.hp / m.maxHp) * widthBar, 8);
    }

    ctx.restore();

    if (m.y > canvas.height - 55 && !m.type.startsWith('boss')) {
      monsters.splice(i, 1);
      
      if (isShieldActive) {
        spawnFloatingText(playerX, canvas.height - 60, 'PERISAI TAHAN!', '#00d2d3');
      } else {
        lives--;
        combo = 1;
        updateHUDValues();
        sounds.playHit();
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
// 4. LOGIKA PERBAIKAN DEDUPLIKASI PAPAN PERINGKAT
// =============================================================
function levelComplete() {
  isGameRunning = false;
  isGamePaused = false;
  sounds.stopBGM();
  sounds.playWin();
  triggerVibrate([50, 50, 50, 50, 100]);

  const levelConfig = levelsData[currentLevelIndex] || { level: 1 };
  unlockSticker(levelConfig.level);
  saveScoreToGlobalLeaderboard(playerName, score, levelConfig.level);

  document.getElementById('result-title').innerText = "MISI SELESAI!";
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-coins').innerText = `+${levelCoinsEarned} 🪙`;
  document.getElementById('result-level').innerText = levelConfig.level;
  document.getElementById('result-kills').innerText = `${levelKills} Target`;
  
  const btnNext = document.getElementById('btn-next-level');
  if (btnNext) btnNext.classList.remove('hidden');

  document.getElementById('modal-result').classList.remove('hidden');
}

function levelFailed(reasonTitle = "MISI GAGAL!") {
  isGameRunning = false;
  isGamePaused = false;
  sounds.stopBGM();
  triggerVibrate([200, 100, 200]);

  const levelConfig = levelsData[currentLevelIndex] || { level: 1 };
  saveScoreToGlobalLeaderboard(playerName, score, levelConfig.level);

  document.getElementById('result-title').innerText = reasonTitle;
  document.getElementById('result-player-name').innerText = playerName;
  document.getElementById('result-score').innerText = score;
  document.getElementById('result-coins').innerText = `+${levelCoinsEarned} 🪙`;
  document.getElementById('result-level').innerText = levelConfig.level;
  document.getElementById('result-kills').innerText = `${levelKills} Target`;
  
  const btnNext = document.getElementById('btn-next-level');
  if (btnNext) btnNext.classList.add('hidden');

  document.getElementById('modal-result').classList.remove('hidden');
}

function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
  const cleanName = (name || 'Pahlawan').trim();
  if (!cleanName) return;

  const playerKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const numScore = Number(scoreVal) || 0;
  const numLevel = Number(levelVal) || 1;
  const sortValue = (numLevel * 100000000) + numScore;

  let localScores = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  let existingIndex = localScores.findIndex(s => (s.name || '').trim().toLowerCase() === cleanName.toLowerCase());

  let shouldUpdateLocal = false;
  if (existingIndex === -1) {
    shouldUpdateLocal = true;
    localScores.push({ name: cleanName, score: numScore, level: numLevel, sortValue: sortValue });
  } else {
    let existing = localScores[existingIndex];
    let oldLevel = Number(existing.level) || 1;
    let oldScore = Number(existing.score) || 0;
    if (numLevel > oldLevel || (numLevel === oldLevel && numScore > oldScore)) {
      shouldUpdateLocal = true;
      localScores[existingIndex] = { name: cleanName, score: numScore, level: numLevel, sortValue: sortValue };
    }
  }

  if (shouldUpdateLocal) {
    localScores.sort((a, b) => {
      let lvlA = Number(a.level) || 1;
      let lvlB = Number(b.level) || 1;
      if (lvlB !== lvlA) return lvlB - lvlA;
      return (Number(b.score) || 0) - (Number(a.score) || 0);
    });
    localStorage.setItem('pahlawan_scores', JSON.stringify(localScores.slice(0, 20)));
  }

  if (db && playerKey) {
    const playerRef = db.ref('leaderboard/' + playerKey);
    playerRef.once('value').then(snapshot => {
      let existingData = snapshot.val();
      let shouldUpdateDb = false;

      if (!existingData) {
        shouldUpdateDb = true;
      } else {
        let oldLevel = Number(existingData.level) || 0;
        let oldScore = Number(existingData.score) || 0;
        if (numLevel > oldLevel || (numLevel === oldLevel && numScore > oldScore)) {
          shouldUpdateDb = true;
        }
      }

      if (shouldUpdateDb) {
        playerRef.set({
          name: cleanName,
          score: numScore,
          level: numLevel,
          sortValue: sortValue,
          timestamp: Date.now()
        }).catch(err => console.error("Gagal simpan Firebase:", err));
      }
    }).catch(err => console.error("Gagal baca Firebase:", err));
  }
}

function openLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Memuat Papan Peringkat Realtime...</td></tr>';

  if (db) {
    db.ref('leaderboard').on('value', (snapshot) => {
      if (!snapshot.exists()) {
        showLocalScores(tbody);
        return;
      }

      let bestMap = new Map();

      snapshot.forEach((childSnapshot) => {
        let val = childSnapshot.val();
        if (!val || !val.name) return;

        let cleanName = val.name.trim();
        let key = cleanName.toLowerCase();
        let currentLevel = Number(val.level) || 1;
        let currentScore = Number(val.score) || 0;

        if (!bestMap.has(key)) {
          bestMap.set(key, { name: cleanName, level: currentLevel, score: currentScore });
        } else {
          let existing = bestMap.get(key);
          let existingLevel = Number(existing.level) || 1;
          let existingScore = Number(existing.score) || 0;

          if (currentLevel > existingLevel || (currentLevel === existingLevel && currentScore > existingScore)) {
            bestMap.set(key, { name: cleanName, level: currentLevel, score: currentScore });
          }
        }
      });

      let uniqueList = Array.from(bestMap.values());
      uniqueList.sort((a, b) => {
        let lvlA = Number(a.level) || 1;
        let lvlB = Number(b.level) || 1;
        if (lvlB !== lvlA) return lvlB - lvlA;
        return (Number(b.score) || 0) - (Number(a.score) || 0);
      });

      let top10 = uniqueList.slice(0, 10);
      if (top10.length === 0) {
        showLocalScores(tbody);
        return;
      }

      tbody.innerHTML = top10.map((s, index) => `
        <tr>
          <td>${index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}</td>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td>Lvl ${s.level || 1}</td>
          <td><strong>${s.score || 0}</strong></td>
        </tr>
      `).join('');
    }, (error) => {
      showLocalScores(tbody);
    });
  } else {
    showLocalScores(tbody);
  }
}

function showLocalScores(tbody) {
  let localScores = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  let bestMap = new Map();

  localScores.forEach(s => {
    if (!s || !s.name) return;
    let cleanName = s.name.trim();
    let key = cleanName.toLowerCase();
    let currentLevel = Number(s.level) || 1;
    let currentScore = Number(s.score) || 0;

    if (!bestMap.has(key)) {
      bestMap.set(key, { name: cleanName, level: currentLevel, score: currentScore });
    } else {
      let existing = bestMap.get(key);
      let existingLevel = Number(existing.level) || 1;
      let existingScore = Number(existing.score) || 0;

      if (currentLevel > existingLevel || (currentLevel === existingLevel && currentScore > existingScore)) {
        bestMap.set(key, { name: cleanName, level: currentLevel, score: currentScore });
      }
    }
  });

  let uniqueList = Array.from(bestMap.values());
  uniqueList.sort((a, b) => {
    let lvlA = Number(a.level) || 1;
    let lvlB = Number(b.level) || 1;
    if (lvlB !== lvlA) return lvlB - lvlA;
    return (Number(b.score) || 0) - (Number(a.score) || 0);
  });

  if (uniqueList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Belum ada skor tercatat.</td></tr>';
  } else {
    tbody.innerHTML = uniqueList.slice(0, 10).map((s, index) => `
      <tr>
        <td>${index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}</td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td>Lvl ${s.level || 1}</td>
        <td><strong>${s.score || 0}</strong></td>
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
  const countEl = document.getElementById('unlocked-count');
  if (countEl) countEl.innerText = unlocked.length;
}

function openStickerAlbum() {
  const unlocked = JSON.parse(localStorage.getItem('pahlawan_stickers') || '[]');
  const grid = document.getElementById('sticker-grid');
  if (!grid) return;

  const list = (stickersData && stickersData.length > 0) ? stickersData : DEFAULT_STICKERS;

  grid.innerHTML = list.map(sticker => {
    const isUnlocked = unlocked.includes(sticker.id);
    return `
      <div class="sticker-card ${isUnlocked ? '' : 'locked'}">
        <div class="sticker-title">${isUnlocked ? sticker.title : '🔒'}</div>
      </div>
    `;
  }).join('');

  document.getElementById('modal-stickers').classList.remove('hidden');
}
