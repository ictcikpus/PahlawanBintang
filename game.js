// =============================================================
// PAHLAWAN BINTANG — game.js v17
// Fitur: Rewarded Revive, Endless Mode, Daily Challenge,
//        Kill Streak, Leaderboard 3 Tab, IndexedDB, Telegraph,
//        Boss Weak Point, Pre-Level Loadout, Narrative, 12 Tema
// =============================================================

// =============================================================
// 1. FIREBASE CONFIG
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
  console.log("⚠️ Firebase Mode Offline");
}

// =============================================================
// 2. INDEXEDDB WRAPPER + DEVICE ID
// =============================================================
class GameDB {
  constructor() { this.db = null; this.ready = this._init(); }
  _init() {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (val) => { if (!settled) { settled = true; resolve(val); } };
      setTimeout(() => finish(false), 2500);
      try {
        if (!window.indexedDB) return finish(false);
        const req = indexedDB.open('pahlawan_bintang', 1);
        req.onupgradeneeded = (e) => {
          const d = e.target.result;
          if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
        };
        req.onsuccess = (e) => { this.db = e.target.result; finish(true); };
        req.onerror = () => finish(false);
        req.onblocked = () => finish(false);
      } catch(e) { finish(false); }
    });
  }
  async get(key) {
    if (!this.db) return localStorage.getItem(key);
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('kv', 'readonly');
        const req = tx.objectStore('kv').get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : localStorage.getItem(key));
        req.onerror = () => resolve(localStorage.getItem(key));
      } catch(e) { resolve(localStorage.getItem(key)); }
    });
  }
  async set(key, value) {
    try { localStorage.setItem(key, value); } catch(e) {}
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch(e) { resolve(); }
    });
  }
}
const DB = new GameDB();

async function initDeviceId() {
  let id = await DB.get('pahlawan_uuid');
  if (!id) {
    try {
      id = (crypto && crypto.randomUUID && crypto.randomUUID()) ||
           ('p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
    } catch(e) {
      id = 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }
    await DB.set('pahlawan_uuid', id);
  }
  return id;
}
let playerUUID = null;

async function getStars() {
  const raw = await DB.get('pahlawan_stars');
  try { return JSON.parse(raw || '{}'); } catch(e) { return {}; }
}
async function setStar(levelNum, starsEarned) {
  const s = await getStars();
  if (!s[levelNum] || s[levelNum] < starsEarned) {
    s[levelNum] = starsEarned;
    await DB.set('pahlawan_stars', JSON.stringify(s));
  }
}
async function getLoadout() {
  const raw = await DB.get('pahlawan_loadout');
  try {
    const arr = JSON.parse(raw || '["freeze","bomb"]');
    return Array.isArray(arr) && arr.length === 2 ? arr : ['freeze','bomb'];
  } catch(e) { return ['freeze','bomb']; }
}
async function setLoadout(arr) { await DB.set('pahlawan_loadout', JSON.stringify(arr)); }

// =============================================================
// 3. TEMA LEVEL
// =============================================================
const LEVEL_THEMES = [
  { id: 'cosmic', name: 'COSMIC SECTOR', bgTop: '#05061a', bgBottom: '#0e1035', accent: '#00d2ff', accentSoft: 'rgba(0,210,255,0.35)', stars: ['#ffffff','#70a1ff','#ffd700','#00d2d3'], ground: '#2f3640', groundLine: '#00d2ff', monsters: ['#ff4757','#2ed573','#ffa502','#1e90ff','#a55eea'] },
  { id: 'inferno', name: 'BOSS: INFERNO', bgTop: '#1a0505', bgBottom: '#4a0a05', accent: '#ff6b00', accentSoft: 'rgba(255,107,0,0.4)', stars: ['#ffb142','#ff6b00','#ffd700','#ff3838'], ground: '#2a1010', groundLine: '#ff6b00', monsters: ['#ff6b00','#ffb142','#ff3838','#ffd700'] },
  { id: 'nebula', name: 'NEBULA DEPTHS', bgTop: '#0d0520', bgBottom: '#1f0a3a', accent: '#a55eea', accentSoft: 'rgba(165,94,234,0.4)', stars: ['#ffffff','#a55eea','#ff2e88','#c3a3ff'], ground: '#26183d', groundLine: '#a55eea', monsters: ['#ff2e88','#a55eea','#ff6bcb','#c3a3ff','#8c46d6'] },
  { id: 'void', name: 'BOSS: VOID', bgTop: '#0a0010', bgBottom: '#2b0033', accent: '#c86bff', accentSoft: 'rgba(200,107,255,0.4)', stars: ['#c86bff','#ffffff','#7a2bb8','#ff77ff'], ground: '#1c0a24', groundLine: '#c86bff', monsters: ['#c86bff','#7a2bb8','#ff77ff','#e0b3ff'] },
  { id: 'aurora', name: 'AURORA FIELDS', bgTop: '#021a10', bgBottom: '#043328', accent: '#39ff14', accentSoft: 'rgba(57,255,20,0.35)', stars: ['#ffffff','#39ff14','#00ffaa','#c8ffb0'], ground: '#0e2f1e', groundLine: '#39ff14', monsters: ['#39ff14','#00ffaa','#7dff8e','#ffd700','#2ed573'] },
  { id: 'cryo', name: 'BOSS: CRYO', bgTop: '#021222', bgBottom: '#053a55', accent: '#4de8ff', accentSoft: 'rgba(77,232,255,0.4)', stars: ['#ffffff','#4de8ff','#70a1ff','#c3f0ff'], ground: '#0d2a3d', groundLine: '#4de8ff', monsters: ['#4de8ff','#70a1ff','#ffffff','#a3d8ff'] },
  { id: 'magma', name: 'MAGMA CORE', bgTop: '#1a0505', bgBottom: '#3a0f00', accent: '#ff3838', accentSoft: 'rgba(255,56,56,0.35)', stars: ['#ff3838','#ffb142','#ffd700','#ffffff'], ground: '#2a0808', groundLine: '#ff3838', monsters: ['#ff3838','#ff6b00','#ffb142','#ffd700'] },
  { id: 'titan', name: 'BOSS: TITAN', bgTop: '#001a1a', bgBottom: '#004d4d', accent: '#1abc9c', accentSoft: 'rgba(26,188,156,0.4)', stars: ['#1abc9c','#00ffcc','#ffffff','#a3ffe6'], ground: '#0a2a2a', groundLine: '#1abc9c', monsters: ['#1abc9c','#00ffcc','#16a085','#7cffdd'] },
  { id: 'gold', name: 'GOLDEN VOID', bgTop: '#1a1000', bgBottom: '#3a2800', accent: '#ffd700', accentSoft: 'rgba(255,215,0,0.4)', stars: ['#ffd700','#ffb142','#ffffff','#ffe680'], ground: '#2a2000', groundLine: '#ffd700', monsters: ['#ffd700','#ffb142','#ff8a00','#ffe680','#fff2b0'] },
  { id: 'solar', name: 'BOSS: SOLAR', bgTop: '#1a0a00', bgBottom: '#5a1e00', accent: '#ffaa00', accentSoft: 'rgba(255,170,0,0.45)', stars: ['#ffaa00','#ff6600','#ffd700','#ffffff'], ground: '#2e1400', groundLine: '#ffaa00', monsters: ['#ffaa00','#ff6600','#ffd700','#ff2200'] },
  { id: 'phantom', name: 'PHANTOM REALM', bgTop: '#0a0015', bgBottom: '#23003a', accent: '#ff2e88', accentSoft: 'rgba(255,46,136,0.4)', stars: ['#ff2e88','#a55eea','#ffffff','#ff9ad4'], ground: '#1f0a2a', groundLine: '#ff2e88', monsters: ['#ff2e88','#a55eea','#c86bff','#ff9ad4'] },
  { id: 'omega', name: 'FINAL BOSS: OMEGA', bgTop: '#000000', bgBottom: '#2a0033', accent: '#ff0055', accentSoft: 'rgba(255,0,85,0.5)', stars: ['#ff0055','#ffd700','#00ffff','#ffffff','#ff00ff'], ground: '#0a0010', groundLine: '#ff0055', monsters: ['#ff0055','#ffd700','#00ffff','#ff00ff','#39ff14'] }
];

function getThemeForLevel(levelNum) {
  if (levelNum === 5)  return LEVEL_THEMES[1];
  if (levelNum === 10) return LEVEL_THEMES[3];
  if (levelNum === 15) return LEVEL_THEMES[5];
  if (levelNum === 20) return LEVEL_THEMES[7];
  if (levelNum === 25) return LEVEL_THEMES[9];
  if (levelNum === 30) return LEVEL_THEMES[11];
  const group = Math.floor((levelNum - 1) / 5);
  return LEVEL_THEMES[group * 2];
}

const BOSS_SIZES = { 5: 62, 10: 80, 15: 96, 20: 112, 25: 128, 30: 148 };
let currentTheme = LEVEL_THEMES[0];

// =============================================================
// 4. STORY
// =============================================================
const STORY = {
  1:  { before: { speaker: 'VEGA', portrait: 'i-vega', lines: ['Pahlawan... gelombang Void datang dari Nebula.', 'Selamatkan 5 sektor. Kita satu-satunya harapan.'] },
        after:  { speaker: 'PAHLAWAN', portrait: 'i-hero-portrait', lines: ['Sektor pertama... aman.'] } },
  3:  { before: { speaker: 'ARIA', portrait: 'i-aria', lines: ['Aku Dr. Aria. Musuh mulai bervariasi.', 'Gunakan upgrade di Toko untuk bertahan.'] } },
  5:  { before: { speaker: 'VEGA', portrait: 'i-vega', lines: ['Peringatan! Bos pertama mendekat.', 'Fokus ke inti merahnya saat terbuka.'] },
        after:  { speaker: 'VEGA', portrait: 'i-vega', lines: ['Kerja bagus! Namun ini baru permulaan.'] } },
  8:  { before: { speaker: 'RIVAL', portrait: 'i-rival', lines: ['Kau... masih hidup?', 'Jangan harap bisa lewat sektorku.'] } },
  10: { before: { speaker: 'VEGA', portrait: 'i-vega', lines: ['Ini... mantan rekanku.', 'Dia jatuh ke Void. Kalahkan dia. Bebaskan dia.'] },
        after:  { speaker: 'ARIA', portrait: 'i-aria', lines: ['Aku mendeteksi sinyal aneh. Ada dalang di balik ini.'] } },
  15: { before: { speaker: 'VEGA', portrait: 'i-vega', lines: ['Bos Cryo. Ciptaan eksperimen kami sendiri.', 'Maafkan aku, Pahlawan.'] },
        after:  { speaker: 'RIVAL', portrait: 'i-rival', lines: ['Kau kuat. Bergabung denganku, atau hancur.'] } },
  20: { before: { speaker: 'ARIA', portrait: 'i-aria', lines: ['Titan — penjaga inti galaksi.', 'Aku percaya padamu.'] },
        after:  { speaker: 'VEGA', portrait: 'i-vega', lines: ['Aria... dia dikorbankan untuk membuka jalan.', 'Lanjutkan. Demi dia.'] } },
  25: { before: { speaker: 'VILLAIN', portrait: 'i-villain', lines: ['Aku adalah Void itu sendiri.', 'Setiap pahlawan yang kau kalahkan... adalah aku.'] } },
  30: { before: { speaker: 'VILLAIN', portrait: 'i-villain', lines: ['Ini akhirnya. Kau vs aku. Takdir atau kehancuran.'] },
        after:  { speaker: 'PAHLAWAN', portrait: 'i-hero-portrait', lines: ['Damai... akhirnya.'] } }
};

// =============================================================
// 5. LEVEL GENERATOR + DATA
// =============================================================
function generate30Levels() {
  const levels = [];
  const enemyTypesPool = ["jelly", "donut", "cloud", "crystal", "splitter"];
  const algorithmsPool = ["linear", "zigzag", "gravity", "stealth", "swarm", "splitter"];
  for (let i = 1; i <= 30; i++) {
    if (i % 5 === 0) {
      const hpScale = { 5: 150, 10: 350, 15: 600, 20: 1000, 25: 1500, 30: 2500 };
      levels.push({
        level: i, targetKills: 1, targetScore: i * 2000, speed: 1.0, spawnRate: 2000,
        algorithm: `boss_${i}`, types: [`boss${i}`], bossHp: hpScale[i] || 150
      });
    } else {
      const availableTypes = enemyTypesPool.slice(0, Math.min(enemyTypesPool.length, Math.floor(i / 3) + 1));
      const chosenAlgo = algorithmsPool[(i - 1) % algorithmsPool.length];
      levels.push({
        level: i, targetKills: 10 + (i * 3), targetScore: i * 1500,
        speed: 1.0 + (i * 0.08),
        spawnRate: Math.max(500, 1500 - (i * 30)),
        algorithm: chosenAlgo, types: availableTypes
      });
    }
  }
  return levels;
}
let levelsData = generate30Levels();

const DEFAULT_STICKERS = [
  { id: 1, title: "Pahlawan Pemula" },
  { id: 2, title: "Penembak Jitu" },
  { id: 3, title: "Penjelajah Galaksi" },
  { id: 4, title: "Penakluk Boss 1" },
  { id: 5, title: "Master Kombinasi" },
  { id: 6, title: "Pahlawan Legendaris" }
];
let stickersData = DEFAULT_STICKERS;

const ENEMY_SCORE_TABLE = {
  jelly: 100, donut: 200, cloud: 250, crystal: 300, splitter: 350,
  boss5: 2500, boss10: 5000, boss15: 7500, boss20: 10000, boss25: 12500, boss30: 20000
};

// Daily modifiers
const DAILY_MODIFIERS = [
  { id: 'double_speed', name: 'DOUBLE SPEED', desc: 'Musuh bergerak 2× lebih cepat', icon: 'i-bolt' },
  { id: 'no_shield', name: 'NO SHIELD', desc: 'Skill Shield dimatikan', icon: 'i-shield' },
  { id: 'one_life', name: 'ONE LIFE', desc: 'Hanya 1 nyawa', icon: 'i-heart' },
  { id: 'double_monster', name: 'SWARM', desc: 'Musuh spawn 2× lebih banyak', icon: 'i-target' }
];

// =============================================================
// 6. SOUND ENGINE
// =============================================================
class SoundEngine {
  constructor() { this.ctx = null; this.isMuted = false; this.bgmTimer = null; this.bgmStep = 0; }
  init() {
    try {
      if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; this.ctx = new A(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch(e) {}
  }
  playLaser() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(850,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(120,this.ctx.currentTime+0.05);
    g.gain.setValueAtTime(0.12,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.05);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.05);
  }
  playPowerup() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(300,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200,this.ctx.currentTime+0.2);
    g.gain.setValueAtTime(0.25,this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playCoin() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(987.77,this.ctx.currentTime);
    o.frequency.setValueAtTime(1318.51,this.ctx.currentTime+0.08);
    g.gain.setValueAtTime(0.2,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playHit() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(180,this.ctx.currentTime);
    o.frequency.linearRampToValueAtTime(40,this.ctx.currentTime+0.2);
    g.gain.setValueAtTime(0.3,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playCombo() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(523.25,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1046.50,this.ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.25,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.15);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.15);
  }
  playBossWarning() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(440,this.ctx.currentTime);
    o.frequency.setValueAtTime(880,this.ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.3,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.3);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.3);
  }
  playBossShoot() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(300,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80,this.ctx.currentTime+0.12);
    g.gain.setValueAtTime(0.2,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.12);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.12);
  }
  playPop() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(450,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(900,this.ctx.currentTime+0.08);
    g.gain.setValueAtTime(0.35,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.08);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.08);
  }
  playFreeze() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(950,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(320,this.ctx.currentTime+0.3);
    g.gain.setValueAtTime(0.3,this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.01,this.ctx.currentTime+0.3);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.3);
  }
  playShield() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(600,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1400,this.ctx.currentTime+0.25);
    g.gain.setValueAtTime(0.28,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.28);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.28);
  }
  playBomb() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(220,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(35,this.ctx.currentTime+0.4);
    g.gain.setValueAtTime(0.45,this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.01,this.ctx.currentTime+0.4);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.4);
  }
  playLevelIntro() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.2);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime + i * 0.1);
      o.stop(this.ctx.currentTime + i * 0.1 + 0.2);
    });
  }
  playType() {
    if (this.isMuted || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'square'; o.frequency.value = 900 + Math.random() * 400;
      g.gain.setValueAtTime(0.015, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + 0.03);
    } catch(e) {}
  }
  playKillstreak() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.05);
      g.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.05 + 0.15);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime + i * 0.05);
      o.stop(this.ctx.currentTime + i * 0.05 + 0.15);
    });
  }
  playWin() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(f,this.ctx.currentTime+i*0.09);
      g.gain.setValueAtTime(0.25,this.ctx.currentTime+i*0.09);
      g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+i*0.09+0.22);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime+i*0.09); o.stop(this.ctx.currentTime+i*0.09+0.22);
    });
  }
  _playTone(freq, dur, type='square', vol=0.05, detune=0) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (detune) o.detune.setValueAtTime(detune, this.ctx.currentTime);
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + dur);
  }
  _playKick() {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(150,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40,this.ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.35,this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  _playSnare() {
    if (!this.ctx) return;
    const bs = this.ctx.sampleRate * 0.12;
    const buf = this.ctx.createBuffer(1, bs, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=1200;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.18, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    s.connect(f); f.connect(g); g.connect(this.ctx.destination); s.start();
  }
  _playHiHat() {
    if (!this.ctx) return;
    const bs = this.ctx.sampleRate * 0.05;
    const buf = this.ctx.createBuffer(1, bs, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.07, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    s.connect(f); f.connect(g); g.connect(this.ctx.destination); s.start();
  }
  startBGM() {
    if (this.bgmTimer) return;
    const bpm = 138, stepMs = (60 / bpm / 4) * 1000;
    const bassNotes = [65.41, 98.00, 110.00, 87.31];
    const chordNotes = [
      [261.63, 329.63, 392.00, 523.25],
      [392.00, 493.88, 587.33, 783.99],
      [440.00, 523.25, 659.25, 880.00],
      [349.23, 440.00, 523.25, 698.46]
    ];
    const melodyPattern = [
      [523.25,null,659.25,null,783.99,null,659.25,null,523.25,null,392.00,null,523.25,null,587.33,null],
      [493.88,null,587.33,null,783.99,null,587.33,null,493.88,null,392.00,null,493.88,null,587.33,null],
      [440.00,null,523.25,null,659.25,null,523.25,null,440.00,null,349.23,null,440.00,null,523.25,null],
      [349.23,null,440.00,null,523.25,null,698.46,null,587.33,null,523.25,null,440.00,null,523.25,587.33]
    ];
    let step = 0;
    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !isGameRunning || isGamePaused) { step = 0; return; }
      this.init(); if (!this.ctx) return;
      const bar = Math.floor(step / 16) % 4;
      const beat = step % 16;
      if (beat % 4 === 0) this._playTone(bassNotes[bar], 0.22, 'triangle', 0.09);
      if (beat % 2 === 0) this._playTone(chordNotes[bar][(beat/2) % 4], 0.14, 'square', 0.028);
      const melNote = melodyPattern[bar][beat];
      if (melNote) this._playTone(melNote, 0.18, 'square', 0.035, 5);
      if (beat === 0 || beat === 8) this._playKick();
      if (beat === 4 || beat === 12) this._playSnare();
      if (beat % 2 === 1) this._playHiHat();
      step++;
      this.bgmStep = step;
    }, stepMs);
  }
  stopBGM() { if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; this.bgmStep = 0; } }
}
const sounds = new SoundEngine();

