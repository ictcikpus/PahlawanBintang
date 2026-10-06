// =============================================================
// PAHLAWAN BINTANG — game.js v18.1
// Responsive Edition + Authoritative Multiplayer Sync
// ------------------------------------------------------------
// Perubahan v18.1:
//   - Host = authoritative (spawn, physics, logic)
//   - Guest = render-only (kirim input, terima state)
//   - Normalized coordinates (0..1) agar sinkron di semua layar
//   - Sync theme, posisi hero host, bullet, monster, boss HP
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
  console.log("🔥 Firebase Realtime Database Terhubung!");
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
  { id:'cosmic', name:'COSMIC SECTOR', bgTop:'#05061a', bgBottom:'#0e1035', accent:'#00d2ff', accentSoft:'rgba(0,210,255,0.35)', stars:['#ffffff','#70a1ff','#ffd700','#00d2d3'], ground:'#2f3640', groundLine:'#00d2ff', monsters:['#ff4757','#2ed573','#ffa502','#1e90ff','#a55eea'] },
  { id:'inferno', name:'BOSS: INFERNO', bgTop:'#1a0505', bgBottom:'#4a0a05', accent:'#ff6b00', accentSoft:'rgba(255,107,0,0.4)', stars:['#ffb142','#ff6b00','#ffd700','#ff3838'], ground:'#2a1010', groundLine:'#ff6b00', monsters:['#ff6b00','#ffb142','#ff3838','#ffd700'] },
  { id:'nebula', name:'NEBULA DEPTHS', bgTop:'#0d0520', bgBottom:'#1f0a3a', accent:'#a55eea', accentSoft:'rgba(165,94,234,0.4)', stars:['#ffffff','#a55eea','#ff2e88','#c3a3ff'], ground:'#26183d', groundLine:'#a55eea', monsters:['#ff2e88','#a55eea','#ff6bcb','#c3a3ff','#8c46d6'] },
  { id:'void', name:'BOSS: VOID', bgTop:'#0a0010', bgBottom:'#2b0033', accent:'#c86bff', accentSoft:'rgba(200,107,255,0.4)', stars:['#c86bff','#ffffff','#7a2bb8','#ff77ff'], ground:'#1c0a24', groundLine:'#c86bff', monsters:['#c86bff','#7a2bb8','#ff77ff','#e0b3ff'] },
  { id:'aurora', name:'AURORA FIELDS', bgTop:'#021a10', bgBottom:'#043328', accent:'#39ff14', accentSoft:'rgba(57,255,20,0.35)', stars:['#ffffff','#39ff14','#00ffaa','#c8ffb0'], ground:'#0e2f1e', groundLine:'#39ff14', monsters:['#39ff14','#00ffaa','#7dff8e','#ffd700','#2ed573'] },
  { id:'cryo', name:'BOSS: CRYO', bgTop:'#021222', bgBottom:'#053a55', accent:'#4de8ff', accentSoft:'rgba(77,232,255,0.4)', stars:['#ffffff','#4de8ff','#70a1ff','#c3f0ff'], ground:'#0d2a3d', groundLine:'#4de8ff', monsters:['#4de8ff','#70a1ff','#ffffff','#a3d8ff'] },
  { id:'magma', name:'MAGMA CORE', bgTop:'#1a0505', bgBottom:'#3a0f00', accent:'#ff3838', accentSoft:'rgba(255,56,56,0.35)', stars:['#ff3838','#ffb142','#ffd700','#ffffff'], ground:'#2a0808', groundLine:'#ff3838', monsters:['#ff3838','#ff6b00','#ffb142','#ffd700'] },
  { id:'titan', name:'BOSS: TITAN', bgTop:'#001a1a', bgBottom:'#004d4d', accent:'#1abc9c', accentSoft:'rgba(26,188,156,0.4)', stars:['#1abc9c','#00ffcc','#ffffff','#a3ffe6'], ground:'#0a2a2a', groundLine:'#1abc9c', monsters:['#1abc9c','#00ffcc','#16a085','#7cffdd'] },
  { id:'gold', name:'GOLDEN VOID', bgTop:'#1a1000', bgBottom:'#3a2800', accent:'#ffd700', accentSoft:'rgba(255,215,0,0.4)', stars:['#ffd700','#ffb142','#ffffff','#ffe680'], ground:'#2a2000', groundLine:'#ffd700', monsters:['#ffd700','#ffb142','#ff8a00','#ffe680','#fff2b0'] },
  { id:'solar', name:'BOSS: SOLAR', bgTop:'#1a0a00', bgBottom:'#5a1e00', accent:'#ffaa00', accentSoft:'rgba(255,170,0,0.45)', stars:['#ffaa00','#ff6600','#ffd700','#ffffff'], ground:'#2e1400', groundLine:'#ffaa00', monsters:['#ffaa00','#ff6600','#ffd700','#ff2200'] },
  { id:'phantom', name:'PHANTOM REALM', bgTop:'#0a0015', bgBottom:'#23003a', accent:'#ff2e88', accentSoft:'rgba(255,46,136,0.4)', stars:['#ff2e88','#a55eea','#ffffff','#ff9ad4'], ground:'#1f0a2a', groundLine:'#ff2e88', monsters:['#ff2e88','#a55eea','#c86bff','#ff9ad4'] },
  { id:'omega', name:'FINAL BOSS: OMEGA', bgTop:'#000000', bgBottom:'#2a0033', accent:'#ff0055', accentSoft:'rgba(255,0,85,0.5)', stars:['#ff0055','#ffd700','#00ffff','#ffffff','#ff00ff'], ground:'#0a0010', groundLine:'#ff0055', monsters:['#ff0055','#ffd700','#00ffff','#ff00ff','#39ff14'] }
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

const BOSS_NAMES = { 5:'INFERNO', 10:'VOID', 15:'CRYO', 20:'TITAN', 25:'SOLAR', 30:'OMEGA' };
function getBossName(n) { return BOSS_NAMES[n] || ('BOSS ' + n); }
function getBossTheme(n) { return getThemeForLevel(n); }
function getBossBaseHp(n) {
  const m = { 5:150, 10:350, 15:600, 20:1000, 25:1500, 30:2500 };
  return m[n] || 150;
}

// =============================================================
// 4. STORY
// =============================================================
const STORY = {
  1:  { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Pahlawan... gelombang Void datang dari Nebula.','Selamatkan 5 sektor. Kita satu-satunya harapan.'] },
        after:{ speaker:'PAHLAWAN', portrait:'i-hero-portrait', lines:['Sektor pertama... aman.'] } },
  3:  { before:{ speaker:'ARIA', portrait:'i-aria', lines:['Aku Dr. Aria. Musuh mulai bervariasi.','Gunakan upgrade di Toko untuk bertahan.'] } },
  5:  { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Peringatan! Bos pertama mendekat.','Fokus ke inti merahnya saat terbuka.'] },
        after:{ speaker:'VEGA', portrait:'i-vega', lines:['Kerja bagus! Namun ini baru permulaan.'] } },
  8:  { before:{ speaker:'RIVAL', portrait:'i-rival', lines:['Kau... masih hidup?','Jangan harap bisa lewat sektorku.'] } },
  10: { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Ini... mantan rekanku.','Dia jatuh ke Void. Kalahkan dia. Bebaskan dia.'] },
        after:{ speaker:'ARIA', portrait:'i-aria', lines:['Aku mendeteksi sinyal aneh. Ada dalang di balik ini.'] } },
  15: { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Bos Cryo. Ciptaan eksperimen kami sendiri.','Maafkan aku, Pahlawan.'] },
        after:{ speaker:'RIVAL', portrait:'i-rival', lines:['Kau kuat. Bergabung denganku, atau hancur.'] } },
  20: { before:{ speaker:'ARIA', portrait:'i-aria', lines:['Titan — penjaga inti galaksi.','Aku percaya padamu.'] },
        after:{ speaker:'VEGA', portrait:'i-vega', lines:['Aria... dia dikorbankan untuk membuka jalan.','Lanjutkan. Demi dia.'] } },
  25: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['Aku adalah Void itu sendiri.','Setiap pahlawan yang kau kalahkan... adalah aku.'] } },
  30: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['Ini akhirnya. Kau vs aku. Takdir atau kehancuran.'] },
        after:{ speaker:'PAHLAWAN', portrait:'i-hero-portrait', lines:['Damai... akhirnya.'] } }
};

// =============================================================
// 5. LEVEL GENERATOR
// =============================================================
function generate30Levels() {
  const levels = [];
  const enemyTypesPool = ["jelly","donut","cloud","crystal","splitter"];
  const algorithmsPool = ["linear","zigzag","gravity","stealth","swarm","splitter"];
  for (let i = 1; i <= 30; i++) {
    if (i % 5 === 0) {
      const hpScale = { 5:150, 10:350, 15:600, 20:1000, 25:1500, 30:2500 };
      levels.push({ level:i, targetKills:1, targetScore:i*2000, speed:1.0, spawnRate:2000,
        algorithm:`boss_${i}`, types:[`boss${i}`], bossHp:hpScale[i]||150 });
    } else {
      const availableTypes = enemyTypesPool.slice(0, Math.min(enemyTypesPool.length, Math.floor(i/3)+1));
      const chosenAlgo = algorithmsPool[(i-1) % algorithmsPool.length];
      levels.push({ level:i, targetKills:10+(i*3), targetScore:i*1500,
        speed:1.0+(i*0.08), spawnRate:Math.max(500, 1500-(i*30)),
        algorithm:chosenAlgo, types:availableTypes });
    }
  }
  return levels;
}
let levelsData = generate30Levels();

const DEFAULT_STICKERS = [
  { id:1, title:"Pahlawan Pemula" }, { id:2, title:"Penembak Jitu" },
  { id:3, title:"Penjelajah Galaksi" }, { id:4, title:"Penakluk Boss 1" },
  { id:5, title:"Master Kombinasi" }, { id:6, title:"Pahlawan Legendaris" }
];
let stickersData = DEFAULT_STICKERS;

const ENEMY_SCORE_TABLE = {
  jelly:100, donut:200, cloud:250, crystal:300, splitter:350,
  boss5:2500, boss10:5000, boss15:7500, boss20:10000, boss25:12500, boss30:20000
};

const DAILY_MODIFIERS = [
  { id:'double_speed', name:'DOUBLE SPEED', desc:'Musuh bergerak 2× lebih cepat', icon:'i-bolt' },
  { id:'no_shield', name:'NO SHIELD', desc:'Skill Shield dimatikan', icon:'i-shield' },
  { id:'one_life', name:'ONE LIFE', desc:'Hanya 1 nyawa', icon:'i-heart' },
  { id:'double_monster', name:'SWARM', desc:'Musuh spawn 2× lebih banyak', icon:'i-target' }
];

const DAILY_BOSS_SEQUENCES = [
  [5, 10, 15], [10, 15, 20], [15, 20, 25], [20, 25, 30], [5, 15, 25], [10, 20, 30]
];

// =============================================================
// 6. SOUND ENGINE
// =============================================================
class SoundEngine {
  constructor() { this.ctx=null; this.isMuted=false; this.bgmTimer=null; this.bgmStep=0; }
  init() {
    try {
      if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; this.ctx = new A(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch(e) {}
  }
  playLaser() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(850,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(120,this.ctx.currentTime+0.05);
    g.gain.setValueAtTime(0.12,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.05);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.05);
  }
  playPowerup() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(300,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200,this.ctx.currentTime+0.2);
    g.gain.setValueAtTime(0.25,this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playCoin() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(987.77,this.ctx.currentTime);
    o.frequency.setValueAtTime(1318.51,this.ctx.currentTime+0.08);
    g.gain.setValueAtTime(0.2,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playHit() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(180,this.ctx.currentTime);
    o.frequency.linearRampToValueAtTime(40,this.ctx.currentTime+0.2);
    g.gain.setValueAtTime(0.3,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playCombo() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(523.25,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1046.50,this.ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.25,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.15);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.15);
  }
  playBossWarning() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(440,this.ctx.currentTime);
    o.frequency.setValueAtTime(880,this.ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.3,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.3);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.3);
  }
  playBossShoot() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(300,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80,this.ctx.currentTime+0.12);
    g.gain.setValueAtTime(0.2,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.12);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.12);
  }
  playPop() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(450,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(900,this.ctx.currentTime+0.08);
    g.gain.setValueAtTime(0.35,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.08);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.08);
  }
  playFreeze() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(950,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(320,this.ctx.currentTime+0.3);
    g.gain.setValueAtTime(0.3,this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.01,this.ctx.currentTime+0.3);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.3);
  }
  playShield() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(600,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1400,this.ctx.currentTime+0.25);
    g.gain.setValueAtTime(0.28,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.28);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.28);
  }
  playBomb() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(220,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(35,this.ctx.currentTime+0.4);
    g.gain.setValueAtTime(0.45,this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.01,this.ctx.currentTime+0.4);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.4);
  }
  playLevelIntro() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    [523.25,659.25,783.99].forEach((f,i)=>{
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='triangle'; o.frequency.setValueAtTime(f,this.ctx.currentTime+i*0.1);
      g.gain.setValueAtTime(0.18,this.ctx.currentTime+i*0.1);
      g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+i*0.1+0.2);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime+i*0.1); o.stop(this.ctx.currentTime+i*0.1+0.2);
    });
  }
  playType() { if (this.isMuted || !this.ctx) return;
    try {
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='square'; o.frequency.value=900+Math.random()*400;
      g.gain.setValueAtTime(0.015,this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.03);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime+0.03);
    } catch(e) {}
  }
  playKillstreak() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    [523.25,659.25,783.99,1046.50].forEach((f,i)=>{
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='triangle'; o.frequency.setValueAtTime(f,this.ctx.currentTime+i*0.05);
      g.gain.setValueAtTime(0.2,this.ctx.currentTime+i*0.05);
      g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+i*0.05+0.15);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime+i*0.05); o.stop(this.ctx.currentTime+i*0.05+0.15);
    });
  }
  playWin() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    [261.63,329.63,392.00,523.25,659.25].forEach((f,i)=>{
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(f,this.ctx.currentTime+i*0.09);
      g.gain.setValueAtTime(0.25,this.ctx.currentTime+i*0.09);
      g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+i*0.09+0.22);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime+i*0.09); o.stop(this.ctx.currentTime+i*0.09+0.22);
    });
  }
  _playTone(freq, dur, type='square', vol=0.05, detune=0) {
    if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,this.ctx.currentTime);
    if (detune) o.detune.setValueAtTime(detune,this.ctx.currentTime);
    g.gain.setValueAtTime(vol,this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+dur);
  }
  _playKick() { if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(150,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40,this.ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.35,this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  _playSnare() { if (!this.ctx) return;
    const bs=this.ctx.sampleRate*0.12;
    const buf=this.ctx.createBuffer(1,bs,this.ctx.sampleRate);
    const d=buf.getChannelData(0);
    for (let i=0;i<bs;i++) d[i]=Math.random()*2-1;
    const s=this.ctx.createBufferSource(); s.buffer=buf;
    const f=this.ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=1200;
    const g=this.ctx.createGain();
    g.gain.setValueAtTime(0.18,this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.12);
    s.connect(f); f.connect(g); g.connect(this.ctx.destination); s.start();
  }
  _playHiHat() { if (!this.ctx) return;
    const bs=this.ctx.sampleRate*0.05;
    const buf=this.ctx.createBuffer(1,bs,this.ctx.sampleRate);
    const d=buf.getChannelData(0);
    for (let i=0;i<bs;i++) d[i]=Math.random()*2-1;
    const s=this.ctx.createBufferSource(); s.buffer=buf;
    const f=this.ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000;
    const g=this.ctx.createGain();
    g.gain.setValueAtTime(0.07,this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.05);
    s.connect(f); f.connect(g); g.connect(this.ctx.destination); s.start();
  }
  startBGM() {
    if (this.bgmTimer) return;
    const bpm=138, stepMs=(60/bpm/4)*1000;
    const bassNotes=[65.41,98.00,110.00,87.31];
    const chordNotes=[[261.63,329.63,392.00,523.25],[392.00,493.88,587.33,783.99],[440.00,523.25,659.25,880.00],[349.23,440.00,523.25,698.46]];
    const melodyPattern=[
      [523.25,null,659.25,null,783.99,null,659.25,null,523.25,null,392.00,null,523.25,null,587.33,null],
      [493.88,null,587.33,null,783.99,null,587.33,null,493.88,null,392.00,null,493.88,null,587.33,null],
      [440.00,null,523.25,null,659.25,null,523.25,null,440.00,null,349.23,null,440.00,null,523.25,null],
      [349.23,null,440.00,null,523.25,null,698.46,null,587.33,null,523.25,null,440.00,null,523.25,587.33]
    ];
    let step=0;
    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !isGameRunning || isGamePaused) { step=0; return; }
      this.init(); if (!this.ctx) return;
      const bar = Math.floor(step/16) % 4;
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

function triggerVibrate(p) { if ('vibrate' in navigator) { try { navigator.vibrate(p); } catch(e) {} } }

// =============================================================
// 7. AD SERVICE
// =============================================================
const AdService = {
  isAvailable: () => true,
  showRewarded: async () => {
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
          setTimeout(() => { overlay.classList.add('hidden'); resolve(true); }, 500);
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
let gameMode = 'normal';

let coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
let upgradeFireRate = Number(localStorage.getItem('pahlawan_up_firerate')) || 1;
let upgradeShield = Number(localStorage.getItem('pahlawan_up_shield')) || 1;
let upgradeBomb = Number(localStorage.getItem('pahlawan_up_bomb')) || 2;
let upgradeFreeze = Number(localStorage.getItem('pahlawan_up_freeze')) || 2;

let combo = 1;
let comboTimer = 0;
const MAX_COMBO = 5;

let killStreakCount = 0;
let killStreakMilestone = 0;
const KILLSTREAK_MILESTONES = [10, 25, 50, 100];
const KILLSTREAK_TITLES = ['KILLING SPREE!', 'RAMPAGE!', 'UNSTOPPABLE!', 'GODLIKE!'];

let reviveUsedThisRun = false;
let reviveQuota = 3;

let playerX = 0;
let playerTargetX = 0;
const PLAYER_LERP = 0.22;
let playerSpeed = 9;
let playerPulse = 0;

let playerHitPoints = 3;
const PLAYER_MAX_HIT_POINTS = 3;
let playerHitFlash = 0;

let bullets = [];
let bossBullets = [];
let powerups = [];
let coinsOnField = [];
let muzzleFlashes = [];
let telegraphs = [];
let lastShotTime = 0;

let isSuperShot = false;
let superShotTimer = 0;
let isMegaShot = false;
let megaShotTimer = 0;

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

let endlessWave = 1;
let endlessKillsThisWave = 0;
const ENDLESS_KILLS_PER_WAVE = 15;

let currentDailyModifier = null;
let currentLeaderboardTab = 'global';

let dailyBossIndex = 0;
let dailyBossSequence = [];
let nextBossSpawnTime = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let deferredPrompt;
let leaderboardRef = null;
let leaderboardHandler = null;

// =============================================================
// RESPONSIVE DIMENSIONS
// =============================================================
const DPR = Math.min(window.devicePixelRatio || 1, 2);
let VIRTUAL_WIDTH  = 0;
let VIRTUAL_HEIGHT = 0;
let GAME_SCALE     = 1;

const actorMap = {
  robot:   { name:'Robot Cyber',     color:'#1e90ff' },
  cannon:  { name:'Meriam Bintang',  color:'#ff4757' },
  dragon:  { name:'Cyber Dragon',    color:'#2ed573' },
  cat:     { name:'Ninja Cat',       color:'#ffa502' },
  unicorn: { name:'Unicorn Star',    color:'#a55eea' }
};

let storyQueue = [];
let storyOnDone = null;
let storyTyping = false;
let storyTimer = null;
let storyCurrentText = '';
let storyCurrentIdx = 0;

let loadoutCurrentSelection = [];
let loadoutCallback = null;

let spawnLoopToken = 0;
let isReviveModalOpen = false;

let lbMigratedThisSession = { global: false, endless: false, daily: false, coop: false };

// =============================================================
// 9. MULTIPLAYER STATE
// =============================================================
let mpSelectedMode = 'coop';
let mpActive = false;
let mpRole = null;
let mpRemoteName = '';
let mpRemoteX = 0;
let mpRemoteTargetX = 0;
let mpRemoteAlive = true;
let mpRemoteScore = 0;
let mpRemoteCombo = 1;
let mpRemoteShootCooldown = 0;
let mpRemoteBulletId = 0;
let mpRemoteHeroType = 'robot';

let mpGuestInput = { left: false, right: false, shoot: false, skill1: false, skill2: false };
let mpGuestX = 0;
let mpGuestTargetX = 0;
let mpGuestHP = 3;
let mpGuestScore = 0;
let mpGuestCombo = 1;
let mpGuestAlive = true;
let mpGuestShootCd = 0;
let mpGuestBullets = [];

let mpRemoteMonsters = [];
let mpRemoteBullets = [];
let mpRemoteHostHP = 3;
let mpRemoteHostScore = 0;

let mpSyncTimer = null;

// =============================================================
// 10. BOOTSTRAP
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
    reviveQuota = await getReviveQuota(todayKey);
  } catch (e) { console.warn('⚠️ [Boot] Async init partial failure:', e); }
  try {
    resizeCanvas();
    updateGameScale();
    initStarfield();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.value = playerName;
    updateActorSelectionUI();
    updateShopUI();
    updateAudioButtonUI();
    updateReviveQuotaUI();
  } catch (e) { console.error('❌ [Boot] UI init error:', e); }
  try {
    await loadGameData();
  } catch (e) {
    levelsData = generate30Levels();
    stickersData = DEFAULT_STICKERS;
  }
  try { updateStickerAlbumUI(); } catch (e) {}
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=18.1').catch(err => console.log('SW Fail:', err));
  }
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) { loader.classList.add('fade-out'); setTimeout(() => loader.remove(), 600); }
  }, 900);
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  const btn = document.getElementById('btn-pwa-install');
  if (btn) btn.classList.remove('hidden');
});