function triggerVibrate(pattern) {
  if ('vibrate' in navigator) { try { navigator.vibrate(pattern); } catch (e) {} }
}

// =============================================================
// 7. AD SERVICE (placeholder, siap diganti AdMob/AdSense)
// =============================================================
const AdService = {
  isAvailable: () => true,
  showRewarded: async () => {
    // Ganti fungsi ini dengan integrasi SDK iklan sungguhan
    return new Promise((resolve) => {
      const overlay = document.getElementById('ad-overlay');
      const cd = document.getElementById('ad-countdown');
      if (!overlay || !cd) { resolve(true); return; }
      let countdown = 5;
      cd.innerText = countdown;
      overlay.classList.remove('hidden');
      const timer = setInterval(() => {
        countdown--;
        cd.innerText = countdown > 0 ? countdown : '✓';
        if (countdown <= 0) {
          clearInterval(timer);
          setTimeout(() => {
            overlay.classList.add('hidden');
            resolve(true);
          }, 500);
        }
      }, 1000);
    });
  }
};

// =============================================================
// 8. GAME STATE
// =============================================================
let currentLevelIndex = 0;
let score = 0;
let levelKills = 0;
let levelCoinsEarned = 0;
let lives = 3;
let isGameRunning = false;
let isGamePaused = false;
let gameMode = 'normal'; // 'normal' | 'endless' | 'daily'

let coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
let upgradeFireRate = Number(localStorage.getItem('pahlawan_up_firerate')) || 1;
let upgradeShield = Number(localStorage.getItem('pahlawan_up_shield')) || 1;
let upgradeBomb = Number(localStorage.getItem('pahlawan_up_bomb')) || 2;
let upgradeFreeze = Number(localStorage.getItem('pahlawan_up_freeze')) || 2;

let combo = 1;
let comboTimer = 0;
const MAX_COMBO = 5;

// Kill streak
let killStreakCount = 0;
let killStreakMilestone = 0;
const KILLSTREAK_MILESTONES = [10, 25, 50, 100];
const KILLSTREAK_TITLES = ['KILLING SPREE!', 'RAMPAGE!', 'UNSTOPPABLE!', 'GODLIKE!'];

// Revive
let reviveUsedThisRun = false;
let reviveQuota = 3;

let playerX = 0;
let playerSpeed = 9;
let playerPulse = 0;
let bullets = [];
let bossBullets = [];
let powerups = [];
let coinsOnField = [];
let muzzleFlashes = [];
let telegraphs = [];
let lastShotTime = 0;

let isSuperShot = false;
let superShotTimer = 0;
let isShieldActive = false;
let shieldTimer = 0;
let isMagnetActive = false;
let magnetTimer = 0;
let isReviveInvuln = false;
let reviveInvulnTimer = 0;

let freezeCharges = 0;
let shieldCharges = 0;
let bombCharges = 0;

let playerLoadout = ['freeze', 'bomb'];

let monsters = [];
let particles = [];
let stars = [];
let isFrozen = false;
let freezeFramesRemaining = 0;
let screenShake = 0;

let isMovingLeft = false;
let isMovingRight = false;

let currentActor = localStorage.getItem('pahlawan_actor') || 'robot';
let playerName = localStorage.getItem('pahlawan_nama') || 'Pahlawan';

// Endless mode state
let endlessWave = 1;
let endlessKillsThisWave = 0;
const ENDLESS_KILLS_PER_WAVE = 15;

// Daily mode state
let currentDailyModifier = null;

// Leaderboard tab
let currentLeaderboardTab = 'global';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let deferredPrompt;
let leaderboardRef = null;
let leaderboardHandler = null;