// =============================================================
// RESIZE + DPR HANDLING
// =============================================================
function resizeCanvas() {
  if (!canvas || !ctx) return;

  const cssW = Math.max(1, window.innerWidth);
  const cssH = Math.max(1, Math.floor(window.visualViewport ? window.visualViewport.height : window.innerHeight));

  canvas.width  = Math.floor(cssW * DPR);
  canvas.height = Math.floor(cssH * DPR);

  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const prevW = VIRTUAL_WIDTH;
  const prevH = VIRTUAL_HEIGHT;
  VIRTUAL_WIDTH  = cssW;
  VIRTUAL_HEIGHT = cssH;

  if (playerX === 0 || playerX > VIRTUAL_WIDTH) {
    playerX = VIRTUAL_WIDTH / 2;
    playerTargetX = playerX;
  } else if (prevW > 0 && prevW !== VIRTUAL_WIDTH) {
    const ratio = playerX / prevW;
    playerX = ratio * VIRTUAL_WIDTH;
    playerTargetX = ratio * VIRTUAL_WIDTH;
  }
}

function updateGameScale() {
  const baseW = 360;
  const baseH = 640;
  const scaleW = VIRTUAL_WIDTH  / baseW;
  const scaleH = VIRTUAL_HEIGHT / baseH;
  GAME_SCALE = Math.min(Math.max(Math.min(scaleW, scaleH), 0.75), 1.8);
}

let _resizeRaf = null;
function handleResize() {
  if (_resizeRaf) cancelAnimationFrame(_resizeRaf);
  _resizeRaf = requestAnimationFrame(() => {
    resizeCanvas();
    updateGameScale();
    _resizeRaf = null;
  });
}

function handleOrientationChange() {
  setTimeout(() => {
    resizeCanvas();
    updateGameScale();
    playerX = VIRTUAL_WIDTH / 2;
    playerTargetX = playerX;
    playerSpeed = 9 * GAME_SCALE;
    if (mpActive && mpRole === 'host') {
      mpGuestX = VIRTUAL_WIDTH * 0.75;
      mpGuestTargetX = mpGuestX;
    }
  }, 300);
}

function initStarfield() {
  stars = [];
  const colors = currentTheme.stars || ['#ffffff'];
  const count = Math.floor(Math.min(120, Math.max(60, (VIRTUAL_WIDTH * VIRTUAL_HEIGHT) / 12000)));
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * VIRTUAL_WIDTH,
      y: Math.random() * VIRTUAL_HEIGHT,
      size: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() * Math.PI * 2
    });
  }
}
function recolorStars() {
  if (!stars.length) return;
  stars.forEach(s => { s.color = currentTheme.stars[Math.floor(Math.random() * currentTheme.stars.length)]; });
}
async function loadGameData() {
  try {
    const [rl, rs] = await Promise.all([
      fetch('./levels.json?v=18.1'), fetch('./stickers.json?v=18.1')
    ]);
    if (rl.ok) levelsData = await rl.json();
    if (rs.ok) stickersData = await rs.json();
  } catch (err) { levelsData = generate30Levels(); stickersData = DEFAULT_STICKERS; }
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
// 11. HELPERS
// =============================================================
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}
function getDailySeed() {
  const k = getTodayKey();
  let n = 0;
  for (let i = 0; i < k.length; i++) n = (n * 31 + k.charCodeAt(i)) % 1000000;
  return n;
}
function getDailyModifier() { return DAILY_MODIFIERS[getDailySeed() % DAILY_MODIFIERS.length]; }
function getDailyBossSequence() {
  return DAILY_BOSS_SEQUENCES[getDailySeed() % DAILY_BOSS_SEQUENCES.length].slice();
}
function secondsUntilMidnight() {
  const now = new Date(); const mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((mid - now) / 1000));
}
function formatTime(s) {
  const h = String(Math.floor(s/3600)).padStart(2,'0');
  const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const sec = String(s%60).padStart(2,'0');
  return `${h}:${m}:${sec}`;
}
async function getReviveQuota(k) {
  const raw = await DB.get('pahlawan_revive_quota');
  try {
    const data = JSON.parse(raw || '{}');
    if (data.date === k) return Number(data.count) || 0;
    return 3;
  } catch(e) { return 3; }
}
async function saveReviveQuota(k, c) {
  await DB.set('pahlawan_revive_quota', JSON.stringify({ date: k, count: c }));
}
async function getEndlessBest() {
  const raw = await DB.get('pahlawan_endless_best');
  try { return JSON.parse(raw || '{"wave":0,"score":0}'); } catch(e) { return {wave:0,score:0}; }
}
async function setEndlessBest(wave, s) {
  const best = await getEndlessBest();
  if (wave > best.wave || (wave === best.wave && s > best.score)) {
    await DB.set('pahlawan_endless_best', JSON.stringify({ wave: wave, score: s }));
  }
}

// =============================================================
// 12. EVENT LISTENERS
// =============================================================
function setupEventListeners() {
  const $ = id => document.getElementById(id);

  const btnPlay = $('btn-prepare-play');
  if (btnPlay) btnPlay.onclick = (e) => {
    e.preventDefault();
    try { requestFullscreenAndLandscape(); } catch (err) {}
    try { startGame(); } catch (err) { console.error('startGame error:', err); }
  };

  const bActor = $('btn-select-actor'); if (bActor) bActor.onclick = () => $('modal-actors').classList.remove('hidden');
  const bCloseActors = $('btn-close-actors'); if (bCloseActors) bCloseActors.onclick = () => $('modal-actors').classList.add('hidden');

  const bShop = $('btn-shop'); if (bShop) bShop.onclick = () => { updateShopUI(); $('modal-shop').classList.remove('hidden'); };
  const bCloseShop = $('btn-close-shop'); if (bCloseShop) bCloseShop.onclick = () => $('modal-shop').classList.add('hidden');

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

  const bStick = $('btn-stickers'); if (bStick) bStick.onclick = openStickerAlbum;
  const bCloseStick = $('btn-close-stickers'); if (bCloseStick) bCloseStick.onclick = () => $('modal-stickers').classList.add('hidden');

  const bPause = $('btn-pause'); if (bPause) bPause.onclick = pauseGame;
  const bResume = $('btn-resume-game'); if (bResume) bResume.onclick = resumeGame;
  const bPHero = $('btn-pause-change-hero'); if (bPHero) bPHero.onclick = () => $('modal-actors').classList.remove('hidden');
  const bPLB = $('btn-pause-leaderboard'); if (bPLB) bPLB.onclick = () => openLeaderboard();
  const bPMain = $('btn-pause-main-menu');
  if (bPMain) bPMain.onclick = () => { $('modal-pause').classList.add('hidden'); goToMainMenu(); };

  const bFR = $('btn-buy-firerate'); if (bFR) bFR.onclick = () => buyUpgrade('firerate');
  const bSH = $('btn-buy-shield');   if (bSH) bSH.onclick = () => buyUpgrade('shield');
  const bBB = $('btn-buy-bomb');     if (bBB) bBB.onclick = () => buyUpgrade('bomb');
  const bFZ = $('btn-buy-freeze');   if (bFZ) bFZ.onclick = () => buyUpgrade('freeze');

  document.querySelectorAll('.actor-card').forEach(card => {
    card.onclick = () => {
      document.querySelectorAll('.actor-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentActor = card.dataset.actor;
      DB.set('pahlawan_actor', currentActor);
      updateActorSelectionUI();
    };
  });

  const bAudio = $('btn-audio');
  if (bAudio) bAudio.onclick = () => {
    sounds.isMuted = !sounds.isMuted;
    if (!sounds.isMuted) sounds.init();
    updateAudioButtonUI();
  };

  const btnInstall = $('btn-pwa-install');
  if (btnInstall) {
    btnInstall.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (e) {}
      deferredPrompt = null; btnInstall.classList.add('hidden');
    };
  }

  const btnLeft = $('btn-move-left');
  const btnRight = $('btn-move-right');
  if (btnLeft) {
    btnLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); isMovingLeft = true; });
    btnLeft.addEventListener('pointerup', () => isMovingLeft = false);
    btnLeft.addEventListener('pointercancel', () => isMovingLeft = false);
    btnLeft.addEventListener('pointerleave', () => isMovingLeft = false);
  }
  if (btnRight) {
    btnRight.addEventListener('pointerdown', (e) => { e.preventDefault(); isMovingRight = true; });
    btnRight.addEventListener('pointerup', () => isMovingRight = false);
    btnRight.addEventListener('pointercancel', () => isMovingRight = false);
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
    const setTargetFromClientX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      playerTargetX = x;
      playerTargetX = Math.max(40, Math.min(VIRTUAL_WIDTH - 40, playerTargetX));
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (!isGameRunning || isGamePaused) return;
      if (e.pointerType === 'touch' || e.buttons > 0) setTargetFromClientX(e.clientX);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!isGameRunning || isGamePaused) return;
      if (e.buttons > 0 || e.pointerType === 'touch') setTargetFromClientX(e.clientX);
    });
  }

  const bNext = $('btn-next-level');
  if (bNext) bNext.onclick = () => {
    $('modal-result').classList.add('hidden');
    if (gameMode !== 'normal') { goToMainMenu(); return; }
    try { requestFullscreenAndLandscape(); } catch (err) {}
    currentLevelIndex++;
    if (currentLevelIndex >= levelsData.length) { restartGame(); return; }
    lives = 3; playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0; reviveUsedThisRun = false;
    updateLivesDisplay(); startCurrentLevel();
  };
  const bRestart = $('btn-restart');
  if (bRestart) bRestart.onclick = () => {
    $('modal-result').classList.add('hidden');
    try { requestFullscreenAndLandscape(); } catch (err) {}
    if (gameMode === 'endless') startEndless();
    else if (gameMode === 'daily') startDaily();
    else if (gameMode === 'coop') { goToMainMenu(); }
    else restartGame();
  };
  const bMenu = $('btn-menu');
  if (bMenu) bMenu.onclick = () => { $('modal-result').classList.add('hidden'); goToMainMenu(); };

  // SKILLS
  const bFreeze = $('btn-freeze');
  if (bFreeze) bFreeze.onclick = () => {
    if (freezeCharges <= 0 || isFrozen || isGamePaused || !isGameRunning) return;
    freezeCharges--; isFrozen = true; freezeFramesRemaining = 210;
    sounds.playFreeze(); triggerVibrate([50, 50, 50]);
    updateSkillButtonsUI();
    spawnFloatingText(VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2, 'FREEZE!', currentTheme.accent);
    screenShake = 6;
    if (mpActive && mpRole === 'guest') mpSendGuestSkill(1);
  };
  const bShield = $('btn-shield');
  if (bShield) bShield.onclick = () => {
    if (shieldCharges <= 0 || isShieldActive || isGamePaused || !isGameRunning) return;
    shieldCharges--; isShieldActive = true; shieldTimer = 300;
    sounds.playShield(); triggerVibrate([30, 30, 60]);
    updateSkillButtonsUI();
    spawnFloatingText(playerX, VIRTUAL_HEIGHT - 70, 'SHIELD!', '#39ff14');
    if (mpActive && mpRole === 'guest') mpSendGuestSkill(2);
  };
  const bBomb = $('btn-bomb');
  if (bBomb) bBomb.onclick = () => {
    if (bombCharges <= 0 || isGamePaused || !isGameRunning) return;
    // Guest: kirim signal ke host, jangan proses lokal
    if (mpActive && mpRole === 'guest') {
      mpSendGuestSkill(3);
      return;
    }
    bombCharges--; screenShake = 22;
    sounds.playBomb(); triggerVibrate([100, 50, 100]);
    updateSkillButtonsUI();
    let total = 0;
    for (let i = monsters.length - 1; i >= 0; i--) {
      let m = monsters[i];
      if (m.type.startsWith('boss')) {
        m.hp -= 50; m.hitFlash = 10;
        spawnFloatingText(m.x, m.y, '-50 HP', '#ff4757');
        if (m.hp <= 0) {
          createBurstParticles3D(m.x, m.y, m.color, 40);
          dropBossLoot(m.x, m.y, parseInt(m.type.replace('boss','')) || 5);
          total += (ENEMY_SCORE_TABLE[m.type] || 150) * combo;
          levelKills++; handleKillStreak();
          monsters.splice(i, 1);
          monsters.forEach(mn => createBurstParticles3D(mn.x, mn.y, mn.color, 20));
          monsters = [];
          if (gameMode === 'endless') setTimeout(() => { endlessWave++; endlessKillsThisWave = 0; updateHUDValues(); }, 1500);
          else if (gameMode === 'daily') setTimeout(() => handleDailyBossDefeated(), 1500);
          else if (gameMode === 'coop') setTimeout(() => mpHostLevelComplete(), 1500);
          else setTimeout(() => onLevelCleared(), 1500);
          break;
        }
      } else {
        createBurstParticles3D(m.x, m.y, m.color, 25);
        total += (ENEMY_SCORE_TABLE[m.type] || 150) * combo;
        levelKills++;
        if (gameMode === 'endless') endlessKillsThisWave++;
        handleKillStreak();
        monsters.splice(i, 1);
      }
    }
    score += total;
    if (total > 0) spawnFloatingText(VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2, `BOOM +${total}`, '#ff4757');
    updateHUDValues(); checkLevelObjectives();
  };

  const loadoutBtn = $('btn-start-loaded');
  if (loadoutBtn) loadoutBtn.addEventListener('click', async () => {
    if (loadoutCurrentSelection.length !== 2) return;
    playerLoadout = [...loadoutCurrentSelection];
    await setLoadout(playerLoadout);
    $('modal-loadout').classList.add('hidden');
    sounds.playPowerup();
    if (loadoutCallback) { const cb = loadoutCallback; loadoutCallback = null; cb(); }
  });

  const bRevAd = $('btn-revive-ad');
  if (bRevAd) bRevAd.onclick = async () => {
    $('modal-revive').classList.add('hidden');
    sounds.init();
    const ok = await AdService.showRewarded();
    if (ok) doRevive(); else { isReviveModalOpen = false; finalizeFail(); }
  };
  const bRevGiveUp = $('btn-revive-give-up');
  if (bRevGiveUp) bRevGiveUp.onclick = () => { $('modal-revive').classList.add('hidden'); isReviveModalOpen = false; finalizeFail(); };

  const bEndless = $('btn-endless'); if (bEndless) bEndless.onclick = openEndlessModal;
  const bStartEndless = $('btn-start-endless');
  if (bStartEndless) bStartEndless.onclick = () => { $('modal-endless').classList.add('hidden'); try { requestFullscreenAndLandscape(); } catch (err) {} startEndless(); };
  const bCloseEndless = $('btn-close-endless'); if (bCloseEndless) bCloseEndless.onclick = () => $('modal-endless').classList.add('hidden');

  const bDaily = $('btn-daily'); if (bDaily) bDaily.onclick = openDailyModal;
  const bStartDaily = $('btn-start-daily');
  if (bStartDaily) bStartDaily.onclick = () => { $('modal-daily').classList.add('hidden'); try { requestFullscreenAndLandscape(); } catch (err) {} startDaily(); };
  const bCloseDaily = $('btn-close-daily'); if (bCloseDaily) bCloseDaily.onclick = () => $('modal-daily').classList.add('hidden');

  // MULTIPLAYER
  const bMP = $('btn-multiplayer');
  if (bMP) bMP.onclick = () => { openMPHub(); };

  const bMPCreate = $('btn-mp-create');
  if (bMPCreate) bMPCreate.onclick = () => mpCreateRoom();

  const bMPJoin = $('btn-mp-join');
  if (bMPJoin) bMPJoin.onclick = () => {
    $('modal-mp-hub').classList.add('hidden');
    $('modal-mp-join').classList.remove('hidden');
    const inp = $('mp-code-input'); if (inp) { inp.value = ''; inp.focus(); }
    mpSetStatus('mp-join-status', '', 'hidden');
  };

  const bMPCloseHub = $('btn-mp-close-hub');
  if (bMPCloseHub) bMPCloseHub.onclick = () => $('modal-mp-hub').classList.add('hidden');

  const bMPBackJoin = $('btn-mp-back-from-join');
  if (bMPBackJoin) bMPBackJoin.onclick = () => {
    $('modal-mp-join').classList.add('hidden');
    $('modal-mp-hub').classList.remove('hidden');
  };

  const bMPDoJoin = $('btn-mp-do-join');
  if (bMPDoJoin) bMPDoJoin.onclick = () => mpJoinRoom();

  const codeInput = $('mp-code-input');
  if (codeInput) {
    codeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    });
  }

  const bMPCopy = $('btn-mp-copy-code');
  if (bMPCopy) bMPCopy.onclick = () => {
    const code = MP && MP.roomCode ? MP.roomCode : '';
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      bMPCopy.style.color = '#39ff14';
      setTimeout(() => bMPCopy.style.color = '', 600);
    } catch(e) {}
  };

  const bMPStart = $('btn-mp-start-game');
  if (bMPStart) bMPStart.onclick = () => mpStartGame();

  const bMPLeave = $('btn-mp-leave');
  if (bMPLeave) bMPLeave.onclick = () => mpLeaveRoom();

  document.querySelectorAll('.mp-mode-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.mp-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mpSelectedMode = btn.dataset.mode || 'coop';
    };
  });

  // Narrative tap
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
    } else playNextStoryLine();
  }, true);
}

// =============================================================
// 13. THEME + UI HELPERS
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
  const bf = $('btn-buy-firerate'); if (bf && bf.querySelector('span')) bf.querySelector('span').innerText = upgradeFireRate >= 5 ? 'MAX' : `${upgradeFireRate * 50}`;
  const bs = $('btn-buy-shield'); if (bs && bs.querySelector('span')) bs.querySelector('span').innerText = upgradeShield >= 5 ? 'MAX' : `${upgradeShield * 60}`;
  const bb = $('btn-buy-bomb'); if (bb && bb.querySelector('span')) bb.querySelector('span').innerText = upgradeBomb >= 5 ? 'MAX' : `${upgradeBomb * 75}`;
  const bz = $('btn-buy-freeze'); if (bz && bz.querySelector('span')) bz.querySelector('span').innerText = upgradeFreeze >= 5 ? 'MAX' : `${upgradeFreeze * 75}`;
}

function buyUpgrade(type) {
  if (type === 'firerate' && upgradeFireRate < 5) {
    let c = upgradeFireRate * 50;
    if (coins >= c) { coins -= c; upgradeFireRate++; DB.set('pahlawan_up_firerate', upgradeFireRate); }
  } else if (type === 'shield' && upgradeShield < 5) {
    let c = upgradeShield * 60;
    if (coins >= c) { coins -= c; upgradeShield++; DB.set('pahlawan_up_shield', upgradeShield); }
  } else if (type === 'bomb' && upgradeBomb < 5) {
    let c = upgradeBomb * 75;
    if (coins >= c) { coins -= c; upgradeBomb++; DB.set('pahlawan_up_bomb', upgradeBomb); }
  } else if (type === 'freeze' && upgradeFreeze < 5) {
    let c = upgradeFreeze * 75;
    if (coins >= c) { coins -= c; upgradeFreeze++; DB.set('pahlawan_up_freeze', upgradeFreeze); }
  }
  DB.set('pahlawan_coins', coins);
  sounds.playCoin(); updateShopUI();
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
    const doc = document.documentElement, body = document.body;
    const p = (doc.requestFullscreen && doc.requestFullscreen()) ||
              (doc.webkitRequestFullscreen && doc.webkitRequestFullscreen()) ||
              (doc.mozRequestFullScreen && doc.mozRequestFullScreen()) ||
              (doc.msRequestFullscreen && doc.msRequestFullscreen()) ||
              (body.webkitRequestFullscreen && body.webkitRequestFullscreen());
    if (p && p.catch) p.catch(() => {});
    setTimeout(() => {
      try {
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
        else if (screen.lockOrientation) screen.lockOrientation('landscape');
        else if (screen.mozLockOrientation) screen.mozLockOrientation('landscape');
        else if (screen.msLockOrientation) screen.msLockOrientation('landscape');
      } catch (e) {}
    }, 250);
  } catch (e) {}
}
function updateActorSelectionUI() {
  const name = actorMap[currentActor] ? actorMap[currentActor].name : 'Robot Cyber';
  const el = document.getElementById('selected-actor-name'); if (el) el.innerText = name;
  const ph = document.getElementById('pause-hero-name'); if (ph) ph.innerText = name;
}
function updateSkillButtonsUI() {
  const bF = document.getElementById('btn-freeze');
  const bS = document.getElementById('btn-shield');
  const bB = document.getElementById('btn-bomb');
  if (!bF || !bS || !bB) return;
  const hF = playerLoadout.includes('freeze');
  const hS = playerLoadout.includes('shield');
  const hB = playerLoadout.includes('bomb');
  bF.style.display = hF ? 'flex' : 'none';
  bS.style.display = hS ? 'flex' : 'none';
  bB.style.display = hB ? 'flex' : 'none';
  if (hF) { const el = document.getElementById('freeze-count'); if (el) el.innerText = freezeCharges; bF.classList.toggle('disabled', freezeCharges <= 0); }
  if (hS) { const el = document.getElementById('shield-count'); if (el) el.innerText = shieldCharges; bS.classList.toggle('disabled', shieldCharges <= 0); }
  if (hB) { const el = document.getElementById('bomb-count'); if (el) el.innerText = bombCharges; bB.classList.toggle('disabled', bombCharges <= 0); }
}

function goToMainMenu() {
  stopSpawnLoop();
  mpStopHostSyncLoop();
  if (mpActive) { try { MP.leaveRoom(); } catch(e) {} mpActive = false; mpRole = null; }
  const hud = document.getElementById('hud-overlay'); if (hud) hud.classList.add('hidden');
  const menu = document.getElementById('screen-main-menu'); if (menu) menu.classList.remove('hidden');
  sounds.stopBGM();
  isGameRunning = false; isGamePaused = false; isReviveModalOpen = false;
  applyThemeToDocument(LEVEL_THEMES[0]);
  gameMode = 'normal';
}

// =============================================================
// 14. MULTIPLAYER LOGIC
// =============================================================
function openMPHub() {
  const modal = document.getElementById('modal-mp-hub');
  if (modal) modal.classList.remove('hidden');
  mpSetStatus('mp-join-status', '', 'hidden');
}

function mpSetStatus(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!text || type === 'hidden') { el.classList.add('mp-status-hidden'); el.innerText = ''; return; }
  el.classList.remove('mp-status-hidden');
  el.className = 'mp-status mp-status-' + (type || 'info');
  el.innerText = text;
}

function mpShowLobby(role, roomCode, mode) {
  document.getElementById('modal-mp-hub').classList.add('hidden');
  document.getElementById('modal-mp-join').classList.add('hidden');
  const lobby = document.getElementById('modal-mp-lobby');
  if (lobby) lobby.classList.remove('hidden');

  const title = document.getElementById('mp-lobby-title');
  if (title) title.innerText = role === 'host' ? 'ROOM DIBUAT' : 'MENUNGGU HOST';

  const codeEl = document.getElementById('mp-room-code');
  if (codeEl) codeEl.innerText = roomCode;

  const modeEl = document.getElementById('mp-lobby-mode');
  if (modeEl) modeEl.innerText = (mode || 'coop').toUpperCase();

  const hostNameEl = document.getElementById('mp-host-name');
  const hostStatusEl = document.getElementById('mp-host-status');
  const guestNameEl = document.getElementById('mp-guest-name');
  const guestStatusEl = document.getElementById('mp-guest-status');
  const slotHost = document.getElementById('mp-slot-host');
  const slotGuest = document.getElementById('mp-slot-guest');

  if (role === 'host') {
    if (hostNameEl) hostNameEl.innerText = playerName + ' (Kamu)';
    if (hostStatusEl) { hostStatusEl.innerText = 'ONLINE'; hostStatusEl.className = 'mp-slot-status online'; }
    if (slotHost) slotHost.classList.add('occupied', 'ready');
    if (guestNameEl) guestNameEl.innerText = 'Menunggu...';
    if (guestStatusEl) { guestStatusEl.innerText = '—'; guestStatusEl.className = 'mp-slot-status'; }
    if (slotGuest) slotGuest.classList.remove('occupied');
  } else {
    if (hostNameEl) hostNameEl.innerText = MP.remotePeerName || 'Host';
    if (hostStatusEl) { hostStatusEl.innerText = 'ONLINE'; hostStatusEl.className = 'mp-slot-status online'; }
    if (slotHost) slotHost.classList.add('occupied');
    if (guestNameEl) guestNameEl.innerText = playerName + ' (Kamu)';
    if (guestStatusEl) { guestStatusEl.innerText = 'ONLINE'; guestStatusEl.className = 'mp-slot-status online'; }
    if (slotGuest) slotGuest.classList.add('occupied', 'ready');
  }

  const startBtn = document.getElementById('btn-mp-start-game');
  if (startBtn) startBtn.disabled = true;

  mpSetStatus('mp-connect-status', 'Menunggu pemain lain...', 'info');
}

async function mpCreateRoom() {
  if (typeof MP === 'undefined') { alert('Multiplayer belum siap. Coba refresh.'); return; }
  try {
    const input = document.getElementById('player-name-input');
    const name = (input && input.value.trim()) || playerName || 'Host';
    playerName = name;
    const res = await MP.createRoom(mpSelectedMode, name);
    mpShowLobby('host', res.roomCode, mpSelectedMode);
    console.log('✅ [MP] Room:', res.roomCode);
  } catch (e) {
    alert('Gagal buat room: ' + (e.message || e));
    console.error(e);
  }
}

async function mpJoinRoom() {
  if (typeof MP === 'undefined') { alert('Multiplayer belum siap.'); return; }
  const input = document.getElementById('mp-code-input');
  const code = (input && input.value.trim().toUpperCase()) || '';
  if (code.length !== 4) { mpSetStatus('mp-join-status', 'Kode harus 4 huruf', 'error'); return; }

  mpSetStatus('mp-join-status', 'Menghubungkan...', 'info');
  try {
    const nameInput = document.getElementById('player-name-input');
    const name = (nameInput && nameInput.value.trim()) || playerName || 'Guest';
    playerName = name;
    const res = await MP.joinRoom(code, name);
    mpShowLobby('guest', code, res.mode);
    mpSetStatus('mp-connect-status', 'Menunggu koneksi P2P...', 'info');
  } catch (e) {
    mpSetStatus('mp-join-status', e.message || 'Gagal join room', 'error');
    console.error(e);
  }
}

async function mpStartGame() {
  if (!MP) return;
  try {
    await MP.setReady(true);
    await MP.startGame();
  } catch(e) { console.error(e); }
}

async function mpLeaveRoom() {
  try { if (MP) await MP.leaveRoom(); } catch(e) {}
  mpActive = false;
  document.getElementById('modal-mp-lobby').classList.add('hidden');
  document.getElementById('modal-mp-hub').classList.remove('hidden');
  mpSetStatus('mp-connect-status', '', 'hidden');
}

function mpSetupCallbacks() {
  if (typeof MP === 'undefined') return;

  MP.onConnect((data) => {
    console.log('✅ [MP] Connected:', data);
    mpSetStatus('mp-connect-status', '✅ Terhubung! ' + (data.peerName || ''), 'success');
    const startBtn = document.getElementById('btn-mp-start-game');
    if (startBtn && MP.isHost) startBtn.disabled = false;

    const guestName = document.getElementById('mp-guest-name');
    if (guestName && data.peerName) guestName.innerText = data.peerName;
    const guestStatus = document.getElementById('mp-guest-status');
    if (guestStatus) { guestStatus.innerText = 'ONLINE'; guestStatus.className = 'mp-slot-status online'; }
    const slotGuest = document.getElementById('mp-slot-guest');
    if (slotGuest) slotGuest.classList.add('occupied');
  });

  MP.onDisconnect((who) => {
    console.log('❌ [MP] Disconnected:', who);
    mpSetStatus('mp-connect-status', '⚠️ Pemain lain terputus', 'warning');
    if (isGameRunning && gameMode === 'coop') {
      mpEndGame(false, 'Pemain lain terputus');
    }
  });

  MP.onError((msg) => {
    mpSetStatus('mp-connect-status', '⚠️ ' + msg, 'error');
  });

  MP.onStatusChange((state) => {
    console.log('🔄 [MP] State:', state);
  });

  MP.onInput((input) => {
    mpGuestInput = input;
  });

  MP.onState((state) => {
    mpApplyHostState(state);
  });

  MP.onStart((data) => {
    console.log('▶️ [MP] Start signal received');
    mpActuallyStartCoop();
  });

  MP.onRemoteReady((ready) => {
    console.log('🎯 [MP] Remote ready:', ready);
  });
}

// =============================================================
// HOST: kirim state ke guest (NORMALIZED coordinates 0..1)
// =============================================================
function mpHostSendState() {
  if (!mpActive || mpRole !== 'host') return;
  if (!MP || !MP.isConnected) return;

  const W = VIRTUAL_WIDTH || 1;
  const H = VIRTUAL_HEIGHT || 1;
  const baseSize = Math.min(W, H);

  const state = {
    monsters: monsters.map(m => ({
      xNorm: m.x / W,
      yNorm: m.y / H,
      hp: m.hp,
      maxHp: m.maxHp,
      type: m.type,
      sizeNorm: m.size / baseSize,
      color: m.color,
      opacity: m.opacity || 1,
      hitFlash: m.hitFlash || 0,
      coreOpen: m.coreOpen || false,
      algorithm: m.algorithm
    })),
    bullets: bullets.map(b => ({
      xNorm: b.x / W,
      yNorm: b.y / H,
      vxNorm: b.vx / W,
      vyNorm: b.vy / H,
      color: b.color,
      sizeNorm: b.size / baseSize,
      heroType: b.heroType,
      owner: b.owner
    })),
    // Posisi HOST (untuk guest render)
    hostXNorm: playerX / W,
    hostHeroType: currentActor,
    // Info GUEST (dari host authoritative)
    guestXNorm: mpGuestX / W,
    guestHP: mpGuestHP,
    guestScore: mpGuestScore,
    guestCombo: mpGuestCombo,
    guestAlive: mpGuestAlive,
    hostHP: playerHitPoints,
    hostScore: score,
    totalScore: score + mpGuestScore,
    level: currentLevelIndex + 1,
    targetKills: (levelsData[currentLevelIndex] || levelsData[0]).targetKills,
    totalKills: levelKills,
    gameRunning: isGameRunning,
    gamePaused: isGamePaused,
    theme: currentTheme.id
  };

  MP.sendState(state);
}

// =============================================================
// GUEST: terapkan state dari host
// =============================================================
function mpApplyHostState(state) {
  if (!state) return;
  if (!Array.isArray(state.monsters)) return;

  const W = VIRTUAL_WIDTH || 1;
  const H = VIRTUAL_HEIGHT || 1;
  const baseSize = Math.min(W, H);

  // Sync theme dari host
  if (state.theme) {
    const matchingTheme = LEVEL_THEMES.find(t => t.id === state.theme);
    if (matchingTheme && matchingTheme.id !== currentTheme.id) {
      currentTheme = matchingTheme;
      applyThemeToDocument(currentTheme);
      recolorStars();
    }
  }

  mpRemoteMonsters = state.monsters.map((m) => ({
    x: m.xNorm * W,
    y: m.yNorm * H,
    hp: m.hp,
    maxHp: m.maxHp,
    type: m.type,
    size: m.sizeNorm * baseSize,
    color: m.color,
    opacity: m.opacity,
    hitFlash: m.hitFlash,
    coreOpen: m.coreOpen,
    algorithm: m.algorithm
  }));

  mpRemoteBullets = (state.bullets || []).map(b => ({
    x: b.xNorm * W,
    y: b.yNorm * H,
    vx: b.vxNorm * W,
    vy: b.vyNorm * H,
    color: b.color,
    size: b.sizeNorm * baseSize,
    heroType: b.heroType,
    owner: b.owner
  }));

  if (state.hostXNorm !== undefined) mpRemoteX = state.hostXNorm * W;
  if (state.hostHeroType) mpRemoteHeroType = state.hostHeroType;

  if (state.guestXNorm !== undefined) mpGuestX = state.guestXNorm * W;
  if (state.guestHP !== undefined) mpGuestHP = state.guestHP;
  if (state.guestScore !== undefined) mpGuestScore = state.guestScore;
  if (state.guestCombo !== undefined) mpGuestCombo = state.guestCombo;
  if (state.guestAlive !== undefined) mpGuestAlive = state.guestAlive;

  mpRemoteHostHP = state.hostHP || 0;
  mpRemoteHostScore = state.hostScore || 0;
  mpRemoteScore = state.hostScore || 0;

  score = state.totalScore || 0;
  levelKills = state.totalKills || 0;

  updateHUDValues();
  updateLivesDisplay();
}

function mpSendGuestSkill(skillNum) {
  if (!mpActive || mpRole !== 'guest') return;
  if (skillNum === 1) mpGuestInput.skill1 = true;
  if (skillNum === 2) mpGuestInput.skill2 = true;
  if (skillNum === 3) mpGuestInput.skill3 = true;
}

function mpHandleGuestDeath() {
  mpGuestAlive = false;
  mpGuestHP = PLAYER_MAX_HIT_POINTS;
  setTimeout(() => { mpGuestAlive = true; mpGuestHP = PLAYER_MAX_HIT_POINTS; }, 2000);
}

function mpHostLevelComplete() {
  mpEndGame(true, 'SELESAI!');
}