const actorMap = {
  robot:   { name: 'Robot Cyber',    color: '#1e90ff' },
  cannon:  { name: 'Meriam Bintang', color: '#ff4757' },
  dragon:  { name: 'Cyber Dragon',   color: '#2ed573' },
  cat:     { name: 'Ninja Cat',      color: '#ffa502' },
  unicorn: { name: 'Unicorn Star',   color: '#a55eea' }
};

let storyQueue = [];
let storyOnDone = null;
let storyTyping = false;
let storyTimer = null;
let storyCurrentText = '';
let storyCurrentIdx = 0;

let loadoutCurrentSelection = [];
let loadoutCallback = null;

// =============================================================
// 9. BOOTSTRAP — UI listener DIPASANG SEBELUM async init
// =============================================================
function bootstrapUI() {
  try {
    setupEventListeners();
    console.log('✅ [Boot] Event listeners attached');
  } catch (e) {
    console.error('❌ [Boot] Failed to attach listeners:', e);
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapUI);
} else {
  bootstrapUI();
}

window.addEventListener('load', async () => {
  try {
    await DB.ready;
    playerUUID = await initDeviceId();
    console.log('✅ [Boot] Device ID:', playerUUID);
    coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
    upgradeFireRate = Number(localStorage.getItem('pahlawan_up_firerate')) || 1;
    upgradeShield = Number(localStorage.getItem('pahlawan_up_shield')) || 1;
    upgradeBomb = Number(localStorage.getItem('pahlawan_up_bomb')) || 2;
    upgradeFreeze = Number(localStorage.getItem('pahlawan_up_freeze')) || 2;
    playerLoadout = await getLoadout();
    const todayKey = getTodayKey();
    const quotaData = await getReviveQuota(todayKey);
    reviveQuota = quotaData;
    console.log('✅ [Boot] Loadout:', playerLoadout, '| Revive quota:', reviveQuota);
  } catch (e) {
    console.warn('⚠️ [Boot] Async init partial failure (UI tetap jalan):', e);
  }
  try {
    initStarfield();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.value = playerName;
    updateActorSelectionUI();
    updateShopUI();
    updateAudioButtonUI();
    updateReviveQuotaUI();
  } catch (e) { console.error('❌ [Boot] UI init error:', e); }
  try {
    await loadGameData();
    console.log('✅ [Boot] Level data loaded:', levelsData.length, 'levels');
  } catch (e) {
    console.warn('⚠️ [Boot] loadGameData fail:', e);
    levelsData = generate30Levels();
    stickersData = DEFAULT_STICKERS;
  }
  try { updateStickerAlbumUI(); } catch (e) {}
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=17.0').catch(err => console.log('SW Fail:', err));
  }
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 600);
    }
  }, 900);
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btn-pwa-install');
  if (btn) btn.classList.remove('hidden');
});

function initStarfield() {
  stars = [];
  const starCount = 90;
  const colors = currentTheme.stars || ['#ffffff'];
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() * Math.PI * 2
    });
  }
}
function recolorStars() {
  const colors = currentTheme.stars;
  stars.forEach(s => { s.color = colors[Math.floor(Math.random() * colors.length)]; });
}
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (playerX === 0 || playerX > canvas.width) playerX = canvas.width / 2;
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
    console.warn('Pakai bawaan.');
    levelsData = generate30Levels();
    stickersData = DEFAULT_STICKERS;
  }
}
function updateAudioButtonUI() {
  const btn = document.getElementById('btn-audio');
  if (!btn) return;
  btn.innerHTML = sounds.isMuted
    ? '<svg class="ico" viewBox="0 0 24 24"><use href="#i-sound-off"/></svg>'
    : '<svg class="ico" viewBox="0 0 24 24"><use href="#i-sound-on"/></svg>';
  btn.classList.toggle('muted', sounds.isMuted);
}
function updateReviveQuotaUI() {
  const el = document.getElementById('revive-quota');
  if (el) el.innerText = reviveQuota;
}