function mpEndGame(win, reason) {
  isGameRunning = false;
  isGamePaused = false;
  stopSpawnLoop();
  mpStopHostSyncLoop();
  sounds.stopBGM();
  if (win) sounds.playWin();

  const wasRole = mpRole;
  mpActive = false;

  const $ = id => document.getElementById(id);
  const rt = $('result-title');
  if (rt) rt.innerText = win ? 'CO-OP SELESAI!' : 'PERMAINAN BERAKHIR';

  const rpn = $('result-player-name');
  if (rpn) rpn.innerText = playerName + (mpRemoteName ? ' + ' + mpRemoteName : '');

  const rs = $('result-score');
  if (rs) rs.innerText = score;

  const rc = $('result-coins');
  if (rc) rc.innerText = `+${levelCoinsEarned}`;

  const rl = $('result-level');
  if (rl) rl.innerText = (currentLevelIndex + 1) + ' (Co-op)';

  const rk = $('result-kills');
  if (rk) rk.innerText = `${levelKills} Target`;

  const starContainer = $('result-stars');
  if (starContainer) {
    if (win) {
      let h = '';
      for (let s = 0; s < 3; s++) h += `<svg class="star-mini on" viewBox="0 0 24 24"><use href="#i-star"/></svg>`;
      starContainer.innerHTML = h;
    } else {
      starContainer.innerHTML = '<span style="color:#566a8c;font-size:12px;">—</span>';
    }
  }

  const icon = $('result-icon');
  if (icon) {
    icon.innerHTML = win ? '<use href="#i-trophy"/>' : '<use href="#i-skull"/>';
    icon.classList.toggle('fail', !win);
  }

  const nextBtn = $('btn-next-level');
  if (nextBtn) nextBtn.classList.add('hidden');

  const modal = $('modal-result');
  if (modal) modal.classList.remove('hidden');

  try { MP.leaveRoom(); } catch(e) {}

  if (win && wasRole === 'host') {
    saveCoopScoreToGlobalLeaderboard(playerName, mpRemoteName || 'Guest', score, currentLevelIndex + 1);
  }

  mpRole = null;
}

// =============================================================
// AUTHORITATIVE COOP START
// - HOST: jalanin spawn + physics + sync loop
// - GUEST: render-only, kirim input, tidak spawn apa-apa
// =============================================================
function mpActuallyStartCoop() {
  console.log('🎮 [MP] Starting Co-op game...');
  mpActive = true;
  mpRole = MP.isHost ? 'host' : 'guest';
  gameMode = 'coop';
  currentLevelIndex = 0;
  score = 0;
  lives = 3;
  playerHitPoints = PLAYER_MAX_HIT_POINTS;
  playerHitFlash = 0;
  reviveUsedThisRun = false;
  levelKills = 0;
  levelCoinsEarned = 0;

  mpGuestInput = { left: false, right: false, shoot: false, skill1: false, skill2: false, skill3: false };
  mpGuestX = VIRTUAL_WIDTH * 0.75;
  mpGuestTargetX = mpGuestX;
  mpGuestHP = PLAYER_MAX_HIT_POINTS;
  mpGuestScore = 0;
  mpGuestCombo = 1;
  mpGuestAlive = true;
  mpRemoteX = VIRTUAL_WIDTH * 0.25;
  mpRemoteTargetX = mpRemoteX;
  mpRemoteName = MP.remotePeerName || 'Teman';
  mpRemoteHeroType = 'robot';

  if (mpRole === 'host') {
    playerX = VIRTUAL_WIDTH * 0.25;
    playerTargetX = playerX;
  } else {
    playerX = VIRTUAL_WIDTH * 0.75;
    playerTargetX = playerX;
  }

  resetLevelState();
  updateHUDValues();
  updateLivesDisplay();

  playerLoadout = ['freeze', 'bomb'];
  freezeCharges = upgradeFreeze;
  shieldCharges = upgradeShield;
  bombCharges = upgradeBomb;
  updateSkillButtonsUI();

  document.getElementById('modal-mp-lobby').classList.add('hidden');

  currentTheme = getThemeForLevel(1);
  applyThemeToDocument(currentTheme);
  recolorStars();

  isGameRunning = true;
  isGamePaused = false;

  const banner = document.getElementById('level-intro');
  if (banner) {
    document.getElementById('level-intro-number').innerText = 'CO-OP';
    document.getElementById('level-intro-name').innerText = 'TEAM BATTLE';
    document.getElementById('level-intro-mission').innerText = '2 PEMAIN VS GALAKSI';
    banner.classList.remove('hidden');
    banner.classList.remove('fade-out');
    void banner.offsetWidth;
    sounds.playLevelIntro();
    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.classList.add('hidden'), 500);
    }, 1800);
  }

  sounds.startBGM();

  if (mpRole === 'host') {
    startSpawnLoop();
    mpStartHostSyncLoop();
    console.log('👑 [MP] Host mode — authoritative');
  } else {
    console.log('👤 [MP] Guest mode — render-only');
  }

  gameLoop();
}

function mpStartHostSyncLoop() {
  if (mpSyncTimer) clearInterval(mpSyncTimer);
  mpSyncTimer = setInterval(() => {
    if (!mpActive || mpRole !== 'host' || !isGameRunning) return;
    mpHostSendState();
  }, 50);
}

function mpStopHostSyncLoop() {
  if (mpSyncTimer) { clearInterval(mpSyncTimer); mpSyncTimer = null; }
}

function saveCoopScoreToGlobalLeaderboard(hostName, guestName, scoreVal, levelVal) {
  if (!db) return;
  const cleanHost = (hostName || 'Host').trim();
  const cleanGuest = (guestName || 'Guest').trim();
  if (!cleanHost) return;

  const teamKey = (cleanHost.toLowerCase() + '_' + cleanGuest.toLowerCase())
    .replace(/[^a-z0-9]/g, '_').slice(0, 40);
  const numScore = Number(scoreVal) || 0;
  const numLevel = Number(levelVal) || 1;
  const sortValue = (numLevel * 100000000) + numScore;

  const ref = db.ref('leaderboard_coop/' + teamKey);
  ref.once('value').then(snap => {
    const ex = snap.val();
    let shouldUpdate = false;
    if (!ex) shouldUpdate = true;
    else {
      const ol = Number(ex.level) || 0;
      const os = Number(ex.score) || 0;
      if (numLevel > ol || (numLevel === ol && numScore > os)) shouldUpdate = true;
    }
    if (shouldUpdate) {
      ref.set({
        name1: cleanHost,
        name2: cleanGuest,
        score: numScore,
        level: numLevel,
        sortValue: sortValue,
        timestamp: Date.now()
      }).catch(() => {});
    }
  }).catch(() => {});
}

// =============================================================
// 15. GAME FLOW
// =============================================================
function startGame() {
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
  playerHitPoints = PLAYER_MAX_HIT_POINTS;
  playerHitFlash = 0;
  reviveUsedThisRun = false;
  coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
  if (!levelsData || levelsData.length === 0) levelsData = generate30Levels();

  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');

  resizeCanvas();
  updateGameScale();
  setTimeout(() => { resizeCanvas(); updateGameScale(); startCurrentLevel(); }, 60);
}

function restartGame() {
  currentLevelIndex = 0;
  score = 0; lives = 3;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
  updateHUDValues(); updateLivesDisplay();
  startCurrentLevel();
}

function showLevelIntro(levelConfig) {
  const banner = document.getElementById('level-intro');
  if (!banner) return;
  const numStr = String(levelConfig.level).padStart(2, '0');
  document.getElementById('level-intro-number').innerText = numStr;
  document.getElementById('level-intro-name').innerText = currentTheme.name;
  document.getElementById('level-intro-mission').innerText = levelConfig.algorithm.startsWith('boss_')
    ? 'DEFEAT THE BOSS' : `${levelConfig.targetKills} KILLS · TARGET ${levelConfig.targetScore}`;
  banner.classList.remove('hidden'); banner.classList.remove('fade-out');
  void banner.offsetWidth;
  sounds.playLevelIntro();
  setTimeout(() => { banner.classList.add('fade-out'); setTimeout(() => banner.classList.add('hidden'), 500); }, 1800);
}

async function startCurrentLevel() {
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  currentTheme = getThemeForLevel(levelConfig.level);
  applyThemeToDocument(currentTheme); recolorStars();
  resetLevelState();
  updateHUDValues(); updateLivesDisplay();
  isGameRunning = false; isGamePaused = false;

  const story = STORY[levelConfig.level];
  const storyKey = 'story_seen_' + levelConfig.level;
  let already = null;
  try { already = await DB.get(storyKey); } catch(e) {}
  const runStory = story && story.before && !already;

  const proceed = () => {
    if (runStory) DB.set(storyKey, '1');
    showLoadoutModal(levelConfig, () => actuallyStartLevel(levelConfig));
  };
  if (runStory) showNarrative(story.before.lines, story.before.speaker, story.before.portrait, proceed);
  else proceed();
}

function resetLevelState() {
  levelKills = 0; levelCoinsEarned = 0;
  playerX = VIRTUAL_WIDTH / 2; playerTargetX = playerX;
  bullets = []; bossBullets = []; powerups = [];
  coinsOnField = []; muzzleFlashes = []; telegraphs = [];
  combo = 1; comboTimer = 0;
  killStreakCount = 0; killStreakMilestone = 0;
  isSuperShot = false; superShotTimer = 0;
  isMegaShot = false; megaShotTimer = 0;
  isShieldActive = false; shieldTimer = 0;
  isMagnetActive = false; magnetTimer = 0;
  isFrozen = false; freezeFramesRemaining = 0;
  isReviveInvuln = false; reviveInvulnTimer = 0;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  monsters = []; particles = [];
}

function actuallyStartLevel(levelConfig) {
  playerSpeed = 9 * GAME_SCALE;
  freezeCharges = playerLoadout.includes('freeze') ? upgradeFreeze : 0;
  shieldCharges = playerLoadout.includes('shield') ? upgradeShield : 0;
  bombCharges   = playerLoadout.includes('bomb') ? upgradeBomb : 0;
  if (gameMode === 'daily' && currentDailyModifier && currentDailyModifier.id === 'no_shield') shieldCharges = 0;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  playerTargetX = playerX;
  updateSkillButtonsUI();
  isGameRunning = true; isGamePaused = false;
  showLevelIntro(levelConfig);
  sounds.startBGM();
  startSpawnLoop();
  gameLoop();
}

function updateHUDValues() {
  const $ = id => document.getElementById(id);
  if (gameMode === 'endless') {
    const hl = $('hud-level'); if (hl) hl.innerText = '∞' + endlessWave;
    const hm = $('hud-mission'); if (hm) hm.innerText = `${endlessKillsThisWave}/${ENDLESS_KILLS_PER_WAVE}`;
  } else if (gameMode === 'daily') {
    const hl = $('hud-level'); if (hl) hl.innerText = 'B' + (dailyBossIndex + 1);
    const hm = $('hud-mission'); if (hm) hm.innerText = `BOS ${dailyBossIndex + 1}/3`;
  } else if (gameMode === 'coop') {
    const hl = $('hud-level'); if (hl) hl.innerText = 'CO-OP';
    const hm = $('hud-mission'); if (hm) hm.innerText = 'TEAM';
  } else {
    const lc = levelsData[currentLevelIndex] || levelsData[0];
    const hl = $('hud-level'); if (hl) hl.innerText = lc.level;
    const hm = $('hud-mission'); if (hm) hm.innerText = `${levelKills}/${lc.targetKills}`;
  }
  const hs = $('hud-score'); if (hs) hs.innerText = score;
  const hc = $('hud-coins'); if (hc) hc.innerText = coins;
  const comboPill = $('hud-combo-pill');
  if (comboPill) {
    if (combo > 1) {
      comboPill.classList.remove('hidden');
      const ct = $('hud-combo-text'); if (ct) ct.innerText = `${combo}x COMBO`;
    } else comboPill.classList.add('hidden');
  }
}

function updateLivesDisplay() {
  const container = document.getElementById('hud-lives');
  if (!container) return;
  let html = '';
  for (let i = 0; i < lives; i++) {
    const isCurrent = (i === lives - 1);
    const ratio = isCurrent ? (playerHitPoints / PLAYER_MAX_HIT_POINTS) : 1;
    const opacity = isCurrent ? (0.35 + ratio * 0.65) : 1;
    const cls = isCurrent && ratio < 1 ? 'heart-icon partial' : 'heart-icon';
    html += `<svg class="${cls}" viewBox="0 0 24 24" style="opacity:${opacity}"><use href="#i-heart"/></svg>`;
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
// 16. SPAWN LOOP (HOST only)
// =============================================================
function spawnMonsterLoop(token) {
  // GUARD: hanya host yang spawn di coop
  if (gameMode === 'coop' && mpActive && mpRole !== 'host') return;

  if (token !== undefined && token !== spawnLoopToken) return;
  if (isGameRunning && !isGamePaused && !isFrozen) {
    let levelConfig;
    let spawnMultiplier = 1;
    const W = VIRTUAL_WIDTH;
    const S = GAME_SCALE;

    if (gameMode === 'endless') {
      const typesPool = ["jelly","donut","cloud","crystal","splitter"];
      const count = Math.min(5, Math.floor(1 + endlessWave / 3) + 1);
      const algos = ["linear","zigzag","gravity","stealth","swarm","splitter"];
      levelConfig = { level: 999, targetKills: ENDLESS_KILLS_PER_WAVE,
        speed: (1 + endlessWave * 0.08) * S,
        spawnRate: Math.max(300, 1200 - endlessWave * 40),
        algorithm: algos[endlessWave % algos.length],
        types: typesPool.slice(0, count) };
      if (endlessWave > 0 && endlessWave % 5 === 0) {
        const b = Math.min(30, Math.ceil(endlessWave / 5) * 5);
        levelConfig.algorithm = `boss_${b}`;
        levelConfig.types = [`boss${b}`];
        levelConfig.bossHp = 150 + endlessWave * 60;
      }
    } else if (gameMode === 'daily') {
      if (Date.now() < nextBossSpawnTime) {}
      else if (monsters.length === 0 && dailyBossIndex < 3 && dailyBossSequence.length === 3) {
        const bossNum = dailyBossSequence[dailyBossIndex];
        const baseHp = getBossBaseHp(bossNum);
        const scale = [1, 1.2, 1.5][dailyBossIndex] || 1;
        const hpVal = Math.floor(baseHp * scale);
        const bossSize = (BOSS_SIZES[bossNum] || 75) * S;
        const theme = getBossTheme(bossNum);
        currentTheme = theme; applyThemeToDocument(theme); recolorStars();
        triggerBossSiren();
        monsters.push({
          x: W / 2, startX: W / 2, y: -100 * S,
          speed: (1.0 + dailyBossIndex * 0.15) * S, size: bossSize,
          hp: hpVal, maxHp: hpVal, color: theme.accent,
          type: `boss${bossNum}`, algorithm: `boss_${bossNum}`,
          shootTimer: 0, minionTimer: 0, enrageTimer: 0,
          timeAlive: 0, opacity: 1, hitFlash: 0, aura: 0,
          aimTimer: 0, aimTargetX: 0, aimTargetY: 0,
          coreOpen: false, coreTimer: 0, coreGlow: 0, noWeakPoint: false
        });
        updateHUDValues();
      }
    } else if (gameMode === 'coop') {
      levelConfig = levelsData[currentLevelIndex] || levelsData[0];
      levelConfig = Object.assign({}, levelConfig, { speed: (levelConfig.speed || 1) * S });
      spawnMultiplier = 1.5;
    } else {
      levelConfig = levelsData[currentLevelIndex] || levelsData[0];
      levelConfig = Object.assign({}, levelConfig, { speed: (levelConfig.speed || 1) * S });
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
          if (gameMode === 'coop') hpVal = Math.floor(hpVal * 1.6);
          const bossSize = (BOSS_SIZES[bossNum] || 75) * S;
          const isTut = (bossNum === 5 && gameMode === 'normal');
          monsters.push({
            x: W / 2, startX: W / 2, y: -100 * S,
            speed: 1.0 * S, size: bossSize, hp: hpVal, maxHp: hpVal,
            color: currentTheme.accent, type: `boss${bossNum}`, algorithm: algo,
            shootTimer: 0, minionTimer: 0, enrageTimer: 0,
            timeAlive: 0, opacity: 1, hitFlash: 0, aura: 0,
            aimTimer: 0, aimTargetX: 0, aimTargetY: 0,
            coreOpen: false, coreTimer: 0, coreGlow: 0,
            noWeakPoint: isTut
          });
        }
      } else {
        let n = (algo === 'swarm') ? 2 : 1;
        n = Math.ceil(n * spawnMultiplier);
        for (let c = 0; c < n; c++) {
          const type = typeList[Math.floor(Math.random() * typeList.length)];
          const hp = (type === 'donut' ? 2 : (type === 'crystal' ? 3 : 1));
          const canShoot = (type === 'crystal');
          const baseSize = (type === 'donut' ? 36 : 30) * S;
          monsters.push({
            x: Math.random() * (W - 120 * S) + 60 * S,
            startX: Math.random() * (W - 120 * S) + 60 * S,
            y: -60 * S,
            speed: (1.2 + Math.random() * 1.2) * (levelConfig.speed || 1),
            size: baseSize,
            hp, maxHp: hp,
            color: currentTheme.monsters[Math.floor(Math.random() * currentTheme.monsters.length)],
            type, algorithm: algo,
            shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0,
            aimTimer: 0, aimTargetX: 0, aimTargetY: 0,
            canShoot, shootCooldown: 60 + Math.random() * 120
          });
        }
      }
    }
  }

  let rate = 1500;
  if (gameMode === 'endless') rate = Math.max(300, 1200 - endlessWave * 40);
  else if (gameMode === 'daily') rate = 500;
  else if (gameMode === 'coop') rate = 800;
  else rate = levelsData[currentLevelIndex] ? levelsData[currentLevelIndex].spawnRate : 1500;

  const myToken = (token !== undefined) ? token : spawnLoopToken;
  setTimeout(() => spawnMonsterLoop(myToken), rate);
}

function startSpawnLoop() {
  spawnLoopToken++;
  spawnMonsterLoop(spawnLoopToken);
}
function stopSpawnLoop() { spawnLoopToken++; }

// =============================================================
// 17. DROP / PARTICLES / UTILITY
// =============================================================
function trySpawnDrop(x, y) {
  const cc = (gameMode === 'endless') ? 0.7 : 0.45;
  const S = GAME_SCALE;
  if (Math.random() < cc) coinsOnField.push({ x, y, vy: 1.8 * S, size: 10 * S, rot: 0, trail: 0 });
  if (Math.random() < 0.32) {
    const types = ['supershot','shield','bomb','freeze','heart','magnet'];
    const t = types[Math.floor(Math.random() * types.length)];
    powerups.push({ x, y, type: t, speed: 2.2 * S, size: 16 * S, rot: 0 });
  }
}