// =============================================================
// 10. HELPERS — Daily / Revive
// =============================================================
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${dd}`;
}
function getDailySeed() {
  const k = getTodayKey();
  let n = 0;
  for (let i = 0; i < k.length; i++) n = (n * 31 + k.charCodeAt(i)) % 1000000;
  return n;
}
function getDailyModifier() {
  const seed = getDailySeed();
  return DAILY_MODIFIERS[seed % DAILY_MODIFIERS.length];
}
function getDailyLevel() {
  const seed = getDailySeed();
  // Level 1-30 tapi non-boss
  const lvl = (seed % 29) + 1; // 1-29
  return lvl;
}
function secondsUntilMidnight() {
  const now = new Date();
  const mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((mid - now) / 1000));
}
function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

async function getReviveQuota(todayKey) {
  const raw = await DB.get('pahlawan_revive_quota');
  try {
    const data = JSON.parse(raw || '{}');
    if (data.date === todayKey) return Number(data.count) || 0;
    return 3;
  } catch(e) { return 3; }
}
async function saveReviveQuota(todayKey, count) {
  await DB.set('pahlawan_revive_quota', JSON.stringify({ date: todayKey, count: count }));
}

async function getEndlessBest() {
  const raw = await DB.get('pahlawan_endless_best');
  try { return JSON.parse(raw || '{"wave":0,"score":0}'); } catch(e) { return {wave:0,score:0}; }
}
async function setEndlessBest(wave, scoreVal) {
  const best = await getEndlessBest();
  if (wave > best.wave || (wave === best.wave && scoreVal > best.score)) {
    await DB.set('pahlawan_endless_best', JSON.stringify({ wave: wave, score: scoreVal }));
  }
}

// =============================================================
// 11. EVENT LISTENERS
// =============================================================
function setupEventListeners() {
  const $ = id => document.getElementById(id);

  // --- MULAI MISI ---
  const btnPlay = $('btn-prepare-play');
  if (btnPlay) {
    btnPlay.onclick = (e) => {
      e.preventDefault();
      console.log('▶ [Click] MULAI MISI');
      try { requestFullscreenAndLandscape(); } catch (err) {}
      try { startGame(); } catch (err) { console.error('startGame error:', err); }
    };
  }

  // --- HERO ---
  const bActor = $('btn-select-actor'); if (bActor) bActor.onclick = () => $('modal-actors').classList.remove('hidden');
  const bCloseActors = $('btn-close-actors'); if (bCloseActors) bCloseActors.onclick = () => $('modal-actors').classList.add('hidden');

  // --- TOKO ---
  const bShop = $('btn-shop'); if (bShop) bShop.onclick = () => { updateShopUI(); $('modal-shop').classList.remove('hidden'); };
  const bCloseShop = $('btn-close-shop'); if (bCloseShop) bCloseShop.onclick = () => $('modal-shop').classList.add('hidden');

  // --- LEADERBOARD ---
  const bLB = $('btn-leaderboard'); if (bLB) bLB.onclick = openLeaderboard;
  const bCloseLB = $('btn-close-leaderboard');
  if (bCloseLB) bCloseLB.onclick = () => {
    $('modal-leaderboard').classList.add('hidden');
    if (leaderboardRef && leaderboardHandler) {
      try { leaderboardRef.off('value', leaderboardHandler); } catch(e) {}
      leaderboardRef = null; leaderboardHandler = null;
    }
  };
  document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLeaderboardTab = tab.dataset.tab || 'global';
      loadLeaderboardData();
    };
  });

  // --- STICKER ---
  const bStick = $('btn-stickers'); if (bStick) bStick.onclick = openStickerAlbum;
  const bCloseStick = $('btn-close-stickers'); if (bCloseStick) bCloseStick.onclick = () => $('modal-stickers').classList.add('hidden');

  // --- PAUSE ---
  const bPause = $('btn-pause'); if (bPause) bPause.onclick = pauseGame;
  const bResume = $('btn-resume-game'); if (bResume) bResume.onclick = resumeGame;
  const bPHero = $('btn-pause-change-hero'); if (bPHero) bPHero.onclick = () => $('modal-actors').classList.remove('hidden');
  const bPLB = $('btn-pause-leaderboard'); if (bPLB) bPLB.onclick = () => openLeaderboard();
  const bPMain = $('btn-pause-main-menu');
  if (bPMain) bPMain.onclick = () => {
    $('modal-pause').classList.add('hidden');
    $('hud-overlay').classList.add('hidden');
    $('screen-main-menu').classList.remove('hidden');
    sounds.stopBGM();
    isGameRunning = false; isGamePaused = false;
    applyThemeToDocument(LEVEL_THEMES[0]);
  };

  // --- UPGRADES ---
  const bFR = $('btn-buy-firerate'); if (bFR) bFR.onclick = () => buyUpgrade('firerate');
  const bSH = $('btn-buy-shield');   if (bSH) bSH.onclick = () => buyUpgrade('shield');
  const bBB = $('btn-buy-bomb');     if (bBB) bBB.onclick = () => buyUpgrade('bomb');
  const bFZ = $('btn-buy-freeze');   if (bFZ) bFZ.onclick = () => buyUpgrade('freeze');

  // --- ACTOR CARDS ---
  document.querySelectorAll('.actor-card').forEach(card => {
    card.onclick = () => {
      document.querySelectorAll('.actor-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentActor = card.dataset.actor;
      DB.set('pahlawan_actor', currentActor);
      updateActorSelectionUI();
    };
  });

  // --- AUDIO ---
  const bAudio = $('btn-audio');
  if (bAudio) bAudio.onclick = () => {
    sounds.isMuted = !sounds.isMuted;
    if (!sounds.isMuted) sounds.init();
    updateAudioButtonUI();
  };

  // --- PWA INSTALL ---
  const btnInstall = $('btn-pwa-install');
  if (btnInstall) {
    btnInstall.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (e) {}
      deferredPrompt = null;
      btnInstall.classList.add('hidden');
    };
  }

  // --- MOVEMENT ---
  const btnLeft = $('btn-move-left');
  const btnRight = $('btn-move-right');
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
  if (canvas) {
    canvas.addEventListener('pointermove', (e) => {
      if (!isGameRunning || isGamePaused) return;
      if (e.buttons > 0 || e.pointerType === 'touch') {
        const rect = canvas.getBoundingClientRect();
        playerX = e.clientX - rect.left;
      }
    });
  }

  // --- NEXT / RESTART / MENU ---
  const bNext = $('btn-next-level');
  if (bNext) bNext.onclick = () => {
    $('modal-result').classList.add('hidden');
    if (gameMode !== 'normal') { goToMainMenu(); return; }
    currentLevelIndex++;
    if (currentLevelIndex >= levelsData.length) { restartGame(); return; }
    lives = 3;
    reviveUsedThisRun = false;
    updateLivesDisplay();
    startCurrentLevel();
  };
  const bRestart = $('btn-restart');
  if (bRestart) bRestart.onclick = () => {
    $('modal-result').classList.add('hidden');
    if (gameMode === 'endless') startEndless();
    else if (gameMode === 'daily') startDaily();
    else restartGame();
  };
  const bMenu = $('btn-menu');
  if (bMenu) bMenu.onclick = () => {
    $('modal-result').classList.add('hidden');
    goToMainMenu();
  };

  // --- SKILL: FREEZE ---
  const bFreeze = $('btn-freeze');
  if (bFreeze) bFreeze.onclick = () => {
    if (freezeCharges <= 0 || isFrozen || isGamePaused || !isGameRunning) return;
    freezeCharges--;
    isFrozen = true;
    freezeFramesRemaining = 210;
    sounds.playFreeze();
    triggerVibrate([50, 50, 50]);
    updateSkillButtonsUI();
    spawnFloatingText(canvas.width / 2, canvas.height / 2, 'FREEZE!', currentTheme.accent);
    screenShake = 6;
  };

  // --- SKILL: SHIELD ---
  const bShield = $('btn-shield');
  if (bShield) bShield.onclick = () => {
    if (shieldCharges <= 0 || isShieldActive || isGamePaused || !isGameRunning) return;
    shieldCharges--;
    isShieldActive = true;
    shieldTimer = 300;
    sounds.playShield();
    triggerVibrate([30, 30, 60]);
    updateSkillButtonsUI();
    spawnFloatingText(playerX, canvas.height - 70, 'SHIELD!', '#39ff14');
  };

  // --- SKILL: BOMB ---
  const bBomb = $('btn-bomb');
  if (bBomb) bBomb.onclick = () => {
    if (bombCharges <= 0 || isGamePaused || !isGameRunning) return;
    bombCharges--;
    screenShake = 22;
    sounds.playBomb();
    triggerVibrate([100, 50, 100]);
    updateSkillButtonsUI();

    let totalScoreFromBomb = 0;
    for (let i = monsters.length - 1; i >= 0; i--) {
      let m = monsters[i];
      if (m.type.startsWith('boss')) {
        m.hp -= 50;
        m.hitFlash = 10;
        spawnFloatingText(m.x, m.y, '-50 HP', '#ff4757');
        if (m.hp <= 0) {
          createBurstParticles3D(m.x, m.y, m.color, 40);
          totalScoreFromBomb += (ENEMY_SCORE_TABLE[m.type] || 150) * combo;
          levelKills++;
          handleKillStreak();
          monsters.splice(i, 1);
          monsters.forEach(minion => createBurstParticles3D(minion.x, minion.y, minion.color, 20));
          monsters = [];
          setTimeout(() => onLevelCleared(), 1500);
          break;
        }
      } else {
        createBurstParticles3D(m.x, m.y, m.color, 25);
        totalScoreFromBomb += (ENEMY_SCORE_TABLE[m.type] || 150) * combo;
        levelKills++;
        handleKillStreak();
        monsters.splice(i, 1);
      }
    }
    score += totalScoreFromBomb;
    if (totalScoreFromBomb > 0) {
      spawnFloatingText(canvas.width / 2, canvas.height / 2, `BOOM +${totalScoreFromBomb}`, '#ff4757');
    }
    updateHUDValues();
    checkLevelObjectives();
  };

  // --- LOADOUT START ---
  const loadoutBtn = $('btn-start-loaded');
  if (loadoutBtn) {
    loadoutBtn.addEventListener('click', async () => {
      if (loadoutCurrentSelection.length !== 2) return;
      playerLoadout = [...loadoutCurrentSelection];
      await setLoadout(playerLoadout);
      $('modal-loadout').classList.add('hidden');
      sounds.playPowerup();
      if (loadoutCallback) { const cb = loadoutCallback; loadoutCallback = null; cb(); }
    });
  }

  // --- REVIVE ---
  const bRevAd = $('btn-revive-ad');
  if (bRevAd) bRevAd.onclick = async () => {
    $('modal-revive').classList.add('hidden');
    sounds.init();
    const success = await AdService.showRewarded();
    if (success) doRevive();
    else finalizeFail();
  };
  const bRevGiveUp = $('btn-revive-give-up');
  if (bRevGiveUp) bRevGiveUp.onclick = () => {
    $('modal-revive').classList.add('hidden');
    finalizeFail();
  };

  // --- ENDLESS ---
  const bEndless = $('btn-endless');
  if (bEndless) bEndless.onclick = openEndlessModal;
  const bStartEndless = $('btn-start-endless');
  if (bStartEndless) bStartEndless.onclick = () => { $('modal-endless').classList.add('hidden'); startEndless(); };
  const bCloseEndless = $('btn-close-endless');
  if (bCloseEndless) bCloseEndless.onclick = () => $('modal-endless').classList.add('hidden');

  // --- DAILY ---
  const bDaily = $('btn-daily');
  if (bDaily) bDaily.onclick = openDailyModal;
  const bStartDaily = $('btn-start-daily');
  if (bStartDaily) bStartDaily.onclick = () => { $('modal-daily').classList.add('hidden'); startDaily(); };
  const bCloseDaily = $('btn-close-daily');
  if (bCloseDaily) bCloseDaily.onclick = () => $('modal-daily').classList.add('hidden');

  // --- NARRATIVE TAP ---
  document.addEventListener('click', (e) => {
    const overlay = $('narrative-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    if (!overlay.contains(e.target) && e.target !== overlay) return;
    if (storyTyping) {
      if (storyTimer) { clearInterval(storyTimer); storyTimer = null; }
      const body = $('story-body');
      if (body) body.textContent = storyCurrentText;
      const caret = overlay.querySelector('.caret');
      if (caret) caret.remove();
      storyTyping = false;
    } else {
      playNextStoryLine();
    }
  }, true);
}

// =============================================================
// 12. THEME + UI
// =============================================================
function applyThemeToDocument(theme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-accent-soft', theme.accentSoft);
}

function updateShopUI() {
  const $ = id => document.getElementById(id);
  const sc = $('shop-coin-count'); if (sc) sc.innerText = coins;
  const lf = $('shop-level-firerate'); if (lf) lf.innerText = upgradeFireRate;
  const ls = $('shop-level-shield'); if (ls) ls.innerText = upgradeShield;
  const lb = $('shop-level-bomb'); if (lb) lb.innerText = upgradeBomb;
  const lz = $('shop-level-freeze'); if (lz) lz.innerText = upgradeFreeze;
  const bf = $('btn-buy-firerate');
  if (bf && bf.querySelector('span')) bf.querySelector('span').innerText = upgradeFireRate >= 5 ? 'MAX' : `${upgradeFireRate * 50}`;
  const bs = $('btn-buy-shield');
  if (bs && bs.querySelector('span')) bs.querySelector('span').innerText = upgradeShield >= 5 ? 'MAX' : `${upgradeShield * 60}`;
  const bb = $('btn-buy-bomb');
  if (bb && bb.querySelector('span')) bb.querySelector('span').innerText = upgradeBomb >= 5 ? 'MAX' : `${upgradeBomb * 75}`;
  const bz = $('btn-buy-freeze');
  if (bz && bz.querySelector('span')) bz.querySelector('span').innerText = upgradeFreeze >= 5 ? 'MAX' : `${upgradeFreeze * 75}`;
}

function buyUpgrade(type) {
  if (type === 'firerate' && upgradeFireRate < 5) {
    let cost = upgradeFireRate * 50;
    if (coins >= cost) { coins -= cost; upgradeFireRate++; DB.set('pahlawan_up_firerate', upgradeFireRate); }
  } else if (type === 'shield' && upgradeShield < 5) {
    let cost = upgradeShield * 60;
    if (coins >= cost) { coins -= cost; upgradeShield++; DB.set('pahlawan_up_shield', upgradeShield); }
  } else if (type === 'bomb' && upgradeBomb < 5) {
    let cost = upgradeBomb * 75;
    if (coins >= cost) { coins -= cost; upgradeBomb++; DB.set('pahlawan_up_bomb', upgradeBomb); }
  } else if (type === 'freeze' && upgradeFreeze < 5) {
    let cost = upgradeFreeze * 75;
    if (coins >= cost) { coins -= cost; upgradeFreeze++; DB.set('pahlawan_up_freeze', upgradeFreeze); }
  }
  DB.set('pahlawan_coins', coins);
  sounds.playCoin();
  updateShopUI();
}

function pauseGame() {
  if (!isGameRunning) return;
  isGamePaused = true;
  sounds.stopBGM();
  const p = document.getElementById('modal-pause');
  if (p) p.classList.remove('hidden');
}
function resumeGame() {
  isGamePaused = false;
  sounds.startBGM();
  const p = document.getElementById('modal-pause');
  if (p) p.classList.add('hidden');
  requestAnimationFrame(gameLoop);
}
function requestFullscreenAndLandscape() {
  try {
    const doc = document.documentElement;
    if (doc.requestFullscreen) doc.requestFullscreen().catch(() => {});
    else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
    if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
  } catch (e) {}
}
function updateActorSelectionUI() {
  const name = actorMap[currentActor] ? actorMap[currentActor].name : 'Robot Cyber';
  const el = document.getElementById('selected-actor-name');
  if (el) el.innerText = name;
  const pauseHero = document.getElementById('pause-hero-name');
  if (pauseHero) pauseHero.innerText = name;
}
function updateSkillButtonsUI() {
  const btnFreeze = document.getElementById('btn-freeze');
  const btnShield = document.getElementById('btn-shield');
  const btnBomb = document.getElementById('btn-bomb');
  if (!btnFreeze || !btnShield || !btnBomb) return;

  const hasFreeze = playerLoadout.includes('freeze');
  const hasShield = playerLoadout.includes('shield');
  const hasBomb = playerLoadout.includes('bomb');

  btnFreeze.style.display = hasFreeze ? 'flex' : 'none';
  btnShield.style.display = hasShield ? 'flex' : 'none';
  btnBomb.style.display = hasBomb ? 'flex' : 'none';

  if (hasFreeze) {
    const fc = document.getElementById('freeze-count');
    if (fc) fc.innerText = freezeCharges;
    btnFreeze.classList.toggle('disabled', freezeCharges <= 0);
  }
  if (hasShield) {
    const sc = document.getElementById('shield-count');
    if (sc) sc.innerText = shieldCharges;
    btnShield.classList.toggle('disabled', shieldCharges <= 0);
  }
  if (hasBomb) {
    const bc = document.getElementById('bomb-count');
    if (bc) bc.innerText = bombCharges;
    btnBomb.classList.toggle('disabled', bombCharges <= 0);
  }
}

function goToMainMenu() {
  const hud = document.getElementById('hud-overlay');
  if (hud) hud.classList.add('hidden');
  const menu = document.getElementById('screen-main-menu');
  if (menu) menu.classList.remove('hidden');
  sounds.stopBGM();
  isGameRunning = false;
  isGamePaused = false;
  applyThemeToDocument(LEVEL_THEMES[0]);
  gameMode = 'normal';
}

// =============================================================
// 13. GAME FLOW — normal / endless / daily
// =============================================================
function startGame() {
  console.log('▶ [startGame] normal mode');
  sounds.init();
  const input = document.getElementById('player-name-input');
  const inputName = input ? input.value.trim() : '';
  playerName = inputName || 'Pahlawan';
  DB.set('pahlawan_nama', playerName);
  const pnd = document.getElementById('player-name-display');
  if (pnd) pnd.innerText = playerName;

  gameMode = 'normal';
  currentLevelIndex = 0;
  score = 0;
  lives = 3;
  reviveUsedThisRun = false;
  coins = Number(localStorage.getItem('pahlawan_coins')) || 0;

  if (!levelsData || levelsData.length === 0) levelsData = generate30Levels();

  const mainMenu = document.getElementById('screen-main-menu');
  const hud = document.getElementById('hud-overlay');
  if (mainMenu) mainMenu.classList.add('hidden');
  if (hud) hud.classList.remove('hidden');

  resizeCanvas();
  setTimeout(() => { resizeCanvas(); startCurrentLevel(); }, 60);
}

function restartGame() {
  currentLevelIndex = 0;
  score = 0;
  lives = 3;
  reviveUsedThisRun = false;
  coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
  updateHUDValues();
  updateLivesDisplay();
  startCurrentLevel();
}

function showLevelIntro(levelConfig) {
  const banner = document.getElementById('level-intro');
  if (!banner) return;
  const numStr = String(levelConfig.level).padStart(2, '0');
  const numEl = document.getElementById('level-intro-number'); if (numEl) numEl.innerText = numStr;
  const nameEl = document.getElementById('level-intro-name'); if (nameEl) nameEl.innerText = currentTheme.name;
  const misEl = document.getElementById('level-intro-mission');
  if (misEl) misEl.innerText = levelConfig.algorithm.startsWith('boss_')
    ? 'DEFEAT THE BOSS'
    : `${levelConfig.targetKills} KILLS · TARGET ${levelConfig.targetScore}`;
  banner.classList.remove('hidden');
  banner.classList.remove('fade-out');
  void banner.offsetWidth;
  sounds.playLevelIntro();
  setTimeout(() => {
    banner.classList.add('fade-out');
    setTimeout(() => banner.classList.add('hidden'), 500);
  }, 1800);
}

async function startCurrentLevel() {
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  currentTheme = getThemeForLevel(levelConfig.level);
  applyThemeToDocument(currentTheme);
  recolorStars();

  resetLevelState();
  updateHUDValues();
  updateLivesDisplay();

  isGameRunning = false;
  isGamePaused = false;

  const story = STORY[levelConfig.level];
  const storyKey = 'story_seen_' + levelConfig.level;
  let alreadySawStory = null;
  try { alreadySawStory = await DB.get(storyKey); } catch(e) {}
  const runStory = story && story.before && !alreadySawStory;

  const proceed = () => {
    if (runStory) DB.set(storyKey, '1');
    showLoadoutModal(levelConfig, () => actuallyStartLevel(levelConfig));
  };
  if (runStory) {
    showNarrative(story.before.lines, story.before.speaker, story.before.portrait, proceed);
  } else {
    proceed();
  }
}

function resetLevelState() {
  levelKills = 0;
  levelCoinsEarned = 0;
  playerX = canvas.width / 2;
  bullets = []; bossBullets = []; powerups = [];
  coinsOnField = []; muzzleFlashes = []; telegraphs = [];
  combo = 1; comboTimer = 0;
  killStreakCount = 0; killStreakMilestone = 0;
  isSuperShot = false; superShotTimer = 0;
  isShieldActive = false; shieldTimer = 0;
  isMagnetActive = false; magnetTimer = 0;
  isFrozen = false; freezeFramesRemaining = 0;
  isReviveInvuln = false; reviveInvulnTimer = 0;
  monsters = []; particles = [];
}

function actuallyStartLevel(levelConfig) {
  freezeCharges = playerLoadout.includes('freeze') ? upgradeFreeze : 0;
  shieldCharges = playerLoadout.includes('shield') ? upgradeShield : 0;
  bombCharges   = playerLoadout.includes('bomb') ? upgradeBomb : 0;
  if (gameMode === 'daily' && currentDailyModifier && currentDailyModifier.id === 'no_shield') {
    shieldCharges = 0;
  }
  updateSkillButtonsUI();

  isGameRunning = true;
  isGamePaused = false;

  showLevelIntro(levelConfig);
  sounds.startBGM();
  spawnMonsterLoop();
  gameLoop();
}

function updateHUDValues() {
  const $ = id => document.getElementById(id);
  let levelNum = 1, targetKills = 0;
  if (gameMode === 'endless') {
    levelNum = endlessWave;
    targetKills = ENDLESS_KILLS_PER_WAVE;
    const hl = $('hud-level'); if (hl) hl.innerText = '∞' + levelNum;
    const hm = $('hud-mission'); if (hm) hm.innerText = `${endlessKillsThisWave}/${targetKills}`;
  } else if (gameMode === 'daily') {
    const lvl = getDailyLevel();
    levelNum = lvl;
    const levelConfig = levelsData[levelNum - 1] || levelsData[0];
    targetKills = levelConfig.targetKills;
    const hl = $('hud-level'); if (hl) hl.innerText = '★' + lvl;
    const hm = $('hud-mission'); if (hm) hm.innerText = `${levelKills}/${targetKills}`;
  } else {
    const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
    levelNum = levelConfig.level;
    targetKills = levelConfig.targetKills;
    const hl = $('hud-level'); if (hl) hl.innerText = levelNum;
    const hm = $('hud-mission'); if (hm) hm.innerText = `${levelKills}/${targetKills}`;
  }
  const hs = $('hud-score'); if (hs) hs.innerText = score;
  const hc = $('hud-coins'); if (hc) hc.innerText = coins;
  const comboPill = $('hud-combo-pill');
  if (comboPill) {
    if (combo > 1) {
      comboPill.classList.remove('hidden');
      const ct = $('hud-combo-text');
      if (ct) ct.innerText = `${combo}x COMBO`;
    } else comboPill.classList.add('hidden');
  }
}

function updateLivesDisplay() {
  const container = document.getElementById('hud-lives');
  if (!container) return;
  let html = '';
  for (let i = 0; i < lives; i++) {
    html += `<svg class="heart-icon" viewBox="0 0 24 24"><use href="#i-heart"/></svg>`;
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

// =============================================================
// 14. SPAWNING — adaptif untuk normal/endless/daily
// =============================================================
function spawnMonsterLoop() {
  if (!isGameRunning) return;
  if (!isGamePaused && !isFrozen) {
    let levelConfig;
    let spawnMultiplier = 1;
    if (gameMode === 'endless') {
      const baseLevel = 1 + (endlessWave - 1) * 0.3;
      const typesPool = ["jelly","donut","cloud","crystal","splitter"];
      const count = Math.min(5, Math.floor(1 + endlessWave / 3) + 1);
      const algos = ["linear","zigzag","gravity","stealth","swarm","splitter"];
      levelConfig = {
        level: 999,
        targetKills: ENDLESS_KILLS_PER_WAVE,
        speed: 1 + endlessWave * 0.08,
        spawnRate: Math.max(300, 1200 - endlessWave * 40),
        algorithm: algos[endlessWave % algos.length],
        types: typesPool.slice(0, count)
      };
      if (endlessWave > 0 && endlessWave % 5 === 0) {
        // boss wave
        const bossLevel = Math.min(30, Math.ceil(endlessWave / 5) * 5);
        levelConfig.algorithm = `boss_${bossLevel}`;
        levelConfig.types = [`boss${bossLevel}`];
        levelConfig.bossHp = Math.floor((levelConfig.bossHp || 150) * (1 + endlessWave * 0.5));
      }
    } else if (gameMode === 'daily') {
      const lvl = getDailyLevel();
      const base = levelsData[lvl - 1] || levelsData[0];
      levelConfig = { ...base };
      if (currentDailyModifier) {
        if (currentDailyModifier.id === 'double_speed') levelConfig.speed = (levelConfig.speed || 1) * 2;
        if (currentDailyModifier.id === 'double_monster') spawnMultiplier = 2;
      }
    } else {
      levelConfig = levelsData[currentLevelIndex] || levelsData[0];
    }
    if (levelConfig) {
      const algo = levelConfig.algorithm;
      const typeList = levelConfig.types || ['jelly'];

      if (algo.startsWith('boss_')) {
        if (monsters.length === 0 && (gameMode !== 'normal' || levelKills < levelConfig.targetKills)) {
          triggerBossSiren();
          const bossNum = parseInt(algo.replace('boss_','')) || 5;
          let hpVal = levelConfig.bossHp || 150;
          if (gameMode === 'endless') hpVal = 150 + endlessWave * 60;
          const bossSize = BOSS_SIZES[bossNum] || 75;
          const isTutorialBoss = (bossNum === 5 && gameMode === 'normal');
          monsters.push({
            x: canvas.width / 2, startX: canvas.width / 2, y: -100,
            speed: 1.0, size: bossSize,
            hp: hpVal, maxHp: hpVal,
            color: currentTheme.accent,
            type: `boss${bossNum}`,
            algorithm: algo,
            shootTimer: 0, minionTimer: 0, enrageTimer: 0,
            timeAlive: 0, opacity: 1,
            hitFlash: 0, aura: 0,
            aimTimer: 0, aimTargetX: 0, aimTargetY: 0,
            coreOpen: false, coreTimer: 0, coreGlow: 0,
            noWeakPoint: isTutorialBoss
          });
        }
      } else {
        let countToSpawn = (algo === 'swarm') ? 2 : 1;
        countToSpawn *= spawnMultiplier;
        for (let c = 0; c < countToSpawn; c++) {
          const chosenType = typeList[Math.floor(Math.random() * typeList.length)];
          const hpVal = (chosenType === 'donut' ? 2 : (chosenType === 'crystal' ? 3 : 1));
          const canShoot = (chosenType === 'crystal');
          monsters.push({
            x: Math.random() * (canvas.width - 120) + 60,
            startX: Math.random() * (canvas.width - 120) + 60,
            y: -60,
            speed: (1.2 + Math.random() * 1.2) * (levelConfig.speed || 1),
            size: (chosenType === 'donut' ? 36 : 30),
            hp: hpVal, maxHp: hpVal,
            color: currentTheme.monsters[Math.floor(Math.random() * currentTheme.monsters.length)],
            type: chosenType, algorithm: algo,
            shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0,
            aimTimer: 0, aimTargetX: 0, aimTargetY: 0,
            canShoot: canShoot,
            shootCooldown: 60 + Math.random() * 120
          });
        }
      }
    }
  }
  let currentRate = 1500;
  if (gameMode === 'endless') currentRate = Math.max(300, 1200 - endlessWave * 40);
  else if (gameMode === 'daily') currentRate = 1200;
  else currentRate = levelsData[currentLevelIndex] ? levelsData[currentLevelIndex].spawnRate : 1500;
  setTimeout(spawnMonsterLoop, currentRate);
}

function trySpawnDrop(x, y) {
  const coinChance = (gameMode === 'endless') ? 0.7 : 0.45;
  if (Math.random() < coinChance) coinsOnField.push({ x, y, vy: 1.8, size: 10, rot: 0, trail: 0 });
  if (Math.random() < 0.32) {
    const types = ['supershot', 'shield', 'bomb', 'freeze', 'heart', 'magnet'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    powerups.push({ x, y, type: chosenType, speed: 2.2, size: 16, rot: 0 });
  }
}
function spawnFloatingText(x, y, text, color) {
  const container = document.getElementById('popup-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.innerText = text;
  el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color;
  container.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
function createBurstParticles3D(x, y, color, count = 20) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14,
      size: Math.random() * 7 + 3,
      life: 1.0, color,
      spin: (Math.random() - 0.5) * 0.4,
      rot: 0, star: Math.random() < 0.35
    });
  }
}
function spawnTelegraph(fromX, fromY, toX, toY, durationFrames, color) {
  telegraphs.push({
    x: fromX, y: fromY, targetX: toX, targetY: toY,
    progress: 0, duration: durationFrames, color: color || '#ff2e88'
  });
}

function handleKillStreak() {
  killStreakCount++;
  const nextIdx = killStreakMilestone;
  if (nextIdx < KILLSTREAK_MILESTONES.length && killStreakCount >= KILLSTREAK_MILESTONES[nextIdx]) {
    killStreakMilestone++;
    showKillStreak(KILLSTREAK_TITLES[nextIdx], KILLSTREAK_MILESTONES[nextIdx]);
  }
}
function showKillStreak(title, count) {
  const overlay = document.getElementById('killstreak-overlay');
  const txt = document.getElementById('killstreak-text');
  const sub = document.getElementById('killstreak-sub');
  if (!overlay || !txt || !sub) return;
  txt.innerText = title;
  sub.innerText = `${count} KILLS`;
  overlay.classList.remove('hidden');
  // retrigger animation
  void overlay.offsetWidth;
  sounds.playKillstreak();
  setTimeout(() => overlay.classList.add('hidden'), 1300);
}

function checkLevelObjectives() {
  if (gameMode === 'endless') {
    if (endlessKillsThisWave >= ENDLESS_KILLS_PER_WAVE && monsters.length === 0) {
      endlessWave++;
      endlessKillsThisWave = 0;
      sounds.playWin();
      spawnFloatingText(canvas.width/2, canvas.height/2, `WAVE ${endlessWave}`, '#ffd700');
      updateHUDValues();
    }
    return;
  }
  if (gameMode === 'daily') {
    const lvl = getDailyLevel();
    const levelConfig = levelsData[lvl - 1] || levelsData[0];
    if (levelKills >= levelConfig.targetKills) {
      if (score >= levelConfig.targetScore) onLevelCleared();
      else onLevelFailed("SKOR BELUM MENCAPAI TARGET");
    }
    return;
  }
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  if (levelConfig.algorithm.startsWith('boss_')) return;
  if (levelKills >= levelConfig.targetKills) {
    if (score >= levelConfig.targetScore) onLevelCleared();
    else onLevelFailed("SKOR BELUM MENCAPAI TARGET");
  }
}

// =============================================================
// 15. DRAW HERO
// =============================================================
function drawHeroVector(ctx, x, y, type) {
  ctx.save();
  ctx.translate(x, y);

  if (type === 'robot') {
    ctx.fillStyle = '#1e90ff'; ctx.fillRect(-18, -10, 36, 28);
    ctx.fillStyle = '#70a1ff'; ctx.fillRect(-12, -26, 24, 16);
    ctx.fillStyle = '#00d2d3'; ctx.fillRect(-8, -22, 16, 6);
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-24, -8, 6, 16); ctx.fillRect(18, -8, 6, 16);
    ctx.fillStyle = '#ff4757';
    ctx.beginPath(); ctx.moveTo(-10, 18); ctx.lineTo(0, 30 + Math.random()*6); ctx.lineTo(10, 18); ctx.fill();
  } else if (type === 'cannon') {
    ctx.fillStyle = '#ff4757';
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(24, 15); ctx.lineTo(-24, 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-16, -18, 5, 20); ctx.fillRect(11, -18, 5, 20);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI*2); ctx.fill();
  } else if (type === 'dragon') {
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(16, 10); ctx.lineTo(28, -5); ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18); ctx.lineTo(-28, -5); ctx.lineTo(-16, 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff4757';
    ctx.fillRect(-7, -12, 4, 4); ctx.fillRect(3, -12, 4, 4);
  } else if (type === 'cat') {
    ctx.fillStyle = '#ffa502';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-8, -24); ctx.lineTo(-2, -12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(8, -24); ctx.lineTo(2, -12); ctx.fill();
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-12, -6, 24, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -4, 4, 4); ctx.fillRect(4, -4, 4, 4);
  } else {
    ctx.fillStyle = '#a55eea';
    ctx.beginPath(); ctx.arc(0, 2, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(5, -12); ctx.lineTo(-5, -12); ctx.closePath(); ctx.fill();
  }

  if (isShieldActive || isReviveInvuln) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + playerPulse * 0.05;
      const px = Math.cos(a) * 38, py = Math.sin(a) * 38 - 2;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = isReviveInvuln ? 'rgba(255, 215, 0, 0.25)' : 'rgba(0, 210, 211, 0.18)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isReviveInvuln ? '#ffd700' : '#00d2d3';
    ctx.stroke();
    ctx.restore();
  }
  if (isMagnetActive) {
    ctx.beginPath(); ctx.arc(0, -2, 42, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffa502'; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]); ctx.lineDashOffset = -playerPulse;
    ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  }
  ctx.restore();
}

// =============================================================
// 16. GAME LOOP
// =============================================================
function gameLoop() {
  if (!isGameRunning || isGamePaused) return;
  if (!ctx || !canvas) return;

  playerPulse += 0.08;
  const theme = currentTheme;

  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    screenShake *= 0.88;
    if (screenShake < 0.5) screenShake = 0;
  }

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, theme.bgTop);
  bgGrad.addColorStop(1, theme.bgBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  stars.forEach(s => {
    s.y += s.speed; s.twinkle += 0.05;
    if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
    const alpha = s.opacity * (0.7 + Math.sin(s.twinkle) * 0.3);
    ctx.fillStyle = s.color; ctx.globalAlpha = alpha;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
  ctx.globalAlpha = 1.0;

  // Ground
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = theme.groundLine;
  ctx.globalAlpha = 0.6 + Math.sin(playerPulse * 0.5) * 0.2;
  ctx.fillRect(0, canvas.height - 45, canvas.width, 5);
  ctx.globalAlpha = 1.0;

  // Movement
  if (isMovingLeft) playerX -= playerSpeed;
  if (isMovingRight) playerX += playerSpeed;
  playerX = Math.max(40, Math.min(canvas.width - 40, playerX));

  // Timers
  if (isSuperShot) { superShotTimer--; if (superShotTimer <= 0) isSuperShot = false; }
  if (isShieldActive) { shieldTimer--; if (shieldTimer <= 0) isShieldActive = false; }
  if (isMagnetActive) { magnetTimer--; if (magnetTimer <= 0) isMagnetActive = false; }
  if (isReviveInvuln) { reviveInvulnTimer--; if (reviveInvulnTimer <= 0) isReviveInvuln = false; }
  if (isFrozen) { freezeFramesRemaining--; if (freezeFramesRemaining <= 0) { isFrozen = false; freezeFramesRemaining = 0; } }
  if (combo > 1) { comboTimer--; if (comboTimer <= 0) { combo = 1; updateHUDValues(); } }

  // Shooting
  let baseInterval = 160;
  if (currentActor === 'cat') baseInterval = 110;
  else if (currentActor === 'cannon') baseInterval = 210;
  const fireInterval = Math.max(70, baseInterval - (upgradeFireRate - 1) * 15);
  const now = Date.now();
  const heroPlayerY = canvas.height - 45;

  if (now - lastShotTime > fireInterval) {
    if (isSuperShot) {
      bullets.push({ x: playerX - 16, y: canvas.height - 65, vx: -2.5, vy: 12, color: '#00d2d3', heroType: currentActor, size: 7, pierce: 1 });
      bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#ffd700', heroType: currentActor, size: 8, pierce: 1 });
      bullets.push({ x: playerX + 16, y: canvas.height - 65, vx: 2.5, vy: 12, color: '#00d2d3', heroType: currentActor, size: 7, pierce: 1 });
    } else {
      if (currentActor === 'robot') {
        bullets.push({ x: playerX - 8, y: canvas.height - 65, vx: 0, vy: 14, color: '#1e90ff', heroType: 'robot', size: 5, pierce: 1 });
        bullets.push({ x: playerX + 8, y: canvas.height - 65, vx: 0, vy: 14, color: '#1e90ff', heroType: 'robot', size: 5, pierce: 1 });
      } else if (currentActor === 'cannon') {
        bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 11, color: '#ff4757', heroType: 'cannon', size: 14, pierce: 1 });
      } else if (currentActor === 'dragon') {
        bullets.push({ x: playerX - 10, y: canvas.height - 65, vx: -2.0, vy: 12, color: '#2ed573', heroType: 'dragon', size: 6, pierce: 1 });
        bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#2ed573', heroType: 'dragon', size: 7, pierce: 1 });
        bullets.push({ x: playerX + 10, y: canvas.height - 65, vx: 2.0, vy: 12, color: '#2ed573', heroType: 'dragon', size: 6, pierce: 1 });
      } else if (currentActor === 'cat') {
        bullets.push({ x: playerX, y: canvas.height - 65, vx: (Math.random()-0.5)*1.2, vy: 15, color: '#ffa502', heroType: 'cat', size: 6, pierce: 1, rot: 0 });
      } else if (currentActor === 'unicorn') {
        bullets.push({ x: playerX, y: canvas.height - 65, vx: 0, vy: 13, color: '#a55eea', heroType: 'unicorn', size: 8, pierce: 2 });
      }
    }
    muzzleFlashes.push({ x: playerX, y: canvas.height - 65, radius: 16, opacity: 1.0 });
    sounds.playLaser();
    lastShotTime = now;
  }

  for (let mf = muzzleFlashes.length - 1; mf >= 0; mf--) {
    const flash = muzzleFlashes[mf];
    ctx.beginPath(); ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 0, ${flash.opacity})`; ctx.fill();
    flash.opacity -= 0.25;
    if (flash.opacity <= 0) muzzleFlashes.splice(mf, 1);
  }

  // Telegraphs
  for (let t = telegraphs.length - 1; t >= 0; t--) {
    const tg = telegraphs[t];
    tg.progress++;
    const p = tg.progress / tg.duration;
    const alpha = 0.15 + Math.sin(p * Math.PI) * 0.5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tg.x, tg.y); ctx.lineTo(tg.targetX, tg.targetY);
    ctx.lineWidth = 2 + Math.sin(p * Math.PI * 6) * 0.8;
    ctx.strokeStyle = tg.color;
    ctx.globalAlpha = alpha;
    ctx.setLineDash([6, 4]); ctx.lineDashOffset = -tg.progress * 2;
    ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(tg.targetX, tg.targetY, 6 + Math.sin(p * Math.PI * 8) * 4, 0, Math.PI * 2);
    ctx.strokeStyle = tg.color; ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7; ctx.stroke();
    ctx.restore();
    if (tg.progress >= tg.duration) telegraphs.splice(t, 1);
  }

  // Bullets
  for (let b = bullets.length - 1; b >= 0; b--) {
    const bullet = bullets[b];
    bullet.y -= bullet.vy;
    bullet.x += bullet.vx;
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    if (bullet.heroType === 'cat') {
      bullet.rot = (bullet.rot || 0) + 0.3;
      ctx.rotate(bullet.rot);
      ctx.fillStyle = bullet.color;
      ctx.fillRect(-6, -2, 12, 4); ctx.fillRect(-2, -6, 4, 12);
    } else if (bullet.heroType === 'cannon') {
      ctx.beginPath(); ctx.arc(0, 0, bullet.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#ff4757'; ctx.stroke();
    } else if (bullet.heroType === 'unicorn') {
      ctx.fillStyle = '#a55eea';
      ctx.beginPath(); ctx.arc(0, 0, bullet.size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, bullet.size * 0.4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -10);
      ctx.lineWidth = bullet.size; ctx.strokeStyle = bullet.color; ctx.stroke();
    }
    ctx.restore();

    if (bullet.y < -20 || bullet.x < -20 || bullet.x > canvas.width + 20) {
      bullets.splice(b, 1); continue;
    }

    let bulletConsumed = false;
    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      const dist = Math.hypot(m.x - bullet.x, m.y - bullet.y);
      if (dist < m.size + bullet.size + 4) {
        bullet.pierce--;
        if (bullet.pierce <= 0) { bullets.splice(b, 1); bulletConsumed = true; }

        let damage = 1;
        const isBossType = m.type.startsWith('boss');
        if (isBossType && !m.noWeakPoint) {
          damage = m.coreOpen ? 3 : 0.34;
          if (m.coreOpen) {
            spawnFloatingText(m.x, m.y - 30, 'CRIT!', '#ffd700');
            sounds.playCombo();
          }
        }
        m.hp -= damage;
        m.hitFlash = 8;
        sounds.playPop();
        triggerVibrate(20);

        if (m.hp <= 0) {
          createBurstParticles3D(m.x, m.y, m.color, 25);
          trySpawnDrop(m.x, m.y);
          let isBoss = m.type.startsWith('boss');
          let basePoints = ENEMY_SCORE_TABLE[m.type] || 150;
          let pointsGained = basePoints * combo;
          if (gameMode === 'endless') pointsGained = Math.floor(pointsGained * 1.5);
          score += pointsGained;
          levelKills++;
          if (gameMode === 'endless') endlessKillsThisWave++;
          handleKillStreak();

          combo = Math.min(MAX_COMBO, combo + 1);
          comboTimer = 180;
          sounds.playCombo();
          spawnFloatingText(m.x, m.y, `+${pointsGained}`, '#ffd700');

          if (m.algorithm === 'splitter' && m.size > 22) {
            monsters.push(
              { x: m.x - 20, startX: m.x - 20, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false },
              { x: m.x + 20, startX: m.x + 20, y: m.y, speed: m.speed * 1.25, size: 22, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false }
            );
          }
          monsters.splice(i, 1);
          updateHUDValues();
          if (isBoss) {
            monsters.forEach(minion => createBurstParticles3D(minion.x, minion.y, minion.color, 20));
            monsters = [];
            if (gameMode === 'endless') {
              setTimeout(() => {
                endlessWave++;
                endlessKillsThisWave = 0;
                updateHUDValues();
              }, 1500);
            } else {
              setTimeout(() => onLevelCleared(), 1500);
            }
          } else {
            checkLevelObjectives();
          }
        } else {
          spawnFloatingText(m.x, m.y, 'HIT', '#ff4757');
        }
        break;
      }
    }
    if (bulletConsumed) continue;
  }

  // Coins
  const isMagnetPulling = isMagnetActive || (currentActor === 'cat');
  for (let c = coinsOnField.length - 1; c >= 0; c--) {
    const coin = coinsOnField[c];
    coin.trail = (coin.trail || 0) + 1;
    if (isMagnetPulling) {
      let pullRange = isMagnetActive ? 350 : 160;
      let distToPlayer = Math.hypot(playerX - coin.x, heroPlayerY - coin.y);
      if (distToPlayer < pullRange) {
        let angle = Math.atan2(heroPlayerY - coin.y, playerX - coin.x);
        coin.x += Math.cos(angle) * 8.5;
        coin.y += Math.sin(angle) * 8.5;
      } else coin.y += coin.vy;
    } else coin.y += coin.vy;
    coin.rot += 0.1;
    if (coin.trail % 3 === 0) {
      ctx.beginPath(); ctx.arc(coin.x, coin.y + 4, coin.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'; ctx.fill();
    }
    ctx.save(); ctx.translate(coin.x, coin.y); ctx.rotate(coin.rot);
    ctx.beginPath(); ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, coin.size * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();

    const distPlayer = Math.hypot(playerX - coin.x, heroPlayerY - coin.y);
    if (distPlayer < coin.size + 25) {
      const coinMult = (gameMode === 'endless' || gameMode === 'daily') ? 2 : 1;
      coins += coinMult;
      levelCoinsEarned += coinMult;
      DB.set('pahlawan_coins', coins);
      sounds.playCoin();
      triggerVibrate(30);
      spawnFloatingText(coin.x, coin.y, `+${coinMult}`, '#ffd700');
      coinsOnField.splice(c, 1);
      updateHUDValues();
      continue;
    }
    if (coin.y > canvas.height) coinsOnField.splice(c, 1);
  }

  // Powerups
  for (let p = powerups.length - 1; p >= 0; p--) {
    const pw = powerups[p];
    pw.y += pw.speed;
    pw.rot = (pw.rot || 0) + 0.04;
    ctx.save(); ctx.translate(pw.x, pw.y); ctx.rotate(Math.sin(pw.rot) * 0.2);
    ctx.beginPath(); ctx.arc(0, 0, pw.size + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([3, 6]); ctx.lineDashOffset = -playerPulse * 2;
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.beginPath(); ctx.arc(0, 0, pw.size, 0, Math.PI * 2);
    let pwColor = '#00d2d3', pwLabel = 'SS';
    if (pw.type === 'shield') { pwColor = '#1e90ff'; pwLabel = 'SH'; }
    else if (pw.type === 'bomb') { pwColor = '#ff4757'; pwLabel = 'B'; }
    else if (pw.type === 'freeze') { pwColor = '#70a1ff'; pwLabel = 'FR'; }
    else if (pw.type === 'heart') { pwColor = '#ff78ae'; pwLabel = '+'; }
    else if (pw.type === 'magnet') { pwColor = '#ffa502'; pwLabel = 'M'; }
    else { pwColor = '#2ed573'; pwLabel = 'SS'; }
    ctx.fillStyle = pwColor; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff'; ctx.fillText(pwLabel, 0, 0);
    ctx.restore();

    const distPlayer = Math.hypot(playerX - pw.x, heroPlayerY - pw.y);
    if (distPlayer < pw.size + 25) {
      sounds.playPowerup(); triggerVibrate([40, 40]);
      if (pw.type === 'supershot') { isSuperShot = true; superShotTimer = 450; spawnFloatingText(playerX, canvas.height - 70, 'SUPER SHOT', '#2ed573'); }
      else if (pw.type === 'shield') { isShieldActive = true; shieldTimer = 450 + (upgradeShield - 1) * 80; spawnFloatingText(playerX, canvas.height - 70, 'SHIELD', '#00d2d3'); }
      else if (pw.type === 'bomb') { if (playerLoadout.includes('bomb')) { bombCharges = Math.min(upgradeBomb, bombCharges + 1); updateSkillButtonsUI(); } spawnFloatingText(playerX, canvas.height - 70, '+1 BOMB', '#ff4757'); }
      else if (pw.type === 'freeze') { if (playerLoadout.includes('freeze')) { freezeCharges = Math.min(upgradeFreeze, freezeCharges + 1); updateSkillButtonsUI(); } spawnFloatingText(playerX, canvas.height - 70, '+1 FREEZE', '#1e90ff'); }
      else if (pw.type === 'heart') { lives = Math.min(5, lives + 1); updateLivesDisplay(); spawnFloatingText(playerX, canvas.height - 70, '+1 LIFE', '#ff78ae'); }
      else if (pw.type === 'magnet') { isMagnetActive = true; magnetTimer = 420; spawnFloatingText(playerX, canvas.height - 70, 'MAGNET', '#ffa502'); }
      powerups.splice(p, 1);
      continue;
    }
    if (pw.y > canvas.height) powerups.splice(p, 1);
  }

  // Boss bullets
  for (let bb = bossBullets.length - 1; bb >= 0; bb--) {
    const bBullet = bossBullets[bb];
    bBullet.y += bBullet.vy; bBullet.x += bBullet.vx;
    ctx.beginPath(); ctx.arc(bBullet.x, bBullet.y - 6, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 71, 87, 0.4)'; ctx.fill();
    ctx.beginPath(); ctx.arc(bBullet.x, bBullet.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffd700'; ctx.stroke();

    const distHero = Math.hypot(playerX - bBullet.x, heroPlayerY - bBullet.y);
    if (distHero < 30) {
      bossBullets.splice(bb, 1);
      if (isShieldActive || isReviveInvuln) {
        spawnFloatingText(playerX, canvas.height - 60, isReviveInvuln ? 'INVULN' : 'BLOCKED', '#ffd700');
        sounds.playPop();
      } else {
        handlePlayerHit();
        if (!isGameRunning) { ctx.restore(); return; }
      }
      continue;
    }
    if (bBullet.y > canvas.height || bBullet.x < -50 || bBullet.x > canvas.width + 50) {
      bossBullets.splice(bb, 1);
    }
  }

  // Hero aura
  ctx.save();
  const auraAlpha = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
  const auraGrad = ctx.createRadialGradient(playerX, heroPlayerY + 20, 4, playerX, heroPlayerY + 20, 55);
  auraGrad.addColorStop(0, `rgba(0, 210, 255, ${auraAlpha})`);
  auraGrad.addColorStop(1, 'rgba(0, 210, 255, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(playerX, heroPlayerY + 20, 55, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawHeroVector(ctx, playerX, heroPlayerY, currentActor);

  // Monsters
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    m.timeAlive += 0.05;
    m.shootTimer++;
    if (m.hitFlash > 0) m.hitFlash--;
    if (m.minionTimer !== undefined) m.minionTimer++;
    if (m.enrageTimer !== undefined) m.enrageTimer++;
    if (m.aura !== undefined) m.aura += 0.03;

    if (!isFrozen) {
      if (m.algorithm.startsWith('boss_')) {
        m.y = Math.min(100, m.y + m.speed);
        m.x = canvas.width / 2 + Math.sin(m.timeAlive * 2) * 140;

        if (m.aimTimer > 0) {
          m.aimTimer--;
          if (m.aimTimer === 0) {
            const dx = m.aimTargetX - m.x;
            const dy = m.aimTargetY - m.y;
            const len = Math.hypot(dx, dy) || 1;
            bossBullets.push({ x: m.x, y: m.y + m.size, vx: (dx/len)*7, vy: (dy/len)*7 });
            bossBullets.push({ x: m.x - 20, y: m.y + m.size, vx: -1.5, vy: 6 });
            bossBullets.push({ x: m.x + 20, y: m.y + m.size, vx: 1.5, vy: 6 });
            sounds.playBossShoot();
            m.shootTimer = 0;
          }
        } else if (m.shootTimer > 60) {
          m.aimTimer = 36;
          m.aimTargetX = playerX; m.aimTargetY = heroPlayerY;
          spawnTelegraph(m.x, m.y + m.size, playerX, heroPlayerY, 36, '#ff2e88');
        }

        if (m.minionTimer > 300) {
          m.minionTimer = 0;
          monsters.push(
            { x: m.x - 60, startX: m.x - 60, y: m.y + 40, speed: 1.5, size: 28, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false },
            { x: m.x + 60, startX: m.x + 60, y: m.y + 40, speed: 1.5, size: 28, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false }
          );
          spawnFloatingText(m.x, m.y + 60, 'SUMMON!', '#ff4757');
        }

        if (m.type === 'boss30' && m.enrageTimer > 900) {
          m.enrageTimer = 0;
          let healVal = Math.floor(m.maxHp * 0.10);
          m.hp = Math.min(m.maxHp, m.hp + healVal);
          screenShake = 15;
          sounds.playBossWarning();
          spawnFloatingText(m.x, m.y - 20, `REGEN +${healVal}`, '#2ed573');
        }

        if (!m.noWeakPoint) {
          m.coreTimer++;
          const cycle = 180, openDur = 60;
          const wasOpen = m.coreOpen;
          m.coreOpen = (m.coreTimer % cycle) < openDur;
          if (m.coreOpen && !wasOpen) m.coreGlow = 0;
          if (m.coreOpen) m.coreGlow = (m.coreGlow || 0) + 0.15;
        }
      } else {
        switch (m.algorithm) {
          case 'zigzag': m.y += m.speed; m.x = m.startX + Math.sin(m.timeAlive * 3) * 65; break;
          case 'gravity': m.speed += 0.04; m.y += m.speed; break;
          case 'stealth': m.y += m.speed; m.opacity = 0.3 + Math.abs(Math.sin(m.timeAlive * 2)) * 0.7; break;
          default: m.y += m.speed; break;
        }
        if (m.canShoot) {
          if (m.aimTimer > 0) {
            m.aimTimer--;
            if (m.aimTimer === 0) {
              const dx = m.aimTargetX - m.x;
              const dy = m.aimTargetY - m.y;
              const len = Math.hypot(dx, dy) || 1;
              bossBullets.push({ x: m.x, y: m.y + m.size, vx: (dx/len)*5, vy: (dy/len)*5 });
              sounds.playBossShoot();
              m.shootCooldown = 180 + Math.random() * 60;
            }
          } else {
            m.shootCooldown--;
            if (m.shootCooldown <= 0 && m.y > 40 && m.y < canvas.height - 100) {
              m.aimTimer = 30;
              m.aimTargetX = playerX; m.aimTargetY = heroPlayerY;
              spawnTelegraph(m.x, m.y + m.size, playerX, heroPlayerY, 30, '#00d2d3');
            }
          }
        }
      }
    }

    // Draw
    ctx.save();
    ctx.globalAlpha = m.opacity || 1.0;
    ctx.beginPath();
    ctx.ellipse(m.x, canvas.height - 38, m.size * 0.7, m.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    ctx.translate(m.x, m.y);

    if (m.type.startsWith('boss')) {
      ctx.save();
      ctx.rotate((m.aura || 0));
      ctx.beginPath();
      ctx.arc(0, 0, m.size + 15, 0, Math.PI * 2);
      ctx.setLineDash([10, 14]); ctx.lineWidth = 4;
      ctx.strokeStyle = currentTheme.accent;
      ctx.globalAlpha = 0.55; ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.save();
      ctx.rotate(-(m.aura || 0) * 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, m.size + 28, 0, Math.PI * 2);
      ctx.setLineDash([4, 18]); ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffd700';
      ctx.globalAlpha = 0.45; ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.globalAlpha = m.opacity || 1.0;
    }

    if (m.type.startsWith('boss')) {
      const bossGrad = ctx.createRadialGradient(0, 0, m.size * 0.2, 0, 0, m.size);
      bossGrad.addColorStop(0, '#ffffff');
      bossGrad.addColorStop(0.4, m.color);
      bossGrad.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI * 2);
      ctx.fillStyle = bossGrad; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#ffd700'; ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-30, -m.size); ctx.lineTo(-15, -m.size - 25); ctx.lineTo(0, -m.size - 10);
      ctx.lineTo(15, -m.size - 25); ctx.lineTo(30, -m.size);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-m.size * 0.3, -10, m.size * 0.15, 0, Math.PI*2);
      ctx.arc(m.size * 0.3, -10, m.size * 0.15, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(-m.size * 0.3, -10, m.size * 0.07, 0, Math.PI*2);
      ctx.arc(m.size * 0.3, -10, m.size * 0.07, 0, Math.PI*2);
      ctx.fill();

      if (!m.noWeakPoint) {
        if (m.coreOpen) {
          const pulse = 1 + Math.sin(m.coreGlow || 0) * 0.15;
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, m.size * 0.55 * pulse, 0, Math.PI * 2);
          const coreGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, m.size * 0.55);
          coreGrad.addColorStop(0, 'rgba(255, 50, 50, 0.95)');
          coreGrad.addColorStop(0.5, 'rgba(255, 200, 0, 0.7)');
          coreGrad.addColorStop(1, 'rgba(255, 50, 50, 0)');
          ctx.fillStyle = coreGrad; ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, m.size * 0.6 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
          ctx.globalAlpha = 0.9; ctx.stroke();
          ctx.restore();
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, m.size * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]); ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    } else if (m.type === 'donut') {
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI * 2); ctx.fillStyle = '#fa8231'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size * 0.8, 0, Math.PI * 2); ctx.fillStyle = '#ff78ae'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size * 0.35, 0, Math.PI * 2); ctx.fillStyle = theme.bgTop; ctx.fill();
    } else if (m.type === 'cloud') {
      ctx.fillStyle = '#f1f2f6';
      ctx.beginPath();
      ctx.arc(-12, 0, m.size * 0.6, 0, Math.PI * 2);
      ctx.arc(12, 0, m.size * 0.6, 0, Math.PI * 2);
      ctx.arc(0, -10, m.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (m.type === 'crystal') {
      ctx.beginPath();
      ctx.moveTo(0, -m.size); ctx.lineTo(m.size, 0); ctx.lineTo(0, m.size); ctx.lineTo(-m.size, 0);
      ctx.closePath(); ctx.fillStyle = '#00d2d3'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.stroke();
    } else {
      const radGrad = ctx.createRadialGradient(-m.size * 0.3, -m.size * 0.3, m.size * 0.1, 0, 0, m.size);
      radGrad.addColorStop(0, '#ffffff'); radGrad.addColorStop(0.3, m.color); radGrad.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI * 2);
      ctx.fillStyle = radGrad; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
    }
    if (m.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = (m.hitFlash / 8) * 0.85;
      ctx.beginPath(); ctx.arc(0, 0, m.size * 1.05, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
    }
    if (m.maxHp > 1 && !m.type.startsWith('boss')) {
      let widthBar = m.size * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-widthBar/2, -m.size - 18, widthBar, 8);
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(-widthBar/2, -m.size - 18, (m.hp / m.maxHp) * widthBar, 8);
    }
    ctx.restore();

    // Boss HP bar
    if (m.type.startsWith('boss')) {
      ctx.save();
      let barWidth = Math.min(400, canvas.width * 0.6);
      let barX = (canvas.width - barWidth) / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(barX, 15, barWidth, 18);
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(barX, 15, (Math.max(0, m.hp) / m.maxHp) * barWidth, 18);
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.strokeRect(barX, 15, barWidth, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      const coreStatus = (!m.noWeakPoint) ? (m.coreOpen ? ' [CRITICAL]' : '') : '';
      ctx.fillText(`BOSS HP: ${Math.ceil(Math.max(0, m.hp))} / ${m.maxHp}${coreStatus}`, canvas.width / 2, 29);
      if (!m.noWeakPoint) {
        const wpY = 38;
        const cycle = 180;
        const pos = (m.coreTimer % cycle) / cycle;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, wpY, barWidth, 6);
        ctx.fillStyle = m.coreOpen ? '#ffd700' : '#ff4757';
        ctx.fillRect(barX, wpY, barWidth * pos, 6);
      }
      ctx.restore();
    }

    if (m.y > canvas.height - 55 && !m.type.startsWith('boss')) {
      monsters.splice(i, 1);
      if (isShieldActive || isReviveInvuln) {
        spawnFloatingText(playerX, canvas.height - 60, isReviveInvuln ? 'INVULN' : 'BLOCKED', '#ffd700');
      } else {
        handlePlayerHit();
        if (!isGameRunning) { ctx.restore(); return; }
      }
    }
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.04;
    p.vx *= 0.97; p.vy *= 0.97;
    if (p.rot !== undefined) p.rot += p.spin || 0;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    if (p.star) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
      ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        const a = (Math.PI * 2 / 5) * s - Math.PI / 2;
        const r = p.size * 1.6;
        const x1 = Math.cos(a) * r, y1 = Math.sin(a) * r;
        if (s === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);
        const a2 = a + Math.PI / 5;
        const r2 = p.size * 0.7;
        ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

// =============================================================
// 17. PLAYER HIT / REVIVE / FAIL
// =============================================================
function handlePlayerHit() {
  if (isReviveInvuln) return;
  if (gameMode === 'daily' && currentDailyModifier && currentDailyModifier.id === 'one_life') {
    lives = 0;
  } else {
    lives--;
  }
  combo = 1;
  updateHUDValues();
  sounds.playHit();
  screenShake = 16;
  triggerVibrate([100, 50, 100]);
  updateLivesDisplay();
  spawnFloatingText(playerX, canvas.height - 60, '-1', '#ff4757');
  if (lives <= 0) {
    // Offer revive atau fail
    offerReviveOrFail();
  }
}

async function offerReviveOrFail() {
  isGameRunning = false;
  isGamePaused = false;
  sounds.stopBGM();

  const todayKey = getTodayKey();
  reviveQuota = await getReviveQuota(todayKey);

  if (reviveUsedThisRun || reviveQuota <= 0) {
    finalizeFail();
    return;
  }

  const modal = document.getElementById('modal-revive');
  const quotaEl = document.getElementById('revive-quota');
  if (quotaEl) quotaEl.innerText = reviveQuota;
  if (modal) modal.classList.remove('hidden');
}

async function doRevive() {
  const todayKey = getTodayKey();
  reviveQuota = await getReviveQuota(todayKey);
  reviveQuota = Math.max(0, reviveQuota - 1);
  await saveReviveQuota(todayKey, reviveQuota);
  reviveUsedThisRun = true;

  lives = 1;
  isReviveInvuln = true;
  reviveInvulnTimer = 120; // 2 detik
  updateLivesDisplay();
  updateHUDValues();
  updateReviveQuotaUI();

  // Bersihkan peluru musuh
  bossBullets = [];

  isGameRunning = true;
  isGamePaused = false;
  sounds.startBGM();
  spawnFloatingText(playerX, canvas.height - 70, 'REVIVED!', '#39ff14');
  triggerVibrate([200, 50, 200]);
  requestAnimationFrame(gameLoop);
}

// =============================================================
// 18. LEVEL COMPLETE / FAILED
// =============================================================
function onLevelCleared() {
  if (gameMode === 'endless') { finalizeEndless(); return; }
  if (gameMode === 'daily') { finalizeDaily(true); return; }
  levelComplete();
}

function onLevelFailed(reason) {
  if (gameMode === 'endless') { finalizeEndless(); return; }
  if (gameMode === 'daily') { finalizeDaily(false); return; }
  levelFailed(reason);
}

async function levelComplete() {
  isGameRunning = false;
  isGamePaused = false;
  sounds.stopBGM();
  sounds.playWin();
  triggerVibrate([50, 50, 50, 50, 100]);

  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  unlockSticker(levelConfig.level);
  saveScoreToGlobalLeaderboard(playerName, score, levelConfig.level);

  const stars = (lives === 3 && combo >= 3) ? 3 : (lives === 3 ? 2 : 1);
  try { await setStar(levelConfig.level, stars); } catch(e) {}

  const showResult = () => {
    const $ = id => document.getElementById(id);
    const rt = $('result-title'); if (rt) rt.innerText = "MISI SELESAI";
    const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
    const rs = $('result-score'); if (rs) rs.innerText = score;
    const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
    const rl = $('result-level'); if (rl) rl.innerText = levelConfig.level;
    const rk = $('result-kills'); if (rk) rk.innerText = `${levelKills} Target`;
    const starContainer = $('result-stars');
    if (starContainer) {
      let html = '';
      for (let s = 0; s < 3; s++) {
        html += `<svg class="star-mini ${s < stars ? 'on' : ''}" viewBox="0 0 24 24"><use href="#i-star"/></svg>`;
      }
      starContainer.innerHTML = html;
    }
    const icon = $('result-icon');
    if (icon) { icon.innerHTML = '<use href="#i-trophy"/>'; icon.classList.remove('fail'); }
    const nextBtn = $('btn-next-level');
    if (nextBtn) nextBtn.classList.remove('hidden');
    const modal = $('modal-result');
    if (modal) modal.classList.remove('hidden');
  };

  const story = STORY[levelConfig.level];
  const storyKey = 'story_after_seen_' + levelConfig.level;
  let alreadySawStory = null;
  try { alreadySawStory = await DB.get(storyKey); } catch(e) {}
  if (story && story.after && !alreadySawStory) {
    DB.set(storyKey, '1');
    showNarrative(story.after.lines, story.after.speaker, story.after.portrait, showResult);
  } else {
    showResult();
  }
}

function levelFailed(reasonTitle) {
  isGameRunning = false;
  isGamePaused = false;
  sounds.stopBGM();
  triggerVibrate([200, 100, 200]);

  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  saveScoreToGlobalLeaderboard(playerName, score, levelConfig.level);

  const $ = id => document.getElementById(id);
  const rt = $('result-title'); if (rt) rt.innerText = reasonTitle || "MISI GAGAL";
  const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
  const rs = $('result-score'); if (rs) rs.innerText = score;
  const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
  const rl = $('result-level'); if (rl) rl.innerText = levelConfig.level;
  const rk = $('result-kills'); if (rk) rk.innerText = `${levelKills} Target`;
  const starContainer = $('result-stars');