function dropBossLoot(bossX, bossY, bossNum) {
  const S = GAME_SCALE;
  const count = 4 + Math.floor(Math.random() * 3);
  const types = ['supershot', 'megashot', 'megashot', 'shield', 'bomb', 'freeze', 'heart', 'magnet'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const distance = (40 + Math.random() * 60) * S;
    const px = bossX + Math.cos(angle) * distance;
    const py = bossY + Math.sin(angle) * distance;
    let type;
    if (bossNum >= 20 && i === 0) type = 'megashot';
    else if (bossNum >= 10 && i === 1) type = 'megashot';
    else type = types[Math.floor(Math.random() * types.length)];
    powerups.push({
      x: Math.max(30 * S, Math.min(VIRTUAL_WIDTH - 30 * S, px)),
      y: Math.max(30 * S, py),
      type, speed: 1.5 * S, size: 18 * S, rot: 0, fromBoss: true
    });
  }
  for (let i = 0; i < 8; i++) {
    coinsOnField.push({
      x: bossX + (Math.random() - 0.5) * 100 * S,
      y: bossY + (Math.random() - 0.5) * 50 * S,
      vy: 1.8 * S, size: 10 * S, rot: 0, trail: 0
    });
  }
  sounds.playPowerup();
  triggerVibrate([80, 40, 80, 40, 120]);
}

function spawnFloatingText(x, y, text, color) {
  const c = document.getElementById('popup-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.innerText = text;
  el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color;
  c.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function createBurstParticles3D(x, y, color, count = 20) {
  const S = GAME_SCALE;
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 14 * S,
      vy: (Math.random() - 0.5) * 14 * S,
      size: (Math.random() * 7 + 3) * S,
      life: 1.0, color,
      spin: (Math.random() - 0.5) * 0.4,
      rot: 0, star: Math.random() < 0.35
    });
  }
}

function spawnTelegraph(fromX, fromY, toX, toY, dur, color) {
  telegraphs.push({ x: fromX, y: fromY, targetX: toX, targetY: toY, progress: 0, duration: dur, color: color || '#ff2e88' });
}

function handleKillStreak() {
  killStreakCount++;
  const n = killStreakMilestone;
  if (n < KILLSTREAK_MILESTONES.length && killStreakCount >= KILLSTREAK_MILESTONES[n]) {
    killStreakMilestone++;
    showKillStreak(KILLSTREAK_TITLES[n], KILLSTREAK_MILESTONES[n]);
  }
}
function showKillStreak(title, count) {
  const ov = document.getElementById('killstreak-overlay');
  const txt = document.getElementById('killstreak-text');
  const sub = document.getElementById('killstreak-sub');
  if (!ov || !txt || !sub) return;
  txt.innerText = title;
  sub.innerText = `${count} KILLS`;
  ov.classList.remove('hidden');
  void ov.offsetWidth;
  sounds.playKillstreak();
  setTimeout(() => ov.classList.add('hidden'), 1300);
}

function checkLevelObjectives() {
  // GUARD: hanya host yang cek objectives di coop
  if (gameMode === 'coop' && mpActive && mpRole !== 'host') return;

  if (gameMode === 'endless') {
    if (endlessKillsThisWave >= ENDLESS_KILLS_PER_WAVE && monsters.length === 0) {
      endlessWave++; endlessKillsThisWave = 0;
      sounds.playWin();
      spawnFloatingText(VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2, `WAVE ${endlessWave}`, '#ffd700');
      updateHUDValues();
    }
    return;
  }
  if (gameMode === 'daily') return;
  if (gameMode === 'coop') {
    const lc = levelsData[currentLevelIndex] || levelsData[0];
    if (levelKills >= lc.targetKills * 1.5 && monsters.length === 0) {
      mpHostLevelComplete();
    }
    return;
  }
  const lc = levelsData[currentLevelIndex] || levelsData[0];
  if (lc.algorithm.startsWith('boss_')) return;
  if (levelKills >= lc.targetKills) {
    if (score >= lc.targetScore) onLevelCleared();
    else onLevelFailed("SKOR BELUM MENCAPAI TARGET");
  }
}

// =============================================================
// 18. DRAW HERO
// =============================================================
function drawHeroVector(ctx, x, y, type, isRemote) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(GAME_SCALE, GAME_SCALE);
  if (isRemote) ctx.globalAlpha = 0.85;

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
    ctx.fillStyle = '#2f3542'; ctx.fillRect(-16, -18, 5, 20); ctx.fillRect(11, -18, 5, 20);
    ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI*2); ctx.fill();
  } else if (type === 'dragon') {
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(16, 10); ctx.lineTo(28, -5); ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18); ctx.lineTo(-28, -5); ctx.lineTo(-16, 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff4757'; ctx.fillRect(-7, -12, 4, 4); ctx.fillRect(3, -12, 4, 4);
  } else if (type === 'cat') {
    ctx.fillStyle = '#ffa502';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-8, -24); ctx.lineTo(-2, -12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(8, -24); ctx.lineTo(2, -12); ctx.fill();
    ctx.fillStyle = '#2f3542'; ctx.fillRect(-12, -6, 24, 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(-8, -4, 4, 4); ctx.fillRect(4, -4, 4, 4);
  } else {
    ctx.fillStyle = '#a55eea';
    ctx.beginPath(); ctx.arc(0, 2, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(5, -12); ctx.lineTo(-5, -12); ctx.closePath(); ctx.fill();
  }

  if (!isRemote && (isShieldActive || isReviveInvuln)) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + playerPulse * 0.05;
      const px = Math.cos(a) * 38, py = Math.sin(a) * 38 - 2;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = isReviveInvuln ? 'rgba(255,215,0,0.25)' : 'rgba(0,210,211,0.18)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isReviveInvuln ? '#ffd700' : '#00d2d3';
    ctx.stroke();
    ctx.restore();
  }
  if (!isRemote && isMagnetActive) {
    ctx.beginPath(); ctx.arc(0, -2, 42, 0, Math.PI*2);
    ctx.strokeStyle = '#ffa502'; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]); ctx.lineDashOffset = -playerPulse;
    ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  }
  ctx.restore();
}

// =============================================================
// 19. GAME LOOP
// =============================================================
function gameLoop() {
  if (!isGameRunning || isGamePaused) return;
  if (!ctx || !canvas) return;

  // ====== GUEST RENDER-ONLY MODE ======
  if (mpActive && mpRole === 'guest') {
    return gameLoopGuest();
  }

  // ====== HOST / SINGLE PLAYER LOOP ======
  const W = VIRTUAL_WIDTH;
  const H = VIRTUAL_HEIGHT;
  const S = GAME_SCALE;

  playerPulse += 0.08;
  const theme = currentTheme;

  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    screenShake *= 0.88;
    if (screenShake < 0.5) screenShake = 0;
  }

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, theme.bgTop);
  bgGrad.addColorStop(1, theme.bgBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  stars.forEach(s => {
    s.y += s.speed;
    s.twinkle += 0.05;
    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    const a = s.opacity * (0.7 + Math.sin(s.twinkle) * 0.3);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = a;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
  ctx.globalAlpha = 1;

  // Ground
  const groundH = 40 * S;
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, H - groundH, W, groundH);
  ctx.fillStyle = theme.groundLine;
  ctx.globalAlpha = 0.6 + Math.sin(playerPulse * 0.5) * 0.2;
  ctx.fillRect(0, H - groundH - 5, W, 5);
  ctx.globalAlpha = 1;

  // Player movement
  if (isMovingLeft) playerTargetX -= playerSpeed;
  if (isMovingRight) playerTargetX += playerSpeed;
  playerTargetX = Math.max(40 * S, Math.min(W - 40 * S, playerTargetX));
  const dx = playerTargetX - playerX;
  if (Math.abs(dx) > 0.5) playerX += dx * PLAYER_LERP;
  else playerX = playerTargetX;
  playerX = Math.max(40 * S, Math.min(W - 40 * S, playerX));
  if (playerHitFlash > 0) playerHitFlash--;

  if (isSuperShot) { superShotTimer--; if (superShotTimer <= 0) isSuperShot = false; }
  if (isMegaShot) { megaShotTimer--; if (megaShotTimer <= 0) isMegaShot = false; }
  if (isShieldActive) { shieldTimer--; if (shieldTimer <= 0) isShieldActive = false; }
  if (isMagnetActive) { magnetTimer--; if (magnetTimer <= 0) isMagnetActive = false; }
  if (isReviveInvuln) { reviveInvulnTimer--; if (reviveInvulnTimer <= 0) isReviveInvuln = false; }
  if (isFrozen) { freezeFramesRemaining--; if (freezeFramesRemaining <= 0) { isFrozen = false; freezeFramesRemaining = 0; } }
  if (combo > 1) { comboTimer--; if (comboTimer <= 0) { combo = 1; updateHUDValues(); } }

  const heroPlayerY = H - 45 * S;

  // HOST: update guest posisi berdasarkan input yang diterima
  if (mpActive && mpRole === 'host') {
    if (mpGuestInput.left) mpGuestTargetX -= playerSpeed;
    if (mpGuestInput.right) mpGuestTargetX += playerSpeed;
    mpGuestTargetX = Math.max(40 * S, Math.min(W - 40 * S, mpGuestTargetX));
    const gdx = mpGuestTargetX - mpGuestX;
    if (Math.abs(gdx) > 0.5) mpGuestX += gdx * PLAYER_LERP;
    else mpGuestX = mpGuestTargetX;
    if (mpGuestShootCd > 0) mpGuestShootCd--;

    // Guest auto shoot
    if (mpGuestInput.shoot && mpGuestShootCd <= 0 && mpGuestAlive) {
      const interval = Math.max(70, 160 - (upgradeFireRate - 1) * 15);
      mpGuestShootCd = Math.round(interval / 16);
      bullets.push({
        x: mpGuestX, y: H - 65 * S, vx: 0, vy: 13 * S,
        color: '#ffd700', heroType: 'robot', size: 5 * S, pierce: 1, owner: 'guest'
      });
    }

    // Guest skills
    if (mpGuestInput.skill1) {
      isFrozen = true; freezeFramesRemaining = 210;
      sounds.playFreeze();
      mpGuestInput.skill1 = false;
    }
    if (mpGuestInput.skill2) {
      isShieldActive = true; shieldTimer = 300;
      sounds.playShield();
      mpGuestInput.skill2 = false;
    }
    if (mpGuestInput.skill3) {
      mpGuestInput.skill3 = false;
      // Bomb dari guest — host proses
      screenShake = 22;
      sounds.playBomb();
      let total = 0;
      for (let i = monsters.length - 1; i >= 0; i--) {
        let m = monsters[i];
        createBurstParticles3D(m.x, m.y, m.color, 25);
        total += (ENEMY_SCORE_TABLE[m.type] || 150) * combo;
        levelKills++;
        monsters.splice(i, 1);
      }
      score += total;
      if (total > 0) spawnFloatingText(W/2, H/2, `BOOM +${total}`, '#ff4757');
      updateHUDValues(); checkLevelObjectives();
    }
  }

  // Shooting (host / single player)
  let baseInterval = 160;
  if (currentActor === 'cat') baseInterval = 110;
  else if (currentActor === 'cannon') baseInterval = 210;
  const fireInterval = Math.max(70, baseInterval - (upgradeFireRate - 1) * 15);
  const now = Date.now();

  if (now - lastShotTime > fireInterval) {
    const shotY = H - 65 * S;
    if (isMegaShot) {
      bullets.push({ x: playerX, y: shotY, vx: 0, vy: 15 * S, color: '#ff2e88', heroType: currentActor, size: 16 * S, pierce: 3, owner: 'host' });
      bullets.push({ x: playerX, y: shotY, vx: 0, vy: 15 * S, color: '#ffd700', heroType: currentActor, size: 8 * S, pierce: 3, owner: 'host' });
    } else if (isSuperShot) {
      bullets.push({ x: playerX - 16 * S, y: shotY, vx: -2.5 * S, vy: 12 * S, color: '#00d2d3', heroType: currentActor, size: 7 * S, pierce: 1, owner: 'host' });
      bullets.push({ x: playerX,            y: shotY, vx: 0,        vy: 13 * S, color: '#ffd700', heroType: currentActor, size: 8 * S, pierce: 1, owner: 'host' });
      bullets.push({ x: playerX + 16 * S, y: shotY, vx: 2.5 * S,  vy: 12 * S, color: '#00d2d3', heroType: currentActor, size: 7 * S, pierce: 1, owner: 'host' });
    } else {
      if (currentActor === 'robot') {
        bullets.push({ x: playerX - 8 * S, y: shotY, vx: 0, vy: 14 * S, color: '#1e90ff', heroType: 'robot', size: 5 * S, pierce: 1, owner: 'host' });
        bullets.push({ x: playerX + 8 * S, y: shotY, vx: 0, vy: 14 * S, color: '#1e90ff', heroType: 'robot', size: 5 * S, pierce: 1, owner: 'host' });
      } else if (currentActor === 'cannon') {
        bullets.push({ x: playerX, y: shotY, vx: 0, vy: 11 * S, color: '#ff4757', heroType: 'cannon', size: 14 * S, pierce: 1, owner: 'host' });
      } else if (currentActor === 'dragon') {
        bullets.push({ x: playerX - 10 * S, y: shotY, vx: -2 * S, vy: 12 * S, color: '#2ed573', heroType: 'dragon', size: 6 * S, pierce: 1, owner: 'host' });
        bullets.push({ x: playerX,         y: shotY, vx: 0,      vy: 13 * S, color: '#2ed573', heroType: 'dragon', size: 7 * S, pierce: 1, owner: 'host' });
        bullets.push({ x: playerX + 10 * S, y: shotY, vx: 2 * S, vy: 12 * S, color: '#2ed573', heroType: 'dragon', size: 6 * S, pierce: 1, owner: 'host' });
      } else if (currentActor === 'cat') {
        bullets.push({ x: playerX, y: shotY, vx: (Math.random()-0.5)*1.2 * S, vy: 15 * S, color: '#ffa502', heroType: 'cat', size: 6 * S, pierce: 1, rot: 0, owner: 'host' });
      } else if (currentActor === 'unicorn') {
        bullets.push({ x: playerX, y: shotY, vx: 0, vy: 13 * S, color: '#a55eea', heroType: 'unicorn', size: 8 * S, pierce: 2, owner: 'host' });
      }
    }
    muzzleFlashes.push({ x: playerX, y: shotY, radius: 16 * S, opacity: 1.0 });
    sounds.playLaser();
    lastShotTime = now;
  }

  // Muzzle flashes
  for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
    const f = muzzleFlashes[i];
    ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,215,0,${f.opacity})`; ctx.fill();
    f.opacity -= 0.25;
    if (f.opacity <= 0) muzzleFlashes.splice(i, 1);
  }

  // Telegraphs
  for (let i = telegraphs.length - 1; i >= 0; i--) {
    const t = telegraphs[i]; t.progress++;
    const p = t.progress / t.duration;
    const a = 0.15 + Math.sin(p * Math.PI) * 0.5;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(t.targetX, t.targetY);
    ctx.lineWidth = 2 + Math.sin(p * Math.PI * 6) * 0.8;
    ctx.strokeStyle = t.color; ctx.globalAlpha = a;
    ctx.setLineDash([6, 4]); ctx.lineDashOffset = -t.progress * 2;
    ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    if (t.progress >= t.duration) telegraphs.splice(i, 1);
  }

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= b.vy; b.x += b.vx;
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.heroType === 'cat') {
      b.rot = (b.rot || 0) + 0.3; ctx.rotate(b.rot);
      ctx.fillStyle = b.color;
      ctx.fillRect(-6 * S, -2 * S, 12 * S, 4 * S);
      ctx.fillRect(-2 * S, -6 * S, 4 * S, 12 * S);
    } else if (b.heroType === 'cannon') {
      ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2);
      ctx.fillStyle = '#ffd700'; ctx.fill();
      ctx.lineWidth = 3 * S; ctx.strokeStyle = '#ff4757'; ctx.stroke();
    } else if (b.heroType === 'unicorn') {
      ctx.fillStyle = '#a55eea';
      ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, b.size * 0.4, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(0, 10 * S); ctx.lineTo(0, -10 * S);
      ctx.lineWidth = b.size; ctx.strokeStyle = b.color; ctx.stroke();
    }
    ctx.restore();

    if (b.y < -20 * S || b.x < -20 * S || b.x > W + 20 * S) { bullets.splice(i, 1); continue; }

    let consumed = false;
    for (let j = monsters.length - 1; j >= 0; j--) {
      const m = monsters[j];
      const d = Math.hypot(m.x - b.x, m.y - b.y);
      if (d < m.size + b.size + 4 * S) {
        b.pierce--;
        if (b.pierce <= 0) { bullets.splice(i, 1); consumed = true; }
        let damage = 1;
        const isBoss = m.type.startsWith('boss');
        if (isBoss && !m.noWeakPoint) {
          damage = m.coreOpen ? 3 : 0.34;
          if (m.coreOpen) sounds.playCombo();
        }
        if (isMegaShot && b.owner === 'host') damage *= 3;
        m.hp -= damage; m.hitFlash = 8;
        sounds.playPop();

        if (m.hp <= 0) {
          createBurstParticles3D(m.x, m.y, m.color, 25);
          trySpawnDrop(m.x, m.y);
          const isB = m.type.startsWith('boss');
          const bp = ENEMY_SCORE_TABLE[m.type] || 150;
          const gained = bp * combo;
          score += gained;
          levelKills++;
          if (gameMode === 'endless') endlessKillsThisWave++;
          handleKillStreak();
          combo = Math.min(MAX_COMBO, combo + 1);
          comboTimer = 180;
          spawnFloatingText(m.x, m.y, `+${gained}`, '#ffd700');

          if (m.algorithm === 'splitter' && m.size > 22 * S) {
            const miniSize = 22 * S;
            monsters.push(
              { x: m.x-20*S, startX: m.x-20*S, y: m.y, speed: m.speed*1.25, size: miniSize, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false },
              { x: m.x+20*S, startX: m.x+20*S, y: m.y, speed: m.speed*1.25, size: miniSize, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false }
            );
          }
          monsters.splice(j, 1);
          updateHUDValues();

          if (isB) {
            dropBossLoot(m.x, m.y, parseInt(m.type.replace('boss','')) || 5);
            monsters.forEach(mn => createBurstParticles3D(mn.x, mn.y, mn.color, 20));
            monsters = [];
            if (gameMode === 'endless') setTimeout(() => { endlessWave++; endlessKillsThisWave = 0; updateHUDValues(); }, 1500);
            else if (gameMode === 'daily') setTimeout(() => handleDailyBossDefeated(), 1500);
            else if (gameMode === 'coop') setTimeout(() => mpHostLevelComplete(), 1500);
            else setTimeout(() => onLevelCleared(), 1500);
          } else checkLevelObjectives();
        } else spawnFloatingText(m.x, m.y, 'HIT', '#ff4757');
        break;
      }
    }
    if (consumed) continue;
  }

  // Coins
  const magnetPull = isMagnetActive || (currentActor === 'cat');
  for (let i = coinsOnField.length - 1; i >= 0; i--) {
    const c = coinsOnField[i];
    c.trail = (c.trail || 0) + 1;
    if (magnetPull) {
      const range = (isMagnetActive ? 350 : 160) * S;
      const dd = Math.hypot(playerX - c.x, heroPlayerY - c.y);
      if (dd < range) {
        const ang = Math.atan2(heroPlayerY - c.y, playerX - c.x);
        c.x += Math.cos(ang) * 8.5 * S;
        c.y += Math.sin(ang) * 8.5 * S;
      } else c.y += c.vy;
    } else c.y += c.vy;
    c.rot += 0.1;
    if (c.trail % 3 === 0) {
      ctx.beginPath(); ctx.arc(c.x, c.y + 4, c.size * 0.5, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,215,0,0.3)'; ctx.fill();
    }
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
    ctx.beginPath(); ctx.arc(0, 0, c.size, 0, Math.PI*2);
    ctx.fillStyle = '#ffd700'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    ctx.restore();

    const dp = Math.hypot(playerX - c.x, heroPlayerY - c.y);
    if (dp < c.size + 25 * S) {
      const mult = (gameMode === 'endless' || gameMode === 'daily') ? 2 : 1;
      coins += mult; levelCoinsEarned += mult;
      DB.set('pahlawan_coins', coins);
      sounds.playCoin();
      spawnFloatingText(c.x, c.y, `+${mult}`, '#ffd700');
      coinsOnField.splice(i, 1);
      updateHUDValues();
      continue;
    }
    if (c.y > H) coinsOnField.splice(i, 1);
  }

  // Powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.speed;
    p.rot = (p.rot || 0) + 0.04;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.sin(p.rot) * 0.2);
    ctx.beginPath(); ctx.arc(0, 0, p.size + 6, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([3, 6]); ctx.lineDashOffset = -playerPulse * 2;
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2);
    let col = '#00d2d3', lbl = 'SS';
    if (p.type === 'shield') { col = '#1e90ff'; lbl = 'SH'; }
    else if (p.type === 'bomb') { col = '#ff4757'; lbl = 'B'; }
    else if (p.type === 'freeze') { col = '#70a1ff'; lbl = 'FR'; }
    else if (p.type === 'heart') { col = '#ff78ae'; lbl = '+'; }
    else if (p.type === 'magnet') { col = '#ffa502'; lbl = 'M'; }
    else if (p.type === 'megashot') { col = '#ff2e88'; lbl = 'MG'; }
    ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
    if (p.fromBoss) {
      ctx.beginPath(); ctx.arc(0, 0, p.size + 10, 0, Math.PI*2);
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(playerPulse * 4) * 0.3;
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.font = `bold ${12 * S}px Orbitron, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(lbl, 0, 0);
    ctx.restore();

    const dp = Math.hypot(playerX - p.x, heroPlayerY - p.y);
    if (dp < p.size + 25 * S) {
      sounds.playPowerup();
      if (p.type === 'supershot') { isSuperShot = true; superShotTimer = 450; spawnFloatingText(playerX, H - 70 * S, 'SUPER SHOT', '#2ed573'); }
      else if (p.type === 'megashot') { isMegaShot = true; megaShotTimer = 540; spawnFloatingText(playerX, H - 70 * S, 'MEGA SHOT!', '#ff2e88'); }
      else if (p.type === 'shield') { isShieldActive = true; shieldTimer = 450 + (upgradeShield-1)*80; spawnFloatingText(playerX, H - 70 * S, 'SHIELD', '#00d2d3'); }
      else if (p.type === 'bomb') { if (playerLoadout.includes('bomb')) { bombCharges = Math.min(upgradeBomb, bombCharges+1); updateSkillButtonsUI(); } spawnFloatingText(playerX, H - 70 * S, '+1 BOMB', '#ff4757'); }
      else if (p.type === 'freeze') { if (playerLoadout.includes('freeze')) { freezeCharges = Math.min(upgradeFreeze, freezeCharges+1); updateSkillButtonsUI(); } spawnFloatingText(playerX, H - 70 * S, '+1 FREEZE', '#1e90ff'); }
      else if (p.type === 'heart') { lives = Math.min(5, lives+1); playerHitPoints = PLAYER_MAX_HIT_POINTS; updateLivesDisplay(); spawnFloatingText(playerX, H - 70 * S, '+1 LIFE', '#ff78ae'); }
      else if (p.type === 'magnet') { isMagnetActive = true; magnetTimer = 420; spawnFloatingText(playerX, H - 70 * S, 'MAGNET', '#ffa502'); }
      powerups.splice(i, 1);
      continue;
    }
    if (p.y > H) powerups.splice(i, 1);
  }

  // Boss bullets
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    const bb = bossBullets[i];
    bb.y += bb.vy; bb.x += bb.vx;
    ctx.beginPath(); ctx.arc(bb.x, bb.y - 6 * S, 5 * S, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,71,87,0.4)'; ctx.fill();
    ctx.beginPath(); ctx.arc(bb.x, bb.y, 8 * S, 0, Math.PI*2);
    ctx.fillStyle = '#ff4757'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffd700'; ctx.stroke();

    const dh = Math.hypot(playerX - bb.x, heroPlayerY - bb.y);
    if (dh < 30 * S) {
      bossBullets.splice(i, 1);
      if (isShieldActive || isReviveInvuln) {
        spawnFloatingText(playerX, H - 60 * S, 'BLOCKED', '#ffd700');
      } else {
        handlePlayerHit();
        if (!isGameRunning) { ctx.restore(); return; }
      }
      continue;
    }
    if (mpActive && mpRole === 'host' && mpGuestAlive) {
      const dg = Math.hypot(mpGuestX - bb.x, heroPlayerY - bb.y);
      if (dg < 30 * S) {
        bossBullets.splice(i, 1);
        mpGuestHP--;
        if (mpGuestHP <= 0) mpHandleGuestDeath();
        continue;
      }
    }
    if (bb.y > H || bb.x < -50 * S || bb.x > W + 50 * S) bossBullets.splice(i, 1);
  }

  // Hero aura
  ctx.save();
  const aA = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
  const aG = ctx.createRadialGradient(playerX, heroPlayerY + 20 * S, 4 * S, playerX, heroPlayerY + 20 * S, 55 * S);
  aG.addColorStop(0, `rgba(0,210,255,${aA})`);
  aG.addColorStop(1, 'rgba(0,210,255,0)');
  ctx.fillStyle = aG;
  ctx.beginPath();
  ctx.ellipse(playerX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  drawHeroVector(ctx, playerX, heroPlayerY, currentActor, false);

  // MP: draw guest
  if (mpActive && mpRole === 'host') {
    if (mpGuestAlive) {
      ctx.save();
      const gG = ctx.createRadialGradient(mpGuestX, heroPlayerY + 20 * S, 4 * S, mpGuestX, heroPlayerY + 20 * S, 55 * S);
      gG.addColorStop(0, `rgba(255,215,0,${aA})`);
      gG.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = gG;
      ctx.beginPath();
      ctx.ellipse(mpGuestX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      drawHeroVector(ctx, mpGuestX, heroPlayerY, mpRemoteHeroType, true);

      ctx.save();
      ctx.font = `bold ${11 * S}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
      ctx.fillText(mpRemoteName || 'Guest', mpGuestX, heroPlayerY - 50 * S);
      ctx.restore();
    }
  }

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
        m.y = Math.min(100 * S, m.y + m.speed);
        m.x = W / 2 + Math.sin(m.timeAlive * 2) * 140 * S;
        if (m.aimTimer > 0) {
          m.aimTimer--;
          if (m.aimTimer === 0) {
            const dx2 = m.aimTargetX - m.x;
            const dy2 = m.aimTargetY - m.y;
            const len = Math.hypot(dx2, dy2) || 1;
            bossBullets.push({ x: m.x, y: m.y + m.size, vx: (dx2/len)*7*S, vy: (dy2/len)*7*S });
            bossBullets.push({ x: m.x-20*S, y: m.y+m.size, vx: -1.5*S, vy: 6*S });
            bossBullets.push({ x: m.x+20*S, y: m.y+m.size, vx: 1.5*S, vy: 6*S });
            sounds.playBossShoot();
            m.shootTimer = 0;
          }
        } else if (m.shootTimer > 60) {
          m.aimTimer = 36;
          m.aimTargetX = playerX;
          m.aimTargetY = heroPlayerY;
          spawnTelegraph(m.x, m.y+m.size, playerX, heroPlayerY, 36, '#ff2e88');
        }
        if (m.minionTimer > 300) {
          m.minionTimer = 0;
          monsters.push(
            { x: m.x-60*S, startX: m.x-60*S, y: m.y+40*S, speed: 1.5*S, size: 28*S, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false },
            { x: m.x+60*S, startX: m.x+60*S, y: m.y+40*S, speed: 1.5*S, size: 28*S, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false }
          );
          spawnFloatingText(m.x, m.y+60*S, 'SUMMON!', '#ff4757');
        }
        if (m.type === 'boss30' && m.enrageTimer > 900) {
          m.enrageTimer = 0;
          const hv = Math.floor(m.maxHp * 0.10);
          m.hp = Math.min(m.maxHp, m.hp + hv);
          screenShake = 15;
          sounds.playBossWarning();
          spawnFloatingText(m.x, m.y-20*S, `REGEN +${hv}`, '#2ed573');
        }
        if (!m.noWeakPoint) {
          m.coreTimer++;
          const wasOpen = m.coreOpen;
          m.coreOpen = (m.coreTimer % 180) < 60;
          if (m.coreOpen && !wasOpen) m.coreGlow = 0;
          if (m.coreOpen) m.coreGlow = (m.coreGlow || 0) + 0.15;
        }
      } else {
        switch (m.algorithm) {
          case 'zigzag':  m.y += m.speed; m.x = m.startX + Math.sin(m.timeAlive * 3) * 65 * S; break;
          case 'gravity': m.speed += 0.04; m.y += m.speed; break;
          case 'stealth': m.y += m.speed; m.opacity = 0.3 + Math.abs(Math.sin(m.timeAlive * 2)) * 0.7; break;
          default:        m.y += m.speed; break;
        }
        if (m.canShoot) {
          if (m.aimTimer > 0) {
            m.aimTimer--;
            if (m.aimTimer === 0) {
              const dx2 = m.aimTargetX - m.x;
              const dy2 = m.aimTargetY - m.y;
              const len = Math.hypot(dx2, dy2) || 1;
              bossBullets.push({ x: m.x, y: m.y+m.size, vx: (dx2/len)*5*S, vy: (dy2/len)*5*S });
              sounds.playBossShoot();
              m.shootCooldown = 180 + Math.random() * 60;
            }
          } else {
            m.shootCooldown--;
            if (m.shootCooldown <= 0 && m.y > 40 * S && m.y < H - 100 * S) {
              m.aimTimer = 30;
              m.aimTargetX = playerX;
              m.aimTargetY = heroPlayerY;
              spawnTelegraph(m.x, m.y+m.size, playerX, heroPlayerY, 30, '#00d2d3');
            }
          }
        }
      }
    }

    // Draw shadow
    ctx.save();
    ctx.globalAlpha = m.opacity || 1.0;
    ctx.beginPath();
    ctx.ellipse(m.x, H - 38 * S, m.size * 0.7, m.size * 0.25, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    ctx.translate(m.x, m.y);

    if (m.type.startsWith('boss')) {
      ctx.save();
      ctx.rotate(m.aura || 0);
      ctx.beginPath(); ctx.arc(0, 0, m.size + 15 * S, 0, Math.PI*2);
      ctx.setLineDash([10, 14]); ctx.lineWidth = 4 * S;
      ctx.strokeStyle = currentTheme.accent; ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.globalAlpha = m.opacity || 1.0;

      const bg = ctx.createRadialGradient(0, 0, m.size*0.2, 0, 0, m.size);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.4, m.color);
      bg.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2);
      ctx.fillStyle = bg; ctx.fill();
      ctx.lineWidth = 5 * S; ctx.strokeStyle = '#ffd700'; ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-30 * S, -m.size);
      ctx.lineTo(-15 * S, -m.size - 25 * S);
      ctx.lineTo(0, -m.size - 10 * S);
      ctx.lineTo(15 * S, -m.size - 25 * S);
      ctx.lineTo(30 * S, -m.size);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-m.size*0.3, -10 * S, m.size*0.15, 0, Math.PI*2);
      ctx.arc(m.size*0.3, -10 * S, m.size*0.15, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(-m.size*0.3, -10 * S, m.size*0.07, 0, Math.PI*2);
      ctx.arc(m.size*0.3, -10 * S, m.size*0.07, 0, Math.PI*2);
      ctx.fill();

      if (!m.noWeakPoint && m.coreOpen) {
        ctx.save();
        const cg = ctx.createRadialGradient(0, 0, 4 * S, 0, 0, m.size*0.55);
        cg.addColorStop(0, 'rgba(255,50,50,0.95)');
        cg.addColorStop(0.5, 'rgba(255,200,0,0.7)');
        cg.addColorStop(1, 'rgba(255,50,50,0)');
        ctx.beginPath(); ctx.arc(0, 0, m.size*0.55, 0, Math.PI*2);
        ctx.fillStyle = cg; ctx.fill();
        ctx.restore();
      }
    } else if (m.type === 'donut') {
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2); ctx.fillStyle = '#fa8231'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.8, 0, Math.PI*2); ctx.fillStyle = '#ff78ae'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.35, 0, Math.PI*2); ctx.fillStyle = theme.bgTop; ctx.fill();
    } else if (m.type === 'cloud') {
      ctx.fillStyle = '#f1f2f6';
      ctx.beginPath();
      ctx.arc(-12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(0, -10 * S, m.size*0.7, 0, Math.PI*2);
      ctx.fill();
    } else if (m.type === 'crystal') {
      ctx.beginPath();
      ctx.moveTo(0, -m.size);
      ctx.lineTo(m.size, 0);
      ctx.lineTo(0, m.size);
      ctx.lineTo(-m.size, 0);
      ctx.closePath();
      ctx.fillStyle = '#00d2d3'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.stroke();
    } else {
      const rg = ctx.createRadialGradient(-m.size*0.3, -m.size*0.3, m.size*0.1, 0, 0, m.size);
      rg.addColorStop(0, '#ffffff');
      rg.addColorStop(0.3, m.color);
      rg.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2);
      ctx.fillStyle = rg; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
    }

    if (m.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = (m.hitFlash / 8) * 0.85;
      ctx.beginPath(); ctx.arc(0, 0, m.size*1.05, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
    }
    if (m.maxHp > 1 && !m.type.startsWith('boss')) {
      const wb = m.size * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-wb/2, -m.size - 18 * S, wb, 8 * S);
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(-wb/2, -m.size - 18 * S, (m.hp/m.maxHp)*wb, 8 * S);
    }
    ctx.restore();

    // Boss HP bar
    if (m.type.startsWith('boss')) {
      ctx.save();
      const bw = Math.min(400 * S, W * 0.6);
      const bx = (W - bw) / 2;
      const by = 15 * S;
      const bh = 18 * S;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(bx, by, (Math.max(0, m.hp)/m.maxHp)*bw, bh);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${12 * S}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      const cs = (!m.noWeakPoint && m.coreOpen) ? ' [CRITICAL]' : '';
      ctx.fillText(`BOSS HP: ${Math.ceil(Math.max(0, m.hp))} / ${m.maxHp}${cs}`, W/2, by + bh - 5 * S);
      ctx.restore();
    }

    if (m.y > H - 55 * S && !m.type.startsWith('boss')) {
      monsters.splice(i, 1);
      if (isShieldActive || isReviveInvuln) {
        spawnFloatingText(playerX, H - 60 * S, 'BLOCKED', '#ffd700');
      } else {
        handlePlayerHit();
        if (!isGameRunning) { ctx.restore(); return; }
      }
    }
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.04;
    p.vx *= 0.97; p.vy *= 0.97;
    if (p.rot !== undefined) p.rot += p.spin || 0;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    if (p.star) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || 0);
      ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        const a = (Math.PI*2/5)*s - Math.PI/2;
        const r = p.size*1.6;
        const x1 = Math.cos(a)*r, y1 = Math.sin(a)*r;
        s === 0 ? ctx.moveTo(x1, y1) : ctx.lineTo(x1, y1);
        const a2 = a + Math.PI/5, r2 = p.size*0.7;
        ctx.lineTo(Math.cos(a2)*r2, Math.sin(a2)*r2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

// =============================================================
// 19b. GUEST RENDER-ONLY LOOP
// Tidak ada physics, spawn, atau AI — hanya menggambar
// =============================================================
function gameLoopGuest() {
  const W = VIRTUAL_WIDTH;
  const H = VIRTUAL_HEIGHT;
  const S = GAME_SCALE;

  playerPulse += 0.08;
  const theme = currentTheme;

  ctx.save();

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, theme.bgTop);
  bgGrad.addColorStop(1, theme.bgBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars (efek lokal)
  stars.forEach(s => {
    s.y += s.speed;
    s.twinkle += 0.05;
    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    const a = s.opacity * (0.7 + Math.sin(s.twinkle) * 0.3);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = a;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
  ctx.globalAlpha = 1;

  // Ground
  const groundH = 40 * S;
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, H - groundH, W, groundH);
  ctx.fillStyle = theme.groundLine;
  ctx.globalAlpha = 0.6 + Math.sin(playerPulse * 0.5) * 0.2;
  ctx.fillRect(0, H - groundH - 5, W, 5);
  ctx.globalAlpha = 1;

  const heroPlayerY = H - 45 * S;

  // Kirim input ke host (30Hz throttle ada di MP engine)
  if (MP && MP.isConnected) {
    MP.sendInput({
      left: isMovingLeft,
      right: isMovingRight,
      shoot: true,
      skill1: false,
      skill2: false,
      skill3: false
    });
  }

  // Interpolasi posisi sendiri (dari host)
  const gdx = mpGuestX - playerX;
  if (Math.abs(gdx) > 0.5) playerX += gdx * 0.35;
  else playerX = mpGuestX;

  // ====== Draw host dulu (di belakang) ======
  if (mpRemoteAlive !== false) {
    const hostX = mpRemoteX;
    ctx.save();
    const aA = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
    const gG = ctx.createRadialGradient(hostX, heroPlayerY + 20 * S, 4 * S, hostX, heroPlayerY + 20 * S, 55 * S);
    gG.addColorStop(0, `rgba(255,215,0,${aA})`);
    gG.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = gG;
    ctx.beginPath();
    ctx.ellipse(hostX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    drawHeroVector(ctx, hostX, heroPlayerY, mpRemoteHeroType, true);

    // Host name tag
    ctx.save();
    ctx.font = `bold ${11 * S}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00d2ff';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
    ctx.fillText(mpRemoteName || 'Host', hostX, heroPlayerY - 50 * S);
    ctx.restore();
  }

  // ====== Draw monster dari host ======
  drawRemoteMonsters(ctx, W, H, S, heroPlayerY);

  // ====== Draw bullets dari host ======
  drawRemoteBullets(ctx, S);

  // ====== Draw hero sendiri (guest) ======
  ctx.save();
  const aA2 = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
  const aG2 = ctx.createRadialGradient(playerX, heroPlayerY + 20 * S, 4 * S, playerX, heroPlayerY + 20 * S, 55 * S);
  aG2.addColorStop(0, `rgba(0,210,255,${aA2})`);
  aG2.addColorStop(1, 'rgba(0,210,255,0)');
  ctx.fillStyle = aG2;
  ctx.beginPath();
  ctx.ellipse(playerX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  drawHeroVector(ctx, playerX, heroPlayerY, currentActor, false);

  // Name tag sendiri
  ctx.save();
  ctx.font = `bold ${11 * S}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
  ctx.fillText(playerName + ' (Kamu)', playerX, heroPlayerY - 50 * S);
  ctx.restore();

  // ====== Particles lokal ======
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.04;
    p.vx *= 0.97; p.vy *= 0.97;
    if (p.rot !== undefined) p.rot += p.spin || 0;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

// =============================================================
// 19c. DRAW HELPERS — monster & bullet dari host
// =============================================================
function drawRemoteMonsters(ctx, W, H, S, heroPlayerY) {
  for (let i = 0; i < mpRemoteMonsters.length; i++) {
    const m = mpRemoteMonsters[i];
    if (!m) continue;

    // Shadow
    ctx.save();
    ctx.globalAlpha = m.opacity || 1.0;
    ctx.beginPath();
    ctx.ellipse(m.x, H - 38 * S, m.size * 0.7, m.size * 0.25, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    ctx.translate(m.x, m.y);

    if (m.type && m.type.startsWith('boss')) {
      ctx.save();
      ctx.beginPath(); ctx.arc(0, 0, m.size + 15 * S, 0, Math.PI*2);
      ctx.setLineDash([10, 14]); ctx.lineWidth = 4 * S;
      ctx.strokeStyle = currentTheme.accent; ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.globalAlpha = m.opacity || 1.0;

      const bg = ctx.createRadialGradient(0, 0, m.size*0.2, 0, 0, m.size);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.4, m.color);
      bg.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2);
      ctx.fillStyle = bg; ctx.fill();
      ctx.lineWidth = 5 * S; ctx.strokeStyle = '#ffd700'; ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-30 * S, -m.size);
      ctx.lineTo(-15 * S, -m.size - 25 * S);
      ctx.lineTo(0, -m.size - 10 * S);
      ctx.lineTo(15 * S, -m.size - 25 * S);
      ctx.lineTo(30 * S, -m.size);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-m.size*0.3, -10 * S, m.size*0.15, 0, Math.PI*2);
      ctx.arc(m.size*0.3, -10 * S, m.size*0.15, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(-m.size*0.3, -10 * S, m.size*0.07, 0, Math.PI*2);
      ctx.arc(m.size*0.3, -10 * S, m.size*0.07, 0, Math.PI*2);
      ctx.fill();

      if (m.coreOpen) {
        ctx.save();
        const cg = ctx.createRadialGradient(0, 0, 4 * S, 0, 0, m.size*0.55);
        cg.addColorStop(0, 'rgba(255,50,50,0.95)');
        cg.addColorStop(0.5, 'rgba(255,200,0,0.7)');
        cg.addColorStop(1, 'rgba(255,50,50,0)');
        ctx.beginPath(); ctx.arc(0, 0, m.size*0.55, 0, Math.PI*2);
        ctx.fillStyle = cg; ctx.fill();
        ctx.restore();
      }
    } else if (m.type === 'donut') {
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2); ctx.fillStyle = '#fa8231'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.8, 0, Math.PI*2); ctx.fillStyle = '#ff78ae'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.35, 0, Math.PI*2); ctx.fillStyle = currentTheme.bgTop; ctx.fill();
    } else if (m.type === 'cloud') {
      ctx.fillStyle = '#f1f2f6';
      ctx.beginPath();
      ctx.arc(-12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(0, -10 * S, m.size*0.7, 0, Math.PI*2);
      ctx.fill();
    } else if (m.type === 'crystal') {
      ctx.beginPath();
      ctx.moveTo(0, -m.size);
      ctx.lineTo(m.size, 0);
      ctx.lineTo(0, m.size);
      ctx.lineTo(-m.size, 0);
      ctx.closePath();
      ctx.fillStyle = '#00d2d3'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.stroke();
    } else {
      const rg = ctx.createRadialGradient(-m.size*0.3, -m.size*0.3, m.size*0.1, 0, 0, m.size);
      rg.addColorStop(0, '#ffffff');
      rg.addColorStop(0.3, m.color);
      rg.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2);
      ctx.fillStyle = rg; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
    }

    if (m.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = (m.hitFlash / 8) * 0.85;
      ctx.beginPath(); ctx.arc(0, 0, m.size*1.05, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
    }
    if (m.maxHp > 1 && m.type && !m.type.startsWith('boss')) {
      const wb = m.size * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-wb/2, -m.size - 18 * S, wb, 8 * S);
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(-wb/2, -m.size - 18 * S, (m.hp/m.maxHp)*wb, 8 * S);
    }

    ctx.restore();
  }

  // Boss HP bar (global)
  const boss = mpRemoteMonsters.find(x => x.type && x.type.startsWith('boss'));
  if (boss) {
    ctx.save();
    const bw = Math.min(400 * S, W * 0.6);
    const bx = (W - bw) / 2;
    const by = 15 * S;
    const bh = 18 * S;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ff4757';
    ctx.fillRect(bx, by, (Math.max(0, boss.hp)/boss.maxHp)*bw, bh);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${12 * S}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    const cs = boss.coreOpen ? ' [CRITICAL]' : '';
    ctx.fillText(`BOSS HP: ${Math.ceil(Math.max(0, boss.hp))} / ${boss.maxHp}${cs}`, W/2, by + bh - 5 * S);
    ctx.restore();
  }
}

function drawRemoteBullets(ctx, S) {
  for (let i = 0; i < mpRemoteBullets.length; i++) {
    const b = mpRemoteBullets[i];
    if (!b) continue;

    ctx.save();
    ctx.translate(b.x, b.y);

    if (b.heroType === 'cat') {
      ctx.rotate((Date.now() * 0.01) % (Math.PI * 2));
      ctx.fillStyle = b.color;
      ctx.fillRect(-6 * S, -2 * S, 12 * S, 4 * S);
      ctx.fillRect(-2 * S, -6 * S, 4 * S, 12 * S);
    } else if (b.heroType === 'cannon') {
      ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2);
      ctx.fillStyle = '#ffd700'; ctx.fill();
      ctx.lineWidth = 3 * S; ctx.strokeStyle = '#ff4757'; ctx.stroke();
    } else if (b.heroType === 'unicorn') {
      ctx.fillStyle = '#a55eea';
      ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, b.size * 0.4, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, 10 * S);
      ctx.lineTo(0, -10 * S);
      ctx.lineWidth = b.size;
      ctx.strokeStyle = b.color;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// =============================================================
// 20. PLAYER HIT / REVIVE
// =============================================================
function handlePlayerHit() {
  if (isReviveInvuln) return;
  if (isReviveModalOpen) return;
  const oneLife = (gameMode === 'daily' && currentDailyModifier && currentDailyModifier.id === 'one_life');
  playerHitPoints--; playerHitFlash = 12;
  combo = 1; updateHUDValues();
  sounds.playHit(); screenShake = 12;
  triggerVibrate([60, 30, 60]);
  if (playerHitPoints > 0) {
    spawnFloatingText(playerX, VIRTUAL_HEIGHT - 60 * GAME_SCALE, `HP ${playerHitPoints}/${PLAYER_MAX_HIT_POINTS}`, '#ffa502');
  } else {
    if (oneLife) lives = 0; else lives--;
    playerHitPoints = PLAYER_MAX_HIT_POINTS;
    spawnFloatingText(playerX, VIRTUAL_HEIGHT - 60 * GAME_SCALE, '-1 ❤', '#ff4757');
    screenShake = 18;
  }
  updateLivesDisplay();
  if (lives <= 0) offerReviveOrFail();
}

async function offerReviveOrFail() {
  if (isReviveModalOpen) return;
  isReviveModalOpen = true;
  isGameRunning = false; isGamePaused = false;
  sounds.stopBGM();
  const tk = getTodayKey();
  try { reviveQuota = await getReviveQuota(tk); } catch(e) {}
  if (reviveUsedThisRun || reviveQuota <= 0) {
    isReviveModalOpen = false;
    finalizeFail();
    return;
  }
  const modal = document.getElementById('modal-revive');
  const q = document.getElementById('revive-quota');
  if (q) q.innerText = reviveQuota;
  if (modal) modal.classList.remove('hidden');
}

async function doRevive() {
  isReviveModalOpen = false;
  const tk = getTodayKey();
  try {
    reviveQuota = await getReviveQuota(tk);
    reviveQuota = Math.max(0, reviveQuota - 1);
    await saveReviveQuota(tk, reviveQuota);
  } catch(e) {}
  reviveUsedThisRun = true;
  lives = 1; isReviveInvuln = true; reviveInvulnTimer = 120;
  bossBullets = [];
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  updateLivesDisplay(); updateHUDValues(); updateReviveQuotaUI();
  isGameRunning = true; isGamePaused = false;
  startSpawnLoop();
  sounds.startBGM();
  spawnFloatingText(playerX, VIRTUAL_HEIGHT - 70 * GAME_SCALE, 'REVIVED!', '#39ff14');
  requestAnimationFrame(gameLoop);
}

// =============================================================
// 21. LEVEL COMPLETE / FAILED
// =============================================================
function onLevelCleared() {
  if (gameMode === 'endless') { finalizeEndless(); return; }
  if (gameMode === 'daily') { finalizeDaily(true); return; }
  if (gameMode === 'coop') { mpHostLevelComplete(); return; }
  levelComplete();
}
function onLevelFailed(reason) {
  if (gameMode === 'endless') { finalizeEndless(); return; }
  if (gameMode === 'daily') { finalizeDaily(false); return; }
  if (gameMode === 'coop') { mpEndGame(false, reason); return; }
  levelFailed(reason);
}

async function levelComplete() {
  isGameRunning = false; isGamePaused = false;
  stopSpawnLoop(); sounds.stopBGM(); sounds.playWin();
  const lc = levelsData[currentLevelIndex] || levelsData[0];
  unlockSticker(lc.level);
  saveScoreToGlobalLeaderboard(playerName, score, lc.level);
  const stars = (lives === 3 && combo >= 3) ? 3 : (lives === 3 ? 2 : 1);
  try { await setStar(lc.level, stars); } catch(e) {}

  const showResult = () => {
    const $ = id => document.getElementById(id);
    const rt = $('result-title'); if (rt) rt.innerText = "MISI SELESAI";
    const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
    const rs = $('result-score'); if (rs) rs.innerText = score;
    const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
    const rl = $('result-level'); if (rl) rl.innerText = lc.level;
    const rk = $('result-kills'); if (rk) rk.innerText = `${levelKills} Target`;
    const sc = $('result-stars');
    if (sc) {
      let h = '';
      for (let s = 0; s < 3; s++) h += `<svg class="star-mini ${s < stars ? 'on' : ''}" viewBox="0 0 24 24"><use href="#i-star"/></svg>`;
      sc.innerHTML = h;
    }
    const icon = $('result-icon');
    if (icon) { icon.innerHTML = '<use href="#i-trophy"/>'; icon.classList.remove('fail'); }
    const nb = $('btn-next-level'); if (nb) nb.classList.remove('hidden');
    const m = $('modal-result'); if (m) m.classList.remove('hidden');
  };

  const story = STORY[lc.level];
  const sk = 'story_after_seen_' + lc.level;
  let already = null;
  try { already = await DB.get(sk); } catch(e) {}
  if (story && story.after && !already) {
    DB.set(sk, '1');
    showNarrative(story.after.lines, story.after.speaker, story.after.portrait, showResult);
  } else showResult();
}

function levelFailed(reasonTitle) {
  isGameRunning = false; isGamePaused = false;
  stopSpawnLoop(); sounds.stopBGM();
  const lc = levelsData[currentLevelIndex] || levelsData[0];
  saveScoreToGlobalLeaderboard(playerName, score, lc.level);
  const $ = id => document.getElementById(id);
  const rt = $('result-title'); if (rt) rt.innerText = reasonTitle || "MISI GAGAL";
  const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
  const rs = $('result-score'); if (rs) rs.innerText = score;
  const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
  const rl = $('result-level'); if (rl) rl.innerText = lc.level;
  const rk = $('result-kills'); if (rk) rk.innerText = `${levelKills} Target`;
  const sc = $('result-stars');
  if (sc) sc.innerHTML = '<span style="color:#566a8c;font-size:12px;">—</span>';
  const icon = $('result-icon');
  if (icon) { icon.innerHTML = '<use href="#i-skull"/>'; icon.classList.add('fail'); }
  const nb = $('btn-next-level'); if (nb) nb.classList.add('hidden');
  const m = $('modal-result'); if (m) m.classList.remove('hidden');
}

function finalizeFail() {
  if (gameMode === 'endless') { finalizeEndless(); return; }
  if (gameMode === 'daily') { finalizeDaily(false); return; }
  if (gameMode === 'coop') { mpEndGame(false, "NYAWA HABIS"); return; }
  levelFailed("GAME OVER - NYAWA HABIS");
}

// =============================================================
// 22. ENDLESS MODE
// =============================================================
async function openEndlessModal() {
  const best = await getEndlessBest();
  const bw = document.getElementById('endless-best-wave'); if (bw) bw.innerText = best.wave;
  const bs = document.getElementById('endless-best-score'); if (bs) bs.innerText = best.score;
  document.getElementById('modal-endless').classList.remove('hidden');
}
function startEndless() {
  sounds.init();
  const inp = document.getElementById('player-name-input');
  playerName = (inp && inp.value.trim()) || 'Pahlawan';
  DB.set('pahlawan_nama', playerName);
  const pn = document.getElementById('player-name-display'); if (pn) pn.innerText = playerName;
  gameMode = 'endless';
  currentLevelIndex = 0; score = 0; lives = 3;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  endlessWave = 1; endlessKillsThisWave = 0;
  currentTheme = LEVEL_THEMES[0]; applyThemeToDocument(currentTheme); recolorStars();
  resetLevelState(); updateHUDValues(); updateLivesDisplay();
  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  resizeCanvas();
  updateGameScale();
  setTimeout(() => {
    resizeCanvas();
    updateGameScale();
    const d = { level: 999, targetKills: ENDLESS_KILLS_PER_WAVE, targetScore: 0, algorithm: 'linear', types: ['jelly'] };
    showLoadoutModal(d, () => {
      playerSpeed = 9 * GAME_SCALE;
      freezeCharges = playerLoadout.includes('freeze') ? upgradeFreeze : 0;
      shieldCharges = playerLoadout.includes('shield') ? upgradeShield : 0;
      bombCharges = playerLoadout.includes('bomb') ? upgradeBomb : 0;
      updateSkillButtonsUI();
      isGameRunning = true; isGamePaused = false;
      document.getElementById('level-intro-number').innerText = '∞';
      document.getElementById('level-intro-name').innerText = 'ENDLESS MODE';
      document.getElementById('level-intro-mission').innerText = 'SURVIVE AS LONG AS YOU CAN';
      const b = document.getElementById('level-intro');
      b.classList.remove('hidden'); b.classList.remove('fade-out');
      void b.offsetWidth;
      sounds.playLevelIntro();
      setTimeout(() => { b.classList.add('fade-out'); setTimeout(() => b.classList.add('hidden'), 500); }, 1800);
      sounds.startBGM();
      startSpawnLoop();
      gameLoop();
    });
  }, 60);
}
async function finalizeEndless() {
  isGameRunning = false; isGamePaused = false;
  stopSpawnLoop(); sounds.stopBGM(); sounds.playWin();
  await setEndlessBest(endlessWave, score);
  saveEndlessToGlobalLeaderboard(playerName, score, endlessWave);
  const $ = id => document.getElementById(id);
  const rt = $('result-title'); if (rt) rt.innerText = "ENDLESS BERAKHIR";
  const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
  const rs = $('result-score'); if (rs) rs.innerText = score;
  const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
  const rl = $('result-level'); if (rl) rl.innerText = `Wave ${endlessWave}`;
  const rk = $('result-kills'); if (rk) rk.innerText = `${levelKills} Total Kills`;
  const sc = $('result-stars');
  if (sc) sc.innerHTML = `<span style="color:#ffd700;font-size:12px;">WAVE ${endlessWave}</span>`;
  const icon = $('result-icon');
  if (icon) { icon.innerHTML = '<use href="#i-trophy"/>'; icon.classList.remove('fail'); }
  const nb = $('btn-next-level'); if (nb) nb.classList.add('hidden');
  document.getElementById('modal-result').classList.remove('hidden');
}

// =============================================================
// 23. DAILY MODE
// =============================================================
async function openDailyModal() {
  currentDailyModifier = getDailyModifier();
  dailyBossSequence = getDailyBossSequence();
  const $ = id => document.getElementById(id);
  const d = new Date();
  const de = $('daily-date');
  if (de) de.innerText = d.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  for (let i = 0; i < 3; i++) {
    const n = $('daily-boss-' + i + '-name');
    if (n) n.innerText = getBossName(dailyBossSequence[i]);
  }
  const nm = $('daily-mod-name'); if (nm) nm.innerText = currentDailyModifier.name;
  const ds = $('daily-mod-desc'); if (ds) ds.innerText = currentDailyModifier.desc;
  const iw = document.querySelector('.daily-mod-icon svg use');
  if (iw) iw.setAttribute('href', '#' + currentDailyModifier.icon);
  const tk = getTodayKey();
  const done = await DB.get('pahlawan_daily_done_' + tk);
  const badge = $('daily-done-badge');
  const sb = $('btn-start-daily');
  const pr = $('daily-progress');
  if (done === '1') {
    for (let i = 0; i < 3; i++) {
      const c = $('daily-boss-' + i + '-check'); if (c) c.classList.remove('hidden');
      const s = document.querySelector('.daily-boss-slot[data-slot="' + i + '"]');
      if (s) s.classList.add('completed');
    }
    if (badge) badge.classList.remove('hidden');
    if (sb) sb.disabled = true;
    if (pr) pr.classList.add('hidden');
  } else {
    for (let i = 0; i < 3; i++) {
      const c = $('daily-boss-' + i + '-check'); if (c) c.classList.add('hidden');
      const s = document.querySelector('.daily-boss-slot[data-slot="' + i + '"]');
      if (s) s.classList.remove('completed');
    }
    if (badge) badge.classList.add('hidden');
    if (sb) sb.disabled = false;
    if (pr) pr.classList.add('hidden');
  }
  const timer = $('daily-reset-timer');
  if (timer) timer.innerText = formatTime(secondsUntilMidnight());
  document.getElementById('modal-daily').classList.remove('hidden');
  if (window._dailyTimer) clearInterval(window._dailyTimer);
  window._dailyTimer = setInterval(() => {
    const el = $('daily-reset-timer');
    if (el) el.innerText = formatTime(secondsUntilMidnight());
  }, 1000);
}
function startDaily() {
  sounds.init();
  const inp = document.getElementById('player-name-input');
  playerName = (inp && inp.value.trim()) || 'Pahlawan';
  DB.set('pahlawan_nama', playerName);
  const pn = document.getElementById('player-name-display'); if (pn) pn.innerText = playerName;
  currentDailyModifier = getDailyModifier();
  dailyBossSequence = getDailyBossSequence();
  dailyBossIndex = 0; nextBossSpawnTime = 0;
  gameMode = 'daily'; score = 0;
  lives = (currentDailyModifier.id === 'one_life') ? 1 : 3;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  const fb = dailyBossSequence[0];
  currentTheme = getBossTheme(fb); applyThemeToDocument(currentTheme); recolorStars();
  resetLevelState(); updateHUDValues(); updateLivesDisplay();
  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  resizeCanvas();
  updateGameScale();
  setTimeout(() => {
    resizeCanvas();
    updateGameScale();
    const d = { level: 999, targetKills: 1, targetScore: 0, algorithm: 'boss_daily', types: ['boss'] };
    showLoadoutModal(d, () => {
      playerSpeed = 9 * GAME_SCALE;
      freezeCharges = playerLoadout.includes('freeze') ? upgradeFreeze : 0;
      shieldCharges = (currentDailyModifier.id !== 'no_shield' && playerLoadout.includes('shield')) ? upgradeShield : 0;
      bombCharges = playerLoadout.includes('bomb') ? upgradeBomb : 0;
      updateSkillButtonsUI();
      isGameRunning = true; isGamePaused = false;
      const b = document.getElementById('level-intro');
      document.getElementById('level-intro-number').innerText = 'BOS 1';
      document.getElementById('level-intro-name').innerText = getBossName(fb);
      document.getElementById('level-intro-mission').innerText = 'DAILY 3 BOS · 1/3';
      b.classList.remove('hidden'); b.classList.remove('fade-out');
      void b.offsetWidth;
      sounds.playLevelIntro();
      setTimeout(() => { b.classList.add('fade-out'); setTimeout(() => b.classList.add('hidden'), 500); }, 1800);
      sounds.startBGM();
      startSpawnLoop();
      gameLoop();
    });
  }, 60);
}
function handleDailyBossDefeated() {
  const dIdx = dailyBossIndex;
  dailyBossIndex++;
  const c = document.getElementById('daily-boss-' + dIdx + '-check');
  if (c) c.classList.remove('hidden');
  const s = document.querySelector('.daily-boss-slot[data-slot="' + dIdx + '"]');
  if (s) s.classList.add('completed');
  if (dailyBossIndex >= 3) { finalizeDaily(true); return; }
  const b = document.getElementById('level-intro');
  if (b) {
    const nb = dailyBossSequence[dailyBossIndex];
    document.getElementById('level-intro-number').innerText = 'BOS ' + (dailyBossIndex + 1);
    document.getElementById('level-intro-name').innerText = getBossName(nb);
    document.getElementById('level-intro-mission').innerText = (dailyBossIndex === 2) ? 'FINAL BOSS!' : 'BOSS DEFEATED! NEXT...';
    b.classList.remove('hidden'); b.classList.remove('fade-out');
    void b.offsetWidth;
    sounds.playBossWarning();
    setTimeout(() => { b.classList.add('fade-out'); setTimeout(() => b.classList.add('hidden'), 500); }, 2200);
  }
  nextBossSpawnTime = Date.now() + 2800;
  bullets = []; bossBullets = []; telegraphs = [];
  updateHUDValues();
}
async function finalizeDaily(success) {
  isGameRunning = false; isGamePaused = false;
  stopSpawnLoop(); sounds.stopBGM();
  if (success) sounds.playWin();
  const tk = getTodayKey();
  if (success) {
    DB.set('pahlawan_daily_done_' + tk, '1');
    const bonus = 500;
    coins += bonus; levelCoinsEarned += bonus;
    DB.set('pahlawan_coins', coins);
    saveDailyToGlobalLeaderboard(playerName, score, tk);
  }
  const $ = id => document.getElementById(id);
  const rt = $('result-title'); if (rt) rt.innerText = success ? "DAILY MASTER!" : "DAILY GAGAL";
  const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
  const rs = $('result-score'); if (rs) rs.innerText = score;
  const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
  const rl = $('result-level'); if (rl) rl.innerText = success ? '3/3 BOS' : `${dailyBossIndex}/3 BOS`;
  const rk = $('result-kills'); if (rk) rk.innerText = `${dailyBossIndex} Bos Dikalahkan`;
  const sc = $('result-stars');
  if (sc) {
    if (success) {
      let h = '';
      for (let s = 0; s < 3; s++) h += `<svg class="star-mini on" viewBox="0 0 24 24"><use href="#i-star"/></svg>`;
      sc.innerHTML = h;
    } else sc.innerHTML = '<span style="color:#566a8c;font-size:12px;">—</span>';
  }
  const icon = $('result-icon');
  if (icon) { icon.innerHTML = success ? '<use href="#i-trophy"/>' : '<use href="#i-skull"/>'; icon.classList.toggle('fail', !success); }
  const nb = $('btn-next-level'); if (nb) nb.classList.add('hidden');
  document.getElementById('modal-result').classList.remove('hidden');
}

// =============================================================
// 24. LEADERBOARD
// =============================================================
function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
  const cleanName = (name || 'Pahlawan').trim();
  if (!cleanName) return;
  const playerKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const numScore = Number(scoreVal) || 0;
  const numLevel = Number(levelVal) || 1;
  const sortValue = (numLevel * 100000000) + numScore;
  let ls = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  let idx = ls.findIndex(s => (s.name || '').trim().toLowerCase() === cleanName.toLowerCase());
  let upd = false;
  if (idx === -1) { upd = true; ls.push({ name: cleanName, score: numScore, level: numLevel, sortValue }); }
  else {
    let o = ls[idx];
    let ol = Number(o.level) || 1, os = Number(o.score) || 0;
    if (numLevel > ol || (numLevel === ol && numScore > os)) { upd = true; ls[idx] = { name: cleanName, score: numScore, level: numLevel, sortValue }; }
  }
  if (upd) {
    ls.sort((a, b) => {
      let la = Number(a.level)||1, lb = Number(b.level)||1;
      if (lb !== la) return lb - la;
      return (Number(b.score)||0) - (Number(a.score)||0);
    });
    DB.set('pahlawan_scores', JSON.stringify(ls.slice(0, 20)));
  }
  if (db && playerKey) {
    const ref = db.ref('leaderboard/' + playerKey);
    ref.once('value').then(snap => {
      let ex = snap.val();
      let su = false;
      if (!ex) su = true;
      else {
        let ol = Number(ex.level)||0, os = Number(ex.score)||0;
        if (numLevel > ol || (numLevel === ol && numScore > os)) su = true;
      }
      if (su) ref.set({ name: cleanName, score: numScore, level: numLevel, sortValue, timestamp: Date.now() }).catch(() => {});
    }).catch(() => {});
  }
}
function saveEndlessToGlobalLeaderboard(name, scoreVal, waveVal) {
  const cleanName = (name || 'Pahlawan').trim();
  if (!cleanName) return;
  const pk = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ns = Number(scoreVal)||0, nw = Number(waveVal)||1;
  const sv = (nw * 100000000) + ns;
  if (db && pk) {
    const r = db.ref('endless/' + pk);
    r.once('value').then(s => {
      let ex = s.val(), su = false;
      if (!ex) su = true;
      else {
        let ow = Number(ex.wave)||0, os = Number(ex.score)||0;
        if (nw > ow || (nw === ow && ns > os)) su = true;
      }
      if (su) r.set({ name: cleanName, score: ns, wave: nw, sortValue: sv, timestamp: Date.now() }).catch(() => {});
    }).catch(() => {});
  }
}
function saveDailyToGlobalLeaderboard(name, scoreVal, dateKey) {
  const cleanName = (name || 'Pahlawan').trim();
  if (!cleanName) return;
  const pk = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ns = Number(scoreVal)||0;
  if (db && pk) {
    db.ref('daily/' + dateKey + '/' + pk).set({
      name: cleanName, score: ns, sortValue: ns, timestamp: Date.now()
    }).catch(() => {});
  }
}

function openLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === currentLeaderboardTab));
  loadLeaderboardData();
}

async function loadLeaderboardData() {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Memuat...</td></tr>';
  if (leaderboardRef && leaderboardHandler) {
    try { leaderboardRef.off('value', leaderboardHandler); } catch(e) {}
    leaderboardRef = null; leaderboardHandler = null;
  }
  if (!db) { showLocalScores(tbody); return; }

  let path = 'leaderboard';
  let tk = 'global';
  if (currentLeaderboardTab === 'endless') { path = 'endless'; tk = 'endless'; }
  else if (currentLeaderboardTab === 'daily') { path = 'daily/' + getTodayKey(); tk = 'daily'; }
  else if (currentLeaderboardTab === 'coop') { path = 'leaderboard_coop'; tk = 'coop'; }

  if (!lbMigratedThisSession[tk]) {
    try {
      const all = await db.ref(path).once('value');
      const u = {}; let missing = 0;
      all.forEach(c => {
        const v = c.val();
        if (v && v.name && (v.sortValue === undefined || v.sortValue === null)) {
          missing++;
          const nl = Number(v.level)||Number(v.wave)||1;
          const nsc = Number(v.score)||0;
          u[c.key + '/sortValue'] = (nl * 100000000) + nsc;
        }
      });
      if (missing > 0 && Object.keys(u).length > 0) await db.ref(path).update(u);
      lbMigratedThisSession[tk] = true;
    } catch(e) {}
  }

  leaderboardRef = db.ref(path).orderByChild('sortValue').limitToLast(100);
  let lrt = 0, pend = null, rt = null;
  const doR = () => {
    if (!pend) return;
    const s = pend; pend = null; lrt = Date.now();
    renderLeaderboardRows(s, tbody);
  };
  leaderboardHandler = (snap) => {
    pend = snap;
    const n = Date.now(), sl = n - lrt;
    if (sl >= 1000) doR();
    else if (!rt) rt = setTimeout(() => { rt = null; doR(); }, 1000 - sl);
  };
  leaderboardRef.on('value', leaderboardHandler, (err) => { showLocalScores(tbody); });
}

function renderLeaderboardRows(snapshot, tbody) {
  if (!snapshot.exists()) { showLocalScores(tbody); return; }
  let arr = [];
  snapshot.forEach(c => {
    const v = c.val();
    if (!v || !v.name) return;
    const cn = String(v.name).trim();
    if (!cn) return;
    if (currentLeaderboardTab === 'coop') {
      arr.push({
        key: c.key,
        name: (v.name1 || cn) + ' + ' + (v.name2 || '?'),
        level: Number(v.level)||1,
        score: Number(v.score)||0,
        sortValue: v.sortValue
      });
    } else {
      arr.push({ key: c.key, name: cn, level: Number(v.level)||Number(v.wave)||1, score: Number(v.score)||0, sortValue: v.sortValue });
    }
  });
  if (arr.length === 0) { showLocalScores(tbody); return; }
  arr.sort((a, b) => {
    const asv = (a.sortValue !== undefined && a.sortValue !== null) ? Number(a.sortValue) : ((a.level * 100000000) + a.score);
    const bsv = (b.sortValue !== undefined && b.sortValue !== null) ? Number(b.sortValue) : ((b.level * 100000000) + b.score);
    return bsv - asv;
  });
  const dm = new Map();
  arr.forEach(it => {
    const k = it.name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!dm.has(k)) dm.set(k, it);
  });
  let uniq = Array.from(dm.values());
  uniq.sort((a, b) => {
    const asv = (a.sortValue !== undefined && a.sortValue !== null) ? Number(a.sortValue) : ((a.level * 100000000) + a.score);
    const bsv = (b.sortValue !== undefined && b.sortValue !== null) ? Number(b.sortValue) : ((b.level * 100000000) + b.score);
    return bsv - asv;
  });
  const top = uniq.slice(0, 50);
  if (top.length === 0) { showLocalScores(tbody); return; }
  const myKey = (playerName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  tbody.innerHTML = top.map((s, i) => {
    const sk = (s.name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
    const isYou = sk === myKey || (currentLeaderboardTab === 'coop' && sk.indexOf(myKey) >= 0);
    const m = i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : i + 1;
    return `<tr class="${isYou ? 'you-row' : ''}"><td>${m}</td><td><strong>${escapeHtml(s.name)}</strong></td><td>Lvl ${s.level||1}</td><td><strong>${s.score||0}</strong></td></tr>`;
  }).join('');
}

function showLocalScores(tbody) {
  let ls = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  let bm = new Map();
  ls.forEach(s => {
    if (!s || !s.name) return;
    const cn = s.name.trim();
    const k = cn.toLowerCase();
    const cl = Number(s.level)||1, csc = Number(s.score)||0;
    if (!bm.has(k)) bm.set(k, { name: cn, level: cl, score: csc });
    else {
      const e = bm.get(k);
      if (cl > e.level || (cl === e.level && csc > e.score)) bm.set(k, { name: cn, level: cl, score: csc });
    }
  });
  let arr = Array.from(bm.values());
  arr.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.score - a.score;
  });
  if (arr.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Belum ada skor.</td></tr>';
  } else {
    tbody.innerHTML = arr.slice(0, 50).map((s, i) => `<tr><td>${i+1}</td><td><strong>${escapeHtml(s.name)}</strong></td><td>Lvl ${s.level||1}</td><td><strong>${s.score||0}</strong></td></tr>`).join('');
  }
}

function escapeHtml(t) {
  return String(t || 'Pahlawan').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
}

// =============================================================
// 25. LOADOUT MODAL
// =============================================================
function showLoadoutModal(levelConfig, onDone) {
  loadoutCallback = onDone;
  loadoutCurrentSelection = [...playerLoadout];
  const lvlEl = document.getElementById('loadout-level');
  if (lvlEl) {
    if (gameMode === 'endless') lvlEl.innerText = '∞';
    else if (gameMode === 'daily') lvlEl.innerText = 'BOS ' + (dailyBossIndex + 1);
    else lvlEl.innerText = levelConfig.level;
  }
  const thEl = document.getElementById('loadout-theme');
  if (thEl) thEl.innerText = currentTheme.name;
  const cards = document.querySelectorAll('.loadout-card');
  const sb = document.getElementById('btn-start-loaded');
  const uv = () => {
    cards.forEach(c => {
      const s = c.dataset.skill;
      const sel = loadoutCurrentSelection.includes(s);
      c.classList.toggle('selected', sel);
      c.classList.toggle('disabled', !sel && loadoutCurrentSelection.length >= 2);
    });
    if (sb) sb.disabled = loadoutCurrentSelection.length !== 2;
  };
  cards.forEach(card => {
    const s = card.dataset.skill;
    card.onclick = () => {
      if (loadoutCurrentSelection.includes(s)) loadoutCurrentSelection = loadoutCurrentSelection.filter(x => x !== s);
      else {
        if (loadoutCurrentSelection.length >= 2) loadoutCurrentSelection.shift();
        loadoutCurrentSelection.push(s);
      }
      uv();
    };
  });
  uv();
  document.getElementById('modal-loadout').classList.remove('hidden');
}

// =============================================================
// 26. NARRATIVE
// =============================================================
function showNarrative(lines, speaker, portrait, onDone) {
  if (!lines || lines.length === 0) { if (onDone) onDone(); return; }
  storyQueue = lines.slice();
  storyOnDone = onDone || null;
  const spk = document.getElementById('narrative-speaker');
  if (spk) spk.innerText = speaker || '';
  const psvg = document.getElementById('narrative-portrait-svg');
  if (psvg) psvg.innerHTML = `<use href="#${portrait || 'i-vega'}"/>`;
  document.getElementById('narrative-overlay').classList.remove('hidden');
  playNextStoryLine();
}
function playNextStoryLine() {
  if (storyQueue.length === 0) {
    document.getElementById('narrative-overlay').classList.add('hidden');
    const cb = storyOnDone; storyOnDone = null;
    if (cb) cb();
    return;
  }
  const line = storyQueue.shift();
  typeStoryLine(line);
}
function typeStoryLine(line) {
  storyTyping = true;
  storyCurrentText = line; storyCurrentIdx = 0;
  const el = document.getElementById('narrative-text');
  if (!el) { storyTyping = false; playNextStoryLine(); return; }
  el.innerHTML = '<span id="story-body"></span><span class="caret">&nbsp;</span>';
  const body = document.getElementById('story-body');
  if (storyTimer) clearInterval(storyTimer);
  storyTimer = setInterval(() => {
    if (storyCurrentIdx >= storyCurrentText.length) {
      clearInterval(storyTimer); storyTimer = null; storyTyping = false;
      return;
    }
    if (body) body.textContent += storyCurrentText[storyCurrentIdx++];
    else storyCurrentIdx++;
    if (storyCurrentIdx % 3 === 0) sounds.playType();
  }, 28);
}

// =============================================================
// 27. STICKER
// =============================================================
function unlockSticker(id) {
  let u = JSON.parse(localStorage.getItem('pahlawan_stickers') || '[]');
  if (!u.includes(id)) {
    u.push(id); DB.set('pahlawan_stickers', JSON.stringify(u)); updateStickerAlbumUI();
  }
}
function updateStickerAlbumUI() {
  const u = JSON.parse(localStorage.getItem('pahlawan_stickers') || '[]');
  const e = document.getElementById('unlocked-count');
  if (e) e.innerText = u.length;
}
function openStickerAlbum() {
  const u = JSON.parse(localStorage.getItem('pahlawan_stickers') || '[]');
  const g = document.getElementById('sticker-grid');
  if (!g) return;
  g.innerHTML = (stickersData || DEFAULT_STICKERS).map((s, i) => {
    const un = u.includes(s.id);
    return `<div class="sticker-card ${un ? '' : 'locked'}" style="animation-delay:${(i*0.03).toFixed(2)}s"><div class="sticker-title">${un ? s.title : 'Terkunci'}</div></div>`;
  }).join('');
  document.getElementById('modal-stickers').classList.remove('hidden');
}

// =============================================================
// 28. INIT MP CALLBACKS
// =============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    if (typeof MP !== 'undefined') {
      mpSetupCallbacks();
      console.log('✅ [MP] Callbacks attached');
    } else {
      console.warn('⚠️ [MP] multiplayer.js belum loaded');
    }
  }, 500);
});

// =============================================================
// END OF FILE — v18.1
// =============================================================
