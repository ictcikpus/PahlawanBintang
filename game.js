// =============================================================
// PAHLAWAN BINTANG — game.js v21.0.0 — PART 1/4
// Setup, Hero Data (20), DB, Achievements, Themes, Sound, State
// =============================================================

// =============================================================
// 1. FIREBASE
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
try { firebase.initializeApp(firebaseConfig); db = firebase.database(); console.log("🔥 Firebase OK"); }
catch(e) { console.log("⚠️ Firebase Offline"); }

// =============================================================
// 2. HERO DATA — 20 HEROES
// =============================================================
const HERO_DATA = {
  robot:   { id:'robot',   name:'Robot Cyber',    desc:'Hero seimbang dengan laser ganda standar.',          color:'#1e90ff', accent:'#70a1ff', bulletType:'laser-double',   bulletCount:2, bulletPierce:1, bulletSize:5,  bulletSpeed:14, fireRate:160, sound:'laser',       difficulty:'easy',   locked:false, quizTime:0  },
  cannon:  { id:'cannon',  name:'Meriam Bintang', desc:'Satu tembakan besar dengan damage tinggi.',          color:'#ff4757', accent:'#ffd700', bulletType:'heavy-shot',     bulletCount:1, bulletPierce:1, bulletSize:14, bulletSpeed:11, fireRate:210, sound:'cannonBlast', difficulty:'medium', locked:true,  quizTime:60 },
  dragon:  { id:'dragon',  name:'Cyber Dragon',   desc:'Napas api tiga arah yang menyebar.',                 color:'#2ed573', accent:'#7dff8e', bulletType:'triple-spread',  bulletCount:3, bulletPierce:1, bulletSize:6,  bulletSpeed:13, fireRate:180, sound:'dragonRoar',  difficulty:'medium', locked:true,  quizTime:60 },
  cat:     { id:'cat',     name:'Ninja Cat',      desc:'Tembakan cepat dengan spread acak ringan.',          color:'#ffa502', accent:'#ffd700', bulletType:'rapid-fire',     bulletCount:1, bulletPierce:1, bulletSize:6,  bulletSpeed:15, fireRate:110, sound:'rapid',       difficulty:'medium', locked:true,  quizTime:60 },
  unicorn: { id:'unicorn', name:'Unicorn Star',   desc:'Tembakan bintang yang menembus 2 musuh.',            color:'#a55eea', accent:'#ffd700', bulletType:'piercing-star',  bulletCount:1, bulletPierce:2, bulletSize:8,  bulletSpeed:13, fireRate:200, sound:'magicSpark',  difficulty:'medium', locked:true,  quizTime:60 },
  phoenix: { id:'phoenix', name:'Phoenix Api',    desc:'Terbang dari abu, menembak 3 bola api membara.',     color:'#ff8c00', accent:'#ffd700', bulletType:'flame-spread',   bulletCount:3, bulletPierce:1, bulletSize:7,  bulletSpeed:12, fireRate:190, sound:'fireWhoosh',  difficulty:'medium', locked:true,  quizTime:60 },
  ninja:   { id:'ninja',   name:'Shadow Ninja',   desc:'Shuriken cepat berputar, damage senyap.',            color:'#1a1a2a', accent:'#c56cf0', bulletType:'shuriken-spin',  bulletCount:2, bulletPierce:1, bulletSize:7,  bulletSpeed:16, fireRate:130, sound:'shuriken',    difficulty:'hard',   locked:true,  quizTime:60 },
  wizard:  { id:'wizard',  name:'Star Wizard',    desc:'Orb sihir bintang yang menembus dan berkilau.',      color:'#00b8d4', accent:'#ffffff', bulletType:'magic-orb',      bulletCount:1, bulletPierce:2, bulletSize:9,  bulletSpeed:13, fireRate:200, sound:'arcaneOrb',   difficulty:'medium', locked:true,  quizTime:60 },
  archer:  { id:'archer',  name:'Elite Archer',   desc:'Panah emas yang menembus 3 musuh sekaligus.',        color:'#2ed573', accent:'#ffd700', bulletType:'golden-arrow',   bulletCount:1, bulletPierce:3, bulletSize:5,  bulletSpeed:18, fireRate:220, sound:'bowRelease',  difficulty:'easy',   locked:true,  quizTime:60 },
  ghost:   { id:'ghost',   name:'Void Ghost',     desc:'Soul blast 5 arah yang menyeramkan.',                color:'#e6eefc', accent:'#00d2d3', bulletType:'soul-spread',    bulletCount:5, bulletPierce:1, bulletSize:5,  bulletSpeed:11, fireRate:240, sound:'ghostWail',   difficulty:'hard',   locked:true,  quizTime:60 },
  tiger:   { id:'tiger',   name:'Tiger Blaze',    desc:'Dua cakar api yang membara ke arah musuh.',          color:'#ff6b00', accent:'#ffd700', bulletType:'flame-claw',     bulletCount:2, bulletPierce:1, bulletSize:7,  bulletSpeed:13, fireRate:170, sound:'fireWhoosh',  difficulty:'medium', locked:true,  quizTime:60 },
  eagle:   { id:'eagle',   name:'Sky Eagle',      desc:'Bulu elang tajam yang menembus pertahanan.',         color:'#ffffff', accent:'#00d2ff', bulletType:'homing-feather', bulletCount:1, bulletPierce:2, bulletSize:6,  bulletSpeed:15, fireRate:190, sound:'bowRelease',  difficulty:'medium', locked:true,  quizTime:60 },
  samurai: { id:'samurai', name:'Star Samurai',   desc:'Tebasan katana plasma tiga arah.',                   color:'#c56cf0', accent:'#ffd700', bulletType:'katana-slash',   bulletCount:3, bulletPierce:2, bulletSize:6,  bulletSpeed:16, fireRate:200, sound:'shuriken',    difficulty:'hard',   locked:true,  quizTime:60 },
  alien:   { id:'alien',   name:'Cosmic Alien',   desc:'Bola plasma yang meledak saat kena.',                color:'#39ff14', accent:'#00ffff', bulletType:'plasma-ball',    bulletCount:2, bulletPierce:1, bulletSize:8,  bulletSpeed:12, fireRate:180, sound:'magicSpark',  difficulty:'medium', locked:true,  quizTime:60 },
  mecha:   { id:'mecha',   name:'Mega Mecha',     desc:'Meriam ganda kelas berat penghancur.',               color:'#7f8fa6', accent:'#ffd700', bulletType:'twin-cannon',    bulletCount:2, bulletPierce:1, bulletSize:10, bulletSpeed:12, fireRate:220, sound:'cannonBlast', difficulty:'medium', locked:true,  quizTime:60 },
  wolf:    { id:'wolf',    name:'Lunar Wolf',     desc:'Sinar bulan yang menembus gelap gulita.',            color:'#a4b0be', accent:'#00d2ff', bulletType:'moon-beam',      bulletCount:1, bulletPierce:3, bulletSize:7,  bulletSpeed:17, fireRate:200, sound:'laser',       difficulty:'medium', locked:true,  quizTime:60 },
  bee:     { id:'bee',     name:'Hyper Bee',      desc:'Sengat lebah yang menyebar cepat.',                  color:'#ffd700', accent:'#1a1a1a', bulletType:'swarm-sting',    bulletCount:4, bulletPierce:1, bulletSize:5,  bulletSpeed:16, fireRate:140, sound:'rapid',       difficulty:'easy',   locked:true,  quizTime:60 },
  kraken:  { id:'kraken',  name:'Void Kraken',    desc:'Tentakel void yang menyebar luas.',                  color:'#3d0060', accent:'#ff00ff', bulletType:'tentacle-spread',bulletCount:5, bulletPierce:1, bulletSize:7,  bulletSpeed:11, fireRate:230, sound:'ghostWail',   difficulty:'hard',   locked:true,  quizTime:60 },
  titan:   { id:'titan',   name:'Iron Titan',     desc:'Palu godam plasma raksasa penghancur.',              color:'#57606f', accent:'#ffd700', bulletType:'hammer-shot',    bulletCount:1, bulletPierce:1, bulletSize:16, bulletSpeed:11, fireRate:280, sound:'cannonBlast', difficulty:'hard',   locked:true,  quizTime:60 },
  angel:   { id:'angel',   name:'Light Angel',    desc:'Sinar suci yang membelah kegelapan.',                color:'#ffffff', accent:'#ffd700', bulletType:'holy-beam',      bulletCount:2, bulletPierce:3, bulletSize:7,  bulletSpeed:14, fireRate:210, sound:'magicSpark',  difficulty:'medium', locked:true,  quizTime:60 }
};
const ALL_HEROES = Object.keys(HERO_DATA);
const HERO_DEFAULT_UNLOCKED = ['robot'];

// =============================================================
// 3. ENVIRONMENT
// =============================================================
const IS_TOUCH_DEVICE = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
const IS_DESKTOP = !IS_TOUCH_DEVICE || window.matchMedia('(pointer: fine)').matches;
let desktopHintsVisible = false;

// =============================================================
// 4. MATH QUIZ GENERATOR
// =============================================================
function generateMathQuestions(heroId, count, difficulty) {
  const hero = HERO_DATA[heroId];
  const diffLevel = difficulty || hero.difficulty || 'medium';
  let maxNum = 20, ops = ['+','-'];
  if (diffLevel === 'easy') { maxNum = 20; ops = ['+','-']; }
  else if (diffLevel === 'medium') { maxNum = 50; ops = ['+','-','×']; }
  else if (diffLevel === 'hard') { maxNum = 100; ops = ['+','-','×','÷']; }
  const questions = [];
  const seen = new Set();
  let attempts = 0;
  while (questions.length < count && attempts < count * 20) {
    attempts++;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer, questionText;
    if (op === '+') { a = Math.floor(Math.random()*maxNum)+1; b = Math.floor(Math.random()*maxNum)+1; answer = a+b; questionText = `${a} + ${b} = ?`; }
    else if (op === '-') { a = Math.floor(Math.random()*maxNum)+10; b = Math.floor(Math.random()*a)+1; answer = a-b; questionText = `${a} - ${b} = ?`; }
    else if (op === '×') { const factor = diffLevel==='hard'?12:(diffLevel==='medium'?9:5); a=Math.floor(Math.random()*factor)+2; b=Math.floor(Math.random()*factor)+2; answer=a*b; questionText=`${a} × ${b} = ?`; }
    else { const factor = diffLevel==='hard'?12:9; b=Math.floor(Math.random()*factor)+2; const q=Math.floor(Math.random()*factor)+2; a=b*q; answer=q; questionText=`${a} ÷ ${b} = ?`; }
    if (seen.has(questionText)) continue;
    seen.add(questionText);
    const opts = new Set([answer]);
    let guard = 0;
    while (opts.size < 4 && guard < 50) {
      guard++;
      const delta = Math.floor(Math.random()*Math.max(4,Math.floor(answer*0.3)))+1;
      const sign = Math.random() < 0.5 ? -1 : 1;
      const fake = answer + sign*delta;
      if (fake > 0 && fake !== answer) opts.add(fake);
    }
    while (opts.size < 4) opts.add(answer+opts.size+1);
    questions.push({ q: questionText, a: answer, opts: Array.from(opts) });
  }
  for (let i = questions.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [questions[i],questions[j]]=[questions[j],questions[i]]; }
  return questions;
}

// =============================================================
// 5. INDEXEDDB WRAPPER
// =============================================================
class GameDB {
  constructor() { this.db = null; this.ready = this._init(); }
  _init() {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (v) => { if (!settled) { settled = true; resolve(v); } };
      setTimeout(() => finish(false), 2500);
      try {
        if (!window.indexedDB) return finish(false);
        const req = indexedDB.open('pahlawan_bintang', 1);
        req.onupgradeneeded = (e) => { const d = e.target.result; if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); };
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
        const tx = this.db.transaction('kv','readonly');
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
        const tx = this.db.transaction('kv','readwrite');
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
    try { id = (crypto && crypto.randomUUID && crypto.randomUUID()) || ('p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)); }
    catch(e) { id = 'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10); }
    await DB.set('pahlawan_uuid', id);
  }
  return id;
}
let playerUUID = null;

async function getStars() { const raw = await DB.get('pahlawan_stars'); try { return JSON.parse(raw||'{}'); } catch(e) { return {}; } }
async function setStar(levelNum, starsEarned) { const s = await getStars(); if (!s[levelNum] || s[levelNum] < starsEarned) { s[levelNum] = starsEarned; await DB.set('pahlawan_stars', JSON.stringify(s)); } }
async function getLoadout() { const raw = await DB.get('pahlawan_loadout'); try { const arr = JSON.parse(raw||'["freeze","bomb"]'); return Array.isArray(arr) && arr.length === 2 ? arr : ['freeze','bomb']; } catch(e) { return ['freeze','bomb']; } }
async function setLoadout(arr) { await DB.set('pahlawan_loadout', JSON.stringify(arr)); }

// =============================================================
// 6. HERO LOCK SYSTEM
// =============================================================
let unlockedHeroes = [];
let gameCompleted = false;
let bestCertificateData = null;

async function loadUnlockedHeroes() {
  const raw = await DB.get('pahlawan_unlocked_heroes');
  try {
    const arr = JSON.parse(raw||'null');
    if (Array.isArray(arr) && arr.length > 0) {
      unlockedHeroes = arr.filter(h => ALL_HEROES.includes(h));
      if (!unlockedHeroes.includes('robot')) unlockedHeroes.push('robot');
    } else unlockedHeroes = [...HERO_DEFAULT_UNLOCKED];
  } catch(e) { unlockedHeroes = [...HERO_DEFAULT_UNLOCKED]; }
}
async function saveUnlockedHeroes() { await DB.set('pahlawan_unlocked_heroes', JSON.stringify(unlockedHeroes)); }
async function unlockHero(heroId) { if (!ALL_HEROES.includes(heroId) || unlockedHeroes.includes(heroId)) return false; unlockedHeroes.push(heroId); await saveUnlockedHeroes(); return true; }
function isHeroUnlocked(heroId) { return unlockedHeroes.includes(heroId); }

// =============================================================
// 7. LEVEL PERSISTENCE
// =============================================================
async function getSavedLevel() { const v = await DB.get('pahlawan_last_level'); return Math.max(1, Math.min(50, Number(v)||1)); }
async function setSavedLevel(levelNum) {
  const current = await getSavedLevel();
  if (levelNum > current) {
    await DB.set('pahlawan_last_level', String(levelNum));
    const el = document.getElementById('saved-level-display');
    if (el) el.innerText = `Level ${levelNum}`;
  }
  if (levelNum > PLAYER_STATS.maxLevelReached) { PLAYER_STATS.maxLevelReached = levelNum; await savePlayerStats(); }
}
async function resetProgress() {
  await DB.set('pahlawan_last_level', '1');
  const el = document.getElementById('saved-level-display');
  if (el) el.innerText = 'Level 1';
}

// =============================================================
// 8. GAME COMPLETED
// =============================================================
async function checkGameCompleted() {
  const raw = await DB.get('pahlawan_game_completed');
  gameCompleted = raw === '1';
  const rawCert = await DB.get('pahlawan_certificate_data');
  try { bestCertificateData = rawCert ? JSON.parse(rawCert) : null; } catch(e) { bestCertificateData = null; }
}
async function markGameCompleted(scoreVal) {
  gameCompleted = true;
  await DB.set('pahlawan_game_completed', '1');
  const certData = { name: playerName, score: scoreVal, date: new Date().toISOString(), dateStr: new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) };
  if (!bestCertificateData || scoreVal > (bestCertificateData.score||0)) { bestCertificateData = certData; await DB.set('pahlawan_certificate_data', JSON.stringify(certData)); }
}

// =============================================================
// 9. PLAYER STATS
// =============================================================
const DEFAULT_PLAYER_STATS = {
  totalKills:0, totalBossKills:0, maxCombo:0, perfectLevels:0,
  fastestLevelTime:Infinity, totalCoinsEarned:0, maxLevelReached:1,
  heroesUsed:[], coopWins:0, loginStreak:0, lastLoginDate:null,
  dailyStreak:0, lastDailyDate:null, unlockedAchievements:[], claimedAchievements:[], endlessBestWave:0
};
let PLAYER_STATS = { ...DEFAULT_PLAYER_STATS };
async function loadPlayerStats() {
  const raw = await DB.get('pahlawan_player_stats');
  try {
    const parsed = JSON.parse(raw||'{}');
    PLAYER_STATS = { ...DEFAULT_PLAYER_STATS, ...parsed };
    if (PLAYER_STATS.fastestLevelTime === null || PLAYER_STATS.fastestLevelTime === undefined) PLAYER_STATS.fastestLevelTime = Infinity;
    if (!Array.isArray(PLAYER_STATS.heroesUsed)) PLAYER_STATS.heroesUsed = [];
    if (!Array.isArray(PLAYER_STATS.unlockedAchievements)) PLAYER_STATS.unlockedAchievements = [];
    if (!Array.isArray(PLAYER_STATS.claimedAchievements)) PLAYER_STATS.claimedAchievements = [];
  } catch(e) { PLAYER_STATS = { ...DEFAULT_PLAYER_STATS }; }
}
async function savePlayerStats() {
  const d = { ...PLAYER_STATS };
  if (d.fastestLevelTime === Infinity) d.fastestLevelTime = null;
  try { await DB.set('pahlawan_player_stats', JSON.stringify(d)); } catch(e) {}
}

// =============================================================
// 10. ACHIEVEMENTS
// =============================================================
let ACHIEVEMENTS_DATA = { categories: [], achievements: [] };
async function loadAchievementsData() {
  try { const res = await fetch('./achievements.json?v=21.0.0'); if (res.ok) ACHIEVEMENTS_DATA = await res.json(); } catch(e) {}
}
function getStatValue(statType) {
  switch(statType) {
    case 'totalKills': return PLAYER_STATS.totalKills;
    case 'bossKills': return PLAYER_STATS.totalBossKills;
    case 'maxCombo': return PLAYER_STATS.maxCombo;
    case 'perfectLevels': return PLAYER_STATS.perfectLevels;
    case 'fastestLevelTime': return PLAYER_STATS.fastestLevelTime === Infinity ? 9999 : PLAYER_STATS.fastestLevelTime;
    case 'totalCoinsEarned': return PLAYER_STATS.totalCoinsEarned;
    case 'maxLevelReached': return PLAYER_STATS.maxLevelReached;
    case 'heroesUsedCount': return PLAYER_STATS.heroesUsed.length;
    case 'coopWins': return PLAYER_STATS.coopWins;
    case 'endlessBestWave': return PLAYER_STATS.endlessBestWave || 0;
    case 'dailyStreak': return PLAYER_STATS.dailyStreak;
    case 'loginStreak': return PLAYER_STATS.loginStreak;
    default: return 0;
  }
}
function isAchievementUnlocked(ach) {
  const cond = ach.condition; if (!cond) return false;
  const current = getStatValue(cond.type);
  if (cond.comparison === 'lte') return current <= cond.value;
  return current >= cond.value;
}
function getAchievementProgress(ach) {
  const cond = ach.condition; if (!cond) return 0;
  const current = getStatValue(cond.type);
  if (cond.comparison === 'lte') { if (current === 9999) return 0; if (current <= cond.value) return 1; return Math.max(0, 1 - (current - cond.value)/120); }
  if (cond.value === 0) return 1;
  return Math.min(1, current / cond.value);
}
function getAchievementProgressText(ach) {
  const cond = ach.condition; if (!cond) return '0/0';
  const current = getStatValue(cond.type);
  if (cond.comparison === 'lte') { if (current === 9999) return `--/${cond.value}s`; return `${Math.round(current)}s/${cond.value}s`; }
  return `${Math.min(current, cond.value)}/${cond.value}`;
}
async function checkAchievements(silent) {
  if (!ACHIEVEMENTS_DATA.achievements.length) return;
  let changed = false;
  for (const ach of ACHIEVEMENTS_DATA.achievements) {
    if (PLAYER_STATS.unlockedAchievements.includes(ach.id)) continue;
    if (isAchievementUnlocked(ach)) { PLAYER_STATS.unlockedAchievements.push(ach.id); changed = true; if (!silent) showAchievementToast(ach); }
  }
  if (changed) {
    await savePlayerStats(); updateAchievementBadge();
    const modal = document.getElementById('modal-achievements');
    if (modal && !modal.classList.contains('hidden')) renderAchievementGrid(currentAchievementFilter);
  }
}
function showAchievementToast(ach) {
  const container = document.getElementById('achievement-toast-container'); if (!container) return;
  const toast = document.createElement('div'); toast.className = 'achievement-toast';
  toast.innerHTML = `<div class="toast-icon-wrap"><svg viewBox="0 0 24 24"><use href="#${ach.icon}"/></svg></div><div class="toast-content"><div class="toast-label">PENCAPAIAN TERBUKA</div><div class="toast-title">${escapeHtml(ach.title)}</div><div class="toast-reward">+${ach.reward.coins} <svg class="ico-inline gold" viewBox="0 0 24 24" style="width:12px;height:12px;vertical-align:-2px;"><use href="#i-coin"/></svg></div></div>`;
  container.appendChild(toast);
  try { if (typeof sounds !== 'undefined') sounds.playKillstreak(); } catch(e) {}
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3800);
}
function updateAchievementBadge() {
  const badge = document.getElementById('achievement-badge-count'); if (!badge) return;
  const unclaimed = PLAYER_STATS.unlockedAchievements.filter(id => !PLAYER_STATS.claimedAchievements.includes(id)).length;
  if (unclaimed > 0) { badge.classList.remove('hidden'); badge.innerText = unclaimed; } else badge.classList.add('hidden');
}
let currentAchievementFilter = 'all';
let currentAchievementDetailId = null;
function openAchievementModal() {
  const modal = document.getElementById('modal-achievements'); if (!modal) return;
  modal.classList.remove('hidden'); currentAchievementFilter = 'all';
  document.querySelectorAll('.ach-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'all'));
  updateAchievementStatsBar(); renderAchievementGrid('all');
}
function updateAchievementStatsBar() {
  const total = ACHIEVEMENTS_DATA.achievements.length;
  const unlocked = PLAYER_STATS.unlockedAchievements.length;
  const claimed = PLAYER_STATS.claimedAchievements.length;
  let totalReward = 0;
  PLAYER_STATS.claimedAchievements.forEach(id => { const a = ACHIEVEMENTS_DATA.achievements.find(x => x.id === id); if (a && a.reward && a.reward.coins) totalReward += a.reward.coins; });
  const e1 = document.getElementById('ach-unlocked-count'); if (e1) e1.innerText = unlocked;
  const e2 = document.getElementById('ach-total-count'); if (e2) e2.innerText = total;
  const e3 = document.getElementById('ach-total-reward'); if (e3) e3.innerText = totalReward;
  const e4 = document.getElementById('ach-claimed-count'); if (e4) e4.innerText = claimed;
  const e5 = document.getElementById('ach-unlocked-count-2'); if (e5) e5.innerText = unlocked;
}
function renderAchievementGrid(filter) {
  const grid = document.getElementById('achievement-grid'); if (!grid) return;
  let list = ACHIEVEMENTS_DATA.achievements.slice();
  list = list.filter(a => !a.hidden || PLAYER_STATS.unlockedAchievements.includes(a.id));
  if (filter && filter !== 'all') list = list.filter(a => a.category === filter);
  list.sort((a,b) => {
    const ua = PLAYER_STATS.unlockedAchievements.includes(a.id);
    const ub = PLAYER_STATS.unlockedAchievements.includes(b.id);
    const ca = PLAYER_STATS.claimedAchievements.includes(a.id);
    const cb = PLAYER_STATS.claimedAchievements.includes(b.id);
    if (ua && !ca && !(ub && !cb)) return -1;
    if (ub && !cb && !(ua && !ca)) return 1;
    if (ca && !cb) return -1;
    if (cb && !ca) return 1;
    return 0;
  });
  if (list.length === 0) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#93a5c4;font-style:italic;">Belum ada pencapaian di kategori ini.</div>'; return; }
  grid.innerHTML = list.map(a => {
    const unlocked = PLAYER_STATS.unlockedAchievements.includes(a.id);
    const claimed = PLAYER_STATS.claimedAchievements.includes(a.id);
    const progress = getAchievementProgress(a);
    const progressText = getAchievementProgressText(a);
    let cls = 'achievement-card rarity-' + a.rarity;
    if (claimed) cls += ' claimed'; else if (unlocked) cls += ' unlocked'; else cls += ' locked';
    return `<div class="${cls}" data-ach-id="${a.id}">
      <div class="ach-card-icon-wrap"><svg class="ach-card-icon" viewBox="0 0 24 24"><use href="#${a.icon}"/></svg></div>
      <div class="ach-card-title">${escapeHtml(a.title)}</div>
      <div class="ach-card-desc">${escapeHtml(a.desc)}</div>
      <div class="ach-card-rarity">${a.rarity.toUpperCase()}</div>
      <div class="ach-card-progress"><div class="ach-card-progress-fill" style="width:${Math.round(progress*100)}%"></div></div>
      <div class="ach-card-progress-text">${progressText}</div>
      ${unlocked && !claimed ? `<div class="ach-card-reward"><svg style="width:10px;height:10px;" viewBox="0 0 24 24"><use href="#i-coin"/></svg>${a.reward.coins}</div>` : ''}
    </div>`;
  }).join('');
  grid.querySelectorAll('.achievement-card').forEach(card => { card.onclick = () => openAchievementDetail(card.dataset.achId); });
}
function openAchievementDetail(achId) {
  const ach = ACHIEVEMENTS_DATA.achievements.find(a => a.id === achId); if (!ach) return;
  currentAchievementDetailId = achId;
  const modal = document.getElementById('modal-achievement-detail'); if (!modal) return;
  modal.classList.remove('hidden');
  const unlocked = PLAYER_STATS.unlockedAchievements.includes(ach.id);
  const claimed = PLAYER_STATS.claimedAchievements.includes(ach.id);
  const iconWrap = document.getElementById('ach-detail-icon-wrap');
  if (iconWrap) iconWrap.className = 'ach-detail-icon-wrap rarity-' + ach.rarity;
  const iconSvg = document.getElementById('ach-detail-icon'); if (iconSvg) iconSvg.innerHTML = `<use href="#${ach.icon}"/>`;
  const titleEl = document.getElementById('ach-detail-title'); if (titleEl) titleEl.innerText = ach.title;
  const descEl = document.getElementById('ach-detail-desc'); if (descEl) descEl.innerText = ach.desc;
  const rarityEl = document.getElementById('ach-detail-rarity');
  if (rarityEl) { rarityEl.innerText = ach.rarity.toUpperCase(); rarityEl.className = 'ach-detail-rarity rarity-' + ach.rarity; }
  const progress = getAchievementProgress(ach);
  const fill = document.getElementById('ach-detail-progress-fill');
  if (fill) { fill.style.width = Math.round(progress*100)+'%'; fill.classList.toggle('complete', progress >= 1); }
  const progressText = document.getElementById('ach-detail-progress-text'); if (progressText) progressText.innerText = getAchievementProgressText(ach);
  const rewardEl = document.getElementById('ach-detail-reward-coins'); if (rewardEl) rewardEl.innerText = ach.reward.coins;
  const claimBtn = document.getElementById('btn-ach-detail-claim');
  const claimText = claimBtn ? claimBtn.querySelector('span') : null;
  if (claimBtn) {
    if (claimed) { claimBtn.disabled = true; claimBtn.classList.add('claimed'); if (claimText) claimText.innerText = 'SUDAH DIKLAIM'; }
    else if (unlocked) { claimBtn.disabled = false; claimBtn.classList.remove('claimed'); if (claimText) claimText.innerText = 'KLAIM REWARD'; }
    else { claimBtn.disabled = true; claimBtn.classList.remove('claimed'); if (claimText) claimText.innerText = 'BELUM TERBUKA'; }
  }
}
async function claimAchievementReward(achId) {
  const ach = ACHIEVEMENTS_DATA.achievements.find(a => a.id === achId); if (!ach) return;
  if (!PLAYER_STATS.unlockedAchievements.includes(achId)) return;
  if (PLAYER_STATS.claimedAchievements.includes(achId)) return;
  PLAYER_STATS.claimedAchievements.push(achId);
  coins += ach.reward.coins || 0;
  PLAYER_STATS.totalCoinsEarned += ach.reward.coins || 0;
  await DB.set('pahlawan_coins', coins); await savePlayerStats();
  updateShopUI(); updateHUDValues(); updateAchievementStatsBar(); updateAchievementBadge();
  renderAchievementGrid(currentAchievementFilter);
  try { sounds.playCoin(); sounds.playPowerup(); } catch(e) {}
  openAchievementDetail(achId);
  const container = document.getElementById('achievement-toast-container');
  if (container) {
    const toast = document.createElement('div'); toast.className = 'achievement-toast';
    toast.innerHTML = `<div class="toast-icon-wrap"><svg viewBox="0 0 24 24"><use href="#i-coin"/></svg></div><div class="toast-content"><div class="toast-label">REWARD DIKLAIM</div><div class="toast-title">${escapeHtml(ach.title)}</div><div class="toast-reward">+${ach.reward.coins} koin</div></div>`;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3200);
  }
}

// =============================================================
// 11. THEMES
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
  { id:'omega', name:'FINAL BOSS: OMEGA', bgTop:'#000000', bgBottom:'#2a0033', accent:'#ff0055', accentSoft:'rgba(255,0,85,0.5)', stars:['#ff0055','#ffd700','#00ffff','#ffffff','#ff00ff'], ground:'#0a0010', groundLine:'#ff0055', monsters:['#ff0055','#ffd700','#00ffff','#ff00ff','#39ff14'] },
  { id:'quantum', name:'QUANTUM RIFT', bgTop:'#020818', bgBottom:'#0a1a3a', accent:'#00ffff', accentSoft:'rgba(0,255,255,0.4)', stars:['#00ffff','#ffffff','#ff00ff','#00ff88'], ground:'#041028', groundLine:'#00ffff', monsters:['#00ffff','#ff00ff','#00ff88','#ffffff'] },
  { id:'abyss', name:'BOSS: ABYSS', bgTop:'#000005', bgBottom:'#0a0020', accent:'#8b00ff', accentSoft:'rgba(139,0,255,0.5)', stars:['#8b00ff','#ffffff','#00ffff','#ff00ff'], ground:'#05001a', groundLine:'#8b00ff', monsters:['#8b00ff','#00ffff','#ff00ff','#ffffff'] },
  { id:'chronos', name:'CHRONOS STREAM', bgTop:'#100018', bgBottom:'#3a0060', accent:'#ff00aa', accentSoft:'rgba(255,0,170,0.4)', stars:['#ff00aa','#00ffff','#ffffff','#ffaaff'], ground:'#20003a', groundLine:'#ff00aa', monsters:['#ff00aa','#00ffff','#ffaaff','#ffffff'] },
  { id:'nemesis', name:'BOSS: NEMESIS', bgTop:'#180000', bgBottom:'#4a0000', accent:'#ff2200', accentSoft:'rgba(255,34,0,0.5)', stars:['#ff2200','#ffd700','#ffffff','#ff8800'], ground:'#200000', groundLine:'#ff2200', monsters:['#ff2200','#ff8800','#ffd700','#ff4400'] },
  { id:'eternity', name:'ETERNITY GATE', bgTop:'#000000', bgBottom:'#001a2a', accent:'#ffd700', accentSoft:'rgba(255,215,0,0.5)', stars:['#ffd700','#00ffff','#ffffff','#ff00ff','#00ff00'], ground:'#001020', groundLine:'#ffd700', monsters:['#ffd700','#00ffff','#ff00ff','#00ff00','#ffffff'] }
];
const THEME_BGM = {
  cosmic:{bpm:138,root:261.63,scale:[0,2,3,5,7,8,10],waveform:'square',bassWave:'triangle',energy:1.0},
  inferno:{bpm:158,root:246.94,scale:[0,1,3,5,7,8,10],waveform:'sawtooth',bassWave:'square',energy:1.3},
  nebula:{bpm:122,root:293.66,scale:[0,2,3,5,7,9,10],waveform:'triangle',bassWave:'sine',energy:0.85},
  void:{bpm:168,root:220.00,scale:[0,1,4,5,7,8,11],waveform:'sawtooth',bassWave:'square',energy:1.4},
  aurora:{bpm:142,root:329.63,scale:[0,2,4,6,7,9,11],waveform:'square',bassWave:'triangle',energy:1.1},
  cryo:{bpm:130,root:311.13,scale:[0,2,3,5,7,8,10],waveform:'sine',bassWave:'triangle',energy:0.95},
  magma:{bpm:150,root:233.08,scale:[0,2,3,5,7,9,10],waveform:'sawtooth',bassWave:'square',energy:1.25},
  titan:{bpm:118,root:174.61,scale:[0,2,3,5,7,9,10],waveform:'triangle',bassWave:'sine',energy:0.9},
  gold:{bpm:145,root:277.18,scale:[0,2,4,5,7,9,11],waveform:'square',bassWave:'triangle',energy:1.15},
  solar:{bpm:155,root:293.66,scale:[0,2,4,5,7,9,10],waveform:'sawtooth',bassWave:'square',energy:1.35},
  phantom:{bpm:125,root:261.63,scale:[0,1,4,5,7,8,11],waveform:'triangle',bassWave:'sine',energy:0.9},
  omega:{bpm:175,root:196.00,scale:[0,1,3,6,7,8,11],waveform:'sawtooth',bassWave:'square',energy:1.5},
  quantum:{bpm:160,root:233.08,scale:[0,2,3,5,7,8,10],waveform:'square',bassWave:'sawtooth',energy:1.35},
  abyss:{bpm:178,root:174.61,scale:[0,1,3,5,7,8,10],waveform:'sawtooth',bassWave:'square',energy:1.55},
  chronos:{bpm:165,root:261.63,scale:[0,2,3,5,7,9,10],waveform:'triangle',bassWave:'sawtooth',energy:1.4},
  nemesis:{bpm:185,root:196.00,scale:[0,1,4,5,7,8,11],waveform:'sawtooth',bassWave:'square',energy:1.6},
  eternity:{bpm:190,root:220.00,scale:[0,2,3,5,7,9,11],waveform:'square',bassWave:'sawtooth',energy:1.7}
};
function getThemeForLevel(levelNum) {
  if (levelNum % 5 === 0) {
    if (levelNum === 5)  return LEVEL_THEMES[1];
    if (levelNum === 10) return LEVEL_THEMES[3];
    if (levelNum === 15) return LEVEL_THEMES[5];
    if (levelNum === 20) return LEVEL_THEMES[7];
    if (levelNum === 25) return LEVEL_THEMES[9];
    if (levelNum === 30) return LEVEL_THEMES[11];
    if (levelNum === 35) return LEVEL_THEMES[13];
    if (levelNum === 40) return LEVEL_THEMES[15];
    if (levelNum === 45) return LEVEL_THEMES[13];
    if (levelNum === 50) return LEVEL_THEMES[16];
  }
  const normalThemes = [0,2,4,6,8,10,12,14];
  const group = Math.floor((levelNum-1)/5);
  return LEVEL_THEMES[normalThemes[group % normalThemes.length]];
}
const BOSS_SIZES = { 5:62, 10:80, 15:96, 20:112, 25:128, 30:148, 35:165, 40:180, 45:200, 50:230 };
let currentTheme = LEVEL_THEMES[0];
const BOSS_NAMES = { 5:'INFERNO', 10:'VOID', 15:'CRYO', 20:'TITAN', 25:'SOLAR', 30:'OMEGA', 35:'ABYSS', 40:'NEMESIS', 45:'ABYSS²', 50:'ETERNITY' };
function getBossName(n) { return BOSS_NAMES[n] || ('BOSS '+n); }
function getBossTheme(n) { return getThemeForLevel(n); }
function getBossBaseHp(n) { const m = { 5:150, 10:350, 15:600, 20:1000, 25:1500, 30:2500, 35:4000, 40:6000, 45:9000, 50:15000 }; return m[n] || 150; }

// =============================================================
// 12. STORY
// =============================================================
const STORY = {
  1:  { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Pahlawan... gelombang Void datang dari Nebula.','Selamatkan 5 sektor. Kita satu-satunya harapan.'] }, after:{ speaker:'PAHLAWAN', portrait:'i-hero-portrait', lines:['Sektor pertama... aman.'] } },
  3:  { before:{ speaker:'ARIA', portrait:'i-aria', lines:['Aku Dr. Aria. Musuh mulai bervariasi.','Gunakan upgrade di Toko untuk bertahan.'] } },
  5:  { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Peringatan! Bos pertama mendekat.','Fokus ke inti merahnya saat terbuka.'] }, after:{ speaker:'VEGA', portrait:'i-vega', lines:['Kerja bagus! Namun ini baru permulaan.'] } },
  8:  { before:{ speaker:'RIVAL', portrait:'i-rival', lines:['Kau... masih hidup?','Jangan harap bisa lewat sektorku.'] } },
  10: { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Ini... mantan rekanku.','Dia jatuh ke Void. Kalahkan dia. Bebaskan dia.'] }, after:{ speaker:'ARIA', portrait:'i-aria', lines:['Aku mendeteksi sinyal aneh. Ada dalang di balik ini.'] } },
  15: { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Bos Cryo. Ciptaan eksperimen kami sendiri.','Maafkan aku, Pahlawan.'] }, after:{ speaker:'RIVAL', portrait:'i-rival', lines:['Kau kuat. Bergabung denganku, atau hancur.'] } },
  20: { before:{ speaker:'ARIA', portrait:'i-aria', lines:['Titan — penjaga inti galaksi.','Aku percaya padamu.'] }, after:{ speaker:'VEGA', portrait:'i-vega', lines:['Aria... dia dikorbankan untuk membuka jalan.','Lanjutkan. Demi dia.'] } },
  25: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['Aku adalah Void itu sendiri.','Setiap pahlawan yang kau kalahkan... adalah aku.'] } },
  30: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['Ini akhirnya. Kau vs aku. Takdir atau kehancuran.'] }, after:{ speaker:'PAHLAWAN', portrait:'i-hero-portrait', lines:['Damai... akhirnya.'] } },
  33: { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Kau mengira ini sudah selesai?','Void memiliki lapisan yang lebih dalam.'] } },
  35: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['Selamat datang di Abyss.','Di sini, bahkan cahaya pun mati.'] }, after:{ speaker:'PAHLAWAN', portrait:'i-hero-portrait', lines:['Aku masih berdiri.'] } },
  38: { before:{ speaker:'ARIA', portrait:'i-aria', lines:['Data menunjukkan... ini bukan Void biasa.','Ini adalah... masa lalu galaksi sendiri.'] } },
  40: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['Aku adalah Nemesis-mu.','Setiap kemenanganmu adalah kekalahanku.','Hancurkan aku, atau aku menghancurkanmu.'] }, after:{ speaker:'PAHLAWAN', portrait:'i-hero-portrait', lines:['Bahkan bayangan pun bisa dikalahkan.'] } },
  43: { before:{ speaker:'VEGA', portrait:'i-vega', lines:['Chronos Stream — aliran waktu.','Hati-hati, apa yang kau lihat mungkin menipu.'] } },
  45: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['ABYSS².','Aku memperkuat diriku dengan setiap kekalahan.','Ini adalah... bentuk terkuatku.'] } },
  48: { before:{ speaker:'ARIA', portrait:'i-aria', lines:['Eternity Gate terbuka.','Di baliknya... akhir dari segalanya.','Aku bersamamu. Selalu.'] } },
  50: { before:{ speaker:'VILLAIN', portrait:'i-villain', lines:['ETERNITY.','Aku adalah awal, aku adalah akhir.','Kau... adalah kekosongan yang mengisiku.'] }, after:{ speaker:'PAHLAWAN', portrait:'i-hero-portrait', lines:['Bintang tidak pernah benar-benar padam.','Selamat tinggal, kawan.'] } }
};

// =============================================================
// 13. LEVEL GENERATOR
// =============================================================
function generate30Levels() {
  const levels = [];
  const enemyTypesPool = ["jelly","donut","cloud","crystal","splitter","triangle","hexagon","star","diamond","worm"];
  const algorithmsPool = ["linear","zigzag","gravity","stealth","swarm","splitter"];
  for (let i = 1; i <= 50; i++) {
    if (i % 5 === 0) {
      const hpScale = { 5:150, 10:350, 15:600, 20:1000, 25:1500, 30:2500, 35:4000, 40:6000, 45:9000, 50:15000 };
      levels.push({ level:i, targetKills:1, targetScore:i*2000, speed:1.0, spawnRate:2000, algorithm:`boss_${i}`, types:[`boss${i}`], bossHp:hpScale[i]||150 });
    } else {
      const availableTypes = enemyTypesPool.slice(0, Math.min(enemyTypesPool.length, Math.floor(i/3)+1));
      levels.push({ level:i, targetKills:10+(i*3), targetScore:i*1500, speed:1.0+(i*0.08), spawnRate:Math.max(500, 1500-(i*30)), algorithm:algorithmsPool[(i-1)%algorithmsPool.length], types:availableTypes });
    }
  }
  return levels;
}
let levelsData = generate30Levels();
const ENEMY_SCORE_TABLE = {
  jelly:100, donut:200, cloud:250, crystal:300, splitter:350,
  triangle:180, hexagon:400, star:320, diamond:280, worm:360,
  boss5:2500, boss10:5000, boss15:7500, boss20:10000, boss25:12500, boss30:20000,
  boss35:30000, boss40:45000, boss45:65000, boss50:100000
};
const DAILY_MODIFIERS = [
  { id:'double_speed', name:'DOUBLE SPEED', desc:'Musuh bergerak 2× lebih cepat', icon:'i-bolt' },
  { id:'no_shield', name:'NO SHIELD', desc:'Skill Shield dimatikan', icon:'i-shield' },
  { id:'one_life', name:'ONE LIFE', desc:'Hanya 1 nyawa', icon:'i-heart' },
  { id:'double_monster', name:'SWARM', desc:'Musuh spawn 2× lebih banyak', icon:'i-target' }
];
const DAILY_BOSS_SEQUENCES = [[5,10,15],[10,15,20],[15,20,25],[20,25,30],[5,15,25],[10,20,30]];

// =============================================================
// 14. SOUND ENGINE
// =============================================================
class SoundEngine {
  constructor() { this.ctx = null; this.isMuted = false; this.bgmTimer = null; this.bgmStep = 0; this.currentBgmTheme = null; }
  init() { try { if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; this.ctx = new A(); } if (this.ctx.state === 'suspended') this.ctx.resume(); } catch(e) {} }
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
  playComboBoost(comboLevel) {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const baseFreq = 400 + comboLevel * 80;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='triangle';
    o.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(baseFreq*2, this.ctx.currentTime+0.25);
    g.gain.setValueAtTime(0.22, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime+0.25);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime+0.25);
  }
  playRespawn() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    [392.00,523.25,659.25,783.99].forEach((f,i)=>{
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(f,this.ctx.currentTime+i*0.08);
      g.gain.setValueAtTime(0.24,this.ctx.currentTime+i*0.08);
      g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+i*0.08+0.2);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime+i*0.08); o.stop(this.ctx.currentTime+i*0.08+0.2);
    });
  }
  playMathCorrect() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(880,this.ctx.currentTime);
    o.frequency.setValueAtTime(1108,this.ctx.currentTime+0.06);
    g.gain.setValueAtTime(0.18,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.15);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.15);
  }
  playMathWrong() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(220,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80,this.ctx.currentTime+0.2);
    g.gain.setValueAtTime(0.2,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playUnlock() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    [523.25,659.25,783.99,1046.50,1318.51].forEach((f,i)=>{
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='triangle'; o.frequency.setValueAtTime(f,this.ctx.currentTime+i*0.08);
      g.gain.setValueAtTime(0.22,this.ctx.currentTime+i*0.08);
      g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+i*0.08+0.25);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime+i*0.08); o.stop(this.ctx.currentTime+i*0.08+0.25);
    });
  }
  playCannonBlast() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(180,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(45,this.ctx.currentTime+0.25);
    g.gain.setValueAtTime(0.35,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.25);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.25);
  }
  playDragonRoar() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(120,this.ctx.currentTime);
    o.frequency.linearRampToValueAtTime(400,this.ctx.currentTime+0.15);
    o.frequency.linearRampToValueAtTime(90,this.ctx.currentTime+0.25);
    g.gain.setValueAtTime(0.22,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.25);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.25);
  }
  playRapid() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(1200,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(600,this.ctx.currentTime+0.04);
    g.gain.setValueAtTime(0.08,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.04);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.04);
  }
  playMagicSpark() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    [1046, 1568, 2093].forEach((f, i) => {
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(f, this.ctx.currentTime + i*0.02);
      g.gain.setValueAtTime(0.09, this.ctx.currentTime + i*0.02);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i*0.02 + 0.1);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(this.ctx.currentTime + i*0.02); o.stop(this.ctx.currentTime + i*0.02 + 0.1);
    });
  }
  playFireWhoosh() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(600,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(150,this.ctx.currentTime+0.2);
    g.gain.setValueAtTime(0.15,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.2);
  }
  playShuriken() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(1400,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(400,this.ctx.currentTime+0.1);
    g.gain.setValueAtTime(0.1,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.1);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.1);
  }
  playArcaneOrb() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(440,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1760,this.ctx.currentTime+0.3);
    g.gain.setValueAtTime(0.14,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.3);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.3);
  }
  playBowRelease() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(1800,this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(200,this.ctx.currentTime+0.09);
    g.gain.setValueAtTime(0.15,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+0.09);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.09);
  }
  playGhostWail() { if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(600,this.ctx.currentTime);
    o.frequency.linearRampToValueAtTime(200,this.ctx.currentTime+0.5);
    g.gain.setValueAtTime(0.15,this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.05,this.ctx.currentTime+0.3);
    g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.5);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.5);
  }
  playHeroShoot(heroId) {
    const hero = HERO_DATA[heroId]; if (!hero) { this.playLaser(); return; }
    switch (hero.sound) {
      case 'laser': this.playLaser(); break;
      case 'cannonBlast': this.playCannonBlast(); break;
      case 'dragonRoar': this.playDragonRoar(); break;
      case 'rapid': this.playRapid(); break;
      case 'magicSpark': this.playMagicSpark(); break;
      case 'fireWhoosh': this.playFireWhoosh(); break;
      case 'shuriken': this.playShuriken(); break;
      case 'arcaneOrb': this.playArcaneOrb(); break;
      case 'bowRelease': this.playBowRelease(); break;
      case 'ghostWail': this.playGhostWail(); break;
      default: this.playLaser();
    }
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
    const themeId = (currentTheme && currentTheme.id) || 'cosmic';
    if (this.currentBgmTheme === themeId && this.bgmTimer) return;
    this.stopBGM();
    this.currentBgmTheme = themeId;
    const cfg = THEME_BGM[themeId] || THEME_BGM.cosmic;
    const stepMs = (60 / cfg.bpm / 4) * 1000;
    const root = cfg.root; const scale = cfg.scale;
    const chordDegrees = [0, 2, 4, 5];
    const chordNotes = chordDegrees.map(deg => [0, 2, 4, 6].map(off => {
      const idx = (deg + off) % scale.length;
      const octave = Math.floor((deg + off) / scale.length);
      return root * Math.pow(2, (scale[idx] + 12 * octave) / 12);
    }));
    const bassNotes = chordDegrees.map(deg => {
      const idx = deg % scale.length;
      const octave = Math.floor(deg / scale.length);
      return (root / 2) * Math.pow(2, (scale[idx] + 12 * octave) / 12);
    });
    const melodyPatterns = [
      [0, null, 1, null, 2, null, 1, null, 0, null, 2, null, 3, null, 2, 3],
      [2, null, 3, null, 4, null, 3, null, 2, null, 0, null, 1, null, 2, 1],
      [4, null, 3, null, 2, null, 4, null, 3, null, 1, null, 2, null, 3, 4],
      [1, null, 2, null, 3, null, 4, null, 3, null, 5, null, 4, null, 2, 1]
    ];
    let step = 0;
    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !isGameRunning || isGamePaused) { step = 0; return; }
      this.init(); if (!this.ctx) return;
      const bar = Math.floor(step / 16) % 4;
      const beat = step % 16;
      if (beat % 4 === 0) this._playTone(bassNotes[bar], 0.22, cfg.bassWave, 0.09 * cfg.energy);
      if (beat % 2 === 0) this._playTone(chordNotes[bar][(beat / 2) % 4], 0.14, cfg.waveform, 0.028 * cfg.energy);
      const melIdx = melodyPatterns[bar][beat];
      if (melIdx !== null && melIdx !== undefined) {
        const idx = melIdx % scale.length;
        const octave = Math.floor(melIdx / scale.length);
        const melNote = root * 2 * Math.pow(2, (scale[idx] + 12 * octave) / 12);
        this._playTone(melNote, 0.18, cfg.waveform, 0.035 * cfg.energy, 5);
      }
      if (beat === 0 || beat === 8) this._playKick();
      if (beat === 4 || beat === 12) this._playSnare();
      if (beat % 2 === 1 && cfg.energy > 1.0) this._playHiHat();
      step++;
      this.bgmStep = step;
    }, stepMs);
  }
  stopBGM() {
    if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; this.bgmStep = 0; }
    this.currentBgmTheme = null;
  }
}
const sounds = new SoundEngine();
function triggerVibrate(p) { if ('vibrate' in navigator) { try { navigator.vibrate(p); } catch(e) {} } }

// =============================================================
// 15. AD SERVICE
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
        if (countdown <= 0) { clearInterval(timer); setTimeout(() => { overlay.classList.add('hidden'); resolve(true); }, 500); }
      }, 1000);
    });
  }
};

// =============================================================
// 16. GAME STATE
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
let upgradeCoin = Number(localStorage.getItem('pahlawan_up_coin')) || 1;
let upgradeLife = Number(localStorage.getItem('pahlawan_up_life')) || 0;
let upgradeCombo = Number(localStorage.getItem('pahlawan_up_combo')) || 1;
let upgradeMagnet = Number(localStorage.getItem('pahlawan_up_magnet')) || 1;
let upgradeCrit = Number(localStorage.getItem('pahlawan_up_crit')) || 0;
let upgradeRevive = Number(localStorage.getItem('pahlawan_up_revive')) || 0;

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
const PLAYER_LERP = 0.30;
let playerSpeed = 11;
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
let starLayers = [];

let isFrozen = false;
let freezeFramesRemaining = 0;
let screenShake = 0;

let hitStopFrames = 0;
let screenFlash = 0;

let comboBoostActive = { coins: false, firerate: false, magnet: false };
let comboBoostLastNotified = 0;

let isMovingLeft = false;
let isMovingRight = false;

let joystickAxis = 0;
let joystickActive = false;
let joystickPointerId = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
let joystickRadius = 0;
let joystickMaxOffset = 0;
const JOYSTICK_DEADZONE = 0.06;
const JOYSTICK_CURVE = 0.65;
const JOYSTICK_SPEED_MULT = 1.55;

let fireButtonPressed = true;

let currentActor = localStorage.getItem('pahlawan_actor') || 'robot';
let playerName = localStorage.getItem('pahlawan_nama') || 'Pahlawan';
if (!HERO_DATA[currentActor]) currentActor = 'robot';

let endlessWave = 1;
let endlessKillsThisWave = 0;
const ENDLESS_KILLS_PER_WAVE = 15;

let currentDailyModifier = null;
let currentLeaderboardTab = 'global';

let dailyBossIndex = 0;
let dailyBossSequence = [];
let nextBossSpawnTime = 0;

let levelStartTime = 0;
let levelDamageTaken = 0;

let levelClearPending = false;
let stageClearTimer = null;

let bossPhase = 'minions';
let bossMinionsTarget = 0;
let bossMinionsKilled = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let deferredPrompt;
let leaderboardRef = null;
let leaderboardHandler = null;

const DPR = Math.min(window.devicePixelRatio || 1, 2);
let VIRTUAL_WIDTH  = 0;
let VIRTUAL_HEIGHT = 0;
let GAME_SCALE     = 1;

const actorMap = {};
ALL_HEROES.forEach(id => { actorMap[id] = { name: HERO_DATA[id].name, color: HERO_DATA[id].color }; });

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

let mathQuizState = { heroId: null, questions: [], currentIdx: 0, timeLimit: 60, timerRemaining: 60, timerInterval: null, correctCount: 0, answered: false, unlockedSuccessfully: false };

// MP state
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

let mpGuestInput = { left:false, right:false, moveX:0, shoot:false, skill1:false, skill2:false, skill3:false, heroType:'robot', respawn:false, pause:false, resume:false };
let mpGuestX = 0, mpGuestTargetX = 0, mpGuestHP = 3, mpGuestScore = 0, mpGuestCombo = 1, mpGuestAlive = true, mpGuestShootCd = 0, mpGuestBullets = [];

let mpRemoteMonsters = [];
let mpRemoteBullets = [];
let mpRemoteHostHP = 3;
let mpRemoteHostScore = 0;

let mpSyncTimer = null;

let mpFlow = { phase: 'lobby', levelIndex: 0, phaseStartedAt: 0, introData: null, themeId: 'cosmic' };
let mpLastAppliedPhase = null;
let mpLastAppliedLevel = -1;

let mpEffectQueue = [];
let mpComboIndicatorState = { text: null, active: false, shownAt: 0 };

let mpSpectatorMode = false;
let mpSpectatorReady = false;
let mpSpectatorTimer = 0;
let mpSpectatorTickInterval = null;

let mpRemoteHostSpectator = false;
let mpRemoteGuestSpectator = false;
let mpGuestLives = 3;

let mpRemotePaused = false;
let mpLocalPauseRequested = false;
let mpPauseState = 'none';

const MP_SPECTATOR_WAIT_SECONDS = 60;

// ============ END OF PART 1/4 ============
console.log('📦 [game.js] PART 1/4 loaded');

// =============================================================
// PAHLAWAN BINTANG — game.js v21.0.0 — PART 2/4
// Bootstrap, Helpers, Resize, Events, Shop, Loadout, Game Flow
// =============================================================

// =============================================================
// 17. BOOTSTRAP
// =============================================================
function bootstrapUI() {
  try {
    const isLowEnd = (
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (window.devicePixelRatio >= 3 && window.innerWidth < 500) ||
      /Android [4-6]/.test(navigator.userAgent)
    );
    if (isLowEnd) { document.body.classList.add('low-end'); console.log('🐢 Low-end mode'); }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) document.body.classList.add('tab-hidden');
      else document.body.classList.remove('tab-hidden');
    });
    setupEventListeners();
    console.log('✅ [Boot] Event listeners attached | Desktop:', IS_DESKTOP);
  } catch (e) { console.error('❌ [Boot]', e); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrapUI);
else bootstrapUI();

window.addEventListener('load', async () => {
  try {
    await DB.ready;
    playerUUID = await initDeviceId();
    coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
    upgradeFireRate = Number(localStorage.getItem('pahlawan_up_firerate')) || 1;
    upgradeShield = Number(localStorage.getItem('pahlawan_up_shield')) || 1;
    upgradeBomb = Number(localStorage.getItem('pahlawan_up_bomb')) || 2;
    upgradeFreeze = Number(localStorage.getItem('pahlawan_up_freeze')) || 2;
    upgradeCoin = Number(localStorage.getItem('pahlawan_up_coin')) || 1;
    upgradeLife = Number(localStorage.getItem('pahlawan_up_life')) || 0;
    upgradeCombo = Number(localStorage.getItem('pahlawan_up_combo')) || 1;
    upgradeMagnet = Number(localStorage.getItem('pahlawan_up_magnet')) || 1;
    upgradeCrit = Number(localStorage.getItem('pahlawan_up_crit')) || 0;
    upgradeRevive = Number(localStorage.getItem('pahlawan_up_revive')) || 0;
    playerLoadout = await getLoadout();
    const todayKey = getTodayKey();
    reviveQuota = await getReviveQuota(todayKey);
    await loadPlayerStats();
    await loadAchievementsData();
    await loadUnlockedHeroes();
    await checkGameCompleted();
    await trackLoginStreak();
    await trackHeroUsage(currentActor);
    await checkAchievements(true);
    updateAchievementBadge();
    updateLevelSelectButton();
    updateActorGridUI();
  } catch (e) { console.warn('⚠️ [Boot] Partial failure:', e); }

  try {
    resizeCanvas();
    updateGameScale();
    initStarfield();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', handleResize);
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.value = playerName;
    updateActorSelectionUI();
    updateShopUI();
    updateAudioButtonUI();
    updateReviveQuotaUI();
    const savedLvl = await getSavedLevel();
    const slEl = document.getElementById('saved-level-display');
    if (slEl) slEl.innerText = `Level ${savedLvl}`;
    if (!document.getElementById('screen-flash-overlay')) {
      const fl = document.createElement('div'); fl.id = 'screen-flash-overlay'; document.body.appendChild(fl);
    }
    if (!document.getElementById('combo-boost-indicator')) {
      const cb = document.createElement('div'); cb.id = 'combo-boost-indicator'; cb.innerText = 'COMBO BOOST!'; document.body.appendChild(cb);
    }
  } catch (e) { console.error('❌ [Boot] UI init error:', e); }

  try { await loadGameData(); } catch (e) { levelsData = generate30Levels(); }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=21.0.0').catch(err => console.log('SW Fail:', err));

  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) { loader.classList.add('fade-out'); setTimeout(() => loader.remove(), 350); }
  }, 400);
});

// =============================================================
// PWA INSTALL HANDLER — v21.1 (support iOS + Android + Desktop)
// =============================================================
let pwaInstallBar = null;
let pwaDeferredPrompt = null;

function detectStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function showPWAInstallBar() {
  if (!pwaInstallBar) pwaInstallBar = document.getElementById('pwa-install-bar');
  if (!pwaInstallBar) return;
  if (detectStandalone()) { pwaInstallBar.classList.add('hidden'); return; }
  // Cek user sudah pernah dismiss (tapi tetap tampilkan lagi setelah 3 hari)
  const dismissed = Number(localStorage.getItem('pwa_dismissed') || 0);
  const now = Date.now();
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  if (dismissed && (now - dismissed) < THREE_DAYS) {
    // Tetap tampilkan di iOS karena tidak ada cara lain
    if (!isIOS()) { pwaInstallBar.classList.add('hidden'); return; }
  }
  pwaInstallBar.classList.remove('hidden');
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pwaDeferredPrompt = e;
  console.log('✅ [PWA] beforeinstallprompt fired');
  showPWAInstallBar();
});

window.addEventListener('appinstalled', () => {
  console.log('✅ [PWA] App installed');
  const bar = document.getElementById('pwa-install-bar');
  if (bar) bar.classList.add('hidden');
  pwaDeferredPrompt = null;
});

// PWA install bar click handler
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('pwa-install-bar');
  if (!bar) return;
  bar.addEventListener('click', async () => {
    if (pwaDeferredPrompt) {
      pwaDeferredPrompt.prompt();
      try { await pwaDeferredPrompt.userChoice; } catch(e) {}
      pwaDeferredPrompt = null;
      bar.classList.add('hidden');
    } else if (isIOS()) {
      // iOS: tampilkan instruksi manual
      const help = document.getElementById('ios-install-help');
      if (help) help.classList.remove('hidden');
    } else {
      // Desktop/Android tanpa prompt — beri tahu user
      alert('Buka menu browser → "Install App" atau "Add to Home Screen"');
    }
  });
});

// Auto-show PWA bar setelah 2 detik kalau belum standalone
setTimeout(() => { showPWAInstallBar(); }, 2000);

// =============================================================
// 18. LOGIN STREAK & HERO USAGE
// =============================================================
async function trackLoginStreak() {
  const todayKey = getTodayKey();
  const last = PLAYER_STATS.lastLoginDate;
  if (last === todayKey) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}${String(yesterday.getMonth()+1).padStart(2,'0')}${String(yesterday.getDate()).padStart(2,'0')}`;
  if (last === yKey) PLAYER_STATS.loginStreak = (PLAYER_STATS.loginStreak || 0) + 1;
  else PLAYER_STATS.loginStreak = 1;
  PLAYER_STATS.lastLoginDate = todayKey;
  await savePlayerStats();
  await checkAchievements(true);
}
async function trackHeroUsage(heroId) {
  if (!heroId) return;
  if (!PLAYER_STATS.heroesUsed.includes(heroId)) {
    PLAYER_STATS.heroesUsed.push(heroId);
    await savePlayerStats();
    await checkAchievements();
  }
}

// =============================================================
// 19. RESIZE + DPR
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
  VIRTUAL_WIDTH  = cssW;
  VIRTUAL_HEIGHT = cssH;
  if (playerX === 0 || playerX > VIRTUAL_WIDTH) { playerX = VIRTUAL_WIDTH / 2; playerTargetX = playerX; }
  else if (prevW > 0 && prevW !== VIRTUAL_WIDTH) {
    const ratio = playerX / prevW;
    playerX = ratio * VIRTUAL_WIDTH;
    playerTargetX = ratio * VIRTUAL_WIDTH;
  }
}
function updateGameScale() {
  const minDim = Math.min(VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  // Arena lebih luas & proporsional — objek kecil, tidak "kegedean"
  const baseMin = 420;
  let scale = minDim / baseMin;
  // Clamp lebih ketat: 0.55 – 0.85 (biar objek lebih compact & pro)
  scale = Math.max(0.55, Math.min(scale, 0.85));
  GAME_SCALE = scale;
  console.log('📐 [Scale]', GAME_SCALE.toFixed(2), '| Arena:', VIRTUAL_WIDTH, 'x', VIRTUAL_HEIGHT);
}
let _resizeRaf = null;
function handleResize() {
  if (_resizeRaf) cancelAnimationFrame(_resizeRaf);
  _resizeRaf = requestAnimationFrame(() => {
    resizeCanvas(); updateGameScale(); _resizeRaf = null;
  });
}
function handleOrientationChange() {
  setTimeout(() => {
    resizeCanvas(); updateGameScale();
    playerX = VIRTUAL_WIDTH / 2; playerTargetX = playerX;
    playerSpeed = 11 * GAME_SCALE;
    if (mpActive && mpRole === 'host') { mpGuestX = VIRTUAL_WIDTH * 0.75; mpGuestTargetX = mpGuestX; }
  }, 300);
}
function initStarfield() {
  stars = []; starLayers = [];
  const colors = currentTheme.stars || ['#ffffff'];
  const layerConfigs = [
    { count: 55, speed: 0.3, sizeMin: 0.4, sizeMax: 1.0, alphaBase: 0.35 },
    { count: 40, speed: 0.8, sizeMin: 0.7, sizeMax: 1.6, alphaBase: 0.65 },
    { count: 25, speed: 1.6, sizeMin: 1.0, sizeMax: 2.4, alphaBase: 1.0 }
  ];
  layerConfigs.forEach((cfg) => {
    const layer = [];
    for (let i = 0; i < cfg.count; i++) {
      layer.push({
        x: Math.random() * VIRTUAL_WIDTH, y: Math.random() * VIRTUAL_HEIGHT,
        size: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
        speed: cfg.speed * (0.7 + Math.random() * 0.6),
        opacity: cfg.alphaBase * (0.7 + Math.random() * 0.3),
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.05
      });
    }
    starLayers.push({ config: cfg, stars: layer });
  });
  stars = []; starLayers.forEach(l => stars.push(...l.stars));
}
function recolorStars() {
  if (!starLayers.length) return;
  starLayers.forEach(layer => {
    layer.stars.forEach(s => { s.color = currentTheme.stars[Math.floor(Math.random() * currentTheme.stars.length)]; });
  });
}
async function loadGameData() {
  try { const [rl] = await Promise.all([fetch('./levels.json?v=21.0.0')]); if (rl.ok) levelsData = await rl.json(); }
  catch (err) { levelsData = generate30Levels(); }
}
function updateAudioButtonUI() {
  const btn = document.getElementById('btn-audio'); if (!btn) return;
  btn.innerHTML = sounds.isMuted ? '<svg class="ico" viewBox="0 0 24 24"><use href="#i-sound-off"/></svg>' : '<svg class="ico" viewBox="0 0 24 24"><use href="#i-sound-on"/></svg>';
  btn.classList.toggle('muted', sounds.isMuted);
}
function updateReviveQuotaUI() {
  const el = document.getElementById('revive-quota'); if (el) el.innerText = reviveQuota + upgradeRevive;
}
function updateLevelSelectButton() {
  const btn = document.getElementById('btn-level-select'); if (!btn) return;
  if (gameCompleted) btn.classList.remove('hidden'); else btn.classList.add('hidden');
}

// =============================================================
// 20. HELPERS
// =============================================================
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}
function getDailySeed() {
  const k = getTodayKey(); let n = 0;
  for (let i = 0; i < k.length; i++) n = (n * 31 + k.charCodeAt(i)) % 1000000;
  return n;
}
function getDailyModifier() { return DAILY_MODIFIERS[getDailySeed() % DAILY_MODIFIERS.length]; }
function getDailyBossSequence() { return DAILY_BOSS_SEQUENCES[getDailySeed() % DAILY_BOSS_SEQUENCES.length].slice(); }
function secondsUntilMidnight() {
  const now = new Date(); const mid = new Date(now); mid.setHours(24,0,0,0);
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
  try { const data = JSON.parse(raw || '{}'); if (data.date === k) return Number(data.count) || 0; return 3; }
  catch(e) { return 3; }
}
async function saveReviveQuota(k, c) { await DB.set('pahlawan_revive_quota', JSON.stringify({ date: k, count: c })); }
async function getEndlessBest() { const raw = await DB.get('pahlawan_endless_best'); try { return JSON.parse(raw || '{"wave":0,"score":0}'); } catch(e) { return {wave:0,score:0}; } }
async function setEndlessBest(wave, s) {
  const best = await getEndlessBest();
  if (wave > best.wave || (wave === best.wave && s > best.score)) await DB.set('pahlawan_endless_best', JSON.stringify({ wave: wave, score: s }));
  if (wave > (PLAYER_STATS.endlessBestWave || 0)) { PLAYER_STATS.endlessBestWave = wave; await savePlayerStats(); await checkAchievements(); }
}
function triggerScreenFlash(intensity) {
  screenFlash = Math.min(1, (intensity || 0.5));
  const fl = document.getElementById('screen-flash-overlay');
  if (fl) { fl.style.opacity = String(screenFlash); setTimeout(() => { if (fl) fl.style.opacity = '0'; }, 80); }
  if (mpActive && mpRole === 'host') mpEffectQueue.push({ type: 'flash', intensity, t: Date.now() });
}
function triggerHitStop(frames) {
  hitStopFrames = Math.max(hitStopFrames, frames || 3);
  if (mpActive && mpRole === 'host') mpEffectQueue.push({ type: 'hitstop', frames, t: Date.now() });
}

// =============================================================
// 21. BOSS PHASE
// =============================================================
function initBossPhase(levelNum, mode) {
  bossPhase = 'minions'; bossMinionsKilled = 0;
  if (mode === 'coop') bossMinionsTarget = 15;
  else if (mode === 'endless') bossMinionsTarget = 8;
  else if (mode === 'daily') bossMinionsTarget = 8 + (dailyBossIndex || 0) * 3;
  else bossMinionsTarget = 8 + Math.floor(levelNum / 5) * 2;
  console.log('👾 [BossPhase] Minions target:', bossMinionsTarget, '| Level:', levelNum, '| Mode:', mode);
}
function transitionToBossPhase() {
  if (bossPhase !== 'minions') return;
  bossPhase = 'boss';
  console.log('👑 [BossPhase] → BOSS phase');
  const banner = document.getElementById('level-intro');
  if (banner) {
    document.getElementById('level-intro-number').innerText = '⚠';
    document.getElementById('level-intro-name').innerText = 'BOSS MUNCUL!';
    document.getElementById('level-intro-mission').innerText = 'SIAP-SIAP!';
    banner.classList.remove('hidden'); banner.classList.remove('fade-out');
    banner.classList.remove('stage-clear'); banner.classList.add('boss-approach');
    void banner.offsetWidth;
    sounds.playBossWarning();
    try { triggerVibrate([100, 50, 100, 50, 200]); } catch(e) {}
    triggerScreenFlash(0.6);
    setTimeout(() => {
      banner.classList.add('fade-out'); banner.classList.remove('boss-approach');
      setTimeout(() => banner.classList.add('hidden'), 500);
    }, 1400);
  }
  setTimeout(() => { if (typeof startSpawnLoop === 'function') startSpawnLoop(); }, 2000);
}

// =============================================================
// 22. SPECTATOR MODE
// =============================================================
function setSpectatorOverlayVisible(visible) {
  const overlay = document.getElementById('mp-spectator-overlay'); if (!overlay) return;
  if (visible) { overlay.classList.remove('hidden'); overlay.style.display = 'flex'; overlay.style.pointerEvents = 'auto'; }
  else { overlay.classList.add('hidden'); overlay.style.display = 'none'; overlay.style.pointerEvents = 'none'; }
}
function ensureOverlaysInert() {
  const el = document.getElementById('mp-spectator-overlay'); if (!el) return;
  if (el.classList.contains('hidden')) { el.style.display = 'none'; el.style.pointerEvents = 'none'; }
}
function startSelfSpectatorMode(reason) {
  if (mpSpectatorMode) return;
  mpSpectatorMode = true; mpSpectatorReady = false; mpSpectatorTimer = MP_SPECTATOR_WAIT_SECONDS;
  setSpectatorOverlayVisible(true); updateSpectatorUI();
  if (mpSpectatorTickInterval) clearInterval(mpSpectatorTickInterval);
  mpSpectatorTickInterval = setInterval(() => {
    if (!mpSpectatorMode) { clearInterval(mpSpectatorTickInterval); mpSpectatorTickInterval = null; return; }
    if (mpSpectatorTimer > 0) {
      mpSpectatorTimer--;
      if (mpSpectatorTimer <= 0) { mpSpectatorReady = true; try { sounds.playPowerup(); } catch(e) {} }
      updateSpectatorUI();
    } else { clearInterval(mpSpectatorTickInterval); mpSpectatorTickInterval = null; }
  }, 1000);
  if (mpRole === 'host') checkBothDead();
}
function endSelfSpectatorMode() {
  if (!mpSpectatorMode) return;
  mpSpectatorMode = false; mpSpectatorReady = false; mpSpectatorTimer = 0;
  if (mpSpectatorTickInterval) { clearInterval(mpSpectatorTickInterval); mpSpectatorTickInterval = null; }
  setSpectatorOverlayVisible(false); updateSpectatorUI();
}
function applyRemoteHostSpectator(bool) { if (mpRemoteHostSpectator === !!bool) return; mpRemoteHostSpectator = !!bool; }
function applyRemoteGuestSpectator(bool) { if (mpRemoteGuestSpectator === !!bool) return; mpRemoteGuestSpectator = !!bool; }
function updateSpectatorUI() {
  const cd = document.getElementById('spectator-countdown');
  const hint = document.getElementById('spectator-hint');
  const btn = document.getElementById('btn-spectator-respawn');
  const prog = document.getElementById('spectator-progress-fill');
  if (cd) { if (mpSpectatorReady) { cd.innerText = '✓'; cd.style.color = '#39ff14'; } else { cd.innerText = mpSpectatorTimer; cd.style.color = '#fff'; } }
  if (prog) prog.style.width = ((MP_SPECTATOR_WAIT_SECONDS - mpSpectatorTimer) / MP_SPECTATOR_WAIT_SECONDS * 100) + '%';
  if (mpSpectatorReady) { if (btn) btn.classList.remove('hidden'); if (hint) hint.innerText = 'Siap respawn! Klik tombol di bawah'; }
  else { if (btn) btn.classList.add('hidden'); if (hint) hint.innerText = 'Tunggu ' + mpSpectatorTimer + ' detik lagi...'; }
}
function respawnFromSpectator() {
  if (!mpSpectatorMode || !mpSpectatorReady) return;
  endSelfSpectatorMode();
  lives = 1; playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  isReviveInvuln = true; reviveInvulnTimer = 120;
  updateLivesDisplay(); try { sounds.playRespawn(); } catch(e) {}
  if (mpRole === 'guest') mpGuestInput.respawn = true;
  else { playerX = VIRTUAL_WIDTH * 0.25; playerTargetX = playerX; spawnFloatingText(playerX, VIRTUAL_HEIGHT - 70 * GAME_SCALE, 'REVIVED!', '#39ff14'); triggerScreenFlash(0.5); }
}
function checkBothDead() {
  if (!mpActive || gameMode !== 'coop') return;
  if (mpRole !== 'host') return;
  if (mpSpectatorMode && mpRemoteGuestSpectator) setTimeout(() => mpEndGame(false, 'KEDUA PEMAIN MATI'), 500);
}

// =============================================================
// 23. MATH QUIZ SYSTEM
// =============================================================
function startMathQuiz(heroId) {
  const hero = HERO_DATA[heroId]; if (!hero) return;
  mathQuizState.heroId = heroId;
  mathQuizState.questions = generateMathQuestions(heroId, 20, hero.difficulty);
  mathQuizState.currentIdx = 0;
  mathQuizState.timeLimit = Math.max(60, hero.quizTime || 60);
  mathQuizState.timerRemaining = mathQuizState.timeLimit;
  mathQuizState.correctCount = 0;
  mathQuizState.answered = false;
  mathQuizState.unlockedSuccessfully = false;
  const modal = document.getElementById('modal-math-quiz');
  const heroNameEl = document.getElementById('math-quiz-hero-name');
  const bodyEl = document.getElementById('math-quiz-body');
  const resultWrap = document.getElementById('math-quiz-result-wrap');
  const closeBtn = document.getElementById('btn-close-math-quiz');
  if (heroNameEl) heroNameEl.innerText = `Buka "${hero.name}" — Jawab 20 soal dalam ${mathQuizState.timeLimit} detik (${hero.difficulty.toUpperCase()})`;
  if (bodyEl) bodyEl.classList.remove('hidden');
  if (resultWrap) resultWrap.classList.add('hidden');
  if (closeBtn) { closeBtn.classList.remove('hidden'); closeBtn.innerText = 'BATAL'; }
  if (modal) modal.classList.remove('hidden');
  renderMathQuestion();
  startMathTimer();
}
function startMathTimer() {
  if (mathQuizState.timerInterval) clearInterval(mathQuizState.timerInterval);
  updateMathTimerUI();
  mathQuizState.timerInterval = setInterval(() => {
    mathQuizState.timerRemaining--;
    updateMathTimerUI();
    if (mathQuizState.timerRemaining <= 0) {
      clearInterval(mathQuizState.timerInterval); mathQuizState.timerInterval = null;
      endMathQuiz(false, 'WAKTU HABIS');
    }
  }, 1000);
}
function updateMathTimerUI() {
  const t = document.getElementById('math-quiz-timer');
  const p = document.getElementById('math-quiz-progress');
  if (t) { t.innerText = mathQuizState.timerRemaining + 's'; if (mathQuizState.timerRemaining <= 10) t.classList.add('warning'); else t.classList.remove('warning'); }
  if (p) p.innerText = (mathQuizState.currentIdx + 1) + '/' + mathQuizState.questions.length;
}
function renderMathQuestion() {
  const q = mathQuizState.questions[mathQuizState.currentIdx]; if (!q) return;
  const qEl = document.getElementById('math-question');
  const optsEl = document.getElementById('math-options');
  const fbEl = document.getElementById('math-quiz-feedback');
  if (qEl) qEl.innerText = q.q;
  if (fbEl) { fbEl.innerText = ''; fbEl.className = 'math-quiz-feedback'; }
  if (optsEl) {
    optsEl.innerHTML = '';
    const opts = [...q.opts];
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    opts.forEach((val) => {
      const btn = document.createElement('button');
      btn.className = 'math-option'; btn.type = 'button'; btn.innerText = val; btn.dataset.val = val;
      btn.onclick = () => answerMath(btn, val, q.a);
      optsEl.appendChild(btn);
    });
  }
  updateMathTimerUI();
}
function answerMath(btn, val, correctVal) {
  if (mathQuizState.answered) return;
  mathQuizState.answered = true;
  const fbEl = document.getElementById('math-quiz-feedback');
  const allBtns = document.querySelectorAll('.math-option');
  allBtns.forEach(b => b.disabled = true);
  if (val === correctVal) {
    btn.classList.add('correct');
    mathQuizState.correctCount++;
    if (fbEl) { fbEl.innerText = '✓ BENAR!'; fbEl.className = 'math-quiz-feedback success'; }
    try { sounds.playMathCorrect(); } catch(e) {}
    triggerVibrate(30);
  } else {
    btn.classList.add('wrong');
    allBtns.forEach(b => { if (parseInt(b.dataset.val) === correctVal) b.classList.add('correct'); });
    if (fbEl) { fbEl.innerText = '✗ SALAH! Jawaban: ' + correctVal; fbEl.className = 'math-quiz-feedback error'; }
    try { sounds.playMathWrong(); } catch(e) {}
    triggerVibrate([60, 30, 60]);
  }
  setTimeout(() => {
    mathQuizState.answered = false;
    mathQuizState.currentIdx++;
    if (mathQuizState.currentIdx >= mathQuizState.questions.length) {
      clearInterval(mathQuizState.timerInterval); mathQuizState.timerInterval = null;
      const success = mathQuizState.correctCount >= 18;
      endMathQuiz(success, success ? 'LULUS!' : `Hanya ${mathQuizState.correctCount}/20 benar`);
    } else renderMathQuestion();
  }, 900);
}
async function endMathQuiz(success, reason) {
  if (mathQuizState.timerInterval) { clearInterval(mathQuizState.timerInterval); mathQuizState.timerInterval = null; }
  const bodyEl = document.getElementById('math-quiz-body');
  const resultWrap = document.getElementById('math-quiz-result-wrap');
  const resultBox = document.getElementById('math-quiz-result');
  const resultTitle = document.getElementById('math-quiz-result-title');
  const resultDesc = document.getElementById('math-quiz-result-desc');
  const actionBtn = document.getElementById('btn-math-quiz-action');
  const closeBtn = document.getElementById('btn-close-math-quiz');
  if (bodyEl) bodyEl.classList.add('hidden');
  if (resultWrap) resultWrap.classList.remove('hidden');
  if (closeBtn) closeBtn.classList.add('hidden');
  if (success) {
    mathQuizState.unlockedSuccessfully = true;
    await unlockHero(mathQuizState.heroId);
    try { sounds.playUnlock(); } catch(e) {}
    if (resultBox) resultBox.className = 'math-quiz-result win';
    if (resultTitle) resultTitle.innerText = '🎉 HERO TERBUKA!';
    if (resultDesc) resultDesc.innerText = `${HERO_DATA[mathQuizState.heroId].name} sekarang bisa kamu pilih!`;
    if (actionBtn) { actionBtn.onclick = () => { closeMathQuiz(); updateActorGridUI(); updateActorSelectionUI(); }; actionBtn.querySelector('span').innerText = 'GUNAKAN HERO'; }
    triggerVibrate([80, 40, 80, 40, 200]);
    triggerScreenFlash(0.5);
    await checkAchievements();
  } else {
    if (resultBox) resultBox.className = 'math-quiz-result lose';
    if (resultTitle) resultTitle.innerText = '❌ BELUM BERHASIL';
    if (resultDesc) resultDesc.innerText = reason + '. Coba lagi ya!';
    if (actionBtn) { actionBtn.onclick = () => closeMathQuiz(); actionBtn.querySelector('span').innerText = 'TUTUP'; }
  }
}
function closeMathQuiz() {
  if (mathQuizState.timerInterval) { clearInterval(mathQuizState.timerInterval); mathQuizState.timerInterval = null; }
  const modal = document.getElementById('modal-math-quiz'); if (modal) modal.classList.add('hidden');
  mathQuizState.heroId = null; mathQuizState.questions = []; mathQuizState.currentIdx = 0; mathQuizState.correctCount = 0;
}

// =============================================================
// 24. LEVEL SELECT
// =============================================================
async function openLevelSelect() {
  const modal = document.getElementById('modal-level-select'); if (!modal) return;
  await renderLevelGrid();
  modal.classList.remove('hidden');
}
async function renderLevelGrid() {
  const grid = document.getElementById('level-grid'); if (!grid) return;
  const stars = await getStars();
  const maxLevel = gameCompleted ? 50 : await getSavedLevel();
  let html = '';
  for (let i = 1; i <= 50; i++) {
    const isBoss = (i % 5 === 0);
    const isCompleted = stars[i] !== undefined && stars[i] > 0;
    const isUnlocked = gameCompleted || i <= maxLevel;
    const isCurrent = (i === maxLevel + (gameCompleted ? 0 : 1));
    const lvlStars = stars[i] || 0;
    let cls = 'level-btn';
    if (isBoss) cls += ' boss';
    if (isCompleted) cls += ' completed';
    if (isCurrent) cls += ' current';
    if (!isUnlocked) cls += ' locked';
    let starHtml = '';
    if (isUnlocked) { starHtml = '<div class="lvl-stars">'; for (let s = 0; s < 3; s++) starHtml += `<span class="lvl-star ${s < lvlStars ? 'on' : ''}">★</span>`; starHtml += '</div>'; }
    else starHtml = '<div class="lvl-stars">🔒</div>';
    html += `<button class="${cls}" data-level="${i}" type="button" ${!isUnlocked ? 'disabled' : ''}><div class="lvl-num">${i}</div>${starHtml}</button>`;
  }
  grid.innerHTML = html;
  grid.querySelectorAll('.level-btn').forEach(btn => {
    btn.onclick = () => { const lvl = parseInt(btn.dataset.level); if (!btn.disabled) { closeLevelSelect(); jumpToLevel(lvl); } };
  });
}
function closeLevelSelect() { const modal = document.getElementById('modal-level-select'); if (modal) modal.classList.add('hidden'); }
async function jumpToLevel(levelNum) {
  if (levelNum < 1 || levelNum > 50) return;
  currentLevelIndex = levelNum - 1;
  lives = 3 + upgradeLife;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false; score = 0; gameMode = 'normal';
  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  resizeCanvas(); updateGameScale();
  setTimeout(() => { resizeCanvas(); updateGameScale(); startCurrentLevel(); }, 60);
}
function updateActorGridUI() {
  document.querySelectorAll('.actor-card').forEach(card => {
    const heroId = card.dataset.actor;
    const unlocked = isHeroUnlocked(heroId);
    card.classList.toggle('locked', !unlocked);
    card.classList.toggle('unlocked', unlocked);
  });
}

// =============================================================
// 25. DESKTOP HINTS
// =============================================================
function setupDesktopHints($) {
  const hintsPanel = $('desktop-hints');
  const hintsToggle = $('btn-hints-toggle');
  const hintsClose = $('btn-hints-close');
  if (!hintsPanel) return;
  if (!IS_DESKTOP) { hintsPanel.classList.add('hidden'); hintsPanel.style.display = 'none'; if (hintsToggle) hintsToggle.classList.add('hidden'); return; }
  const showHints = () => { if (!isGameRunning) return; hintsPanel.classList.remove('hidden'); hintsPanel.style.display = 'block'; desktopHintsVisible = true; if (hintsToggle) hintsToggle.classList.remove('hidden'); };
  const hideHints = () => { hintsPanel.classList.add('hidden'); hintsPanel.style.display = 'none'; desktopHintsVisible = false; };
  const toggleHints = () => { if (desktopHintsVisible) hideHints(); else showHints(); };
  if (hintsToggle) hintsToggle.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleHints(); };
  if (hintsClose) hintsClose.onclick = (e) => { e.preventDefault(); e.stopPropagation(); hideHints(); };
  window._showDesktopHints = showHints;
  window._hideDesktopHints = hideHints;
  window._toggleDesktopHints = toggleHints;
}

// =============================================================
// 26. JOYSTICK
// =============================================================
function setupJoystick() {
  const joystick = document.getElementById('analog-joystick');
  const knob = document.getElementById('joystick-knob');
  if (!joystick || !knob) return;
  const KNOB_RATIO = 0.46, MAX_OFFSET_RATIO = 1 - KNOB_RATIO;
  const updateKnobVisual = (dx, dy) => {
    const dist = Math.hypot(dx, dy);
    let nx = dx, ny = dy;
    if (dist > joystickMaxOffset) { const k = joystickMaxOffset / dist; nx = dx * k; ny = dy * k; }
    knob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    const rawAxis = nx / joystickMaxOffset;
    if (Math.abs(rawAxis) < JOYSTICK_DEADZONE) joystickAxis = 0;
    else { const sign = rawAxis > 0 ? 1 : -1; const abs = (Math.abs(rawAxis) - JOYSTICK_DEADZONE) / (1 - JOYSTICK_DEADZONE); joystickAxis = sign * Math.pow(Math.min(1, abs), JOYSTICK_CURVE); }
    joystick.setAttribute('aria-valuenow', joystickAxis.toFixed(2));
  };
  const resetKnob = () => {
    knob.style.transform = 'translate(-50%, -50%)';
    joystickAxis = 0; joystickActive = false; joystickPointerId = null;
    joystick.classList.remove('is-active'); joystick.setAttribute('aria-valuenow', '0');
  };
  const refreshCenter = () => {
    const rect = joystick.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
    joystickRadius = rect.width / 2;
    joystickMaxOffset = joystickRadius * MAX_OFFSET_RATIO;
  };
  const onPointerDown = (e) => {
    if (!isGameRunning || isGamePaused || mpSpectatorMode) return;
    if (joystickPointerId !== null) return;
    e.preventDefault(); e.stopPropagation();
    joystickPointerId = e.pointerId; joystickActive = true;
    joystick.classList.add('is-active');
    try { joystick.setPointerCapture(e.pointerId); } catch(err) {}
    try { triggerVibrate(8); } catch(err) {}
    refreshCenter();
    updateKnobVisual(e.clientX - joystickCenterX, e.clientY - joystickCenterY);
  };
  const onPointerMove = (e) => {
    if (!joystickActive || e.pointerId !== joystickPointerId) return;
    if (!isGameRunning || isGamePaused) return;
    e.preventDefault();
    updateKnobVisual(e.clientX - joystickCenterX, e.clientY - joystickCenterY);
  };
  const onPointerUp = (e) => {
    if (e.pointerId !== joystickPointerId) return;
    try { joystick.releasePointerCapture(e.pointerId); } catch(err) {}
    resetKnob();
  };
  joystick.addEventListener('pointerdown', onPointerDown);
  joystick.addEventListener('pointermove', onPointerMove);
  joystick.addEventListener('pointerup', onPointerUp);
  joystick.addEventListener('pointercancel', onPointerUp);
  joystick.addEventListener('lostpointercapture', onPointerUp);
  window.addEventListener('resize', () => { if (joystickActive) refreshCenter(); });
  window.addEventListener('orientationchange', () => { if (joystickActive) setTimeout(refreshCenter, 350); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && joystickActive) resetKnob(); });
}
function setupFireButton() {
  const btn = document.getElementById('btn-fire'); if (!btn) return;
  const press = (e) => { if (e) e.preventDefault(); if (!isGameRunning || isGamePaused || mpSpectatorMode) return; btn.dataset.pressed = '1'; fireButtonPressed = true; try { triggerVibrate(5); } catch(err) {} };
  const release = (e) => { if (e) e.preventDefault(); btn.dataset.pressed = '0'; fireButtonPressed = false; };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('pointerleave', release);
  btn.addEventListener('lostpointercapture', release);
}

// =============================================================
// 27. EVENT LISTENERS
// =============================================================
function setupEventListeners() {
  const $ = id => document.getElementById(id);
  const btnPlay = $('btn-prepare-play');
  if (btnPlay) btnPlay.onclick = (e) => { e.preventDefault(); try { requestFullscreenAndLandscape(); } catch (err) {} try { startGame(); } catch (err) { console.error('startGame error:', err); } };

  const bLevelSelect = $('btn-level-select');
  if (bLevelSelect) bLevelSelect.onclick = () => openLevelSelect();
  const bCloseLevelSelect = $('btn-close-level-select');
  if (bCloseLevelSelect) bCloseLevelSelect.onclick = () => closeLevelSelect();

  const bActor = $('btn-select-actor');
  if (bActor) bActor.onclick = () => { updateActorGridUI(); $('modal-actors').classList.remove('hidden'); };
  const bCloseActors = $('btn-close-actors');
  if (bCloseActors) bCloseActors.onclick = () => $('modal-actors').classList.add('hidden');

  document.querySelectorAll('.actor-card').forEach(card => {
    card.onclick = () => {
      const heroId = card.dataset.actor; if (!heroId) return;
      if (!isHeroUnlocked(heroId)) { startMathQuiz(heroId); return; }
      document.querySelectorAll('.actor-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentActor = heroId;
      DB.set('pahlawan_actor', currentActor);
      updateActorSelectionUI();
      trackHeroUsage(currentActor);
    };
  });

  const bCloseMath = $('btn-close-math-quiz');
  if (bCloseMath) bCloseMath.onclick = () => closeMathQuiz();

  const bShop = $('btn-shop'); if (bShop) bShop.onclick = () => { updateShopUI(); $('modal-shop').classList.remove('hidden'); };
  const bCloseShop = $('btn-close-shop'); if (bCloseShop) bCloseShop.onclick = () => $('modal-shop').classList.add('hidden');

  const bFR = $('btn-buy-firerate'); if (bFR) bFR.onclick = () => buyUpgrade('firerate');
  const bSH = $('btn-buy-shield');   if (bSH) bSH.onclick = () => buyUpgrade('shield');
  const bBB = $('btn-buy-bomb');     if (bBB) bBB.onclick = () => buyUpgrade('bomb');
  const bFZ = $('btn-buy-freeze');   if (bFZ) bFZ.onclick = () => buyUpgrade('freeze');
  const bCO = $('btn-buy-coin');     if (bCO) bCO.onclick = () => buyUpgrade('coin');
  const bLI = $('btn-buy-life');     if (bLI) bLI.onclick = () => buyUpgrade('life');
  const bCM = $('btn-buy-combo');    if (bCM) bCM.onclick = () => buyUpgrade('combo');
  const bMG = $('btn-buy-magnet');   if (bMG) bMG.onclick = () => buyUpgrade('magnet');
  const bCR = $('btn-buy-crit');     if (bCR) bCR.onclick = () => buyUpgrade('crit');
  const bRV = $('btn-buy-revive');   if (bRV) bRV.onclick = () => buyUpgrade('revive');

  const bLB = $('btn-leaderboard'); if (bLB) bLB.onclick = openLeaderboard;
  const bCloseLB = $('btn-close-leaderboard');
  if (bCloseLB) bCloseLB.onclick = () => {
    $('modal-leaderboard').classList.add('hidden');
    if (leaderboardRef && leaderboardHandler) { try { leaderboardRef.off('value', leaderboardHandler); } catch(e) {} leaderboardRef = null; leaderboardHandler = null; }
  };
  document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLeaderboardTab = tab.dataset.tab || 'global';
      loadLeaderboardData();
    };
  });

  const bAch = $('btn-achievements'); if (bAch) bAch.onclick = () => openAchievementModal();
  const bCloseAch = $('btn-close-achievements');
  if (bCloseAch) bCloseAch.onclick = () => $('modal-achievements').classList.add('hidden');
  document.querySelectorAll('.ach-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.ach-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentAchievementFilter = tab.dataset.cat || 'all';
      renderAchievementGrid(currentAchievementFilter);
    };
  });
  const bAchDetailClose = $('btn-ach-detail-close');
  if (bAchDetailClose) bAchDetailClose.onclick = () => { $('modal-achievement-detail').classList.add('hidden'); currentAchievementDetailId = null; };
  const bAchClaim = $('btn-ach-detail-claim');
  if (bAchClaim) bAchClaim.onclick = () => { if (currentAchievementDetailId) claimAchievementReward(currentAchievementDetailId); };

  const bPause = $('btn-pause');
  if (bPause) bPause.onclick = () => { try { triggerVibrate(10); } catch(e) {} pauseGame(); };
  const bResume = $('btn-resume-game'); if (bResume) bResume.onclick = resumeGame;
  const bPHero = $('btn-pause-change-hero');
  if (bPHero) bPHero.onclick = () => { updateActorGridUI(); $('modal-actors').classList.remove('hidden'); };
  const bPLB = $('btn-pause-leaderboard'); if (bPLB) bPLB.onclick = () => openLeaderboard();
  const bResetProgress = $('btn-pause-reset-progress');
  if (bResetProgress) bResetProgress.onclick = async () => { if (confirm('Yakin reset progress? Kamu akan mulai dari Level 1.')) { await resetProgress(); $('modal-pause').classList.add('hidden'); goToMainMenu(); } };
  const bPMain = $('btn-pause-main-menu');
  if (bPMain) bPMain.onclick = () => { $('modal-pause').classList.add('hidden'); goToMainMenu(); };

  const bAudio = $('btn-audio');
  if (bAudio) bAudio.onclick = () => { sounds.isMuted = !sounds.isMuted; if (!sounds.isMuted) sounds.init(); updateAudioButtonUI(); };

  const btnInstall = $('btn-pwa-install');
  if (btnInstall) btnInstall.onclick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) {}
    deferredPrompt = null; btnInstall.classList.add('hidden');
  };

  setupJoystick();
  setupFireButton();

  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return;
    const key = e.key; const keyLower = key.toLowerCase();
    if (key === 'ArrowLeft' || keyLower === 'a') isMovingLeft = true;
    if (key === 'ArrowRight' || keyLower === 'd') isMovingRight = true;
    if (key === ' ' || key === 'Spacebar') { fireButtonPressed = true; if (isGameRunning && !isGamePaused) e.preventDefault(); }
    if (keyLower === 'q') { e.preventDefault(); if (isGameRunning && !isGamePaused) triggerSkillByKey('freeze'); }
    if (keyLower === 'w') { e.preventDefault(); if (isGameRunning && !isGamePaused) triggerSkillByKey('shield'); }
    if (keyLower === 'e') { e.preventDefault(); if (isGameRunning && !isGamePaused) triggerSkillByKey('bomb'); }
    if (key === 'Escape') { e.preventDefault(); if (isGameRunning) { if (isGamePaused) resumeGame(); else pauseGame(); } }
    if (keyLower === 'h') { e.preventDefault(); if (typeof window._toggleDesktopHints === 'function' && IS_DESKTOP) window._toggleDesktopHints(); }
  });

  window.addEventListener('keyup', (e) => {
    const key = e.key; const keyLower = key.toLowerCase();
    if (key === 'ArrowLeft' || keyLower === 'a') isMovingLeft = false;
    if (key === 'ArrowRight' || keyLower === 'd') isMovingRight = false;
    if (key === ' ' || key === 'Spacebar') fireButtonPressed = false;
  });

  window.addEventListener('blur', () => { fireButtonPressed = false; isMovingLeft = false; isMovingRight = false; });

  if (canvas) {
    const setTargetFromClientX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      playerTargetX = Math.max(40, Math.min(VIRTUAL_WIDTH - 40, x));
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (!isGameRunning || isGamePaused || mpSpectatorMode || joystickActive) return;
      if (e.pointerType === 'touch' || e.buttons > 0) setTargetFromClientX(e.clientX);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!isGameRunning || isGamePaused || mpSpectatorMode || joystickActive) return;
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
    lives = 3 + upgradeLife; playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0; reviveUsedThisRun = false;
    updateLivesDisplay(); startCurrentLevel();
  };
  const bRetry = $('btn-retry-level');
  if (bRetry) bRetry.onclick = () => {
    $('modal-result').classList.add('hidden');
    try { requestFullscreenAndLandscape(); } catch (err) {}
    if (gameMode === 'endless') { startEndless(); return; }
    if (gameMode === 'daily') { startDaily(); return; }
    if (gameMode === 'coop') { goToMainMenu(); return; }
    lives = 3 + upgradeLife; playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0; reviveUsedThisRun = false;
    updateLivesDisplay(); startCurrentLevel();
  };
  const bCert = $('btn-view-certificate'); if (bCert) bCert.onclick = () => openCertificate();
  const bMenu = $('btn-menu'); if (bMenu) bMenu.onclick = () => { $('modal-result').classList.add('hidden'); goToMainMenu(); };
  const bCertClose = $('btn-cert-close'); if (bCertClose) bCertClose.onclick = () => closeCertificate();
  const bCertDownload = $('btn-cert-download'); if (bCertDownload) bCertDownload.onclick = () => downloadCertificate();
  const bCertShare = $('btn-cert-share'); if (bCertShare) bCertShare.onclick = () => shareCertificate();

  const bFreeze = $('btn-freeze');
  if (bFreeze) bFreeze.onclick = () => {
    if (freezeCharges <= 0 || isFrozen || isGamePaused || !isGameRunning || mpSpectatorMode) return;
    try { triggerVibrate(15); } catch(e) {}
    if (mpActive && mpRole === 'guest') { freezeCharges--; updateSkillButtonsUI(); mpSendGuestSkill(1); return; }
    freezeCharges--; isFrozen = true; freezeFramesRemaining = 210;
    sounds.playFreeze(); triggerVibrate([50, 50, 50]); updateSkillButtonsUI();
    spawnFloatingText(VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2, 'FREEZE!', currentTheme.accent);
    screenShake = 6; triggerScreenFlash(0.25);
  };
  const bShield = $('btn-shield');
  if (bShield) bShield.onclick = () => {
    if (shieldCharges <= 0 || isShieldActive || isGamePaused || !isGameRunning || mpSpectatorMode) return;
    try { triggerVibrate(15); } catch(e) {}
    if (mpActive && mpRole === 'guest') { shieldCharges--; updateSkillButtonsUI(); mpSendGuestSkill(2); return; }
    shieldCharges--; isShieldActive = true; shieldTimer = 300;
    sounds.playShield(); triggerVibrate([30, 30, 60]); updateSkillButtonsUI();
    spawnFloatingText(playerX, VIRTUAL_HEIGHT - 70, 'SHIELD!', '#39ff14'); triggerScreenFlash(0.2);
  };
  const bBomb = $('btn-bomb');
  if (bBomb) bBomb.onclick = () => {
    if (bombCharges <= 0 || isGamePaused || !isGameRunning || mpSpectatorMode) return;
    try { triggerVibrate(20); } catch(e) {}
    if (mpActive && mpRole === 'guest') { bombCharges--; updateSkillButtonsUI(); mpSendGuestSkill(3); return; }
    bombCharges--; screenShake = 22; sounds.playBomb(); triggerVibrate([100, 50, 100]);
    triggerHitStop(5); triggerScreenFlash(0.7); updateSkillButtonsUI();
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
          PLAYER_STATS.totalKills++; PLAYER_STATS.totalBossKills++;
          monsters.splice(i, 1);
          monsters.forEach(mn => createBurstParticles3D(mn.x, mn.y, mn.color, 20));
          monsters = [];
          stopSpawnLoop();
          if (!levelClearPending) {
            levelClearPending = true; showStageClearBanner();
            stageClearTimer = setTimeout(() => {
              stageClearTimer = null; levelClearPending = false; hideStageClearBanner();
              if (gameMode === 'endless') { endlessWave++; endlessKillsThisWave = 0; updateHUDValues(); startSpawnLoop(); }
              else if (gameMode === 'daily') handleDailyBossDefeated();
              else if (gameMode === 'coop') mpHostLevelComplete();
              else onLevelCleared();
            }, 3500);
          }
          break;
        }
      } else {
        createBurstParticles3D(m.x, m.y, m.color, 25);
        total += (ENEMY_SCORE_TABLE[m.type] || 150) * combo;
        levelKills++; PLAYER_STATS.totalKills++;
        if (gameMode === 'endless') endlessKillsThisWave++;
        handleKillStreak();
        monsters.splice(i, 1);
      }
    }
    score += total;
    if (total > 0) spawnFloatingText(VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2, `BOOM +${total}`, '#ff4757');
    updateHUDValues(); checkLevelObjectives();
    savePlayerStats(); checkAchievements();
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

  const bMP = $('btn-multiplayer'); if (bMP) bMP.onclick = () => openMPHub();
  const bMPCreate = $('btn-mp-create'); if (bMPCreate) bMPCreate.onclick = () => mpCreateRoom();
  const bMPJoin = $('btn-mp-join');
  if (bMPJoin) bMPJoin.onclick = () => {
    $('modal-mp-hub').classList.add('hidden'); $('modal-mp-join').classList.remove('hidden');
    const inp = $('mp-code-input'); if (inp) { inp.value = ''; inp.focus(); }
    mpSetStatus('mp-join-status', '', 'hidden');
  };
  const bMPCloseHub = $('btn-mp-close-hub'); if (bMPCloseHub) bMPCloseHub.onclick = () => $('modal-mp-hub').classList.add('hidden');
  const bMPBackJoin = $('btn-mp-back-from-join');
  if (bMPBackJoin) bMPBackJoin.onclick = () => { $('modal-mp-join').classList.add('hidden'); $('modal-mp-hub').classList.remove('hidden'); };
  const bMPDoJoin = $('btn-mp-do-join'); if (bMPDoJoin) bMPDoJoin.onclick = () => mpJoinRoom();
  const codeInput = $('mp-code-input');
  if (codeInput) codeInput.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); });
  const bMPCopy = $('btn-mp-copy-code');
  if (bMPCopy) bMPCopy.onclick = () => {
    const code = MP && MP.roomCode ? MP.roomCode : ''; if (!code) return;
    try { navigator.clipboard.writeText(code); bMPCopy.style.color = '#39ff14'; setTimeout(() => bMPCopy.style.color = '', 600); } catch(e) {}
  };
  const bMPStart = $('btn-mp-start-game'); if (bMPStart) bMPStart.onclick = () => mpStartGame();
  const bMPLeave = $('btn-mp-leave'); if (bMPLeave) bMPLeave.onclick = () => mpLeaveRoom();
  const bSpecRespawn = $('btn-spectator-respawn'); if (bSpecRespawn) bSpecRespawn.onclick = () => respawnFromSpectator();
  document.querySelectorAll('.mp-mode-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.mp-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); mpSelectedMode = btn.dataset.mode || 'coop';
    };
  });

  document.addEventListener('click', (e) => {
    const overlay = $('narrative-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    if (!overlay.contains(e.target) && e.target !== overlay) return;
    if (storyTyping) {
      if (storyTimer) { clearInterval(storyTimer); storyTimer = null; }
      const body = $('story-body'); if (body) body.textContent = storyCurrentText;
      const caret = overlay.querySelector('.caret'); if (caret) caret.remove();
      storyTyping = false;
    } else playNextStoryLine();
  }, true);

  setupDesktopHints($);
}

// =============================================================
// 28. THEME + UI HELPERS
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
  const lco = $('shop-level-coin'); if (lco) lco.innerText = upgradeCoin;
  const lli = $('shop-level-life'); if (lli) lli.innerText = upgradeLife;
  const lcm = $('shop-level-combo'); if (lcm) lcm.innerText = upgradeCombo;
  const lmg = $('shop-level-magnet'); if (lmg) lmg.innerText = upgradeMagnet;
  const lcr = $('shop-level-crit'); if (lcr) lcr.innerText = upgradeCrit;
  const lrv = $('shop-level-revive'); if (lrv) lrv.innerText = upgradeRevive;
  const cm = $('shop-coin-mult'); if (cm) cm.innerText = (1 + (upgradeCoin - 1) * 0.5).toFixed(1);
  const lbn = $('shop-life-bonus'); if (lbn) lbn.innerText = upgradeLife;
  const cc = $('shop-crit-chance'); if (cc) cc.innerText = upgradeCrit * 5;
  const rb = $('shop-revive-bonus'); if (rb) rb.innerText = upgradeRevive;
  const bf = $('btn-buy-firerate'); if (bf && bf.querySelector('span')) bf.querySelector('span').innerText = upgradeFireRate >= 5 ? 'MAX' : `${upgradeFireRate * 50}`;
  const bsh = $('btn-buy-shield'); if (bsh && bsh.querySelector('span')) bsh.querySelector('span').innerText = upgradeShield >= 5 ? 'MAX' : `${upgradeShield * 60}`;
  const bb = $('btn-buy-bomb'); if (bb && bb.querySelector('span')) bb.querySelector('span').innerText = upgradeBomb >= 5 ? 'MAX' : `${upgradeBomb * 75}`;
  const bz = $('btn-buy-freeze'); if (bz && bz.querySelector('span')) bz.querySelector('span').innerText = upgradeFreeze >= 5 ? 'MAX' : `${upgradeFreeze * 75}`;
  const bco = $('btn-buy-coin'); if (bco && bco.querySelector('span')) bco.querySelector('span').innerText = upgradeCoin >= 5 ? 'MAX' : `${upgradeCoin * 100}`;
  const bli = $('btn-buy-life'); if (bli && bli.querySelector('span')) bli.querySelector('span').innerText = upgradeLife >= 3 ? 'MAX' : `${(upgradeLife + 1) * 200}`;
  const bcm = $('btn-buy-combo'); if (bcm && bcm.querySelector('span')) bcm.querySelector('span').innerText = upgradeCombo >= 5 ? 'MAX' : `${upgradeCombo * 120}`;
  const bmg = $('btn-buy-magnet'); if (bmg && bmg.querySelector('span')) bmg.querySelector('span').innerText = upgradeMagnet >= 5 ? 'MAX' : `${upgradeMagnet * 140}`;
  const bcr = $('btn-buy-crit'); if (bcr && bcr.querySelector('span')) bcr.querySelector('span').innerText = upgradeCrit >= 5 ? 'MAX' : `${(upgradeCrit + 1) * 180}`;
  const brv = $('btn-buy-revive'); if (brv && brv.querySelector('span')) brv.querySelector('span').innerText = upgradeRevive >= 3 ? 'MAX' : `${(upgradeRevive + 1) * 250}`;
}
function buyUpgrade(type) {
  let cost = 0, ok = false;
  if (type === 'firerate' && upgradeFireRate < 5) { cost = upgradeFireRate * 50; if (coins >= cost) { coins -= cost; upgradeFireRate++; DB.set('pahlawan_up_firerate', upgradeFireRate); ok = true; } }
  else if (type === 'shield' && upgradeShield < 5) { cost = upgradeShield * 60; if (coins >= cost) { coins -= cost; upgradeShield++; DB.set('pahlawan_up_shield', upgradeShield); ok = true; } }
  else if (type === 'bomb' && upgradeBomb < 5) { cost = upgradeBomb * 75; if (coins >= cost) { coins -= cost; upgradeBomb++; DB.set('pahlawan_up_bomb', upgradeBomb); ok = true; } }
  else if (type === 'freeze' && upgradeFreeze < 5) { cost = upgradeFreeze * 75; if (coins >= cost) { coins -= cost; upgradeFreeze++; DB.set('pahlawan_up_freeze', upgradeFreeze); ok = true; } }
  else if (type === 'coin' && upgradeCoin < 5) { cost = upgradeCoin * 100; if (coins >= cost) { coins -= cost; upgradeCoin++; DB.set('pahlawan_up_coin', upgradeCoin); ok = true; } }
  else if (type === 'life' && upgradeLife < 3) { cost = (upgradeLife + 1) * 200; if (coins >= cost) { coins -= cost; upgradeLife++; DB.set('pahlawan_up_life', upgradeLife); ok = true; } }
  else if (type === 'combo' && upgradeCombo < 5) { cost = upgradeCombo * 120; if (coins >= cost) { coins -= cost; upgradeCombo++; DB.set('pahlawan_up_combo', upgradeCombo); ok = true; } }
  else if (type === 'magnet' && upgradeMagnet < 5) { cost = upgradeMagnet * 140; if (coins >= cost) { coins -= cost; upgradeMagnet++; DB.set('pahlawan_up_magnet', upgradeMagnet); ok = true; } }
  else if (type === 'crit' && upgradeCrit < 5) { cost = (upgradeCrit + 1) * 180; if (coins >= cost) { coins -= cost; upgradeCrit++; DB.set('pahlawan_up_crit', upgradeCrit); ok = true; } }
  else if (type === 'revive' && upgradeRevive < 3) { cost = (upgradeRevive + 1) * 250; if (coins >= cost) { coins -= cost; upgradeRevive++; DB.set('pahlawan_up_revive', upgradeRevive); ok = true; } }
  DB.set('pahlawan_coins', coins);
  if (ok) sounds.playCoin();
  updateShopUI();
}
function pauseGame() {
  if (!isGameRunning || mpSpectatorMode) return;
  if (mpActive && mpRole === 'guest') { mpGuestInput.pause = true; mpPauseState = 'paused-local'; return; }
  isGamePaused = true; mpPauseState = 'paused-local'; sounds.stopBGM();
  const p = document.getElementById('modal-pause'); if (p) { p.style.pointerEvents = 'auto'; p.classList.remove('hidden'); }
}
function resumeGame() {
  if (mpActive && mpRole === 'guest') { mpGuestInput.resume = true; mpPauseState = 'none'; return; }
  isGamePaused = false; mpPauseState = 'none'; sounds.startBGM();
  const p = document.getElementById('modal-pause'); if (p) p.classList.add('hidden');
  requestAnimationFrame(gameLoop);
}
function showRemotePauseOverlay() {
  const p = document.getElementById('modal-pause'); if (!p) return;
  const title = p.querySelector('h2, .modal-title');
  if (title) title.innerText = 'PARTNER PAUSED';
  p.style.pointerEvents = 'none'; p.classList.remove('hidden');
  p.querySelectorAll('button').forEach(b => { if (b.id !== 'btn-pause-leaderboard' && b.id !== 'btn-pause-change-hero') b.style.display = 'none'; });
}
function hideRemotePauseOverlay() {
  const p = document.getElementById('modal-pause'); if (!p) return;
  p.style.pointerEvents = 'auto'; p.classList.add('hidden');
  p.querySelectorAll('button').forEach(b => { b.style.display = ''; });
}
function requestFullscreenAndLandscape() {
  try {
    const doc = document.documentElement, body = document.body;
    const p = (doc.requestFullscreen && doc.requestFullscreen()) || (doc.webkitRequestFullscreen && doc.webkitRequestFullscreen()) || (doc.mozRequestFullScreen && doc.mozRequestFullScreen()) || (doc.msRequestFullscreen && doc.msRequestFullscreen()) || (body.webkitRequestFullscreen && body.webkitRequestFullscreen());
    if (p && p.catch) p.catch(() => {});
    setTimeout(() => {
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); else if (screen.lockOrientation) screen.lockOrientation('landscape'); } catch(e) {}
    }, 250);
  } catch (e) {}
}
function updateActorSelectionUI() {
  const name = HERO_DATA[currentActor] ? HERO_DATA[currentActor].name : 'Robot Cyber';
  const el = document.getElementById('selected-actor-name'); if (el) el.innerText = name;
  const ph = document.getElementById('pause-hero-name'); if (ph) ph.innerText = name;
}
function triggerSkillByKey(skillType) {
  if (!isGameRunning || isGamePaused || mpSpectatorMode) return;
  if (skillType === 'freeze') { if (freezeCharges <= 0 || isFrozen) return; const btn = document.getElementById('btn-freeze'); if (btn) btn.click(); }
  else if (skillType === 'shield') { if (shieldCharges <= 0 || isShieldActive) return; const btn = document.getElementById('btn-shield'); if (btn) btn.click(); }
  else if (skillType === 'bomb') { if (bombCharges <= 0) return; const btn = document.getElementById('btn-bomb'); if (btn) btn.click(); }
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
  joystickAxis = 0; joystickActive = false; joystickPointerId = null; fireButtonPressed = true;
  isMovingLeft = false; isMovingRight = false;
  const jk = document.getElementById('joystick-knob'); if (jk) jk.style.transform = 'translate(-50%, -50%)';
  const je = document.getElementById('analog-joystick'); if (je) je.classList.remove('is-active');
  const fb = document.getElementById('btn-fire'); if (fb) fb.dataset.pressed = '1';
  if (typeof window._hideDesktopHints === 'function') window._hideDesktopHints();
  if (stageClearTimer) { clearTimeout(stageClearTimer); stageClearTimer = null; }
  levelClearPending = false; bossPhase = 'minions'; bossMinionsKilled = 0; bossMinionsTarget = 0;
  const lvlBanner = document.getElementById('level-intro');
  if (lvlBanner) { lvlBanner.classList.remove('stage-clear'); lvlBanner.classList.remove('boss-approach'); }
  stopSpawnLoop(); mpStopHostSyncLoop();
  if (mpActive) { try { MP.leaveRoom(); } catch(e) {} mpActive = false; mpRole = null; }
  mpLastAppliedPhase = null; mpLastAppliedLevel = -1; mpEffectQueue = [];
  endSelfSpectatorMode();
  mpRemoteHostSpectator = false; mpRemoteGuestSpectator = false; mpGuestLives = 3;
  setSpectatorOverlayVisible(false);
  mpRemotePaused = false; mpLocalPauseRequested = false; mpPauseState = 'none';
  hideRemotePauseOverlay();
  const hud = document.getElementById('hud-overlay'); if (hud) hud.classList.add('hidden');
  const menu = document.getElementById('screen-main-menu'); if (menu) menu.classList.remove('hidden');
  sounds.stopBGM();
  isGameRunning = false; isGamePaused = false; isReviveModalOpen = false;
  applyThemeToDocument(LEVEL_THEMES[0]); gameMode = 'normal';
  (async () => { const lvl = await getSavedLevel(); const el = document.getElementById('saved-level-display'); if (el) el.innerText = `Level ${lvl}`; })();
  updateAchievementBadge(); updateLevelSelectButton(); updateActorGridUI();
}

// =============================================================
// 29. GAME FLOW
// =============================================================
async function startGame() {
  sounds.init();
  const input = document.getElementById('player-name-input');
  const inputName = input ? input.value.trim() : '';
  playerName = inputName || 'Pahlawan';
  DB.set('pahlawan_nama', playerName);
  const pnd = document.getElementById('player-name-display'); if (pnd) pnd.innerText = playerName;
  gameMode = 'normal';
  const savedLevel = await getSavedLevel();
  currentLevelIndex = Math.max(0, savedLevel - 1);
  score = 0; lives = 3 + upgradeLife;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
  if (!levelsData || levelsData.length === 0) levelsData = generate30Levels();
  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  resizeCanvas(); updateGameScale();
  setTimeout(() => { resizeCanvas(); updateGameScale(); startCurrentLevel(); }, 60);
}
function restartGame() {
  currentLevelIndex = 0; score = 0; lives = 3 + upgradeLife;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  coins = Number(localStorage.getItem('pahlawan_coins')) || 0;
  updateHUDValues(); updateLivesDisplay();
  startCurrentLevel();
}
function showLevelIntro(levelConfig) {
  const banner = document.getElementById('level-intro'); if (!banner) return;
  const numStr = String(levelConfig.level).padStart(2, '0');
  document.getElementById('level-intro-number').innerText = numStr;
  document.getElementById('level-intro-name').innerText = currentTheme.name;
  document.getElementById('level-intro-mission').innerText = levelConfig.algorithm.startsWith('boss_') ? 'DEFEAT THE BOSS' : `${levelConfig.targetKills} KILLS · TARGET ${levelConfig.targetScore}`;
  banner.classList.remove('hidden'); banner.classList.remove('fade-out');
  banner.classList.remove('stage-clear'); banner.classList.remove('boss-approach');
  void banner.offsetWidth;
  sounds.playLevelIntro();
  setTimeout(() => { banner.classList.add('fade-out'); setTimeout(() => banner.classList.add('hidden'), 300); }, 1200);
}
function showStageClearBanner() {
  const banner = document.getElementById('level-intro'); if (!banner) return;
  document.getElementById('level-intro-number').innerText = '✓';
  document.getElementById('level-intro-name').innerText = 'STAGE CLEAR!';
  document.getElementById('level-intro-mission').innerText = 'AMBIL KOIN & BONUS!';
  banner.classList.remove('hidden'); banner.classList.remove('fade-out'); banner.classList.remove('boss-approach');
  banner.classList.add('stage-clear');
  void banner.offsetWidth;
  try { sounds.playWin(); } catch(e) {}
  try { triggerVibrate([100, 50, 100, 50, 200]); } catch(e) {}
  triggerScreenFlash(0.6);
}
function hideStageClearBanner() {
  const banner = document.getElementById('level-intro'); if (!banner) return;
  banner.classList.add('fade-out'); banner.classList.remove('stage-clear');
  setTimeout(() => banner.classList.add('hidden'), 500);
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
  const proceed = () => { if (runStory) DB.set(storyKey, '1'); showLoadoutModal(levelConfig, () => actuallyStartLevel(levelConfig)); };
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
  hitStopFrames = 0; screenFlash = 0;
  comboBoostActive = { coins: false, firerate: false, magnet: false };
  comboBoostLastNotified = 0;
  levelDamageTaken = 0;
  if (stageClearTimer) { clearTimeout(stageClearTimer); stageClearTimer = null; }
  levelClearPending = false;
  bossPhase = 'minions'; bossMinionsKilled = 0; bossMinionsTarget = 0;
  const banner = document.getElementById('level-intro');
  if (banner) { banner.classList.remove('stage-clear'); banner.classList.remove('boss-approach'); }
  const cb = document.getElementById('combo-boost-indicator'); if (cb) cb.classList.remove('show');
}
function actuallyStartLevel(levelConfig) {
  playerSpeed = 11 * GAME_SCALE;
  freezeCharges = playerLoadout.includes('freeze') ? upgradeFreeze : 0;
  shieldCharges = playerLoadout.includes('shield') ? upgradeShield : 0;
  bombCharges   = playerLoadout.includes('bomb') ? upgradeBomb : 0;
  if (gameMode === 'daily' && currentDailyModifier && currentDailyModifier.id === 'no_shield') shieldCharges = 0;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  playerTargetX = playerX;
  updateSkillButtonsUI();
  isGameRunning = true; isGamePaused = false;
  levelStartTime = Date.now(); levelDamageTaken = 0;
  if (levelConfig.algorithm && levelConfig.algorithm.startsWith('boss_')) {
    const lvlNum = parseInt(levelConfig.algorithm.replace('boss_', '')) || 5;
    initBossPhase(lvlNum, gameMode);
  } else { bossPhase = 'defeated'; bossMinionsKilled = 0; bossMinionsTarget = 0; }
  if (IS_DESKTOP && typeof window._showDesktopHints === 'function') window._showDesktopHints();
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
    const hm = $('hud-mission');
    if (hm) { if (bossPhase === 'minions') hm.innerText = `${bossMinionsKilled}/${bossMinionsTarget} MINION`; else hm.innerText = `BOS ${dailyBossIndex + 1}/3`; }
  } else if (gameMode === 'coop') {
    const hl = $('hud-level'); if (hl) hl.innerText = 'CO-OP';
    const hm = $('hud-mission'); if (hm) hm.innerText = 'TEAM';
  } else {
    const lc = levelsData[currentLevelIndex] || levelsData[0];
    const hl = $('hud-level'); if (hl) hl.innerText = lc.level;
    const hm = $('hud-mission');
    if (hm) {
      if (lc.algorithm && lc.algorithm.startsWith('boss_')) {
        if (bossPhase === 'minions') hm.innerText = `${bossMinionsKilled}/${bossMinionsTarget} MINION`;
        else if (bossPhase === 'boss') hm.innerText = 'BOSS!';
        else hm.innerText = 'CLEAR';
      } else hm.innerText = `${levelKills}/${lc.targetKills}`;
    }
  }
  const hs = $('hud-score'); if (hs) hs.innerText = score;
  const hc = $('hud-coins'); if (hc) hc.innerText = coins;
  const comboPill = $('hud-combo-pill');
  if (comboPill) {
    if (combo > 1) { comboPill.classList.remove('hidden'); const ct = $('hud-combo-text'); if (ct) ct.innerText = `${combo}x COMBO`; }
    else comboPill.classList.add('hidden');
  }
}
function updateLivesDisplay() {
  const container = document.getElementById('hud-lives'); if (!container) return;
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
    triggerScreenFlash(0.5);
    setTimeout(() => overlay.classList.add('hidden'), 1400);
  }
}
function updateComboBoosts() {
  if (combo > PLAYER_STATS.maxCombo) { PLAYER_STATS.maxCombo = combo; savePlayerStats().then(() => checkAchievements()); }
  const c3 = combo >= 3, c5 = combo >= 5, c10 = combo >= 10;
  if (c3 && !comboBoostActive.coins) { comboBoostActive.coins = true; if (comboBoostLastNotified < 3) { showComboBoostIndicator('💰 COIN +50%'); sounds.playComboBoost(3); comboBoostLastNotified = 3; } }
  if (c5 && !comboBoostActive.firerate) { comboBoostActive.firerate = true; if (comboBoostLastNotified < 5) { showComboBoostIndicator('⚡ FIRE RATE +20%'); sounds.playComboBoost(5); comboBoostLastNotified = 5; } }
  if (c10 && !comboBoostActive.magnet) { comboBoostActive.magnet = true; if (comboBoostLastNotified < 10) { showComboBoostIndicator('🧲 AUTO MAGNET'); sounds.playComboBoost(10); comboBoostLastNotified = 10; isMagnetActive = true; magnetTimer = 600; } }
}
function showComboBoostIndicator(text) {
  const cb = document.getElementById('combo-boost-indicator'); if (!cb) return;
  cb.innerText = text; cb.classList.add('show');
  clearTimeout(cb._hideTimer);
  cb._hideTimer = setTimeout(() => cb.classList.remove('show'), 1800);
}

// =============================================================
// 30. SPAWN LOOP
// =============================================================
function spawnMonsterLoop(token) {
  if (gameMode === 'coop' && mpActive && mpRole !== 'host') return;
  if (token !== undefined && token !== spawnLoopToken) return;
  if (isGameRunning && !isGamePaused && !isFrozen) {
    let levelConfig;
    let spawnMultiplier = 1;
    const W = VIRTUAL_WIDTH;
    const S = GAME_SCALE;

    if (gameMode === 'endless') {
      const typesPool = ["jelly","donut","cloud","crystal","splitter","triangle","hexagon","star","diamond","worm"];
      const count = Math.min(typesPool.length, Math.floor(1 + endlessWave / 3) + 1);
      const algos = ["linear","zigzag","gravity","stealth","swarm","splitter"];
      levelConfig = { level: 999, targetKills: ENDLESS_KILLS_PER_WAVE, speed: (1 + endlessWave * 0.08) * S, spawnRate: Math.max(300, 1200 - endlessWave * 40), algorithm: algos[endlessWave % algos.length], types: typesPool.slice(0, count) };
      if (endlessWave > 0 && endlessWave % 5 === 0) {
        const b = Math.min(50, Math.ceil(endlessWave / 5) * 5);
        levelConfig.algorithm = `boss_${b}`;
        levelConfig.types = [`boss${b}`];
        levelConfig.bossHp = 150 + endlessWave * 60;
      }
    } else if (gameMode === 'daily') {
      if (Date.now() < nextBossSpawnTime) {}
      else if (monsters.length === 0 && dailyBossIndex < 3 && dailyBossSequence.length === 3 && bossPhase === 'boss') {
        const bossNum = dailyBossSequence[dailyBossIndex];
        const baseHp = getBossBaseHp(bossNum);
        const scale = [1, 1.2, 1.5][dailyBossIndex] || 1;
        const hpVal = Math.floor(baseHp * scale);
        const bossSize = (BOSS_SIZES[bossNum] || 75) * S;
        const theme = getBossTheme(bossNum);
        currentTheme = theme; applyThemeToDocument(theme); recolorStars();
        triggerBossSiren();
        monsters.push({ x: W / 2, startX: W / 2, y: -100 * S, speed: (1.0 + dailyBossIndex * 0.15) * S, size: bossSize, hp: hpVal, maxHp: hpVal, color: theme.accent, type: `boss${bossNum}`, algorithm: `boss_${bossNum}`, shootTimer: 0, minionTimer: 0, enrageTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, aura: 0, aimTimer: 0, aimTargetX: 0, aimTargetY: 0, coreOpen: false, coreTimer: 0, coreGlow: 0, noWeakPoint: false });
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
      const isBossAlgo = algo.startsWith('boss_');

      if (isBossAlgo && bossPhase === 'minions') {
        const minionTypes = ['jelly', 'triangle', 'worm', 'cloud'];
        const type = minionTypes[Math.floor(Math.random() * minionTypes.length)];
        monsters.push({
          x: Math.random() * (W - 120 * S) + 60 * S,
          startX: Math.random() * (W - 120 * S) + 60 * S,
          y: -60 * S,
          speed: (1.4 + Math.random() * 0.8) * (levelConfig.speed || 1),
          size: 28 * S, hp: 1, maxHp: 1,
          color: currentTheme.monsters[Math.floor(Math.random() * currentTheme.monsters.length)],
          type, algorithm: 'linear',
          shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0,
          aimTimer: 0, aimTargetX: 0, aimTargetY: 0,
          canShoot: false, shootCooldown: 999,
          rot: 0, wobble: Math.random() * Math.PI * 2, isMinion: true
        });
        const myToken = (token !== undefined) ? token : spawnLoopToken;
        setTimeout(() => spawnMonsterLoop(myToken), 700);
        return;
      }

      if (isBossAlgo) {
        if (bossPhase === 'boss' && monsters.length === 0) {
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
            coreOpen: false, coreTimer: 0, coreGlow: 0, noWeakPoint: isTut
          });
        }
      } else {
        let n = (algo === 'swarm') ? 2 : 1;
        n = Math.ceil(n * spawnMultiplier);
        for (let c = 0; c < n; c++) {
          const type = typeList[Math.floor(Math.random() * typeList.length)];
          let hp = 1, canShoot = false, baseSize = 30 * S, speedMult = 1.0;
          if (type === 'donut') { hp = 2; baseSize = 36 * S; speedMult = 0.9; }
          else if (type === 'crystal') { hp = 3; baseSize = 30 * S; speedMult = 0.85; canShoot = true; }
          else if (type === 'cloud') { hp = 2; baseSize = 34 * S; speedMult = 1.1; }
          else if (type === 'splitter') { hp = 2; baseSize = 32 * S; speedMult = 1.0; }
          else if (type === 'triangle') { hp = 1; baseSize = 28 * S; speedMult = 1.6; }
          else if (type === 'hexagon') { hp = 4; baseSize = 34 * S; speedMult = 0.7; }
          else if (type === 'star') { hp = 2; baseSize = 30 * S; speedMult = 0.95; canShoot = true; }
          else if (type === 'diamond') { hp = 2; baseSize = 32 * S; speedMult = 1.1; }
          else if (type === 'worm') { hp = 3; baseSize = 36 * S; speedMult = 1.05; }
          monsters.push({
            x: Math.random() * (W - 120 * S) + 60 * S,
            startX: Math.random() * (W - 120 * S) + 60 * S,
            y: -60 * S,
            speed: (1.2 + Math.random() * 1.2) * speedMult * (levelConfig.speed || 1),
            size: baseSize, hp, maxHp: hp,
            color: currentTheme.monsters[Math.floor(Math.random() * currentTheme.monsters.length)],
            type, algorithm: algo,
            shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0,
            aimTimer: 0, aimTargetX: 0, aimTargetY: 0,
            canShoot, shootCooldown: 60 + Math.random() * 120,
            rot: Math.random() * Math.PI * 2,
            wobble: Math.random() * Math.PI * 2
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
function startSpawnLoop() { spawnLoopToken++; spawnMonsterLoop(spawnLoopToken); }
function stopSpawnLoop() { spawnLoopToken++; }

// =============================================================
// 31. DROP / PARTICLES / UTILITY
// =============================================================
function trySpawnDrop(x, y) {
  const comboCoinBonus = comboBoostActive.coins ? 1.5 : 1.0;
  const cc = ((gameMode === 'endless') ? 0.7 : 0.45) * comboCoinBonus;
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
    powerups.push({ x: Math.max(30 * S, Math.min(VIRTUAL_WIDTH - 30 * S, px)), y: Math.max(30 * S, py), type, speed: 1.5 * S, size: 18 * S, rot: 0, fromBoss: true });
  }
  for (let i = 0; i < 8; i++) {
    coinsOnField.push({ x: bossX + (Math.random() - 0.5) * 100 * S, y: bossY + (Math.random() - 0.5) * 50 * S, vy: 1.8 * S, size: 10 * S, rot: 0, trail: 0 });
  }
  sounds.playPowerup(); triggerVibrate([80, 40, 80, 40, 120]);
  triggerScreenFlash(0.4); triggerHitStop(4);
}
function spawnFloatingText(x, y, text, color) {
  const c = document.getElementById('popup-container'); if (!c) return;
  const el = document.createElement('div');
  el.className = 'floating-text'; el.innerText = text;
  el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color;
  c.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
function createBurstParticles3D(x, y, color, count = 20) {
  const S = GAME_SCALE;
  for (let i = 0; i < count; i++) {
    particles.push({ x, y, vx: (Math.random() - 0.5) * 14 * S, vy: (Math.random() - 0.5) * 14 * S, size: (Math.random() * 7 + 3) * S, life: 1.0, color, spin: (Math.random() - 0.5) * 0.4, rot: 0, star: Math.random() < 0.35 });
  }
}
function spawnTelegraph(fromX, fromY, toX, toY, dur, color) {
  telegraphs.push({ x: fromX, y: fromY, targetX: toX, targetY: toY, progress: 0, duration: dur, color: color || '#ff2e88' });
}
function handleKillStreak() {
  killStreakCount++;
  const n = killStreakMilestone;
  if (n < KILLSTREAK_MILESTONES.length && killStreakCount >= KILLSTREAK_MILESTONES[n]) { killStreakMilestone++; showKillStreak(KILLSTREAK_TITLES[n], KILLSTREAK_MILESTONES[n]); }
}
function showKillStreak(title, count) {
  const ov = document.getElementById('killstreak-overlay');
  const txt = document.getElementById('killstreak-text');
  const sub = document.getElementById('killstreak-sub');
  if (!ov || !txt || !sub) return;
  txt.innerText = title; sub.innerText = `${count} KILLS`;
  ov.classList.remove('hidden'); void ov.offsetWidth;
  sounds.playKillstreak(); triggerScreenFlash(0.35);
  setTimeout(() => ov.classList.add('hidden'), 1300);
}
function checkLevelObjectives() {
  if (gameMode === 'coop' && mpActive && mpRole !== 'host') return;
  if (gameMode === 'endless') {
    if (endlessKillsThisWave >= ENDLESS_KILLS_PER_WAVE && monsters.length === 0) {
      if (!levelClearPending) {
        levelClearPending = true; showStageClearBanner(); stopSpawnLoop();
        stageClearTimer = setTimeout(() => {
          stageClearTimer = null; levelClearPending = false; hideStageClearBanner();
          endlessWave++; endlessKillsThisWave = 0; updateHUDValues();
          spawnFloatingText(VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2, `WAVE ${endlessWave}`, '#ffd700');
          if (endlessWave % 5 === 0) initBossPhase(endlessWave, 'endless');
          startSpawnLoop();
        }, 2500);
      }
    }
    return;
  }
  if (gameMode === 'daily') {
    if (bossPhase === 'minions') {
      bossMinionsKilled = levelKills;
      const hud = document.getElementById('hud-mission');
      if (hud) hud.innerText = `${bossMinionsKilled}/${bossMinionsTarget} MINION`;
      if (bossMinionsKilled >= bossMinionsTarget && monsters.length === 0) transitionToBossPhase();
    }
    return;
  }
  if (gameMode === 'coop') {
    const lc = levelsData[currentLevelIndex] || levelsData[0];
    if (levelKills >= lc.targetKills * 1.5 && monsters.length === 0) {
      if (!levelClearPending) {
        levelClearPending = true; showStageClearBanner(); stopSpawnLoop();
        stageClearTimer = setTimeout(() => {
          stageClearTimer = null; levelClearPending = false; hideStageClearBanner();
          mpHostLevelComplete();
        }, 2500);
      }
    }
    return;
  }
  const lc = levelsData[currentLevelIndex] || levelsData[0];
  const isBossLevel = lc.algorithm.startsWith('boss_');
  if (isBossLevel) {
    if (bossPhase === 'minions') {
      bossMinionsKilled = levelKills;
      const hud = document.getElementById('hud-mission');
      if (hud) hud.innerText = `${bossMinionsKilled}/${bossMinionsTarget} MINION`;
      if (bossMinionsKilled >= bossMinionsTarget && monsters.length === 0) transitionToBossPhase();
    }
    return;
  }
  if (levelKills >= lc.targetKills) {
    if (score >= lc.targetScore) {
      if (!levelClearPending) {
        levelClearPending = true; showStageClearBanner(); stopSpawnLoop();
        stageClearTimer = setTimeout(() => {
          stageClearTimer = null; levelClearPending = false; hideStageClearBanner();
          onLevelCleared();
        }, 2500);
      }
    } else onLevelFailed("SKOR BELUM MENCAPAI TARGET");
  }
}

// ============ END OF PART 2/4 ============
console.log('📦 [game.js] PART 2/4 loaded');

// =============================================================
// PAHLAWAN BINTANG — game.js v21.0.0 — PART 3/4
// Draw Hero (20), Bullet Spawner (20), Draw Bullet (20),
// Enemy Extended, Boss Unique, Game Loop Host, Game Loop Guest
// =============================================================

// =============================================================
// 32. DRAW HERO — 20 HERO VISUAL
// =============================================================
function drawHeroVector(ctx, x, y, type, isRemote) {
  const hero = HERO_DATA[type] || HERO_DATA.robot;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(GAME_SCALE, GAME_SCALE);
  if (isRemote) ctx.globalAlpha = 0.85;
  const rageMode = !isRemote && lives === 1 && playerHitPoints === 1;

  // ============ ROBOT ============
  if (type === 'robot') {
    ctx.fillStyle = '#1e90ff'; ctx.fillRect(-18, -10, 36, 28);
    ctx.fillStyle = '#70a1ff'; ctx.fillRect(-12, -26, 24, 16);
    ctx.fillStyle = '#00d2d3'; ctx.fillRect(-8, -22, 16, 6);
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-24, -8, 6, 16); ctx.fillRect(18, -8, 6, 16);
    ctx.fillStyle = '#ff4757';
    ctx.beginPath(); ctx.moveTo(-10, 18); ctx.lineTo(0, 30 + Math.random()*6); ctx.lineTo(10, 18); ctx.fill();
  }
  // ============ CANNON ============
  else if (type === 'cannon') {
    ctx.fillStyle = '#ff4757';
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(24, 15); ctx.lineTo(-24, 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2f3542'; ctx.fillRect(-16, -18, 5, 20); ctx.fillRect(11, -18, 5, 20);
    ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI*2); ctx.fill();
  }
  // ============ DRAGON ============
  else if (type === 'dragon') {
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(16, 10); ctx.lineTo(28, -5); ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18); ctx.lineTo(-28, -5); ctx.lineTo(-16, 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff4757'; ctx.fillRect(-7, -12, 4, 4); ctx.fillRect(3, -12, 4, 4);
  }
  // ============ CAT ============
  else if (type === 'cat') {
    ctx.fillStyle = '#ffa502';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-8, -24); ctx.lineTo(-2, -12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(8, -24); ctx.lineTo(2, -12); ctx.fill();
    ctx.fillStyle = '#2f3542'; ctx.fillRect(-12, -6, 24, 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(-8, -4, 4, 4); ctx.fillRect(4, -4, 4, 4);
  }
  // ============ UNICORN ============
  else if (type === 'unicorn') {
    ctx.fillStyle = '#a55eea';
    ctx.beginPath(); ctx.arc(0, 2, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(5, -12); ctx.lineTo(-5, -12); ctx.closePath(); ctx.fill();
  }
  // ============ PHOENIX ============
  else if (type === 'phoenix') {
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.moveTo(-22, -5); ctx.lineTo(-32, -18); ctx.lineTo(-26, 0);
    ctx.lineTo(-30, 8); ctx.lineTo(-16, 6);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(22, -5); ctx.lineTo(32, -18); ctx.lineTo(26, 0);
    ctx.lineTo(30, 8); ctx.lineTo(16, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff6600';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, -16, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(-5, -19, 2, 2); ctx.fillRect(3, -19, 2, 2);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(-6, -26); ctx.lineTo(-3, -32); ctx.lineTo(0, -28); ctx.lineTo(3, -32); ctx.lineTo(6, -26); ctx.closePath(); ctx.fill();
  }
  // ============ NINJA ============
  else if (type === 'ninja') {
    ctx.fillStyle = 'rgba(165, 94, 234, 0.3)';
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.ellipse(0, 2, 16, 18, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#0d0d1a';
    ctx.beginPath(); ctx.arc(0, -12, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c56cf0'; ctx.fillRect(-12, -14, 24, 5);
    ctx.fillStyle = '#fff'; ctx.fillRect(-7, -12, 5, 3); ctx.fillRect(2, -12, 5, 3);
    ctx.strokeStyle = '#666'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-22, 12); ctx.stroke();
  }
  // ============ WIZARD ============
  else if (type === 'wizard') {
    ctx.fillStyle = 'rgba(0, 184, 212, 0.25)';
    ctx.beginPath(); ctx.arc(0, 0, 26 + Math.sin(playerPulse*2)*2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00b8d4';
    ctx.beginPath(); ctx.moveTo(-16, 22); ctx.lineTo(-8, -8); ctx.lineTo(8, -8); ctx.lineTo(16, 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0095b8';
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(0, -34); ctx.lineTo(14, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    for (let s = 0; s < 5; s++) {
      const a = (Math.PI*2/5)*s - Math.PI/2;
      const px = Math.cos(a)*5, py = -22 + Math.sin(a)*5;
      s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      const a2 = a + Math.PI/5;
      ctx.lineTo(Math.cos(a2)*2, -22 + Math.sin(a2)*2);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd8b0';
    ctx.beginPath(); ctx.arc(0, -2, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(-3, -3, 2, 2); ctx.fillRect(1, -3, 2, 2);
    ctx.strokeStyle = '#8b4513'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(-16, 22); ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(-14, -14, 5, 0, Math.PI*2); ctx.fill();
  }
  // ============ ARCHER ============
  else if (type === 'archer') {
    ctx.fillStyle = '#2ed573';
    ctx.beginPath(); ctx.ellipse(0, 4, 14, 18, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd8b0';
    ctx.beginPath(); ctx.arc(0, -12, 11, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1abc4e';
    ctx.beginPath();
    ctx.moveTo(-12, -14); ctx.lineTo(-10, -24); ctx.lineTo(0, -28);
    ctx.lineTo(10, -24); ctx.lineTo(12, -14); ctx.lineTo(0, -20);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(-4, -13, 2, 2); ctx.fillRect(2, -13, 2, 2);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(-16, -2, 12, -Math.PI/3, Math.PI/3); ctx.stroke();
    ctx.strokeStyle = '#8b4513'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(-32, -2); ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(-32, -2); ctx.lineTo(-38, -5); ctx.lineTo(-38, 1); ctx.closePath(); ctx.fill();
  }
  // ============ GHOST ============
  else if (type === 'ghost') {
    ctx.fillStyle = `rgba(0, 210, 211, ${0.15 + Math.sin(playerPulse*3)*0.1})`;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(230, 238, 252, 0.85)';
    ctx.beginPath();
    ctx.moveTo(-16, -8);
    ctx.quadraticCurveTo(-20, -20, 0, -22);
    ctx.quadraticCurveTo(20, -20, 16, -8);
    ctx.lineTo(16, 16);
    const waveOffset = Math.sin(playerPulse * 2) * 2;
    ctx.lineTo(12, 12 + waveOffset); ctx.lineTo(8, 18); ctx.lineTo(4, 12 - waveOffset);
    ctx.lineTo(0, 18); ctx.lineTo(-4, 12 + waveOffset); ctx.lineTo(-8, 18); ctx.lineTo(-12, 12 - waveOffset);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#00d2d3';
    ctx.shadowColor = '#00d2d3'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(-6, -6, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -6, 3, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0a0015';
    ctx.beginPath(); ctx.ellipse(0, 4, 3, 5, 0, 0, Math.PI*2); ctx.fill();
  }
  // ============ TIGER ============
  else if (type === 'tiger') {
    ctx.fillStyle = '#ff6b00';
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#cc5500';
    ctx.fillRect(-16, -6, 4, 3); ctx.fillRect(-16, 2, 4, 3); ctx.fillRect(-16, 10, 4, 3);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-18, -22); ctx.lineTo(-8, -12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(18, -22); ctx.lineTo(8, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-6, -3, 2, 0, Math.PI*2); ctx.arc(6, -3, 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-6, -3, 0.8, 0, Math.PI*2); ctx.arc(6, -3, 0.8, 0, Math.PI*2); ctx.fill();
  }
  // ============ EAGLE ============
  else if (type === 'eagle') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(24, 0); ctx.lineTo(14, 6); ctx.lineTo(0, -2); ctx.lineTo(-14, 6); ctx.lineTo(-24, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e6eefc';
    ctx.beginPath(); ctx.ellipse(0, 4, 12, 16, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath(); ctx.arc(0, -10, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffa502';
    ctx.beginPath(); ctx.moveTo(-3, -10); ctx.lineTo(-10, -8); ctx.lineTo(-3, -6); ctx.closePath(); ctx.fill();
  }
  // ============ SAMURAI ============
  else if (type === 'samurai') {
    ctx.fillStyle = '#2c2c54'; ctx.fillRect(-14, -10, 28, 24);
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(-12, 6, 24, 8);
    ctx.fillStyle = '#c56cf0'; ctx.beginPath(); ctx.arc(0, -18, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(-9, -20, 18, 5);
    ctx.fillStyle = '#fff'; ctx.fillRect(-6, -19, 4, 2); ctx.fillRect(2, -19, 4, 2);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(28, 18); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(28, 18); ctx.stroke();
  }
  // ============ ALIEN ============
  else if (type === 'alien') {
    ctx.fillStyle = 'rgba(57, 255, 20, 0.25)';
    ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#39ff14';
    ctx.beginPath(); ctx.ellipse(0, -10, 14, 10, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 6, 10, 12, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5, -10, 3, 0, Math.PI*2); ctx.arc(5, -10, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00ffff';
    ctx.beginPath(); ctx.arc(-5, -10, 1, 0, Math.PI*2); ctx.arc(5, -10, 1, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(-10, -28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -22); ctx.lineTo(10, -28); ctx.stroke();
    ctx.fillStyle = '#00ffff';
    ctx.beginPath(); ctx.arc(-10, -28, 1.5, 0, Math.PI*2); ctx.arc(10, -28, 1.5, 0, Math.PI*2); ctx.fill();
  }
  // ============ MECHA ============
  else if (type === 'mecha') {
    ctx.fillStyle = '#7f8fa6'; ctx.fillRect(-18, -14, 36, 26);
    ctx.fillStyle = '#57606f'; ctx.fillRect(-12, -28, 24, 14);
    ctx.fillStyle = '#ffd700'; ctx.fillRect(-22, -10, 4, 18); ctx.fillRect(18, -10, 4, 18);
    ctx.fillStyle = '#2f3542'; ctx.fillRect(-6, -8, 12, 6);
    ctx.fillStyle = '#ff4757'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath(); ctx.arc(-6, -20, 2, 0, Math.PI*2); ctx.arc(6, -20, 2, 0, Math.PI*2); ctx.fill();
  }
  // ============ WOLF ============
  else if (type === 'wolf') {
    ctx.fillStyle = '#a4b0be';
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#57606f';
    ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-14, -22); ctx.lineTo(-4, -12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(14, -22); ctx.lineTo(4, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e6eefc';
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(0, 6); ctx.lineTo(4, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath(); ctx.arc(-5, -2, 2, 0, Math.PI*2); ctx.arc(5, -2, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowColor = '#00d2ff'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(-5, -2, 1, 0, Math.PI*2); ctx.arc(5, -2, 1, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  // ============ BEE ============
  else if (type === 'bee') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath(); ctx.ellipse(-16, -10, 8, 5, -0.4 + Math.sin(playerPulse*8)*0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16, -10, 8, 5, 0.4 - Math.sin(playerPulse*8)*0.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-14, -6, 28, 5); ctx.fillRect(-14, 5, 28, 5);
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5, -10, 1.5, 0, Math.PI*2); ctx.arc(5, -10, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -18); ctx.lineTo(-8, -24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -18); ctx.lineTo(8, -24); ctx.stroke();
  }
  // ============ KRAKEN ============
  else if (type === 'kraken') {
    ctx.strokeStyle = '#3d0060'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 6); ctx.quadraticCurveTo(-18 + Math.sin(playerPulse*4)*3, 18, -14, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 6); ctx.quadraticCurveTo(18 + Math.sin(playerPulse*4+1)*3, 18, 14, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(Math.sin(playerPulse*4+2)*3, 22, 0, 30); ctx.stroke();
    ctx.fillStyle = '#3d0060';
    ctx.beginPath(); ctx.ellipse(0, -8, 18, 14, 0, 0, Math.PI*2); ctx.fill();
    ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath(); ctx.arc(-7, -10, 3, 0, Math.PI*2); ctx.arc(7, -10, 3, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-7, -10, 1.5, 0, Math.PI*2); ctx.arc(7, -10, 1.5, 0, Math.PI*2); ctx.fill();
  }
  // ============ TITAN ============
  else if (type === 'titan') {
    ctx.fillStyle = '#57606f'; ctx.fillRect(-16, -14, 32, 28);
    ctx.fillStyle = '#2f3542'; ctx.fillRect(-20, 8, 40, 14);
    ctx.fillStyle = '#ffd700'; ctx.fillRect(-8, 24, 16, 3);
    ctx.fillStyle = '#3a4560'; ctx.fillRect(-12, -12, 24, 8);
    ctx.fillStyle = '#ff4757';
    ctx.beginPath(); ctx.arc(-6, -4, 2.5, 0, Math.PI*2); ctx.arc(6, -4, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-6, -4, 1, 0, Math.PI*2); ctx.arc(6, -4, 1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700'; ctx.fillRect(-22, -12, 4, 20); ctx.fillRect(18, -12, 4, 20);
  }
  // ============ ANGEL ============
  else if (type === 'angel') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath(); ctx.moveTo(-8, -6); ctx.quadraticCurveTo(-30, -20, -16, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, -6); ctx.quadraticCurveTo(30, -20, 16, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, -14, 8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI*2/8)*i;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*10, -14 + Math.sin(a)*10);
      ctx.lineTo(Math.cos(a)*15, -14 + Math.sin(a)*15); ctx.stroke();
    }
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-4, -14, 1.5, 0, Math.PI*2); ctx.arc(4, -14, 1.5, 0, Math.PI*2); ctx.fill();
  }

  if (rageMode) {
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(playerPulse * 3) * 0.15;
    ctx.fillStyle = 'rgba(255, 0, 60, 0.4)';
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI*2); ctx.fill();
    ctx.restore();
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
// 33. BULLET SPAWNER PER HERO — 20 BULLET TYPES
// =============================================================
function spawnHeroBullets(heroId, originX, originY, targetDir, owner) {
  const hero = HERO_DATA[heroId] || HERO_DATA.robot;
  const S = GAME_SCALE;
  const bulletsToAdd = [];
  const bt = hero.bulletType;
  const size = hero.bulletSize * S;
  const speed = hero.bulletSpeed * S;
  const pierce = hero.bulletPierce;

  switch (bt) {
    case 'laser-double':
      bulletsToAdd.push({ x: originX - 8 * S, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      bulletsToAdd.push({ x: originX + 8 * S, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      break;
    case 'heavy-shot':
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      break;
    case 'triple-spread':
      bulletsToAdd.push({ x: originX - 10 * S, y: originY, vx: -2 * S, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed + 1 * S, color: hero.color, heroType: heroId, size: size + 1, pierce, owner });
      bulletsToAdd.push({ x: originX + 10 * S, y: originY, vx: 2 * S, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      break;
    case 'rapid-fire':
      bulletsToAdd.push({ x: originX, y: originY, vx: (Math.random()-0.5)*1.2 * S, vy: speed, color: hero.color, heroType: heroId, size, pierce, rot: 0, owner });
      break;
    case 'piercing-star':
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce: 2, owner });
      break;
    case 'flame-spread':
      bulletsToAdd.push({ x: originX - 12 * S, y: originY, vx: -1.8 * S, vy: speed, color: '#ff6600', heroType: heroId, size, pierce, owner });
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed + 1 * S, color: '#ff8c00', heroType: heroId, size: size + 1, pierce, owner });
      bulletsToAdd.push({ x: originX + 12 * S, y: originY, vx: 1.8 * S, vy: speed, color: '#ff6600', heroType: heroId, size, pierce, owner });
      break;
    case 'shuriken-spin':
      bulletsToAdd.push({ x: originX - 6 * S, y: originY, vx: -1 * S, vy: speed, color: '#c56cf0', heroType: heroId, size, pierce, rot: 0, owner });
      bulletsToAdd.push({ x: originX + 6 * S, y: originY, vx: 1 * S, vy: speed, color: '#c56cf0', heroType: heroId, size, pierce, rot: 0, owner });
      break;
    case 'magic-orb':
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce: 2, owner });
      break;
    case 'golden-arrow':
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: '#ffd700', heroType: heroId, size, pierce: 3, owner });
      break;
    case 'soul-spread':
      for (let i = -2; i <= 2; i++) {
        const angle = i * 0.28;
        bulletsToAdd.push({ x: originX, y: originY, vx: Math.sin(angle) * speed, vy: Math.cos(angle) * speed, color: i === 0 ? '#00d2d3' : hero.color, heroType: heroId, size, pierce, owner });
      }
      break;
    // ============ NEW 10 HEROES ============
    case 'flame-claw':
      bulletsToAdd.push({ x: originX - 8 * S, y: originY, vx: -1.5 * S, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      bulletsToAdd.push({ x: originX + 8 * S, y: originY, vx: 1.5 * S, vy: speed, color: hero.accent, heroType: heroId, size, pierce, owner });
      break;
    case 'homing-feather':
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      break;
    case 'katana-slash':
      bulletsToAdd.push({ x: originX - 12 * S, y: originY, vx: -1.8 * S, vy: speed, color: hero.color, heroType: heroId, size, pierce: 2, owner });
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed + 1 * S, color: hero.accent, heroType: heroId, size: size + 1, pierce: 2, owner });
      bulletsToAdd.push({ x: originX + 12 * S, y: originY, vx: 1.8 * S, vy: speed, color: hero.color, heroType: heroId, size, pierce: 2, owner });
      break;
    case 'plasma-ball':
      bulletsToAdd.push({ x: originX - 10 * S, y: originY, vx: -1 * S, vy: speed, color: hero.color, heroType: heroId, size: size + 2, pierce, owner });
      bulletsToAdd.push({ x: originX + 10 * S, y: originY, vx: 1 * S, vy: speed, color: hero.color, heroType: heroId, size: size + 2, pierce, owner });
      break;
    case 'twin-cannon':
      bulletsToAdd.push({ x: originX - 12 * S, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size: size + 2, pierce, owner });
      bulletsToAdd.push({ x: originX + 12 * S, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size: size + 2, pierce, owner });
      break;
    case 'moon-beam':
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce: 3, owner });
      break;
    case 'swarm-sting':
      for (let i = 0; i < 4; i++) {
        bulletsToAdd.push({ x: originX + (i - 1.5) * 6 * S, y: originY, vx: (i - 1.5) * 1.2 * S, vy: speed, color: hero.color, heroType: heroId, size: size - 1, pierce, owner });
      }
      break;
    case 'tentacle-spread':
      for (let i = -2; i <= 2; i++) {
        const angle = i * 0.28;
        bulletsToAdd.push({ x: originX, y: originY, vx: Math.sin(angle) * speed * 0.9, vy: Math.cos(angle) * speed, color: hero.color, heroType: heroId, size, pierce, owner });
      }
      break;
    case 'hammer-shot':
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
      break;
    case 'holy-beam':
      bulletsToAdd.push({ x: originX - 10 * S, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce: 3, owner });
      bulletsToAdd.push({ x: originX + 10 * S, y: originY, vx: 0, vy: speed, color: hero.accent, heroType: heroId, size, pierce: 3, owner });
      break;
    default:
      bulletsToAdd.push({ x: originX, y: originY, vx: 0, vy: speed, color: hero.color, heroType: heroId, size, pierce, owner });
  }

  bulletsToAdd.forEach(b => bullets.push(b));
  return bulletsToAdd.length;
}

// =============================================================
// 34. DRAW BULLET — 20 HERO BULLETS
// =============================================================
function drawBullet(ctx, b, S) {
  ctx.save();
  ctx.translate(b.x, b.y);
  const heroType = b.heroType;

  if (heroType === 'cat') {
    b.rot = (b.rot || 0) + 0.3; ctx.rotate(b.rot);
    ctx.fillStyle = b.color;
    ctx.fillRect(-6 * S, -2 * S, 12 * S, 4 * S);
    ctx.fillRect(-2 * S, -6 * S, 4 * S, 12 * S);
  } else if (heroType === 'cannon') {
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2);
    ctx.fillStyle = '#ffd700'; ctx.fill();
    ctx.lineWidth = 3 * S; ctx.strokeStyle = '#ff4757'; ctx.stroke();
  } else if (heroType === 'unicorn') {
    ctx.fillStyle = '#a55eea';
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.4, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'phoenix') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 2);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
    glow.addColorStop(0.5, 'rgba(255, 140, 0, 0.6)');
    glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff4500';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.4, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'ninja') {
    b.rot = (b.rot || 0) + 0.4; ctx.rotate(b.rot);
    ctx.fillStyle = '#c56cf0';
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.rotate((Math.PI/2) * i);
      ctx.beginPath();
      ctx.moveTo(0, -b.size);
      ctx.lineTo(b.size * 0.3, -b.size * 0.3);
      ctx.lineTo(0, 0);
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.3, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'wizard') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 1.8);
    glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    glow.addColorStop(0.4, 'rgba(0, 184, 212, 0.8)');
    glow.addColorStop(1, 'rgba(0, 100, 180, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 1.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.5, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'archer') {
    ctx.strokeStyle = '#8b4513'; ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.moveTo(0, b.size*1.5); ctx.lineTo(0, -b.size*1.5); ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(0, -b.size*2); ctx.lineTo(-b.size*0.6, -b.size*1); ctx.lineTo(b.size*0.6, -b.size*1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2ed573';
    ctx.beginPath(); ctx.moveTo(0, b.size*1.5); ctx.lineTo(-b.size*0.8, b.size*2.3); ctx.lineTo(-b.size*0.2, b.size*1.7); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, b.size*1.5); ctx.lineTo(b.size*0.8, b.size*2.3); ctx.lineTo(b.size*0.2, b.size*1.7); ctx.closePath(); ctx.fill();
  } else if (heroType === 'ghost') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 1.8);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    glow.addColorStop(0.4, 'rgba(0, 210, 211, 0.7)');
    glow.addColorStop(1, 'rgba(0, 100, 150, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 1.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#e6eefc';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.6, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'tiger') {
    ctx.fillStyle = '#ff6b00';
    ctx.beginPath(); ctx.ellipse(0, 0, b.size * 0.6, b.size * 1.2, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, -b.size * 0.5, b.size * 0.3, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'eagle') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(0, -b.size*1.5); ctx.lineTo(-b.size, b.size); ctx.lineTo(0, b.size*0.4); ctx.lineTo(b.size, b.size); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#00d2ff'; ctx.lineWidth = 1; ctx.stroke();
  } else if (heroType === 'samurai') {
    ctx.rotate((b.rot = (b.rot||0) + 0.2));
    ctx.fillStyle = '#c56cf0';
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-b.size, 0); ctx.lineTo(b.size, 0); ctx.stroke();
  } else if (heroType === 'alien') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size*2);
    glow.addColorStop(0, 'rgba(57,255,20,0.9)'); glow.addColorStop(1, 'rgba(0,255,255,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, b.size*2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#39ff14'; ctx.beginPath(); ctx.arc(0, 0, b.size*0.7, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'mecha') {
    ctx.fillStyle = '#7f8fa6';
    ctx.fillRect(-b.size, -b.size*1.5, b.size*2, b.size*3);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-b.size*0.6, -b.size*0.6, b.size*1.2, b.size*1.2);
  } else if (heroType === 'wolf') {
    ctx.strokeStyle = '#a4b0be'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -b.size*2); ctx.lineTo(0, b.size*2); ctx.stroke();
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath(); ctx.arc(0, -b.size*2, b.size*0.6, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'bee') {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.ellipse(0, 0, b.size*0.7, b.size, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-b.size*0.7, -b.size*0.3, b.size*1.4, b.size*0.4);
    ctx.fillRect(-b.size*0.7, b.size*0.4, b.size*1.4, b.size*0.4);
  } else if (heroType === 'kraken') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size*2);
    glow.addColorStop(0, 'rgba(255,0,255,0.7)'); glow.addColorStop(1, 'rgba(61,0,96,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, b.size*2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3d0060'; ctx.beginPath(); ctx.arc(0, 0, b.size*0.8, 0, Math.PI*2); ctx.fill();
  } else if (heroType === 'titan') {
    ctx.fillStyle = '#57606f';
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; ctx.stroke();
  } else if (heroType === 'angel') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size*2);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(0.5, 'rgba(255,215,0,0.7)');
    glow.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, b.size*2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, b.size*0.6, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(0, 10 * S); ctx.lineTo(0, -10 * S);
    ctx.lineWidth = b.size; ctx.strokeStyle = b.color; ctx.stroke();
  }
  ctx.restore();
}

// =============================================================
// 35. EXTENDED ENEMY SHAPE DRAWING
// =============================================================
function drawEnemyShapeExtended(ctx, m, S, theme) {
  const type = m.type;
  const size = m.size;
  const t = m.timeAlive || 0;
  const rot = (m.rot = (m.rot || 0) + 0.02);
  const wobble = Math.sin((m.wobble = (m.wobble || 0) + 0.08)) * 0.15 + 1;

  if (type === 'triangle') {
    ctx.save(); ctx.rotate(rot * 0.5);
    const g = ctx.createLinearGradient(0, -size, 0, size);
    g.addColorStop(0, m.color); g.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -size * wobble);
    ctx.lineTo(size * 0.9, size * 0.7);
    ctx.lineTo(0, size * 0.35);
    ctx.lineTo(-size * 0.9, size * 0.7);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(0, -size * 0.1, size * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  } else if (type === 'hexagon') {
    ctx.save(); ctx.rotate(rot * 0.3);
    const sides = 6;
    const g = ctx.createRadialGradient(-size * 0.3, -size * 0.3, size * 0.1, 0, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, m.color); g.addColorStop(1, '#000000');
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const x = Math.cos(a) * size * wobble, y = Math.sin(a) * size * wobble;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.75; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-size * 0.25, -size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.arc(size * 0.25, -size * 0.1, size * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff4757';
    ctx.beginPath(); ctx.arc(-size * 0.25, -size * 0.1, size * 0.04, 0, Math.PI * 2);
    ctx.arc(size * 0.25, -size * 0.1, size * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (type === 'star') {
    ctx.save(); ctx.rotate(rot * 0.4);
    const points = 5;
    const outerR = size * wobble, innerR = size * 0.45;
    const g = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, m.color); g.addColorStop(1, '#000000');
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffd700'; ctx.globalAlpha = 0.9; ctx.stroke(); ctx.globalAlpha = 1;
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
    cg.addColorStop(0, 'rgba(255,255,255,0.9)'); cg.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (type === 'diamond') {
    ctx.save(); ctx.rotate(rot * 0.6);
    const g = ctx.createLinearGradient(0, -size, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, m.color); g.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.beginPath();
    ctx.moveTo(0, -size * wobble);
    ctx.lineTo(size * 0.75, 0);
    ctx.lineTo(0, size * wobble);
    ctx.lineTo(-size * 0.75, 0);
    ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.8; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * wobble); ctx.lineTo(0, size * wobble);
    ctx.moveTo(-size * 0.75, 0); ctx.lineTo(size * 0.75, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + Math.sin(t * 6) * 0.4) + ')';
    ctx.beginPath(); ctx.arc(0, -size * 0.2, size * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (type === 'worm') {
    ctx.save();
    const segCount = 4;
    for (let i = segCount - 1; i >= 0; i--) {
      const segX = Math.sin(t * 2 + i * 0.5) * size * 0.5;
      const segY = -i * size * 0.55;
      const segR = size * (0.9 - i * 0.15);
      const alpha = 1.0 - i * 0.15;
      ctx.globalAlpha = alpha;
      const g = ctx.createRadialGradient(segX - segR * 0.3, segY - segR * 0.3, segR * 0.1, segX, segY, segR);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, m.color); g.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(segX, segY, segR, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke();
      if (i === 0) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(segX - segR * 0.3, segY - segR * 0.15, segR * 0.2, 0, Math.PI * 2);
        ctx.arc(segX + segR * 0.3, segY - segR * 0.15, segR * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(segX - segR * 0.3, segY - segR * 0.15, segR * 0.08, 0, Math.PI * 2);
        ctx.arc(segX + segR * 0.3, segY - segR * 0.15, segR * 0.08, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    const rg = ctx.createRadialGradient(-size*0.3, -size*0.3, size*0.1, 0, 0, size);
    rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.3, m.color); rg.addColorStop(1, '#000000');
    ctx.beginPath(); ctx.arc(0, 0, size * wobble, 0, Math.PI*2);
    ctx.fillStyle = rg; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
  }
}

// =============================================================
// 36. UNIQUE BOSS SHAPES — 10 BOSS
// =============================================================
function drawBossUniqueShape(ctx, m, S, theme, bossNum) {
  const size = m.size;
  const t = m.timeAlive || 0;
  const coreOpen = m.coreOpen;
  const rot = m.aura || 0;

  if (bossNum === 5) {
    ctx.save(); ctx.rotate(Math.sin(t * 1.5) * 0.1);
    const g = ctx.createRadialGradient(0, -size * 0.2, size * 0.2, 0, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, m.color); g.addColorStop(1, '#3a0000');
    ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * 0.9, size * 0.75); ctx.lineTo(-size * 0.9, size * 0.75); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 4 * S; ctx.strokeStyle = '#ffd700'; ctx.stroke();
    for (let i = -1; i <= 1; i += 2) {
      const fx = i * size * 0.6;
      ctx.fillStyle = 'rgba(255,120,0,' + (0.6 + Math.sin(t * 5 + i) * 0.3) + ')';
      ctx.beginPath();
      ctx.moveTo(fx - 8 * S, -size * 0.5);
      ctx.lineTo(fx, -size * 0.5 - 30 * S - Math.sin(t * 6) * 5);
      ctx.lineTo(fx + 8 * S, -size * 0.5);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.1, size * 0.15, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.1, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.1, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.1, size * 0.07, 0, Math.PI * 2); ctx.fill();
    if (coreOpen) drawBossCore(ctx, size, '#ff4400', '#ffd700', t);
    ctx.restore(); return;
  }

  if (bossNum === 10) {
    ctx.save(); ctx.rotate(rot * 0.5);
    const g = ctx.createRadialGradient(0, 0, size * 0.15, 0, 0, size);
    g.addColorStop(0, '#c86bff'); g.addColorStop(0.4, '#3d0060'); g.addColorStop(1, '#000000');
    ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 5 * S; ctx.strokeStyle = '#ff77ff'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,119,255,0.7)'; ctx.lineWidth = 3 * S;
    for (let arm = 0; arm < 3; arm++) {
      ctx.beginPath();
      const aOff = (Math.PI * 2 / 3) * arm;
      for (let i = 0; i < 25; i++) {
        const a = (i / 25) * Math.PI * 1.8 + aOff;
        const r = size * (0.2 + i / 25 * 0.75);
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c86bff'; ctx.lineWidth = 3 * S;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2); ctx.stroke();
    if (coreOpen) drawBossCore(ctx, size * 0.5, '#c86bff', '#ffffff', t);
    ctx.restore(); return;
  }

  if (bossNum === 15) {
    ctx.save(); ctx.rotate(Math.sin(t * 0.5) * 0.08);
    const sides = 6;
    const g = ctx.createRadialGradient(0, -size * 0.3, size * 0.1, 0, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, m.color); g.addColorStop(1, '#001a3a');
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const r = i % 2 === 0 ? size : size * 0.7;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 5 * S; ctx.strokeStyle = '#4de8ff'; ctx.stroke();
    ctx.fillStyle = 'rgba(200,240,255,0.9)';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const baseX = Math.cos(a) * size * 0.9, baseY = Math.sin(a) * size * 0.9;
      const tipX = Math.cos(a) * (size + 15 * S), tipY = Math.sin(a) * (size + 15 * S);
      ctx.beginPath();
      ctx.moveTo(baseX - 6 * S, baseY - 6 * S);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(baseX + 6 * S, baseY + 6 * S);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.1, size * 0.14, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.1, size * 0.14, 0, Math.PI * 2); ctx.fill();
    if (coreOpen) drawBossCore(ctx, size * 0.5, '#4de8ff', '#ffffff', t);
    ctx.restore(); return;
  }

  if (bossNum === 20) {
    ctx.save(); ctx.rotate(rot * 0.3);
    ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2a'; ctx.fill();
    ctx.lineWidth = 6 * S; ctx.strokeStyle = '#1abc9c'; ctx.stroke();
    const g = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.8);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, m.color); g.addColorStop(1, '#003333');
    ctx.beginPath(); ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2 * S;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i + rot * 0.5;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * size * 0.8, Math.sin(a) * size * 0.8); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,200,0.7)'; ctx.lineWidth = 3 * S; ctx.stroke();
    ctx.fillStyle = '#00ffcc';
    ctx.beginPath();
    ctx.arc(-size * 0.25, -size * 0.05, size * 0.12, 0, Math.PI * 2);
    ctx.arc(size * 0.25, -size * 0.05, size * 0.12, 0, Math.PI * 2); ctx.fill();
    if (coreOpen) drawBossCore(ctx, size * 0.5, '#1abc9c', '#00ffcc', t);
    ctx.restore(); return;
  }

  if (bossNum === 25) {
    ctx.save(); ctx.rotate(rot * 0.2);
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      const a = (Math.PI * 2 / rayCount) * i + t * 0.5;
      const innerR = size * 1.05;
      const outerR = size * 1.35 + Math.sin(t * 3 + i) * size * 0.1;
      ctx.save(); ctx.rotate(a);
      const rg = ctx.createLinearGradient(innerR, 0, outerR, 0);
      rg.addColorStop(0, 'rgba(255,170,0,0.9)'); rg.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(innerR, -size * 0.08);
      ctx.lineTo(outerR, 0);
      ctx.lineTo(innerR, size * 0.08);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    const g = ctx.createRadialGradient(0, -size * 0.2, size * 0.15, 0, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#ffd700'); g.addColorStop(0.7, '#ff6600'); g.addColorStop(1, '#3a0a00');
    ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 4 * S; ctx.strokeStyle = '#ffd700'; ctx.stroke();
    ctx.globalAlpha = 0.4 + Math.sin(t * 8) * 0.2;
    ctx.beginPath(); ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3 * S; ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.05, size * 0.13, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.05, size * 0.13, 0, Math.PI * 2); ctx.fill();
    if (coreOpen) drawBossCore(ctx, size * 0.5, '#ffaa00', '#ffd700', t);
    ctx.restore(); return;
  }

  if (bossNum === 30) {
    ctx.save(); ctx.rotate(rot * 0.4);
    for (let layer = 2; layer >= 0; layer--) {
      const r = size * (0.5 + layer * 0.25);
      const alpha = 0.4 + (2 - layer) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI / 6) * i + layer * 0.3;
        const rr = i % 2 === 0 ? r : r * 0.6;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, '#ff0055'); g.addColorStop(0.5, '#ffd700'); g.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 3 * S; ctx.strokeStyle = '#ffd700'; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 3 * S; ctx.stroke();
    if (coreOpen) drawBossCore(ctx, size * 0.4, '#ff0055', '#ffffff', t);
    ctx.restore(); return;
  }

  if (bossNum === 35) {
    ctx.save();
    ctx.strokeStyle = 'rgba(139,0,255,0.7)'; ctx.lineWidth = 6 * S;
    for (let i = 0; i < 8; i++) {
      const baseA = (Math.PI * 2 / 8) * i + rot * 0.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(baseA) * size * 0.8, Math.sin(baseA) * size * 0.8);
      for (let s = 1; s <= 5; s++) {
        const a = baseA + Math.sin(t * 3 + i + s) * 0.3;
        const r = size * (0.8 + s * 0.15);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.stroke();
    }
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 / 8) * i - Math.PI / 2;
      const x = Math.cos(a) * size, y = Math.sin(a) * size;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size);
    g.addColorStop(0, '#e0b3ff'); g.addColorStop(0.4, '#5a0099'); g.addColorStop(1, '#000000');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 5 * S; ctx.strokeStyle = '#8b00ff'; ctx.stroke();
    ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.05, size * 0.13, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.05, size * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (coreOpen) drawBossCore(ctx, size * 0.5, '#8b00ff', '#ff00ff', t);
    ctx.restore(); return;
  }

  if (bossNum === 40) {
    ctx.save();
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.moveTo(-size * 0.6, -size);
    ctx.lineTo(-size * 0.5, -size * 1.3); ctx.lineTo(-size * 0.3, -size * 1.05);
    ctx.lineTo(-size * 0.1, -size * 1.35); ctx.lineTo(size * 0.1, -size * 1.05);
    ctx.lineTo(size * 0.3, -size * 1.35); ctx.lineTo(size * 0.5, -size * 1.05);
    ctx.lineTo(size * 0.6, -size);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2 * S; ctx.stroke();
    const g = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, m.color); g.addColorStop(1, '#1a0000');
    ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 5 * S; ctx.strokeStyle = '#ff2200'; ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.arc(size * 0.35, -size * 0.1, size * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = '#ff2200'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.arc(size * 0.35, -size * 0.1, size * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    for (let i = -3; i <= 3; i++) { const tx = i * size * 0.13; ctx.fillRect(tx - size * 0.05, size * 0.35, size * 0.1, size * 0.2); }
    if (coreOpen) drawBossCore(ctx, size * 0.4, '#ff2200', '#ffd700', t);
    ctx.restore(); return;
  }

  if (bossNum === 45) {
    ctx.save(); ctx.rotate(rot * 0.3);
    for (let ring = 0; ring < 2; ring++) {
      const r = size * (1.0 + ring * 0.2);
      const rAlpha = 0.9 - ring * 0.3;
      ctx.globalAlpha = rAlpha;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.lineWidth = (5 - ring) * S;
      ctx.strokeStyle = ring === 0 ? '#8b00ff' : '#ff00ff';
      ctx.setLineDash(ring === 0 ? [] : [10, 8]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      const aOff = arm * Math.PI;
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2 + aOff + t * 0.8;
        const r = size * (i / 30 * 0.9);
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = arm === 0 ? '#8b00ff' : '#ff00ff';
      ctx.lineWidth = 3 * S; ctx.stroke();
    }
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
    g.addColorStop(0, '#000000'); g.addColorStop(0.7, '#3d0066'); g.addColorStop(1, 'rgba(255,0,255,0.3)');
    ctx.beginPath(); ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    if (coreOpen) drawBossCore(ctx, size * 0.4, '#8b00ff', '#ff00ff', t);
    ctx.restore(); return;
  }

  if (bossNum === 50) {
    ctx.save(); ctx.rotate(Math.sin(t * 0.5) * 0.05);
    ctx.fillStyle = 'rgba(255,215,0,0.6)';
    for (let w = -1; w <= 1; w += 2) {
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.quadraticCurveTo(w * size * 1.6, -size * 1.2, w * size * 1.4, 0);
      ctx.quadraticCurveTo(w * size * 1.7, size * 0.6, w * size * 1.2, size * 0.8);
      ctx.quadraticCurveTo(w * size * 0.9, size * 0.3, 0, size * 0.5);
      ctx.closePath(); ctx.fill();
    }
    const g = ctx.createRadialGradient(0, 0, size * 0.15, 0, 0, size);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#ffd700'); g.addColorStop(0.75, '#ff8a00'); g.addColorStop(1, '#3a1500');
    ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 6 * S; ctx.strokeStyle = '#ffd700'; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * S;
    ctx.beginPath();
    const iw = size * 0.4, ih = size * 0.25;
    ctx.moveTo(-iw, 0);
    ctx.bezierCurveTo(-iw, -ih, 0, -ih, 0, 0);
    ctx.bezierCurveTo(0, ih, iw, ih, iw, 0);
    ctx.bezierCurveTo(iw, -ih, 0, -ih, 0, 0);
    ctx.bezierCurveTo(0, ih, -iw, ih, -iw, 0);
    ctx.stroke();
    ctx.globalAlpha = 0.3 + Math.sin(t * 4) * 0.2;
    ctx.beginPath(); ctx.arc(0, 0, size * 1.25, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3 * S; ctx.stroke();
    ctx.globalAlpha = 1;
    if (coreOpen) drawBossCore(ctx, size * 0.5, '#ffd700', '#ffffff', t);
    ctx.restore(); return;
  }

  const bg = ctx.createRadialGradient(0, 0, size*0.2, 0, 0, size);
  bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.4, m.color); bg.addColorStop(1, '#000000');
  ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI*2);
  ctx.fillStyle = bg; ctx.fill();
  ctx.lineWidth = 5 * S; ctx.strokeStyle = '#ffd700'; ctx.stroke();
}
function drawBossCore(ctx, size, color1, color2, t) {
  ctx.save();
  const pulse = 0.85 + Math.sin(t * 8) * 0.15;
  const cg = ctx.createRadialGradient(0, 0, 2, 0, 0, size * pulse);
  cg.addColorStop(0, color2); cg.addColorStop(0.4, color1); cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath(); ctx.arc(0, 0, size * pulse, 0, Math.PI * 2);
  ctx.fillStyle = cg; ctx.fill();
  ctx.restore();
}

// =============================================================
// 37. GAME LOOP — HOST / SINGLE
// =============================================================
function gameLoop() {
  if (!isGameRunning || isGamePaused) return;
  if (!ctx || !canvas) return;
  if (hitStopFrames > 0) { hitStopFrames--; requestAnimationFrame(gameLoop); return; }

  if (screenFlash > 0) {
    const fl = document.getElementById('screen-flash-overlay');
    if (fl) {
      fl.style.opacity = String(screenFlash);
      screenFlash *= 0.75;
      if (screenFlash < 0.05) { screenFlash = 0; fl.style.opacity = '0'; }
    }
  }

  if (mpActive && mpRole === 'guest') return gameLoopGuest();

  const W = VIRTUAL_WIDTH, H = VIRTUAL_HEIGHT, S = GAME_SCALE;
  const localPlayerActive = !mpSpectatorMode;
  playerPulse += 0.08;
  const theme = currentTheme;

  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    screenShake *= 0.88;
    if (screenShake < 0.5) screenShake = 0;
  }

  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, theme.bgTop); bgGrad.addColorStop(1, theme.bgBottom);
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  drawParallaxStars(ctx, W, H);

  const groundH = Math.max(30, VIRTUAL_HEIGHT * 0.06);
  ctx.fillStyle = theme.ground; ctx.fillRect(0, H - groundH, W, groundH);
  ctx.fillStyle = theme.groundLine;
  ctx.globalAlpha = 0.6 + Math.sin(playerPulse * 0.5) * 0.2;
  ctx.fillRect(0, H - groundH - 5, W, 5);
  ctx.globalAlpha = 1;

  if (localPlayerActive) {
    let moveInput = 0, useJoystick = false;
    if (Math.abs(joystickAxis) > 0.02) { moveInput = joystickAxis; useJoystick = true; }
    else if (isMovingLeft) moveInput = -1;
    else if (isMovingRight) moveInput = 1;
    if (useJoystick) {
      playerX += moveInput * playerSpeed * JOYSTICK_SPEED_MULT;
      playerX = Math.max(40 * S, Math.min(W - 40 * S, playerX));
      playerTargetX = playerX;
    } else {
      if (moveInput !== 0) { playerTargetX += moveInput * playerSpeed; playerTargetX = Math.max(40 * S, Math.min(W - 40 * S, playerTargetX)); }
      const dx = playerTargetX - playerX;
      const dynamicLerp = Math.min(0.55, PLAYER_LERP + Math.abs(dx) / (W * 0.4));
      if (Math.abs(dx) > 0.5) playerX += dx * dynamicLerp;
      else playerX = playerTargetX;
      playerX = Math.max(40 * S, Math.min(W - 40 * S, playerX));
    }
  }
  if (playerHitFlash > 0) playerHitFlash--;

  if (isSuperShot) { superShotTimer--; if (superShotTimer <= 0) isSuperShot = false; }
  if (isMegaShot) { megaShotTimer--; if (megaShotTimer <= 0) isMegaShot = false; }
  if (isShieldActive) { shieldTimer--; if (shieldTimer <= 0) isShieldActive = false; }
  if (isMagnetActive) { magnetTimer--; if (magnetTimer <= 0) isMagnetActive = false; }
  if (isReviveInvuln) { reviveInvulnTimer--; if (reviveInvulnTimer <= 0) isReviveInvuln = false; }
  if (isFrozen) { freezeFramesRemaining--; if (freezeFramesRemaining <= 0) { isFrozen = false; freezeFramesRemaining = 0; } }
  if (combo > 1) { comboTimer--; if (comboTimer <= 0) { combo = 1; updateHUDValues(); comboBoostActive = { coins: false, firerate: false, magnet: false }; comboBoostLastNotified = 0; } }

  const heroPlayerY = H - Math.max(40, H * 0.07);

  // === GUEST LOGIC (HOST side) ===
  if (mpActive && mpRole === 'host' && !mpRemoteGuestSpectator) {
    let guestMove = 0, guestUseJoystick = false;
    if (typeof mpGuestInput.moveX === 'number' && Math.abs(mpGuestInput.moveX) > 0.02) { guestMove = mpGuestInput.moveX; guestUseJoystick = true; }
    else if (mpGuestInput.left) guestMove = -1;
    else if (mpGuestInput.right) guestMove = 1;
    if (guestUseJoystick) {
      mpGuestX += guestMove * playerSpeed * JOYSTICK_SPEED_MULT;
      mpGuestX = Math.max(40 * S, Math.min(W - 40 * S, mpGuestX));
      mpGuestTargetX = mpGuestX;
    } else {
      if (guestMove !== 0) { mpGuestTargetX += guestMove * playerSpeed; mpGuestTargetX = Math.max(40 * S, Math.min(W - 40 * S, mpGuestTargetX)); }
      const gdx = mpGuestTargetX - mpGuestX;
      const dynamicLerp = Math.min(0.55, PLAYER_LERP + Math.abs(gdx) / (W * 0.4));
      if (Math.abs(gdx) > 0.5) mpGuestX += gdx * dynamicLerp;
      else mpGuestX = mpGuestTargetX;
    }
    if (mpGuestShootCd > 0) mpGuestShootCd--;
    if (mpGuestInput.shoot && mpGuestShootCd <= 0 && mpGuestAlive) {
      const gHero = HERO_DATA[mpRemoteHeroType] || HERO_DATA.robot;
      const gInterval = Math.max(60, (gHero.fireRate - (upgradeFireRate - 1) * 15));
      mpGuestShootCd = Math.round(gInterval / 16);
      spawnHeroBullets(mpRemoteHeroType, mpGuestX, heroPlayerY - 20 * S, 1, 'guest');
    }
    if (mpGuestInput.skill1) { isFrozen = true; freezeFramesRemaining = 210; sounds.playFreeze(); triggerScreenFlash(0.2); mpGuestInput.skill1 = false; }
    if (mpGuestInput.skill2) { isShieldActive = true; shieldTimer = 300; sounds.playShield(); triggerScreenFlash(0.15); mpGuestInput.skill2 = false; }
    if (mpGuestInput.skill3) {
      mpGuestInput.skill3 = false;
      screenShake = 22; sounds.playBomb(); triggerHitStop(5); triggerScreenFlash(0.7);
      let total = 0;
      for (let i = monsters.length - 1; i >= 0; i--) {
        const m = monsters[i];
        createBurstParticles3D(m.x, m.y, m.color, 25);
        total += (ENEMY_SCORE_TABLE[m.type] || 150) * combo;
        levelKills++; PLAYER_STATS.totalKills++;
        monsters.splice(i, 1);
      }
      score += total;
      if (total > 0) spawnFloatingText(W/2, H/2, `BOOM +${total}`, '#ff4757');
      updateHUDValues(); checkLevelObjectives();
      savePlayerStats(); checkAchievements();
    }
  }

  const hero = HERO_DATA[currentActor] || HERO_DATA.robot;
  const comboFRMult = comboBoostActive.firerate ? 0.8 : 1.0;
  const fireInterval = Math.max(60, (hero.fireRate - (upgradeFireRate - 1) * 15) * comboFRMult);
  const now = Date.now();
  if (localPlayerActive && fireButtonPressed && now - lastShotTime > fireInterval) {
    const shotY = heroPlayerY - 20 * S;
    if (isMegaShot) {
      bullets.push({ x: playerX, y: shotY, vx: 0, vy: 15 * S, color: '#ff2e88', heroType: currentActor, size: 16 * S, pierce: 3, owner: 'host' });
      bullets.push({ x: playerX, y: shotY, vx: 0, vy: 15 * S, color: '#ffd700', heroType: currentActor, size: 8 * S, pierce: 3, owner: 'host' });
    } else if (isSuperShot) {
      bullets.push({ x: playerX - 16 * S, y: shotY, vx: -2.5 * S, vy: 12 * S, color: '#00d2d3', heroType: currentActor, size: 7 * S, pierce: 1, owner: 'host' });
      bullets.push({ x: playerX, y: shotY, vx: 0, vy: 13 * S, color: '#ffd700', heroType: currentActor, size: 8 * S, pierce: 1, owner: 'host' });
      bullets.push({ x: playerX + 16 * S, y: shotY, vx: 2.5 * S, vy: 12 * S, color: '#00d2d3', heroType: currentActor, size: 7 * S, pierce: 1, owner: 'host' });
    } else {
      spawnHeroBullets(currentActor, playerX, shotY, 1, 'host');
    }
    muzzleFlashes.push({ x: playerX, y: shotY, radius: 16 * S, opacity: 1.0, color: hero.color });
    sounds.playHeroShoot(currentActor);
    lastShotTime = now;
  }

  for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
    const f = muzzleFlashes[i];
    ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = f.color ? f.color : `rgba(255,215,0,${f.opacity})`;
    ctx.globalAlpha = f.opacity; ctx.fill(); ctx.globalAlpha = 1;
    f.opacity -= 0.25;
    if (f.opacity <= 0) muzzleFlashes.splice(i, 1);
  }

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

  // === BULLET LOOP ===
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= b.vy; b.x += b.vx;
    drawBullet(ctx, b, S);
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
        if (upgradeCrit > 0 && Math.random() < (upgradeCrit * 0.05)) {
          damage *= 3;
          spawnFloatingText(m.x, m.y - 20 * S, 'CRIT!', '#ff2e88');
          sounds.playCombo();
        }
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
          PLAYER_STATS.totalKills++;
          if (isB) PLAYER_STATS.totalBossKills++;
          if (gameMode === 'endless') endlessKillsThisWave++;
          handleKillStreak();
          combo = Math.min(MAX_COMBO, combo + 1);
          comboTimer = 180 + (upgradeCombo - 1) * 40;
          updateComboBoosts();
          spawnFloatingText(m.x, m.y, `+${gained}`, '#ffd700');
          if (isB) { triggerScreenFlash(0.6); triggerHitStop(6); try { triggerVibrate([100, 40, 100]); } catch(e) {} }
          else if (m.size > 30 * GAME_SCALE) { triggerHitStop(2); }
          if (m.algorithm === 'splitter' && m.size > 22 * S) {
            const miniSize = 22 * S;
            monsters.push(
              { x: m.x-20*S, startX: m.x-20*S, y: m.y, speed: m.speed*1.25, size: miniSize, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false, rot: 0, wobble: 0 },
              { x: m.x+20*S, startX: m.x+20*S, y: m.y, speed: m.speed*1.25, size: miniSize, hp: 1, maxHp: 1, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false, rot: 0, wobble: 0 }
            );
          }
          monsters.splice(j, 1);
          updateHUDValues();
          savePlayerStats(); checkAchievements();
          if (isB) {
            dropBossLoot(m.x, m.y, parseInt(m.type.replace('boss','')) || 5);
            monsters.forEach(mn => createBurstParticles3D(mn.x, mn.y, mn.color, 20));
            monsters = [];
            stopSpawnLoop();
            if (!levelClearPending) {
              levelClearPending = true; showStageClearBanner();
              stageClearTimer = setTimeout(() => {
                stageClearTimer = null; levelClearPending = false; hideStageClearBanner();
                if (gameMode === 'endless') { endlessWave++; endlessKillsThisWave = 0; updateHUDValues(); startSpawnLoop(); }
                else if (gameMode === 'daily') handleDailyBossDefeated();
                else if (gameMode === 'coop') mpHostLevelComplete();
                else onLevelCleared();
              }, 3500);
            }
          } else checkLevelObjectives();
        } else spawnFloatingText(m.x, m.y, 'HIT', '#ff4757');
        break;
      }
    }
    if (consumed) continue;
  }

  // === COIN DROP ===
  const magnetPull = isMagnetActive || (currentActor === 'cat') || comboBoostActive.magnet;
  for (let i = coinsOnField.length - 1; i >= 0; i--) {
    const c = coinsOnField[i];
    c.trail = (c.trail || 0) + 1;
    if (magnetPull && localPlayerActive) {
      const baseMagRange = isMagnetActive ? 350 : 160;
      const range = (baseMagRange + (upgradeMagnet - 1) * 40) * S;
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
    if (localPlayerActive && dp < c.size + 25 * S) {
      let mult = (gameMode === 'endless' || gameMode === 'daily') ? 2 : 1;
      if (comboBoostActive.coins) mult *= 2;
      mult *= (1 + (upgradeCoin - 1) * 0.5);
      mult = Math.round(mult * 10) / 10;
      coins += mult; levelCoinsEarned += mult;
      PLAYER_STATS.totalCoinsEarned += mult;
      DB.set('pahlawan_coins', coins);
      sounds.playCoin();
      spawnFloatingText(c.x, c.y, `+${mult}`, '#ffd700');
      coinsOnField.splice(i, 1);
      updateHUDValues();
      continue;
    }
    if (c.y > H) coinsOnField.splice(i, 1);
  }

  // === POWERUPS ===
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
    ctx.fillStyle = '#fff'; ctx.fillText(lbl, 0, 0);
    ctx.restore();
    const dp = Math.hypot(playerX - p.x, heroPlayerY - p.y);
    if (localPlayerActive && dp < p.size + 25 * S) {
      sounds.playPowerup(); triggerScreenFlash(0.25);
      if (p.type === 'supershot') { isSuperShot = true; superShotTimer = 450; spawnFloatingText(playerX, heroPlayerY - 30 * S, 'SUPER SHOT', '#2ed573'); }
      else if (p.type === 'megashot') { isMegaShot = true; megaShotTimer = 540; spawnFloatingText(playerX, heroPlayerY - 30 * S, 'MEGA SHOT!', '#ff2e88'); }
      else if (p.type === 'shield') { isShieldActive = true; shieldTimer = 450 + (upgradeShield-1)*80; spawnFloatingText(playerX, heroPlayerY - 30 * S, 'SHIELD', '#00d2d3'); }
      else if (p.type === 'bomb') { if (playerLoadout.includes('bomb')) { bombCharges = Math.min(upgradeBomb, bombCharges+1); updateSkillButtonsUI(); } spawnFloatingText(playerX, heroPlayerY - 30 * S, '+1 BOMB', '#ff4757'); }
      else if (p.type === 'freeze') { if (playerLoadout.includes('freeze')) { freezeCharges = Math.min(upgradeFreeze, freezeCharges+1); updateSkillButtonsUI(); } spawnFloatingText(playerX, heroPlayerY - 30 * S, '+1 FREEZE', '#1e90ff'); }
      else if (p.type === 'heart') { lives = Math.min(5, lives+1); playerHitPoints = PLAYER_MAX_HIT_POINTS; updateLivesDisplay(); spawnFloatingText(playerX, heroPlayerY - 30 * S, '+1 LIFE', '#ff78ae'); }
      else if (p.type === 'magnet') { isMagnetActive = true; magnetTimer = 420; spawnFloatingText(playerX, heroPlayerY - 30 * S, 'MAGNET', '#ffa502'); }
      powerups.splice(i, 1);
      continue;
    }
    if (p.y > H) powerups.splice(i, 1);
  }

  // === BOSS BULLETS ===
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    const bb = bossBullets[i];
    bb.y += bb.vy; bb.x += bb.vx;
    ctx.beginPath(); ctx.arc(bb.x, bb.y - 6 * S, 5 * S, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,71,87,0.4)'; ctx.fill();
    ctx.beginPath(); ctx.arc(bb.x, bb.y, 8 * S, 0, Math.PI*2);
    ctx.fillStyle = '#ff4757'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffd700'; ctx.stroke();
    if (localPlayerActive) {
      const dh = Math.hypot(playerX - bb.x, heroPlayerY - bb.y);
      if (dh < 30 * S) {
        bossBullets.splice(i, 1);
        if (isShieldActive || isReviveInvuln) spawnFloatingText(playerX, heroPlayerY - 15 * S, 'BLOCKED', '#ffd700');
        else { handlePlayerHit(); if (!isGameRunning) { ctx.restore(); return; } }
        continue;
      }
    }
    if (mpActive && mpRole === 'host' && mpGuestAlive && !mpRemoteGuestSpectator) {
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

  // === DRAW HOST PLAYER ===
  if (localPlayerActive) {
    ctx.save();
    const aA = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
    const aG = ctx.createRadialGradient(playerX, heroPlayerY + 20 * S, 4 * S, playerX, heroPlayerY + 20 * S, 55 * S);
    aG.addColorStop(0, `rgba(0,210,255,${aA})`);
    aG.addColorStop(1, 'rgba(0,210,255,0)');
    ctx.fillStyle = aG;
    ctx.beginPath(); ctx.ellipse(playerX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    drawHeroVector(ctx, playerX, heroPlayerY, currentActor, false);
  }

  // === DRAW GUEST (HOST VIEW) ===
  if (mpActive && mpRole === 'host') {
    if (mpGuestAlive && !mpRemoteGuestSpectator) {
      ctx.save();
      const aA = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
      const gG = ctx.createRadialGradient(mpGuestX, heroPlayerY + 20 * S, 4 * S, mpGuestX, heroPlayerY + 20 * S, 55 * S);
      gG.addColorStop(0, `rgba(255,215,0,${aA})`);
      gG.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = gG;
      ctx.beginPath(); ctx.ellipse(mpGuestX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      drawHeroVector(ctx, mpGuestX, heroPlayerY, mpRemoteHeroType, true);
      ctx.save();
      ctx.font = `bold ${11 * S}px Orbitron, sans-serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
      ctx.fillText(mpRemoteName || 'Guest', mpGuestX, heroPlayerY - 50 * S);
      ctx.restore();
    }
  }

  // === MONSTER LOOP ===
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
            const dx2 = m.aimTargetX - m.x, dy2 = m.aimTargetY - m.y;
            const len = Math.hypot(dx2, dy2) || 1;
            bossBullets.push({ x: m.x, y: m.y + m.size, vx: (dx2/len)*7*S, vy: (dy2/len)*7*S });
            bossBullets.push({ x: m.x-20*S, y: m.y+m.size, vx: -1.5*S, vy: 6*S });
            bossBullets.push({ x: m.x+20*S, y: m.y+m.size, vx: 1.5*S, vy: 6*S });
            sounds.playBossShoot();
            m.shootTimer = 0;
          }
        } else if (m.shootTimer > 60) {
          m.aimTimer = 36;
          m.aimTargetX = localPlayerActive ? playerX : (W / 2);
          m.aimTargetY = heroPlayerY;
          spawnTelegraph(m.x, m.y+m.size, m.aimTargetX, heroPlayerY, 36, '#ff2e88');
        }
        if (m.minionTimer > 300) {
          m.minionTimer = 0;
          monsters.push(
            { x: m.x-60*S, startX: m.x-60*S, y: m.y+40*S, speed: 1.5*S, size: 28*S, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false, rot: 0, wobble: 0 },
            { x: m.x+60*S, startX: m.x+60*S, y: m.y+40*S, speed: 1.5*S, size: 28*S, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1, hitFlash: 0, canShoot: false, rot: 0, wobble: 0 }
          );
          spawnFloatingText(m.x, m.y+60*S, 'SUMMON!', '#ff4757');
        }
        if ((m.type === 'boss30' || m.type === 'boss50') && m.enrageTimer > 900) {
          m.enrageTimer = 0;
          const hv = Math.floor(m.maxHp * 0.10);
          m.hp = Math.min(m.maxHp, m.hp + hv);
          screenShake = 15; sounds.playBossWarning();
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
              const dx2 = m.aimTargetX - m.x, dy2 = m.aimTargetY - m.y;
              const len = Math.hypot(dx2, dy2) || 1;
              bossBullets.push({ x: m.x, y: m.y+m.size, vx: (dx2/len)*5*S, vy: (dy2/len)*5*S });
              sounds.playBossShoot();
              m.shootCooldown = 180 + Math.random() * 60;
            }
          } else {
            m.shootCooldown--;
            if (m.shootCooldown <= 0 && m.y > 40 * S && m.y < H - 100 * S) {
              m.aimTimer = 30;
              m.aimTargetX = localPlayerActive ? playerX : (W / 2);
              m.aimTargetY = heroPlayerY;
              spawnTelegraph(m.x, m.y+m.size, m.aimTargetX, heroPlayerY, 30, '#00d2d3');
            }
          }
        }
      }
    }

    ctx.save();
    ctx.globalAlpha = m.opacity || 1.0;
    ctx.beginPath();
    ctx.ellipse(m.x, H - groundH * 0.95, m.size * 0.7, m.size * 0.25, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    ctx.translate(m.x, m.y);

    if (m.type.startsWith('boss')) {
      ctx.save(); ctx.rotate(m.aura || 0);
      ctx.beginPath(); ctx.arc(0, 0, m.size + 15 * S, 0, Math.PI*2);
      ctx.setLineDash([10, 14]); ctx.lineWidth = 4 * S;
      ctx.strokeStyle = currentTheme.accent; ctx.globalAlpha = 0.55;
      ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      ctx.globalAlpha = m.opacity || 1.0;
      const bossNum = parseInt(m.type.replace('boss','')) || 5;
      drawBossUniqueShape(ctx, m, S, currentTheme, bossNum);
    } else if (m.type === 'donut') {
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2); ctx.fillStyle = '#fa8231'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.8, 0, Math.PI*2); ctx.fillStyle = '#ff78ae'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.35, 0, Math.PI*2); ctx.fillStyle = theme.bgTop; ctx.fill();
    } else if (m.type === 'cloud') {
      ctx.fillStyle = '#f1f2f6';
      ctx.beginPath();
      ctx.arc(-12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(0, -10 * S, m.size*0.7, 0, Math.PI*2); ctx.fill();
    } else if (m.type === 'crystal') {
      ctx.beginPath();
      ctx.moveTo(0, -m.size); ctx.lineTo(m.size, 0); ctx.lineTo(0, m.size); ctx.lineTo(-m.size, 0);
      ctx.closePath();
      ctx.fillStyle = '#00d2d3'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.stroke();
    } else if (['triangle','hexagon','star','diamond','worm'].includes(m.type)) {
      drawEnemyShapeExtended(ctx, m, S, theme);
    } else {
      const rg = ctx.createRadialGradient(-m.size*0.3, -m.size*0.3, m.size*0.1, 0, 0, m.size);
      rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.3, m.color); rg.addColorStop(1, '#000000');
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

    if (m.type.startsWith('boss')) {
      ctx.save();
      const bw = Math.min(400 * S, W * 0.6);
      const bx = (W - bw) / 2, by = 15 * S, bh = 18 * S;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#ff4757'; ctx.fillRect(bx, by, (Math.max(0, m.hp)/m.maxHp)*bw, bh);
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${12 * S}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      const cs = (!m.noWeakPoint && m.coreOpen) ? ' [CRITICAL]' : '';
      ctx.fillText(`BOSS HP: ${Math.ceil(Math.max(0, m.hp))} / ${m.maxHp}${cs}`, W/2, by + bh - 5 * S);
      ctx.restore();
    }

    if (m.y > H - groundH * 0.5 && !m.type.startsWith('boss')) {
      monsters.splice(i, 1);
      if (localPlayerActive) {
        if (isShieldActive || isReviveInvuln) spawnFloatingText(playerX, heroPlayerY - 15 * S, 'BLOCKED', '#ffd700');
        else { handlePlayerHit(); if (!isGameRunning) { ctx.restore(); return; } }
      }
    }
  }

  // === PARTICLES ===
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
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
      ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        const a = (Math.PI*2/5)*s - Math.PI/2;
        const r = p.size*1.6;
        const x1 = Math.cos(a)*r, y1 = Math.sin(a)*r;
        s === 0 ? ctx.moveTo(x1, y1) : ctx.lineTo(x1, y1);
        const a2 = a + Math.PI/5, r2 = p.size*0.7;
        ctx.lineTo(Math.cos(a2)*r2, Math.sin(a2)*r2);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

function drawParallaxStars(ctx, W, H) {
  if (!starLayers.length) return;
  starLayers.forEach(layer => {
    layer.stars.forEach(s => {
      s.y += s.speed;
      s.twinkle += s.twinkleSpeed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      const a = s.opacity * (0.75 + Math.sin(s.twinkle) * 0.25);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
    });
  });
  ctx.globalAlpha = 1;
}

// =============================================================
// 38. GUEST RENDER-ONLY LOOP
// =============================================================
function gameLoopGuest() {
  const W = VIRTUAL_WIDTH, H = VIRTUAL_HEIGHT, S = GAME_SCALE;
  if (hitStopFrames > 0) { hitStopFrames--; requestAnimationFrame(gameLoop); return; }
  if (screenFlash > 0) {
    const fl = document.getElementById('screen-flash-overlay');
    if (fl) { fl.style.opacity = String(screenFlash); screenFlash *= 0.75; if (screenFlash < 0.05) { screenFlash = 0; fl.style.opacity = '0'; } }
  }
  playerPulse += 0.08;
  const theme = currentTheme;
  const localPlayerActive = !mpSpectatorMode;
  ctx.save();

  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, theme.bgTop); bgGrad.addColorStop(1, theme.bgBottom);
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  drawParallaxStars(ctx, W, H);

  const groundH = Math.max(30, VIRTUAL_HEIGHT * 0.06);
  ctx.fillStyle = theme.ground; ctx.fillRect(0, H - groundH, W, groundH);
  ctx.fillStyle = theme.groundLine;
  ctx.globalAlpha = 0.6 + Math.sin(playerPulse * 0.5) * 0.2;
  ctx.fillRect(0, H - groundH - 5, W, 5);
  ctx.globalAlpha = 1;

  const heroPlayerY = H - Math.max(40, H * 0.07);

  if (MP && MP.isConnected) {
    MP.sendInput({
      left: localPlayerActive ? isMovingLeft : false,
      right: localPlayerActive ? isMovingRight : false,
      moveX: localPlayerActive ? joystickAxis : 0,
      shoot: localPlayerActive && fireButtonPressed,
      skill1: mpGuestInput.skill1 || false,
      skill2: mpGuestInput.skill2 || false,
      skill3: mpGuestInput.skill3 || false,
      heroType: currentActor,
      respawn: mpGuestInput.respawn || false,
      pause: mpGuestInput.pause || false,
      resume: mpGuestInput.resume || false
    });
    mpGuestInput.skill1 = false;
    mpGuestInput.skill2 = false;
    mpGuestInput.skill3 = false;
    mpGuestInput.respawn = false;
    mpGuestInput.pause = false;
    mpGuestInput.resume = false;
  }

  if (localPlayerActive && Math.abs(joystickAxis) > 0.02) {
    playerX += joystickAxis * playerSpeed * JOYSTICK_SPEED_MULT;
    playerX = Math.max(40 * S, Math.min(W - 40 * S, playerX));
    mpGuestX = mpGuestX * 0.6 + playerX * 0.4;
  } else if (localPlayerActive && (isMovingLeft || isMovingRight)) {
    const kbMove = isMovingLeft ? -1 : 1;
    playerX += kbMove * playerSpeed;
    playerX = Math.max(40 * S, Math.min(W - 40 * S, playerX));
    mpGuestX = mpGuestX * 0.6 + playerX * 0.4;
  } else {
    const gdx = mpGuestX - playerX;
    if (Math.abs(gdx) > 0.5) playerX += gdx * 0.4;
    else playerX = mpGuestX;
  }

  if (mpRemoteAlive !== false && !mpRemoteHostSpectator) {
    const hostX = mpRemoteX;
    ctx.save();
    const aA = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
    const gG = ctx.createRadialGradient(hostX, heroPlayerY + 20 * S, 4 * S, hostX, heroPlayerY + 20 * S, 55 * S);
    gG.addColorStop(0, `rgba(255,215,0,${aA})`);
    gG.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = gG;
    ctx.beginPath(); ctx.ellipse(hostX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    drawHeroVector(ctx, hostX, heroPlayerY, mpRemoteHeroType, true);
    ctx.save();
    ctx.font = `bold ${11 * S}px Orbitron, sans-serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = '#00d2ff';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
    ctx.fillText(mpRemoteName || 'Host', hostX, heroPlayerY - 50 * S);
    ctx.restore();
  }

  drawRemoteMonsters(ctx, W, H, S, heroPlayerY);
  drawRemoteBullets(ctx, S);

  if (localPlayerActive) {
    ctx.save();
    const aA2 = 0.35 + Math.sin(playerPulse * 1.4) * 0.15;
    const aG2 = ctx.createRadialGradient(playerX, heroPlayerY + 20 * S, 4 * S, playerX, heroPlayerY + 20 * S, 55 * S);
    aG2.addColorStop(0, `rgba(0,210,255,${aA2})`);
    aG2.addColorStop(1, 'rgba(0,210,255,0)');
    ctx.fillStyle = aG2;
    ctx.beginPath(); ctx.ellipse(playerX, heroPlayerY + 20 * S, 55 * S, 14 * S, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    drawHeroVector(ctx, playerX, heroPlayerY, currentActor, false);
    ctx.save();
    ctx.font = `bold ${11 * S}px Orbitron, sans-serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
    ctx.fillText(playerName + ' (Kamu)', playerX, heroPlayerY - 50 * S);
    ctx.restore();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.04;
    p.vx *= 0.97; p.vy *= 0.97;
    if (p.rot !== undefined) p.rot += p.spin || 0;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

function drawRemoteMonsters(ctx, W, H, S, heroPlayerY) {
  for (let i = 0; i < mpRemoteMonsters.length; i++) {
    const m = mpRemoteMonsters[i]; if (!m) continue;
    ctx.save();
    ctx.globalAlpha = m.opacity || 1.0;
    const gH = Math.max(30, H * 0.06);
    ctx.beginPath();
    ctx.ellipse(m.x, H - gH * 0.95, m.size * 0.7, m.size * 0.25, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    ctx.translate(m.x, m.y);
    if (m.type && m.type.startsWith('boss')) {
      ctx.save();
      ctx.beginPath(); ctx.arc(0, 0, m.size + 15 * S, 0, Math.PI*2);
      ctx.setLineDash([10, 14]); ctx.lineWidth = 4 * S;
      ctx.strokeStyle = currentTheme.accent; ctx.globalAlpha = 0.55;
      ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      ctx.globalAlpha = m.opacity || 1.0;
      const bossNum = parseInt(m.type.replace('boss','')) || 5;
      drawBossUniqueShape(ctx, m, S, currentTheme, bossNum);
    } else if (m.type === 'donut') {
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2); ctx.fillStyle = '#fa8231'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.8, 0, Math.PI*2); ctx.fillStyle = '#ff78ae'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, m.size*0.35, 0, Math.PI*2); ctx.fillStyle = currentTheme.bgTop; ctx.fill();
    } else if (m.type === 'cloud') {
      ctx.fillStyle = '#f1f2f6';
      ctx.beginPath();
      ctx.arc(-12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(12 * S, 0, m.size*0.6, 0, Math.PI*2);
      ctx.arc(0, -10 * S, m.size*0.7, 0, Math.PI*2); ctx.fill();
    } else if (m.type === 'crystal') {
      ctx.beginPath();
      ctx.moveTo(0, -m.size); ctx.lineTo(m.size, 0); ctx.lineTo(0, m.size); ctx.lineTo(-m.size, 0);
      ctx.closePath(); ctx.fillStyle = '#00d2d3'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.stroke();
    } else if (m.type && ['triangle','hexagon','star','diamond','worm'].includes(m.type)) {
      drawEnemyShapeExtended(ctx, m, S, currentTheme);
    } else {
      const rg = ctx.createRadialGradient(-m.size*0.3, -m.size*0.3, m.size*0.1, 0, 0, m.size);
      rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.3, m.color); rg.addColorStop(1, '#000000');
      ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI*2);
      ctx.fillStyle = rg; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
    }
    if (m.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = (m.hitFlash / 8) * 0.85;
      ctx.beginPath(); ctx.arc(0, 0, m.size*1.05, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
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
  const boss = mpRemoteMonsters.find(x => x.type && x.type.startsWith('boss'));
  if (boss) {
    ctx.save();
    const bw = Math.min(400 * S, W * 0.6);
    const bx = (W - bw) / 2, by = 15 * S, bh = 18 * S;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ff4757'; ctx.fillRect(bx, by, (Math.max(0, boss.hp)/boss.maxHp)*bw, bh);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${12 * S}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    const cs = boss.coreOpen ? ' [CRITICAL]' : '';
    ctx.fillText(`BOSS HP: ${Math.ceil(Math.max(0, boss.hp))} / ${boss.maxHp}${cs}`, W/2, by + bh - 5 * S);
    ctx.restore();
  }
}
function drawRemoteBullets(ctx, S) {
  for (let i = 0; i < mpRemoteBullets.length; i++) { const b = mpRemoteBullets[i]; if (!b) continue; drawBullet(ctx, b, S); }
}

// ============ END OF PART 3/4 ============
console.log('📦 [game.js] PART 3/4 loaded');

// =============================================================
// PAHLAWAN BINTANG — game.js v21.0.0 — PART 4/4 (FINAL)
// Player Hit/Revive, Level Complete, Endless, Daily, Leaderboard,
// Loadout, Narrative, Certificate, Multiplayer, Init
// =============================================================

// =============================================================
// 39. PLAYER HIT / REVIVE
// =============================================================
function handlePlayerHit() {
  if (isReviveInvuln) return;
  if (isReviveModalOpen) return;
  if (mpSpectatorMode) return;

  levelDamageTaken++;
  const oneLife = (gameMode === 'daily' && currentDailyModifier && currentDailyModifier.id === 'one_life');
  playerHitPoints--; playerHitFlash = 12;
  combo = 1; updateHUDValues();
  comboBoostActive = { coins: false, firerate: false, magnet: false };
  comboBoostLastNotified = 0;
  sounds.playHit(); screenShake = 12;
  triggerVibrate([60, 30, 60]);
  triggerScreenFlash(0.4);

  const heroPlayerY = VIRTUAL_HEIGHT - Math.max(40, VIRTUAL_HEIGHT * 0.07);

  if (playerHitPoints > 0) {
    spawnFloatingText(playerX, heroPlayerY - 15 * GAME_SCALE, `HP ${playerHitPoints}/${PLAYER_MAX_HIT_POINTS}`, '#ffa502');
  } else {
    if (oneLife) lives = 0;
    else lives--;
    playerHitPoints = PLAYER_MAX_HIT_POINTS;
    spawnFloatingText(playerX, heroPlayerY - 15 * GAME_SCALE, '-1 ❤', '#ff4757');
    screenShake = 18;
  }
  updateLivesDisplay();

  if (lives <= 0) {
    if (mpActive && gameMode === 'coop') startSelfSpectatorMode('lives-zero');
    else offerReviveOrFail();
  }
}
async function offerReviveOrFail() {
  if (isReviveModalOpen) return;
  isReviveModalOpen = true;
  isGameRunning = false; isGamePaused = false;
  sounds.stopBGM();
  const tk = getTodayKey();
  try { reviveQuota = await getReviveQuota(tk); } catch(e) {}
  reviveQuota += upgradeRevive;
  if (reviveUsedThisRun || reviveQuota <= 0) { isReviveModalOpen = false; finalizeFail(); return; }
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
  startSpawnLoop(); sounds.startBGM();
  const heroPlayerY = VIRTUAL_HEIGHT - Math.max(40, VIRTUAL_HEIGHT * 0.07);
  spawnFloatingText(playerX, heroPlayerY - 25 * GAME_SCALE, 'REVIVED!', '#39ff14');
  requestAnimationFrame(gameLoop);
}

// =============================================================
// 40. LEVEL COMPLETE / FAILED
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
  const levelTime = (Date.now() - levelStartTime) / 1000;
  if (levelTime < PLAYER_STATS.fastestLevelTime) PLAYER_STATS.fastestLevelTime = levelTime;
  if (levelDamageTaken === 0) PLAYER_STATS.perfectLevels++;
  await setSavedLevel(lc.level + 1);
  await savePlayerStats();
  saveScoreToGlobalLeaderboard(playerName, score, lc.level);
  const stars = (lives === 3 && combo >= 3) ? 3 : (lives === 3 ? 2 : 1);
  try { await setStar(lc.level, stars); } catch(e) {}
  const isFinalLevel = (lc.level === 50);
  if (isFinalLevel) { await markGameCompleted(score); updateLevelSelectButton(); }
  await checkAchievements();

  const showResult = () => {
    const $ = id => document.getElementById(id);
    const rt = $('result-title');
    if (rt) rt.innerText = isFinalLevel ? '🏆 SELAMAT! GAME TAMAT!' : "MISI SELESAI";
    const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
    const rs = $('result-score'); if (rs) rs.innerText = score;
    const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
    const rl = $('result-level'); if (rl) rl.innerText = lc.level;
    const rk = $('result-kills'); if (rk) rk.innerText = `${levelKills} Target`;
    const sc = $('result-stars');
    if (sc) { let h = ''; for (let s = 0; s < 3; s++) h += `<svg class="star-mini ${s < stars ? 'on' : ''}" viewBox="0 0 24 24"><use href="#i-star"/></svg>`; sc.innerHTML = h; }
    const icon = $('result-icon');
    if (icon) { icon.innerHTML = '<use href="#i-trophy"/>'; icon.classList.remove('fail'); }
    const nb = $('btn-next-level');
    if (nb) { if (isFinalLevel) nb.classList.add('hidden'); else nb.classList.remove('hidden'); }
    const rb = $('btn-retry-level'); if (rb) rb.classList.remove('hidden');
    const certBtn = $('btn-view-certificate');
    if (certBtn) { if (isFinalLevel) certBtn.classList.remove('hidden'); else certBtn.classList.add('hidden'); }
    const m = $('modal-result'); if (m) m.classList.remove('hidden');
  };
  const story = STORY[lc.level];
  const sk = 'story_after_seen_' + lc.level;
  let already = null;
  try { already = await DB.get(sk); } catch(e) {}
  if (story && story.after && !already) { DB.set(sk, '1'); showNarrative(story.after.lines, story.after.speaker, story.after.portrait, showResult); }
  else showResult();
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
  const sc = $('result-stars'); if (sc) sc.innerHTML = '<span style="color:#566a8c;font-size:12px;">—</span>';
  const icon = $('result-icon');
  if (icon) { icon.innerHTML = '<use href="#i-skull"/>'; icon.classList.add('fail'); }
  const nb = $('btn-next-level'); if (nb) nb.classList.add('hidden');
  const rb = $('btn-retry-level'); if (rb) rb.classList.remove('hidden');
  const certBtn = $('btn-view-certificate'); if (certBtn) certBtn.classList.add('hidden');
  const m = $('modal-result'); if (m) m.classList.remove('hidden');
}
function finalizeFail() {
  if (gameMode === 'endless') { finalizeEndless(); return; }
  if (gameMode === 'daily') { finalizeDaily(false); return; }
  if (gameMode === 'coop') { mpEndGame(false, "NYAWA HABIS"); return; }
  levelFailed("GAME OVER - NYAWA HABIS");
}

// =============================================================
// 41. ENDLESS MODE
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
  currentLevelIndex = 0; score = 0; lives = 3 + upgradeLife;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  endlessWave = 1; endlessKillsThisWave = 0;
  currentTheme = LEVEL_THEMES[0]; applyThemeToDocument(currentTheme); recolorStars();
  resetLevelState(); updateHUDValues(); updateLivesDisplay();
  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  resizeCanvas(); updateGameScale();
  setTimeout(() => {
    resizeCanvas(); updateGameScale();
    const d = { level: 999, targetKills: ENDLESS_KILLS_PER_WAVE, targetScore: 0, algorithm: 'linear', types: ['jelly'] };
    showLoadoutModal(d, () => {
      playerSpeed = 11 * GAME_SCALE;
      freezeCharges = playerLoadout.includes('freeze') ? upgradeFreeze : 0;
      shieldCharges = playerLoadout.includes('shield') ? upgradeShield : 0;
      bombCharges = playerLoadout.includes('bomb') ? upgradeBomb : 0;
      updateSkillButtonsUI();
      isGameRunning = true; isGamePaused = false;
      levelStartTime = Date.now();
      initBossPhase(1, 'endless');
      document.getElementById('level-intro-number').innerText = '∞';
      document.getElementById('level-intro-name').innerText = 'ENDLESS MODE';
      document.getElementById('level-intro-mission').innerText = 'SURVIVE AS LONG AS YOU CAN';
      const b = document.getElementById('level-intro');
      b.classList.remove('hidden'); b.classList.remove('fade-out');
      b.classList.remove('stage-clear'); b.classList.remove('boss-approach');
      void b.offsetWidth;
      sounds.playLevelIntro();
      setTimeout(() => { b.classList.add('fade-out'); setTimeout(() => b.classList.add('hidden'), 500); }, 1200);
      if (IS_DESKTOP && typeof window._showDesktopHints === 'function') window._showDesktopHints();
      sounds.startBGM(); startSpawnLoop(); gameLoop();
    });
  }, 60);
}
async function finalizeEndless() {
  isGameRunning = false; isGamePaused = false;
  stopSpawnLoop(); sounds.stopBGM(); sounds.playWin();
  await setEndlessBest(endlessWave, score);
  saveEndlessToGlobalLeaderboard(playerName, score, endlessWave);
  await checkAchievements();
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
  const rb = $('btn-retry-level'); if (rb) rb.classList.remove('hidden');
  const certBtn = $('btn-view-certificate'); if (certBtn) certBtn.classList.add('hidden');
  document.getElementById('modal-result').classList.remove('hidden');
}

// =============================================================
// 42. DAILY MODE
// =============================================================
async function openDailyModal() {
  currentDailyModifier = getDailyModifier();
  dailyBossSequence = getDailyBossSequence();
  const $ = id => document.getElementById(id);
  const d = new Date();
  const de = $('daily-date');
  if (de) de.innerText = d.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  for (let i = 0; i < 3; i++) { const n = $('daily-boss-' + i + '-name'); if (n) n.innerText = getBossName(dailyBossSequence[i]); }
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
    for (let i = 0; i < 3; i++) { const c = $('daily-boss-' + i + '-check'); if (c) c.classList.remove('hidden'); const s = document.querySelector('.daily-boss-slot[data-slot="' + i + '"]'); if (s) s.classList.add('completed'); }
    if (badge) badge.classList.remove('hidden');
    if (sb) sb.disabled = true;
    if (pr) pr.classList.add('hidden');
  } else {
    for (let i = 0; i < 3; i++) { const c = $('daily-boss-' + i + '-check'); if (c) c.classList.add('hidden'); const s = document.querySelector('.daily-boss-slot[data-slot="' + i + '"]'); if (s) s.classList.remove('completed'); }
    if (badge) badge.classList.add('hidden');
    if (sb) sb.disabled = false;
    if (pr) pr.classList.add('hidden');
  }
  const timer = $('daily-reset-timer'); if (timer) timer.innerText = formatTime(secondsUntilMidnight());
  document.getElementById('modal-daily').classList.remove('hidden');
  if (window._dailyTimer) clearInterval(window._dailyTimer);
  window._dailyTimer = setInterval(() => { const el = $('daily-reset-timer'); if (el) el.innerText = formatTime(secondsUntilMidnight()); }, 1000);
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
  lives = (currentDailyModifier.id === 'one_life') ? 1 : 3 + upgradeLife;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  const fb = dailyBossSequence[0];
  currentTheme = getBossTheme(fb); applyThemeToDocument(currentTheme); recolorStars();
  resetLevelState(); updateHUDValues(); updateLivesDisplay();
  document.getElementById('screen-main-menu').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
  resizeCanvas(); updateGameScale();
  setTimeout(() => {
    resizeCanvas(); updateGameScale();
    const d = { level: 999, targetKills: 1, targetScore: 0, algorithm: 'boss_daily', types: ['boss'] };
    showLoadoutModal(d, () => {
      playerSpeed = 11 * GAME_SCALE;
      freezeCharges = playerLoadout.includes('freeze') ? upgradeFreeze : 0;
      shieldCharges = (currentDailyModifier.id !== 'no_shield' && playerLoadout.includes('shield')) ? upgradeShield : 0;
      bombCharges = playerLoadout.includes('bomb') ? upgradeBomb : 0;
      updateSkillButtonsUI();
      isGameRunning = true; isGamePaused = false;
      levelStartTime = Date.now();
      initBossPhase(fb, 'daily');
      const b = document.getElementById('level-intro');
      document.getElementById('level-intro-number').innerText = 'BOS 1';
      document.getElementById('level-intro-name').innerText = getBossName(fb);
      document.getElementById('level-intro-mission').innerText = 'DAILY 3 BOS · 1/3';
      b.classList.remove('hidden'); b.classList.remove('fade-out');
      b.classList.remove('stage-clear'); b.classList.remove('boss-approach');
      void b.offsetWidth;
      sounds.playLevelIntro();
      setTimeout(() => { b.classList.add('fade-out'); setTimeout(() => b.classList.add('hidden'), 500); }, 1200);
      if (IS_DESKTOP && typeof window._showDesktopHints === 'function') window._showDesktopHints();
      sounds.startBGM(); startSpawnLoop(); gameLoop();
    });
  }, 60);
}
function handleDailyBossDefeated() {
  const dIdx = dailyBossIndex;
  dailyBossIndex++;
  const c = document.getElementById('daily-boss-' + dIdx + '-check'); if (c) c.classList.remove('hidden');
  const s = document.querySelector('.daily-boss-slot[data-slot="' + dIdx + '"]'); if (s) s.classList.add('completed');
  if (dailyBossIndex >= 3) { finalizeDaily(true); return; }
  bossPhase = 'minions'; bossMinionsKilled = 0;
  bossMinionsTarget = 8 + dailyBossIndex * 3;
  const b = document.getElementById('level-intro');
  if (b) {
    const nb = dailyBossSequence[dailyBossIndex];
    document.getElementById('level-intro-number').innerText = 'BOS ' + (dailyBossIndex + 1);
    document.getElementById('level-intro-name').innerText = getBossName(nb);
    document.getElementById('level-intro-mission').innerText = (dailyBossIndex === 2) ? 'FINAL BOSS!' : 'BOSS DEFEATED! NEXT...';
    b.classList.remove('hidden'); b.classList.remove('fade-out');
    b.classList.remove('stage-clear'); b.classList.remove('boss-approach');
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
    PLAYER_STATS.totalCoinsEarned += bonus;
    const lastDaily = PLAYER_STATS.lastDailyDate;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yKey = `${y.getFullYear()}${String(y.getMonth()+1).padStart(2,'0')}${String(y.getDate()).padStart(2,'0')}`;
    if (lastDaily === yKey) PLAYER_STATS.dailyStreak = (PLAYER_STATS.dailyStreak || 0) + 1;
    else if (lastDaily !== tk) PLAYER_STATS.dailyStreak = 1;
    PLAYER_STATS.lastDailyDate = tk;
    DB.set('pahlawan_coins', coins);
    saveDailyToGlobalLeaderboard(playerName, score, tk);
    await savePlayerStats(); await checkAchievements();
  }
  const $ = id => document.getElementById(id);
  const rt = $('result-title'); if (rt) rt.innerText = success ? "DAILY MASTER!" : "DAILY GAGAL";
  const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName;
  const rs = $('result-score'); if (rs) rs.innerText = score;
  const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
  const rl = $('result-level'); if (rl) rl.innerText = success ? '3/3 BOS' : `${dailyBossIndex}/3 BOS`;
  const rk = $('result-kills'); if (rk) rk.innerText = `${dailyBossIndex} Bos Dikalahkan`;
  const sc = $('result-stars');
  if (sc) { if (success) { let h = ''; for (let s = 0; s < 3; s++) h += `<svg class="star-mini on" viewBox="0 0 24 24"><use href="#i-star"/></svg>`; sc.innerHTML = h; } else sc.innerHTML = '<span style="color:#566a8c;font-size:12px;">—</span>'; }
  const icon = $('result-icon');
  if (icon) { icon.innerHTML = success ? '<use href="#i-trophy"/>' : '<use href="#i-skull"/>'; icon.classList.toggle('fail', !success); }
  const nb = $('btn-next-level'); if (nb) nb.classList.add('hidden');
  const rb = $('btn-retry-level'); if (rb) rb.classList.remove('hidden');
  const certBtn = $('btn-view-certificate'); if (certBtn) certBtn.classList.add('hidden');
  document.getElementById('modal-result').classList.remove('hidden');
}

// =============================================================
// 43. LEADERBOARD
// =============================================================
function escapeHtml(t) { return String(t || 'Pahlawan').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]); }
function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
  const cleanName = (name || 'Pahlawan').trim(); if (!cleanName) return;
  const playerKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const numScore = Number(scoreVal) || 0;
  const numLevel = Number(levelVal) || 1;
  const sortValue = (numLevel * 100000000) + numScore;
  let ls = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  let idx = ls.findIndex(s => (s.name || '').trim().toLowerCase() === cleanName.toLowerCase());
  let upd = false;
  if (idx === -1) { upd = true; ls.push({ name: cleanName, score: numScore, level: numLevel, sortValue }); }
  else {
    const o = ls[idx];
    const ol = Number(o.level) || 1, os = Number(o.score) || 0;
    if (numLevel > ol || (numLevel === ol && numScore > os)) { upd = true; ls[idx] = { name: cleanName, score: numScore, level: numLevel, sortValue }; }
  }
  if (upd) {
    ls.sort((a, b) => { const la = Number(a.level)||1, lb = Number(b.level)||1; if (lb !== la) return lb - la; return (Number(b.score)||0) - (Number(a.score)||0); });
    DB.set('pahlawan_scores', JSON.stringify(ls.slice(0, 20)));
  }
  if (db && playerKey) {
    const ref = db.ref('leaderboard/' + playerKey);
    ref.once('value').then(snap => {
      const ex = snap.val();
      let su = false;
      if (!ex) su = true;
      else { const ol = Number(ex.level)||0, os = Number(ex.score)||0; if (numLevel > ol || (numLevel === ol && numScore > os)) su = true; }
      if (su) ref.set({ name: cleanName, score: numScore, level: numLevel, sortValue, timestamp: Date.now() }).catch(() => {});
    }).catch(() => {});
  }
}
function saveEndlessToGlobalLeaderboard(name, scoreVal, waveVal) {
  const cleanName = (name || 'Pahlawan').trim(); if (!cleanName) return;
  const pk = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ns = Number(scoreVal)||0, nw = Number(waveVal)||1;
  const sv = (nw * 100000000) + ns;
  if (db && pk) {
    const r = db.ref('endless/' + pk);
    r.once('value').then(s => {
      const ex = s.val(); let su = false;
      if (!ex) su = true;
      else { const ow = Number(ex.wave)||0, os = Number(ex.score)||0; if (nw > ow || (nw === ow && ns > os)) su = true; }
      if (su) r.set({ name: cleanName, score: ns, wave: nw, sortValue: sv, timestamp: Date.now() }).catch(() => {});
    }).catch(() => {});
  }
}
function saveDailyToGlobalLeaderboard(name, scoreVal, dateKey) {
  const cleanName = (name || 'Pahlawan').trim(); if (!cleanName) return;
  const pk = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ns = Number(scoreVal)||0;
  if (db && pk) db.ref('daily/' + dateKey + '/' + pk).set({ name: cleanName, score: ns, sortValue: ns, timestamp: Date.now() }).catch(() => {});
}
function saveCoopScoreToGlobalLeaderboard(hostName, guestName, scoreVal, levelVal) {
  if (!db) return;
  const cleanHost = (hostName || 'Host').trim();
  const cleanGuest = (guestName || 'Guest').trim();
  if (!cleanHost) return;
  const teamKey = (cleanHost.toLowerCase() + '_' + cleanGuest.toLowerCase()).replace(/[^a-z0-9]/g, '_').slice(0, 40);
  const numScore = Number(scoreVal) || 0;
  const numLevel = Number(levelVal) || 1;
  const sortValue = (numLevel * 100000000) + numScore;
  const ref = db.ref('leaderboard_coop/' + teamKey);
  ref.once('value').then(snap => {
    const ex = snap.val(); let shouldUpdate = false;
    if (!ex) shouldUpdate = true;
    else { const ol = Number(ex.level)||0, os = Number(ex.score)||0; if (numLevel > ol || (numLevel === ol && numScore > os)) shouldUpdate = true; }
    if (shouldUpdate) ref.set({ name1: cleanHost, name2: cleanGuest, score: numScore, level: numLevel, sortValue, timestamp: Date.now() }).catch(() => {});
  }).catch(() => {});
}
function openLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === currentLeaderboardTab));
  loadLeaderboardData();
}
async function loadLeaderboardData() {
  const tbody = document.getElementById('leaderboard-body'); if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Memuat...</td></tr>';
  if (leaderboardRef && leaderboardHandler) { try { leaderboardRef.off('value', leaderboardHandler); } catch(e) {} leaderboardRef = null; leaderboardHandler = null; }
  if (!db) { showLocalScores(tbody); return; }
  let path = 'leaderboard', tk = 'global';
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
  const doR = () => { if (!pend) return; const s = pend; pend = null; lrt = Date.now(); renderLeaderboardRows(s, tbody); };
  leaderboardHandler = (snap) => {
    pend = snap;
    const n = Date.now(), sl = n - lrt;
    if (sl >= 1000) doR();
    else if (!rt) rt = setTimeout(() => { rt = null; doR(); }, 1000 - sl);
  };
  leaderboardRef.on('value', leaderboardHandler, () => { showLocalScores(tbody); });
}
function renderLeaderboardRows(snapshot, tbody) {
  if (!snapshot.exists()) { showLocalScores(tbody); return; }
  let arr = [];
  snapshot.forEach(c => {
    const v = c.val(); if (!v || !v.name) return;
    const cn = String(v.name).trim(); if (!cn) return;
    if (currentLeaderboardTab === 'coop') arr.push({ key: c.key, name: (v.name1 || cn) + ' + ' + (v.name2 || '?'), level: Number(v.level)||1, score: Number(v.score)||0, sortValue: v.sortValue });
    else arr.push({ key: c.key, name: cn, level: Number(v.level)||Number(v.wave)||1, score: Number(v.score)||0, sortValue: v.sortValue });
  });
  if (arr.length === 0) { showLocalScores(tbody); return; }
  arr.sort((a, b) => {
    const asv = (a.sortValue !== undefined && a.sortValue !== null) ? Number(a.sortValue) : ((a.level * 100000000) + a.score);
    const bsv = (b.sortValue !== undefined && b.sortValue !== null) ? Number(b.sortValue) : ((b.level * 100000000) + b.score);
    return bsv - asv;
  });
  const dm = new Map();
  arr.forEach(it => { const k = it.name.toLowerCase().replace(/\s+/g, ' ').trim(); if (!dm.has(k)) dm.set(k, it); });
  const uniq = Array.from(dm.values());
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
  const ls = JSON.parse(localStorage.getItem('pahlawan_scores') || '[]');
  const bm = new Map();
  ls.forEach(s => {
    if (!s || !s.name) return;
    const cn = s.name.trim();
    const k = cn.toLowerCase();
    const cl = Number(s.level)||1, csc = Number(s.score)||0;
    if (!bm.has(k)) bm.set(k, { name: cn, level: cl, score: csc });
    else { const e = bm.get(k); if (cl > e.level || (cl === e.level && csc > e.score)) bm.set(k, { name: cn, level: cl, score: csc }); }
  });
  const arr = Array.from(bm.values());
  arr.sort((a, b) => { if (b.level !== a.level) return b.level - a.level; return b.score - a.score; });
  if (arr.length === 0) tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Belum ada skor.</td></tr>';
  else tbody.innerHTML = arr.slice(0, 50).map((s, i) => `<tr><td>${i+1}</td><td><strong>${escapeHtml(s.name)}</strong></td><td>Lvl ${s.level||1}</td><td><strong>${s.score||0}</strong></td></tr>`).join('');
}

// =============================================================
// 44. LOADOUT MODAL
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
      else { if (loadoutCurrentSelection.length >= 2) loadoutCurrentSelection.shift(); loadoutCurrentSelection.push(s); }
      uv();
    };
  });
  uv();
  document.getElementById('modal-loadout').classList.remove('hidden');
}

// =============================================================
// 45. NARRATIVE
// =============================================================
function showNarrative(lines, speaker, portrait, onDone) {
  if (!lines || lines.length === 0) { if (onDone) onDone(); return; }
  storyQueue = lines.slice();
  storyOnDone = onDone || null;
  const spk = document.getElementById('narrative-speaker'); if (spk) spk.innerText = speaker || '';
  const psvg = document.getElementById('narrative-portrait-svg'); if (psvg) psvg.innerHTML = `<use href="#${portrait || 'i-vega'}"/>`;
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
    if (storyCurrentIdx >= storyCurrentText.length) { clearInterval(storyTimer); storyTimer = null; storyTyping = false; return; }
    if (body) body.textContent += storyCurrentText[storyCurrentIdx++];
    else storyCurrentIdx++;
    if (storyCurrentIdx % 3 === 0) sounds.playType();
  }, 28);
}

// =============================================================
// 46. CERTIFICATE
// =============================================================
async function openCertificate() {
  if (!bestCertificateData) {
    bestCertificateData = { name: playerName, score: score, dateStr: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) };
  }
  const modal = document.getElementById('modal-certificate'); if (!modal) return;
  renderCertificate(bestCertificateData);
  modal.classList.remove('hidden');
}
function closeCertificate() { const modal = document.getElementById('modal-certificate'); if (modal) modal.classList.add('hidden'); }
function renderCertificate(data) {
  const canvas = document.getElementById('certificate-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const bgGrad = ctx.createRadialGradient(W/2, H/2, 100, W/2, H/2, Math.max(W, H) * 0.7);
  bgGrad.addColorStop(0, '#fdf8e7'); bgGrad.addColorStop(1, '#e8dcb8');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#8a6a00'; ctx.lineWidth = 14; ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 6; ctx.strokeRect(60, 60, W - 120, H - 120);
  ctx.strokeStyle = '#8a6a00'; ctx.lineWidth = 2; ctx.strokeRect(75, 75, W - 150, H - 150);
  const corners = [[100, 100], [W-100, 100], [100, H-100], [W-100, H-100]];
  corners.forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#8a6a00';
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
  });
  const starY = 180, starSize = 40;
  ctx.fillStyle = '#ffd700';
  for (let i = 0; i < 5; i++) { const x = W/2 + (i - 2) * 100; drawStar(ctx, x, starY, starSize, 5); }
  ctx.font = '80px serif'; ctx.textAlign = 'center';
  ctx.fillText('🏆', W/2, starY - 100);
  ctx.fillStyle = '#8a6a00'; ctx.font = 'bold 72px "Orbitron", serif'; ctx.textAlign = 'center';
  ctx.fillText('SERTIFIKAT', W/2, 360);
  ctx.fillStyle = '#5a4a00'; ctx.font = 'bold 40px "Orbitron", serif';
  ctx.fillText('PENYELESAIAN GAME', W/2, 420);
  ctx.strokeStyle = '#8a6a00'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W/2 - 400, 450); ctx.lineTo(W/2 + 400, 450); ctx.stroke();
  ctx.fillStyle = '#3a2a00'; ctx.font = '32px "Rajdhani", serif';
  ctx.fillText('Dengan ini menyatakan bahwa', W/2, 520);
  ctx.fillStyle = '#0a0a3a'; ctx.font = 'bold 88px "Orbitron", serif';
  ctx.fillText('"' + (data.name || 'Pahlawan') + '"', W/2, 630);
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(W/2 - 450, 660); ctx.lineTo(W/2 + 450, 660); ctx.stroke();
  ctx.fillStyle = '#3a2a00'; ctx.font = '32px "Rajdhani", serif';
  ctx.fillText('Telah berhasil menyelesaikan seluruh 50 level', W/2, 720);
  ctx.fillText('dalam game PAHLAWAN BINTANG', W/2, 765);
  ctx.fillStyle = '#8a6a00'; ctx.font = 'bold 44px "Orbitron", serif';
  ctx.fillText('SKOR TERTINGGI: ' + (data.score || 0), W/2, 860);
  ctx.fillStyle = '#5a4a00'; ctx.font = '28px "Rajdhani", serif';
  ctx.fillText('Diberikan pada ' + (data.dateStr || new Date().toLocaleDateString('id-ID')), W/2, 920);
  ctx.fillStyle = '#3a2a00'; ctx.font = '24px "Rajdhani", serif'; ctx.textAlign = 'left';
  ctx.fillText('Tertanda,', W/2 + 250, 1000);
  ctx.strokeStyle = '#0a0a3a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W/2 + 200, 1040);
  ctx.bezierCurveTo(W/2 + 240, 1000, W/2 + 280, 1080, W/2 + 320, 1030);
  ctx.bezierCurveTo(W/2 + 360, 990, W/2 + 400, 1060, W/2 + 440, 1030);
  ctx.stroke();
  ctx.fillStyle = '#8a6a00'; ctx.font = 'bold 26px "Orbitron", serif'; ctx.textAlign = 'left';
  ctx.fillText('VEGA - Komandan Galaksi', W/2 + 220, 1080);
  ctx.save(); ctx.translate(220, 1000);
  ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700'; ctx.fill();
  ctx.strokeStyle = '#8a6a00'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#8a6a00'; ctx.font = 'bold 20px "Orbitron", serif'; ctx.textAlign = 'center';
  ctx.fillText('PB', 0, -5); ctx.font = 'bold 14px "Orbitron", serif'; ctx.fillText('GAME', 0, 20);
  ctx.restore();
}
function drawStar(ctx, cx, cy, r, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
}
function downloadCertificate() {
  const canvas = document.getElementById('certificate-canvas'); if (!canvas) return;
  try {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    const cleanName = (bestCertificateData?.name || 'Pahlawan').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `Sertifikat_PahlawanBintang_${cleanName}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch(e) { console.warn('⚠️ [Cert]', e); alert('Gagal mengunduh sertifikat'); }
}
async function shareCertificate() {
  const canvas = document.getElementById('certificate-canvas'); if (!canvas) return;
  try {
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('Canvas blob failed');
    const file = new File([blob], 'sertifikat.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Sertifikat Pahlawan Bintang', text: `Saya telah menyelesaikan PAHLAWAN BINTANG dengan skor ${bestCertificateData?.score || 0}!` });
    } else downloadCertificate();
  } catch(e) {
    if (e.name === 'AbortError') return;
    console.warn('⚠️ [Cert]', e); downloadCertificate();
  }
}

// =============================================================
// 47. MULTIPLAYER LOGIC
// =============================================================
function openMPHub() { const modal = document.getElementById('modal-mp-hub'); if (modal) modal.classList.remove('hidden'); mpSetStatus('mp-join-status', '', 'hidden'); }
function mpSetStatus(id, text, type) {
  const el = document.getElementById(id); if (!el) return;
  if (!text || type === 'hidden') { el.classList.add('mp-status-hidden'); el.innerText = ''; return; }
  el.classList.remove('mp-status-hidden');
  el.className = 'mp-status mp-status-' + (type || 'info');
  el.innerText = text;
}
function mpShowLobby(role, roomCode, mode) {
  document.getElementById('modal-mp-hub').classList.add('hidden');
  document.getElementById('modal-mp-join').classList.add('hidden');
  const lobby = document.getElementById('modal-mp-lobby'); if (lobby) lobby.classList.remove('hidden');
  const title = document.getElementById('mp-lobby-title'); if (title) title.innerText = role === 'host' ? 'ROOM DIBUAT' : 'MENUNGGU HOST';
  const codeEl = document.getElementById('mp-room-code'); if (codeEl) codeEl.innerText = roomCode;
  const modeEl = document.getElementById('mp-lobby-mode'); if (modeEl) modeEl.innerText = (mode || 'coop').toUpperCase();
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
  const startBtn = document.getElementById('btn-mp-start-game'); if (startBtn) startBtn.disabled = true;
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
  } catch (e) { alert('Gagal buat room: ' + (e.message || e)); console.error(e); }
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
  } catch (e) { mpSetStatus('mp-join-status', e.message || 'Gagal join room', 'error'); console.error(e); }
}
async function mpStartGame() { if (!MP) return; try { await MP.setReady(true); await MP.startGame(); } catch(e) { console.error(e); } }
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
    mpSetStatus('mp-connect-status', '✅ Terhubung! ' + (data.peerName || ''), 'success');
    const startBtn = document.getElementById('btn-mp-start-game');
    if (startBtn && MP.isHost) startBtn.disabled = false;
    const guestName = document.getElementById('mp-guest-name');
    if (guestName && data.peerName) guestName.innerText = data.peerName;
    const guestStatus = document.getElementById('mp-guest-status');
    if (guestStatus) { guestStatus.innerText = 'ONLINE'; guestStatus.className = 'mp-slot-status online'; }
    const slotGuest = document.getElementById('mp-slot-guest'); if (slotGuest) slotGuest.classList.add('occupied');
  });
  MP.onDisconnect((who) => {
    mpSetStatus('mp-connect-status', '⚠️ Pemain lain terputus', 'warning');
    if (isGameRunning && gameMode === 'coop') mpEndGame(false, 'Pemain lain terputus');
  });
  MP.onError((msg) => mpSetStatus('mp-connect-status', '⚠️ ' + msg, 'error'));
  MP.onStatusChange((state) => {
    const msgMap = {
      'idle': { text: 'Menunggu...', type: 'info' },
      'creating': { text: 'Membuat room...', type: 'info' },
      'waiting': { text: 'Menunggu pemain lain...', type: 'info' },
      'connecting': { text: '🔄 Menghubungkan... (5-10 detik)', type: 'info' },
      'connected': { text: '✅ Terhubung!', type: 'success' },
      'error': { text: '❌ Gagal terhubung. Coba lagi.', type: 'error' },
      'closed': { text: '⚠️ Koneksi terputus', type: 'warning' }
    };
    const info = msgMap[state] || { text: state, type: 'info' };
    mpSetStatus('mp-connect-status', info.text, info.type);
    if (state === 'connecting' || state === 'connected' || state === 'error') mpSetStatus('mp-join-status', info.text, info.type);
  });
  MP.onInput((input) => {
    if (!input) return;
    if (input.pause) {
      if (!isGamePaused && isGameRunning) {
        isGamePaused = true; mpPauseState = 'paused-local'; sounds.stopBGM();
        const p = document.getElementById('modal-pause'); if (p) { p.style.pointerEvents = 'auto'; p.classList.remove('hidden'); }
      }
      return;
    }
    if (input.resume) {
      if (isGamePaused) {
        isGamePaused = false; mpPauseState = 'none'; sounds.startBGM();
        const p = document.getElementById('modal-pause'); if (p) p.classList.add('hidden');
        requestAnimationFrame(gameLoop);
      }
      return;
    }
    if (input.respawn) {
      mpRemoteGuestSpectator = false;
      mpGuestHP = PLAYER_MAX_HIT_POINTS; mpGuestAlive = true;
      mpGuestX = VIRTUAL_WIDTH * 0.75; mpGuestTargetX = mpGuestX;
      mpGuestLives = 1;
      spawnFloatingText(mpGuestX, VIRTUAL_HEIGHT - 70 * GAME_SCALE, 'PARTNER REVIVED!', '#39ff14');
      triggerScreenFlash(0.4);
    }
    mpGuestInput = input;
    if (input.heroType && input.heroType !== mpRemoteHeroType) mpRemoteHeroType = input.heroType;
  });
  MP.onState((state) => mpApplyHostState(state));
  MP.onStart((data) => { mpActuallyStartCoop(); });
  MP.onRemoteReady((ready) => console.log('🎯 [MP] Remote ready:', ready));
}
function mpHostSendState() {
  if (!mpActive || mpRole !== 'host') return;
  if (!MP || !MP.isConnected) return;
  const W = VIRTUAL_WIDTH || 1, H = VIRTUAL_HEIGHT || 1;
  const baseSize = Math.min(W, H);
  const effectsToSend = mpEffectQueue.splice(0, mpEffectQueue.length);
  let comboIndicatorText = null;
  if (comboBoostLastNotified >= 10) comboIndicatorText = '🧲 AUTO MAGNET';
  else if (comboBoostLastNotified >= 5) comboIndicatorText = '⚡ FIRE RATE +20%';
  else if (comboBoostLastNotified >= 3) comboIndicatorText = '💰 COIN +50%';
  const state = {
    monsters: monsters.map(m => ({ xNorm: m.x/W, yNorm: m.y/H, hp: m.hp, maxHp: m.maxHp, type: m.type, sizeNorm: m.size/baseSize, color: m.color, opacity: m.opacity||1, hitFlash: m.hitFlash||0, coreOpen: m.coreOpen||false, algorithm: m.algorithm })),
    bullets: bullets.map(b => ({ xNorm: b.x/W, yNorm: b.y/H, vxNorm: b.vx/W, vyNorm: b.vy/H, color: b.color, sizeNorm: b.size/baseSize, heroType: b.heroType, owner: b.owner })),
    hostXNorm: playerX/W,
    hostHeroType: currentActor,
    guestXNorm: mpGuestX/W,
    guestHP: mpGuestHP, guestScore: mpGuestScore,
    guestCombo: mpGuestCombo, guestAlive: mpGuestAlive,
    guestLives: mpGuestLives,
    hostHP: playerHitPoints, hostScore: score,
    hostSpectator: mpSpectatorMode,
    guestSpectator: mpRemoteGuestSpectator,
    totalScore: score + mpGuestScore,
    level: currentLevelIndex + 1,
    targetKills: (levelsData[currentLevelIndex] || levelsData[0]).targetKills,
    totalKills: levelKills,
    gameRunning: isGameRunning, gamePaused: isGamePaused,
    theme: currentTheme.id,
    bossPhase: bossPhase, bossMinionsKilled: bossMinionsKilled, bossMinionsTarget: bossMinionsTarget,
    flow: { phase: mpFlow.phase, levelIndex: mpFlow.levelIndex, phaseStartedAt: mpFlow.phaseStartedAt, introData: mpFlow.introData, themeId: currentTheme.id },
    effects: effectsToSend,
    comboIndicator: { text: comboIndicatorText, active: comboBoostLastNotified > 0 }
  };
  MP.sendState(state);
}
function mpApplyHostState(state) {
  if (!state) return;
  if (!Array.isArray(state.monsters)) return;
  const W = VIRTUAL_WIDTH || 1, H = VIRTUAL_HEIGHT || 1;
  const baseSize = Math.min(W, H);
  if (state.theme) {
    const matchingTheme = LEVEL_THEMES.find(t => t.id === state.theme);
    if (matchingTheme && matchingTheme.id !== currentTheme.id) {
      currentTheme = matchingTheme; applyThemeToDocument(currentTheme); recolorStars();
      if (mpActive && mpRole === 'guest') { sounds.stopBGM(); sounds.startBGM(); }
    }
  }
  mpRemoteMonsters = state.monsters.map(m => ({
    x: m.xNorm * W, y: m.yNorm * H, hp: m.hp, maxHp: m.maxHp, type: m.type,
    size: m.sizeNorm * baseSize, color: m.color, opacity: m.opacity,
    hitFlash: m.hitFlash, coreOpen: m.coreOpen, algorithm: m.algorithm,
    timeAlive: (Date.now() % 10000) / 1000, rot: 0, wobble: 0, aura: 0
  }));
  mpRemoteBullets = (state.bullets || []).map(b => ({
    x: b.xNorm * W, y: b.yNorm * H, vx: b.vxNorm * W, vy: b.vyNorm * H,
    color: b.color, size: b.sizeNorm * baseSize, heroType: b.heroType, owner: b.owner
  }));
  if (state.hostXNorm !== undefined) mpRemoteX = state.hostXNorm * W;
  if (state.hostHeroType) mpRemoteHeroType = state.hostHeroType;
  if (state.guestXNorm !== undefined) mpGuestX = state.guestXNorm * W;
  if (state.guestHP !== undefined) { mpGuestHP = state.guestHP; if (mpRole === 'guest' && !mpSpectatorMode) playerHitPoints = state.guestHP; }
  if (state.guestScore !== undefined) mpGuestScore = state.guestScore;
  if (state.guestCombo !== undefined) mpGuestCombo = state.guestCombo;
  if (state.guestAlive !== undefined) mpGuestAlive = state.guestAlive;
  if (state.guestLives !== undefined) { mpGuestLives = state.guestLives; if (mpRole === 'guest') { lives = state.guestLives; updateLivesDisplay(); } }
  if (state.bossPhase !== undefined) bossPhase = state.bossPhase;
  if (state.bossMinionsKilled !== undefined) bossMinionsKilled = state.bossMinionsKilled;
  if (state.bossMinionsTarget !== undefined) bossMinionsTarget = state.bossMinionsTarget;
  if (state.hostSpectator !== undefined && mpRole === 'guest') applyRemoteHostSpectator(state.hostSpectator);
  if (mpRole === 'guest' && state.guestSpectator !== undefined) {
    const shouldBeSpectator = !!state.guestSpectator;
    if (shouldBeSpectator && !mpSpectatorMode) startSelfSpectatorMode('host-command');
    else if (!shouldBeSpectator && mpSpectatorMode) endSelfSpectatorMode();
  }
  if (mpRole === 'guest' && state.gamePaused !== undefined) {
    const hostPaused = !!state.gamePaused && state.gameRunning !== false;
    if (hostPaused && !isGamePaused) { isGamePaused = true; mpRemotePaused = true; mpPauseState = 'paused-remote'; sounds.stopBGM(); showRemotePauseOverlay(); }
    else if (!hostPaused && isGamePaused && mpRemotePaused) { isGamePaused = false; mpRemotePaused = false; mpPauseState = 'none'; sounds.startBGM(); hideRemotePauseOverlay(); requestAnimationFrame(gameLoop); }
  }
  mpRemoteHostHP = state.hostHP || 0;
  mpRemoteHostScore = state.hostScore || 0;
  mpRemoteScore = state.hostScore || 0;
  score = state.totalScore || 0;
  levelKills = state.totalKills || 0;
  if (Array.isArray(state.effects)) {
    state.effects.forEach(eff => {
      if (eff.type === 'flash') {
        screenFlash = Math.min(1, eff.intensity || 0.5);
        const fl = document.getElementById('screen-flash-overlay');
        if (fl) { fl.style.opacity = String(screenFlash); setTimeout(() => { if (fl) fl.style.opacity = '0'; }, 80); }
      } else if (eff.type === 'hitstop') hitStopFrames = Math.max(hitStopFrames, eff.frames || 3);
    });
  }
  if (state.comboIndicator && state.comboIndicator.active && state.comboIndicator.text) {
    const cb = document.getElementById('combo-boost-indicator');
    if (cb && cb.innerText !== state.comboIndicator.text) {
      cb.innerText = state.comboIndicator.text; cb.classList.add('show');
      clearTimeout(cb._hideTimer);
      cb._hideTimer = setTimeout(() => cb.classList.remove('show'), 1800);
      sounds.playComboBoost(5);
    }
  }
  if (state.flow) {
    const newPhase = state.flow.phase, newLevel = state.flow.levelIndex;
    if (newPhase !== mpLastAppliedPhase || newLevel !== mpLastAppliedLevel) {
      mpLastAppliedPhase = newPhase; mpLastAppliedLevel = newLevel;
      mpFlow = Object.assign({}, state.flow);
      if (newPhase === 'intro' && state.flow.introData) mpGuestShowIntro(state.flow.introData);
      else if (newPhase === 'playing') mpGuestHideIntro();
      else if (newPhase === 'result') mpGuestHideIntro();
    }
  }
  updateHUDValues();
  updateLivesDisplay();
}
function mpGuestShowIntro(introData) {
  const banner = document.getElementById('level-intro'); if (!banner) return;
  document.getElementById('level-intro-number').innerText = introData.number || '01';
  document.getElementById('level-intro-name').innerText = introData.name || '';
  document.getElementById('level-intro-mission').innerText = introData.mission || '';
  banner.classList.remove('hidden'); banner.classList.remove('fade-out');
  void banner.offsetWidth;
  sounds.playLevelIntro();
}
function mpGuestHideIntro() {
  const banner = document.getElementById('level-intro');
  if (!banner || banner.classList.contains('hidden')) return;
  banner.classList.add('fade-out');
  setTimeout(() => banner.classList.add('hidden'), 500);
}
function mpSendGuestSkill(skillNum) {
  if (!mpActive || mpRole !== 'guest') return;
  if (skillNum === 1) mpGuestInput.skill1 = true;
  if (skillNum === 2) mpGuestInput.skill2 = true;
  if (skillNum === 3) mpGuestInput.skill3 = true;
}
function mpHandleGuestDeath() {
  mpGuestLives--;
  mpGuestHP = PLAYER_MAX_HIT_POINTS;
  mpGuestAlive = true;
  if (mpGuestLives <= 0) { mpRemoteGuestSpectator = true; checkBothDead(); }
}
function mpHostLevelComplete() { mpEndGame(true, 'SELESAI!'); }
function mpEndGame(win, reason) {
  isGameRunning = false; isGamePaused = false;
  stopSpawnLoop(); mpStopHostSyncLoop();
  sounds.stopBGM(); if (win) sounds.playWin();
  mpFlow.phase = 'result';
  endSelfSpectatorMode();
  mpRemoteHostSpectator = false; mpRemoteGuestSpectator = false;
  setSpectatorOverlayVisible(false);
  mpRemotePaused = false; mpPauseState = 'none';
  hideRemotePauseOverlay();
  if (typeof window._hideDesktopHints === 'function') window._hideDesktopHints();
  if (stageClearTimer) { clearTimeout(stageClearTimer); stageClearTimer = null; }
  levelClearPending = false;
  const wasRole = mpRole;
  mpActive = false;
  const $ = id => document.getElementById(id);
  const rt = $('result-title'); if (rt) rt.innerText = win ? 'CO-OP SELESAI!' : 'PERMAINAN BERAKHIR';
  const rpn = $('result-player-name'); if (rpn) rpn.innerText = playerName + (mpRemoteName ? ' + ' + mpRemoteName : '');
  const rs = $('result-score'); if (rs) rs.innerText = score;
  const rc = $('result-coins'); if (rc) rc.innerText = `+${levelCoinsEarned}`;
  const rl = $('result-level'); if (rl) rl.innerText = (currentLevelIndex + 1) + ' (Co-op)';
  const rk = $('result-kills'); if (rk) rk.innerText = `${levelKills} Target`;
  const starContainer = $('result-stars');
  if (starContainer) {
    if (win) { let h = ''; for (let s = 0; s < 3; s++) h += `<svg class="star-mini on" viewBox="0 0 24 24"><use href="#i-star"/></svg>`; starContainer.innerHTML = h; }
    else starContainer.innerHTML = '<span style="color:#566a8c;font-size:12px;">—</span>';
  }
  const icon = $('result-icon');
  if (icon) { icon.innerHTML = win ? '<use href="#i-trophy"/>' : '<use href="#i-skull"/>'; icon.classList.toggle('fail', !win); }
  const nextBtn = $('btn-next-level'); if (nextBtn) nextBtn.classList.add('hidden');
  const retryBtn = $('btn-retry-level'); if (retryBtn) retryBtn.classList.remove('hidden');
  const certBtn = $('btn-view-certificate'); if (certBtn) certBtn.classList.add('hidden');
  const modal = $('modal-result'); if (modal) modal.classList.remove('hidden');
  try { MP.leaveRoom(); } catch(e) {}
  if (win && wasRole === 'host') {
    saveCoopScoreToGlobalLeaderboard(playerName, mpRemoteName || 'Guest', score, currentLevelIndex + 1);
    PLAYER_STATS.coopWins++;
    savePlayerStats().then(() => checkAchievements());
  }
  mpRole = null;
}
function mpActuallyStartCoop() {
  mpActive = true;
  mpRole = MP.isHost ? 'host' : 'guest';
  gameMode = 'coop';
  currentLevelIndex = 0;
  score = 0; lives = 3 + upgradeLife;
  playerHitPoints = PLAYER_MAX_HIT_POINTS; playerHitFlash = 0;
  reviveUsedThisRun = false;
  levelKills = 0; levelCoinsEarned = 0;
  mpGuestInput = { left:false, right:false, moveX:0, shoot:false, skill1:false, skill2:false, skill3:false, heroType:'robot', respawn:false, pause:false, resume:false };
  mpGuestX = VIRTUAL_WIDTH * 0.75; mpGuestTargetX = mpGuestX;
  mpGuestHP = PLAYER_MAX_HIT_POINTS;
  mpGuestScore = 0; mpGuestCombo = 1;
  mpGuestAlive = true;
  mpRemoteX = VIRTUAL_WIDTH * 0.25; mpRemoteTargetX = mpRemoteX;
  mpRemoteName = MP.remotePeerName || 'Teman';
  mpRemoteHeroType = 'robot';
  mpEffectQueue = []; mpComboIndicatorState = { text: null, active: false, shownAt: 0 };
  endSelfSpectatorMode();
  mpRemoteHostSpectator = false; mpRemoteGuestSpectator = false; mpGuestLives = 3;
  setSpectatorOverlayVisible(false);
  mpRemotePaused = false; mpLocalPauseRequested = false; mpPauseState = 'none';
  hideRemotePauseOverlay();
  if (mpRole === 'host') { playerX = VIRTUAL_WIDTH * 0.25; playerTargetX = playerX; }
  else { playerX = VIRTUAL_WIDTH * 0.75; playerTargetX = playerX; }
  resetLevelState(); updateHUDValues(); updateLivesDisplay();
  playerLoadout = ['freeze', 'bomb'];
  freezeCharges = upgradeFreeze; shieldCharges = upgradeShield; bombCharges = upgradeBomb;
  updateSkillButtonsUI();
  document.getElementById('modal-mp-lobby').classList.add('hidden');
  currentTheme = getThemeForLevel(1);
  applyThemeToDocument(currentTheme); recolorStars();
  isGameRunning = true; isGamePaused = false;
  initBossPhase(1, 'coop');
  mpFlow.phase = 'intro'; mpFlow.levelIndex = 0;
  mpFlow.phaseStartedAt = Date.now();
  mpFlow.introData = { number: 'CO-OP', name: 'TEAM BATTLE', mission: '2 PEMAIN VS GALAKSI' };
  mpFlow.themeId = currentTheme.id;
  if (mpRole === 'guest') { mpLastAppliedPhase = null; mpLastAppliedLevel = -1; }
  if (mpRole === 'host') {
    const banner = document.getElementById('level-intro');
    if (banner) {
      document.getElementById('level-intro-number').innerText = mpFlow.introData.number;
      document.getElementById('level-intro-name').innerText = mpFlow.introData.name;
      document.getElementById('level-intro-mission').innerText = mpFlow.introData.mission;
      banner.classList.remove('hidden'); banner.classList.remove('fade-out');
      banner.classList.remove('stage-clear'); banner.classList.remove('boss-approach');
      void banner.offsetWidth;
      sounds.playLevelIntro();
      setTimeout(() => {
        banner.classList.add('fade-out');
        setTimeout(() => banner.classList.add('hidden'), 500);
        mpFlow.phase = 'playing';
        mpFlow.phaseStartedAt = Date.now();
        startSpawnLoop(); mpStartHostSyncLoop();
      }, 1200);
    }
  }
  if (IS_DESKTOP && typeof window._showDesktopHints === 'function') window._showDesktopHints();
  sounds.startBGM();
  gameLoop();
}
function mpStartHostSyncLoop() {
  if (mpSyncTimer) clearInterval(mpSyncTimer);
  mpSyncTimer = setInterval(() => { if (!mpActive || mpRole !== 'host' || !isGameRunning) return; mpHostSendState(); }, 33);
}
function mpStopHostSyncLoop() { if (mpSyncTimer) { clearInterval(mpSyncTimer); mpSyncTimer = null; } }

// =============================================================
// 48. INIT
// =============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    if (typeof MP !== 'undefined') { mpSetupCallbacks(); console.log('✅ [MP] Callbacks attached'); }
    else console.warn('⚠️ [MP] multiplayer.js belum loaded');
  }, 500);
  setTimeout(() => { ensureOverlaysInert(); updateActorGridUI(); updateLevelSelectButton(); }, 800);
});

// =============================================================
// END OF FILE — game.js v21.0.0
// 20 HEROES + 10 UPGRADES + GALAXY MENU + FULL RESPONSIVE
// =============================================================
console.log('✅ [game.js] v21.0.0 LOADED — PART 4/4 COMPLETE');

// =============================================================
// PAHLAWAN BINTANG — game.js v23.0.0 — PART 6/6
// 30 HEROES + VILLAIN NARRATIVE + DRAMATIC ZONES
// =============================================================

// =============================================================
// V1. HERO DATA — TAMBAH 20 HERO BARU (10 villain + 10 minion)
// =============================================================
Object.assign(HERO_DATA, {
  // ============ 10 VILLAIN HEROES (dari bos yang dikalahkan) ============
  inferno_boss:   { id:'inferno_boss',   name:'Inferno',       desc:'Api abadi dari neraka void — napas 3 arah membara.',   color:'#ff2200', accent:'#ffd700', bulletType:'inferno-meteor',   bulletCount:3, bulletPierce:2, bulletSize:9,  bulletSpeed:13, fireRate:180, sound:'fireWhoosh',  difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  void_boss:      { id:'void_boss',      name:'Void Lord',     desc:'Penguasa kekosongan — rift pembelok ruang.',           color:'#c86bff', accent:'#ff77ff', bulletType:'void-rift',        bulletCount:2, bulletPierce:3, bulletSize:10, bulletSpeed:11, fireRate:200, sound:'arcaneOrb',   difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  cryo_boss:      { id:'cryo_boss',      name:'Cryo Emperor',  desc:'Raja es abadi — pecahan kristal menembus.',            color:'#4de8ff', accent:'#ffffff', bulletType:'cryo-shatter',     bulletCount:4, bulletPierce:2, bulletSize:6,  bulletSpeed:15, fireRate:170, sound:'laser',       difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  titan_boss:     { id:'titan_boss',     name:'Titan Prime',   desc:'Penjaga inti galaksi — hantaman seismik.',             color:'#1abc9c', accent:'#00ffcc', bulletType:'titan-quake',      bulletCount:1, bulletPierce:4, bulletSize:16, bulletSpeed:10, fireRate:260, sound:'cannonBlast', difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  solar_boss:     { id:'solar_boss',     name:'Solar Wraith',  desc:'Matahari yang marah — pancaran api super.',            color:'#ffaa00', accent:'#ffd700', bulletType:'solar-flare',      bulletCount:5, bulletPierce:1, bulletSize:7,  bulletSpeed:14, fireRate:190, sound:'fireWhoosh',  difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  omega_boss:     { id:'omega_boss',     name:'Omega',         desc:'Akhir dari segalanya — beam penghancur.',              color:'#ff0055', accent:'#ffd700', bulletType:'omega-beam',       bulletCount:3, bulletPierce:5, bulletSize:8,  bulletSpeed:16, fireRate:200, sound:'laser',       difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  abyss_boss:     { id:'abyss_boss',     name:'Abyss Sovereign', desc:'Penguasa jurang — tentakel void melingkar.',         color:'#8b00ff', accent:'#ff00ff', bulletType:'abyss-tendril',    bulletCount:6, bulletPierce:1, bulletSize:6,  bulletSpeed:12, fireRate:210, sound:'ghostWail',   difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  nemesis_boss:   { id:'nemesis_boss',   name:'Nemesis',       desc:'Bayangan dirimu sendiri — spiral penghancur.',         color:'#ff2200', accent:'#ffd700', bulletType:'nemesis-spiral',   bulletCount:4, bulletPierce:2, bulletSize:9,  bulletSpeed:13, fireRate:180, sound:'dragonRoar',  difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  abyss2_boss:    { id:'abyss2_boss',    name:'Abyss²',        desc:'Bentuk terkuat Abyss — void berlapis ganda.',          color:'#8b00ff', accent:'#ffffff', bulletType:'abyss2-void',      bulletCount:5, bulletPierce:3, bulletSize:8,  bulletSpeed:14, fireRate:170, sound:'ghostWail',   difficulty:'hard',   locked:true, quizTime:0, isVillain:true },
  eternity_boss:  { id:'eternity_boss',  name:'Eternity',      desc:'Awal dan akhir — bintang purba penghancur.',           color:'#ffd700', accent:'#ffffff', bulletType:'eternity-star',    bulletCount:7, bulletPierce:4, bulletSize:9,  bulletSpeed:15, fireRate:160, sound:'magicSpark',  difficulty:'hard',   locked:true, quizTime:0, isVillain:true },

  // ============ 10 MINION HEROES (unlock via MTK) ============
  jelly_hero:     { id:'jelly_hero',     name:'Jelly Bouncer', desc:'Bola jelly memantul dengan tembakan bergelombang.',   color:'#ff4757', accent:'#ffd700', bulletType:'jelly-bounce',     bulletCount:3, bulletPierce:1, bulletSize:7,  bulletSpeed:12, fireRate:170, sound:'rapid',       difficulty:'easy',   locked:true, quizTime:60 },
  donut_hero:     { id:'donut_hero',     name:'Donut Roller',  desc:'Donat berputar dengan tembakan spiral.',              color:'#fa8231', accent:'#ff78ae', bulletType:'donut-spiral',     bulletCount:4, bulletPierce:1, bulletSize:6,  bulletSpeed:13, fireRate:160, sound:'rapid',       difficulty:'easy',   locked:true, quizTime:60 },
  cloud_hero:     { id:'cloud_hero',     name:'Cloud Puff',    desc:'Awan lembut dengan tembakan menyebar pelan.',         color:'#f1f2f6', accent:'#70a1ff', bulletType:'cloud-puff',       bulletCount:3, bulletPierce:1, bulletSize:9,  bulletSpeed:10, fireRate:200, sound:'magicSpark',  difficulty:'easy',   locked:true, quizTime:60 },
  crystal_hero:   { id:'crystal_hero',   name:'Crystal Shard', desc:'Kristal tajam menembus 2 musuh sekaligus.',           color:'#00d2d3', accent:'#ffffff', bulletType:'crystal-shard',    bulletCount:2, bulletPierce:2, bulletSize:7,  bulletSpeed:14, fireRate:180, sound:'magicSpark',  difficulty:'easy',   locked:true, quizTime:60 },
  splitter_hero:  { id:'splitter_hero',  name:'Split Bomb',    desc:'Tembakan yang membelah jadi dua.',                    color:'#ff7f50', accent:'#ffd700', bulletType:'split-bullet',     bulletCount:1, bulletPierce:1, bulletSize:10, bulletSpeed:12, fireRate:200, sound:'cannonBlast', difficulty:'medium', locked:true, quizTime:60 },
  triangle_hero:  { id:'triangle_hero',  name:'Tri Dash',      desc:'Tembakan cepat tiga arah zigzag.',                    color:'#ffa502', accent:'#ffd700', bulletType:'tri-zigzag',       bulletCount:3, bulletPierce:1, bulletSize:6,  bulletSpeed:16, fireRate:140, sound:'rapid',       difficulty:'easy',   locked:true, quizTime:60 },
  hexagon_hero:   { id:'hexagon_hero',   name:'Hex Tank',      desc:'Tembakan lambat tapi damage besar.',                  color:'#1e90ff', accent:'#ffd700', bulletType:'hex-heavy',        bulletCount:2, bulletPierce:3, bulletSize:11, bulletSpeed:10, fireRate:240, sound:'cannonBlast', difficulty:'medium', locked:true, quizTime:60 },
  star_enemy_hero:{ id:'star_enemy_hero',name:'Star Shooter',  desc:'Bintang berkilau, tembakan menyilang.',               color:'#ffd700', accent:'#ffffff', bulletType:'star-cross',       bulletCount:4, bulletPierce:1, bulletSize:7,  bulletSpeed:14, fireRate:180, sound:'magicSpark',  difficulty:'easy',   locked:true, quizTime:60 },
  diamond_hero:   { id:'diamond_hero',   name:'Diamond Blast', desc:'Berlian keras, tembakan memantul.',                   color:'#70a1ff', accent:'#ffffff', bulletType:'diamond-richochet',bulletCount:2, bulletPierce:2, bulletSize:8,  bulletSpeed:13, fireRate:190, sound:'laser',       difficulty:'medium', locked:true, quizTime:60 },
  worm_hero:      { id:'worm_hero',      name:'Worm Tunnel',   desc:'Cacing void dengan tembakan bertahap.',               color:'#a55eea', accent:'#ff77ff', bulletType:'worm-multi',       bulletCount:3, bulletPierce:2, bulletSize:7,  bulletSpeed:13, fireRate:170, sound:'shuriken',    difficulty:'medium', locked:true, quizTime:60 }
});

// Refresh ALL_HEROES
Object.keys(HERO_DATA).forEach(id => { if (!ALL_HEROES.includes(id)) ALL_HEROES.push(id); });

// =============================================================
// V2. UNLOCK ROUTING — Siapa unlock bagaimana
// =============================================================
// Hero awal (10) — unlock via MTK easy
const STARTER_HEROES = ['robot','cannon','dragon','cat','unicorn','phoenix','ninja','wizard','archer','ghost'];

// Minion heroes — unlock via MTK (bisa easy/medium)
const MINION_HEROES = ['jelly_hero','donut_hero','cloud_hero','crystal_hero','splitter_hero','triangle_hero','hexagon_hero','star_enemy_hero','diamond_hero','worm_hero'];

// Villain heroes — unlock via defeat boss
const VILLAIN_HERO_FROM_BOSS = {
  5:  'inferno_boss',
  10: 'void_boss',
  15: 'cryo_boss',
  20: 'titan_boss',
  25: 'solar_boss',
  30: 'omega_boss',
  35: 'abyss_boss',
  40: 'nemesis_boss',
  45: 'abyss2_boss',
  50: 'eternity_boss'
};

// Narasi bos berubah jadi baik
const BOSS_REDEMPTION_NARRATIVES = {
  inferno_boss: {
    title: 'INFERNO DIKALAHKAN!',
    sub: 'Api kemarahan padam, digantikan cahaya',
    text: '"Aku... terbakar oleh kemarahanku sendiri. Void mengendalikanku. Sekarang aku sadar. Izinkan aku bertarung di sisimu, Pahlawan."'
  },
  void_boss: {
    title: 'VOID LORD DIBEBASKAN!',
    sub: 'Kekosongan menyingkir, jiwa kembali',
    text: '"Ribuan tahun dalam kegelapan... dan kau membebaskanku. Aku berutang nyawa padamu. Biar rift ini menembus musuh, bukan teman."'
  },
  cryo_boss: {
    title: 'CRYO EMPEROR LULUH!',
    sub: 'Es mencair, hati menghangat',
    text: '"Beku selama ini... membekukan hatiku juga. Terima kasih telah menghangatkanku kembali. Es-ku akan melindungi, bukan melukai."'
  },
  titan_boss: {
    title: 'TITAN PRIME TUNDUK!',
    sub: 'Raksasa mengenali kekuatan sejati',
    text: '"Kekuatan tanpa arah hanyalah kehancuran. Kau menunjukkan arah. Aku akan menjadi tameng bagimu, Pahlawan Bintang."'
  },
  solar_boss: {
    title: 'SOLAR WRAITH REDA!',
    sub: 'Matahari marah kembali bersinar',
    text: '"Amukan matahari telah reda. Aku... malu. Tapi aku akan menebusnya dengan cahaya yang menerangi jalanmu."'
  },
  omega_boss: {
    title: 'OMEGA DIHANCURKAN!',
    sub: 'Akhir menjadi awal baru',
    text: '"Aku adalah akhir... tapi kau menunjukkan awal baru. Panggil aku, dan aku akan jadi senjata pamungkasmu."'
  },
  abyss_boss: {
    title: 'ABYSS SOVEREIGN TERBELAH!',
    sub: 'Jurang menemukan cahaya',
    text: '"Di dalam jurang, aku mencari cahaya. Kau... adalah cahaya itu. Tentakel-ku akan melindungi galaksi bersamamu."'
  },
  nemesis_boss: {
    title: 'NEMESIS MENGAKUI!',
    sub: 'Bayangan menyatu dengan terang',
    text: '"Aku adalah bayanganmu yang terpisah. Sekarang, terangmu adalah milikku juga. Bersama, kita tak terkalahkan."'
  },
  abyss2_boss: {
    title: 'ABYSS² DIKALAHKAN!',
    sub: 'Lapisan terdalam telah sembuh',
    text: '"Bahkan lapisan terdalam pun bisa disembuhkan oleh keberanian. Aku Abyss², dan aku berdiri bersamamu."'
  },
  eternity_boss: {
    title: 'ETERNITY BERTEMU DAMAI!',
    sub: 'Awal dan akhir menjadi satu',
    text: '"Aku awal, aku akhir. Tapi kau... adalah teman di antara keduanya. Bintang-bintang purba akan menyertaimu selamanya."'
  }
};

// =============================================================
// V3. MODAL NARASI BOS
// =============================================================
function showBossRedemptionNarrative(heroId) {
  const hero = HERO_DATA[heroId];
  if (!hero) return;
  const narrative = BOSS_REDEMPTION_NARRATIVES[heroId] || {
    title: hero.name.toUpperCase() + ' DIKALAHKAN!',
    sub: 'Kegelapan sirna',
    text: '"Aku tersadar. Izinkan aku bergabung."'
  };

  const $ = id => document.getElementById(id);
  const titleEl = $('bn-title');
  const subEl = $('bn-sub');
  const narrEl = $('bn-narrative-text');
  const rewardName = $('bn-reward-name');
  const rewardIcon = $('bn-reward-icon');
  const villainSvg = $('bn-villain-svg');
  const heroSvg = $('bn-hero-svg');

  if (titleEl) titleEl.innerText = narrative.title;
  if (subEl) subEl.innerText = narrative.sub;
  if (narrEl) narrEl.innerText = narrative.text;
  if (rewardName) rewardName.innerText = hero.name;
  if (rewardIcon) {
    rewardIcon.innerHTML = `<svg viewBox="0 0 40 40"><use href="#i-${heroId}"/></svg>`;
  }
  if (villainSvg) villainSvg.innerHTML = `<use href="#i-${heroId}"/>`;
  if (heroSvg) heroSvg.innerHTML = `<use href="#i-${currentActor || 'robot'}"/>`;

  const modal = $('modal-boss-narrative');
  if (modal) modal.classList.remove('hidden');
  try { sounds.playUnlock(); } catch(e) {}
  try { triggerVibrate([100, 50, 100, 50, 300]); } catch(e) {}
  triggerScreenFlash(0.7);
}

// =============================================================
// V4. HOOK — Level Complete → chain narasi bos → unlock zona
// =============================================================
const _origLevelComplete23 = levelComplete;
levelComplete = async function() {
  const lvl = (levelsData[currentLevelIndex] || {}).level || 0;

  // Cek villain unlock dari bos
  const villainId = VILLAIN_HERO_FROM_BOSS[lvl];
  let villainUnlocked = false;
  if (villainId && !isHeroUnlocked(villainId)) {
    await unlockHero(villainId);
    villainUnlocked = true;
    console.log('🎉 [Villain Unlock]', villainId);
  }

  // Cek zona baru
  let zoneUnlockedId = null;
  if (lvl > 0 && lvl % 10 === 0 && lvl < 50) {
    const nextZoneId = Math.floor(lvl / 10) + 1;
    if (!isZoneUnlocked(nextZoneId)) {
      unlockedZones.push(nextZoneId);
      await saveUnlockedZones();
      zoneUnlockedId = nextZoneId;
      console.log('🌌 [Zone Unlock]', nextZoneId);
    }
  }
  if (lvl === 50 && !isZoneUnlocked(5)) {
    unlockedZones.push(5);
    await saveUnlockedZones();
    zoneUnlockedId = 5;
  }

  // Panggil original (tampilkan result + narrative)
  await _origLevelComplete23.call(this);

  // Setelah result modal & narrative story, tampilkan boss redemption + zone unlock
  setTimeout(() => {
    if (villainUnlocked) {
      // Tutup result modal dulu
      const resultModal = document.getElementById('modal-result');
      if (resultModal) resultModal.classList.add('hidden');
      showBossRedemptionNarrative(villainId);
      // Chain ke zone setelah boss narrative
      if (zoneUnlockedId) {
        const origOk = document.getElementById('btn-boss-narrative-ok');
        if (origOk) {
          const origHandler = origOk.onclick;
          origOk.onclick = () => {
            if (origHandler) origHandler();
            setTimeout(() => showZoneUnlockModal(zoneUnlockedId), 400);
            origOk.onclick = origHandler;
          };
        }
      }
    } else if (zoneUnlockedId) {
      setTimeout(() => showZoneUnlockModal(zoneUnlockedId), 300);
    }
  }, 800);
};

// =============================================================
// V5. HOOK BUTTON — Terima narasi bos
// =============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const btnOk = document.getElementById('btn-boss-narrative-ok');
    if (btnOk) {
      btnOk.addEventListener('click', () => {
        const modal = document.getElementById('modal-boss-narrative');
        if (modal) modal.classList.add('hidden');
        try { sounds.playPowerup(); } catch(e) {}
        updateActorGridUI();
        // Tampilkan result modal kembali
        const resultModal = document.getElementById('modal-result');
        if (resultModal && !resultModal.classList.contains('hidden')) {
          // Sudah tampil, biarkan
        } else if (resultModal) {
          resultModal.classList.remove('hidden');
        }
      });
    }
  }, 1000);
});

// =============================================================
// V6. ZONA DRAMATIC — Enhancement ambient effects
// =============================================================
// Override initZoneParticles untuk lebih dramatis
const _origInitZoneParticles = initZoneParticles;
initZoneParticles = function(zone) {
  _origInitZoneParticles.call(this, zone);
  if (!zone || !VIRTUAL_WIDTH) return;
  const W = VIRTUAL_WIDTH, H = VIRTUAL_HEIGHT;

  // Extra ambient based on zone
  if (zone.id === 1) {
    // BUMI — lightning + birds silhoutte
    for (let i = 0; i < 2; i++) {
      zoneBackgroundParticles.push({
        type: 'lightning', x: Math.random() * W, y: 0,
        life: 0, delay: Math.random() * 6,
        bolts: []
      });
    }
  } else if (zone.id === 2) {
    // LUAR ANGKASA — asteroid field
    for (let i = 0; i < 8; i++) {
      zoneBackgroundParticles.push({
        type: 'asteroid',
        x: Math.random() * W, y: Math.random() * H * 0.7,
        size: 6 + Math.random() * 14,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.03,
        vx: -0.3 - Math.random() * 0.4,
        vy: 0.1 + Math.random() * 0.2
      });
    }
  } else if (zone.id === 3) {
    // GALAKSI — nebula clouds swirling
    for (let i = 0; i < 3; i++) {
      zoneBackgroundParticles.push({
        type: 'nebula_swirl',
        x: W * (0.2 + i * 0.3), y: H * (0.3 + Math.random() * 0.3),
        size: 80 + Math.random() * 60,
        phase: Math.random() * Math.PI * 2,
        color: ['#c86bff', '#ff2e88', '#7a2bb8'][i]
      });
    }
  } else if (zone.id === 4) {
    // SELURUH ALAM — dimensional glitch
    for (let i = 0; i < 5; i++) {
      zoneBackgroundParticles.push({
        type: 'glitch',
        x: Math.random() * W, y: Math.random() * H * 0.7,
        w: 40 + Math.random() * 60,
        h: 4 + Math.random() * 8,
        life: 0, delay: Math.random() * 5
      });
    }
  } else if (zone.id === 5) {
    // BIMA SAKTI — gravitational lensing rings
    for (let i = 0; i < 2; i++) {
      zoneBackgroundParticles.push({
        type: 'lens_ring',
        x: W * 0.5, y: H * 0.15,
        radius: 100 + i * 40,
        phase: 0, speed: 0.02 + i * 0.01
      });
    }
  }
};

// Override drawing untuk efek tambahan
const _origDrawZoneLiving = drawZoneLiving;
drawZoneLiving = function(ctx, W, H, zone) {
  _origDrawZoneLiving.call(this, ctx, W, H, zone);
  const t = zoneAmbientTime;

  // Extra effects
  zoneBackgroundParticles.forEach(p => {
    if (p.type === 'lightning') {
      p.delay -= 0.016;
      if (p.delay > 0) return;
      if (!p.bolts || p.bolts.length === 0) {
        // Generate bolts
        p.bolts = [];
        let bx = p.x, by = 0;
        const targetY = H * 0.7;
        while (by < targetY) {
          p.bolts.push({ x: bx, y: by });
          bx += (Math.random() - 0.5) * 30;
          by += 20 + Math.random() * 20;
        }
        p.bolts.push({ x: bx, y: by });
      }
      p.life += 0.05;
      if (p.life > 1) { p.life = 0; p.bolts = []; p.delay = 5 + Math.random() * 8; return; }
      ctx.save();
      ctx.globalAlpha = 1 - p.life;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      p.bolts.forEach((pt, i) => { i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); });
      ctx.stroke();
      ctx.restore();
    } else if (p.type === 'asteroid') {
      p.x += p.vx; p.y += p.vy;
      p.rot += p.rotSpd;
      if (p.x < -30) p.x = W + 30;
      if (p.y > H + 30) p.y = -30;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = 'rgba(120,110,100,0.7)';
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const r = p.size * (0.75 + Math.random() * 0.25);
        i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'nebula_swirl') {
      p.phase += 0.008;
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(p.phase) * 0.05;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'glitch') {
      p.delay -= 0.016;
      if (p.delay > 0) return;
      p.life += 0.1;
      if (p.life > 1) { p.life = 0; p.delay = 2 + Math.random() * 4; return; }
      ctx.save();
      ctx.globalAlpha = 1 - p.life;
      ctx.fillStyle = ['#ff00ff', '#00ffff', '#ffffff'][Math.floor(Math.random() * 3)];
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.restore();
    } else if (p.type === 'lens_ring') {
      p.phase += p.speed;
      const scale = 1 + Math.sin(p.phase) * 0.08;
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radius * scale, p.radius * 0.32 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  });

  // Vignette dramatis
  const vig = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.7, 'rgba(0,0,0,0.15)');
  vig.addColorStop(1, `rgba(0,0,0,${0.4 + Math.sin(t * 0.5) * 0.05})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
};

// =============================================================
// V7. ZONA INTRO CINEMATIC
// =============================================================
const _origStartCurrentLevel23 = startCurrentLevel;
startCurrentLevel = async function() {
  const lvl = (levelsData[currentLevelIndex] || { level: 1 }).level || 1;
  const prevLvl = lvl - 1;

  // Deteksi jika masuk zona baru (level 1, 11, 21, 31, 41)
  const isZoneEntry = [1, 11, 21, 31, 41].includes(lvl);
  if (isZoneEntry) {
    const zone = getZoneByLevel(lvl);
    showZoneEntryCinematic(zone);
    await new Promise(r => setTimeout(r, 2600));
  }

  await _origStartCurrentLevel23.call(this);
};

function showZoneEntryCinematic(zone) {
  const banner = document.getElementById('level-intro');
  if (!banner) return;
  const numEl = document.getElementById('level-intro-number');
  const nameEl = document.getElementById('level-intro-name');
  const missionEl = document.getElementById('level-intro-mission');
  if (numEl) numEl.innerText = '✦';
  if (nameEl) nameEl.innerText = zone.name;
  if (missionEl) missionEl.innerText = zone.subtitle.toUpperCase() + ' — ' + zone.description.slice(0, 40) + '...';
  banner.classList.remove('hidden');
  banner.classList.remove('fade-out');
  banner.classList.remove('stage-clear');
  banner.classList.add('boss-approach');
  void banner.offsetWidth;
  try { sounds.playBossWarning(); } catch(e) {}
  try { triggerVibrate([200, 100, 200]); } catch(e) {}
  triggerScreenFlash(0.8);
  setTimeout(() => {
    banner.classList.add('fade-out');
    banner.classList.remove('boss-approach');
    setTimeout(() => banner.classList.add('hidden'), 500);
  }, 2400);
}

// =============================================================
// V8. SCARIER BOSS SPRITES — Redesign drawBossUniqueShape
// =============================================================
const _origDrawBossUniqueShape = drawBossUniqueShape;
drawBossUniqueShape = function(ctx, m, S, theme, bossNum) {
  const size = m.size;
  const t = m.timeAlive || 0;
  const coreOpen = m.coreOpen;
  const rot = m.aura || 0;

  // Menacing aura for all bosses
  ctx.save();
  const auraPulse = 0.85 + Math.sin(t * 4) * 0.15;
  const auraGrad = ctx.createRadialGradient(0, 0, size * 0.7, 0, 0, size * 1.4 * auraPulse);
  auraGrad.addColorStop(0, 'rgba(255,0,60,0)');
  auraGrad.addColorStop(0.5, 'rgba(255,0,60,0.15)');
  auraGrad.addColorStop(1, 'rgba(255,0,60,0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.4 * auraPulse, 0, Math.PI * 2);
  ctx.fill();

  // Angry eyes glow for all bosses
  ctx.save();
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 12 + Math.sin(t * 6) * 4;
  ctx.fillStyle = '#ff2200';
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.15, size * 0.06, 0, Math.PI * 2);
  ctx.arc(size * 0.3, -size * 0.15, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // Call original for base shape
  _origDrawBossUniqueShape.call(this, ctx, m, S, theme, bossNum);

  // Add menacing scars/cracks overlay
  ctx.save();
  ctx.globalAlpha = 0.4 + Math.sin(t * 3) * 0.15;
  ctx.strokeStyle = '#ff2200';
  ctx.lineWidth = 2 * S;
  ctx.lineCap = 'round';
  // Jagged crack pattern
  for (let i = 0; i < 3; i++) {
    const a = (t * 0.5 + i * 2.1) % (Math.PI * 2);
    const startR = size * 0.4;
    const endR = size * 0.95;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * startR, Math.sin(a) * startR);
    for (let s = 1; s <= 4; s++) {
      const mid = startR + (endR - startR) * (s / 4);
      const jitter = (Math.random() - 0.5) * size * 0.15;
      ctx.lineTo(Math.cos(a) * mid + jitter, Math.sin(a) * mid + jitter);
    }
    ctx.stroke();
  }
  ctx.restore();
};

// =============================================================
// V9. UPDATE ACTOR GRID — 30 hero dengan bagian terpisah
// =============================================================
const _origUpdateActorGridUI = updateActorGridUI;
updateActorGridUI = function() {
  _origUpdateActorGridUI.call(this);
  // Ensure all 30 cards show correct state
  document.querySelectorAll('.actor-card').forEach(card => {
    const heroId = card.dataset.actor;
    if (!heroId) return;
    const unlocked = isHeroUnlocked(heroId);
    card.classList.toggle('locked', !unlocked);
    card.classList.toggle('unlocked', unlocked);
    // Mark villain heroes
    if (HERO_DATA[heroId] && HERO_DATA[heroId].isVillain) {
      card.classList.add('villain-hero');
    }
  });
};

console.log('✅ [game.js] v23.0.0 — IMMERSIVE EDITION LOADED');

// =============================================================
// PAHLAWAN BINTANG — game.js v23.0.0 — PART 7/7 (FINAL)
// 20 HERO VISUAL + 20 BULLET SPAWNERS + 20 BULLET DRAW + TABS
// =============================================================

// =============================================================
// W1. DRAW HERO — 20 HERO BARU (appended to drawHeroVector)
// =============================================================
const _origDrawHeroVector = drawHeroVector;
drawHeroVector = function(ctx, x, y, type, isRemote) {
  // Cek hero baru dulu
  if (HERO_DATA[type] && (HERO_DATA[type].isVillain || MINION_HEROES.includes(type))) {
    drawNewHeroVector(ctx, x, y, type, isRemote);
    return;
  }
  _origDrawHeroVector.call(this, ctx, x, y, type, isRemote);
};

function drawNewHeroVector(ctx, x, y, type, isRemote) {
  const hero = HERO_DATA[type] || HERO_DATA.robot;
  const S = GAME_SCALE;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(S, S);
  if (isRemote) ctx.globalAlpha = 0.85;

  const rageMode = !isRemote && lives === 1 && playerHitPoints === 1;

  // ==================== VILLAIN HEROES (10) ====================

  // ---- INFERNO (bos 5) ----
  if (type === 'inferno_boss') {
    // Aura api
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 34);
    auraGrad.addColorStop(0, 'rgba(255,60,0,0.5)');
    auraGrad.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 34 + Math.sin(playerPulse*4)*3, 0, Math.PI*2); ctx.fill();
    // Body
    ctx.fillStyle = '#3a0a00';
    ctx.beginPath();
    ctx.moveTo(0, -26); ctx.lineTo(20, 18); ctx.lineTo(-20, 18);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ff2200'; ctx.lineWidth = 2.5; ctx.stroke();
    // Inner flame
    ctx.fillStyle = '#ff6b00';
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(12, 12); ctx.lineTo(-12, 12);
    ctx.closePath(); ctx.fill();
    // Eyes
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-7, -6, 2.5, 0, Math.PI*2);
    ctx.arc(7, -6, 2.5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Horns
    ctx.fillStyle = '#ff2200';
    ctx.beginPath(); ctx.moveTo(-16, -18); ctx.lineTo(-20, -30); ctx.lineTo(-10, -22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(16, -18); ctx.lineTo(20, -30); ctx.lineTo(10, -22); ctx.closePath(); ctx.fill();
    // Flame crown
    ctx.fillStyle = 'rgba(255,140,0,' + (0.6 + Math.sin(playerPulse*6)*0.3) + ')';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i*8 - 3, -26);
      ctx.lineTo(i*8, -40 - Math.sin(playerPulse*8 + i)*4);
      ctx.lineTo(i*8 + 3, -26);
      ctx.closePath(); ctx.fill();
    }
  }

  // ---- VOID LORD (bos 10) ----
  else if (type === 'void_boss') {
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 32);
    auraGrad.addColorStop(0, 'rgba(200,107,255,0.55)');
    auraGrad.addColorStop(1, 'rgba(200,107,255,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 32 + Math.sin(playerPulse*3)*3, 0, Math.PI*2); ctx.fill();
    // Spiral arms
    ctx.strokeStyle = 'rgba(255,119,255,0.6)';
    ctx.lineWidth = 2;
    for (let arm = 0; arm < 3; arm++) {
      ctx.beginPath();
      const aOff = (Math.PI*2/3) * arm + playerPulse * 0.3;
      for (let i = 0; i < 15; i++) {
        const a = (i/15) * Math.PI * 1.4 + aOff;
        const r = 5 + i * 1.6;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // Void core
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#c86bff'; ctx.lineWidth = 2; ctx.stroke();
    // Core eye
    ctx.fillStyle = '#c86bff';
    ctx.shadowColor = '#c86bff'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ---- CRYO EMPEROR (bos 15) ----
  else if (type === 'cryo_boss') {
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
    auraGrad.addColorStop(0, 'rgba(77,232,255,0.5)');
    auraGrad.addColorStop(1, 'rgba(77,232,255,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(playerPulse*3)*2, 0, Math.PI*2); ctx.fill();
    // Ice crystal spikes
    ctx.fillStyle = '#4de8ff';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI*2/6) * i - Math.PI/2;
      const r = 20;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a-0.15)*8, Math.sin(a-0.15)*8);
      ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      ctx.lineTo(Math.cos(a+0.15)*8, Math.sin(a+0.15)*8);
      ctx.closePath(); ctx.fill();
    }
    // Body
    ctx.fillStyle = '#001a3a';
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#4de8ff'; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-5, -2, 2.5, 0, Math.PI*2);
    ctx.arc(5, -2, 2.5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ---- TITAN PRIME (bos 20) ----
  else if (type === 'titan_boss') {
    const auraGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 32);
    auraGrad.addColorStop(0, 'rgba(26,188,156,0.45)');
    auraGrad.addColorStop(1, 'rgba(26,188,156,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI*2); ctx.fill();
    // Armor body
    ctx.fillStyle = '#2c2c54';
    ctx.fillRect(-16, -14, 32, 28);
    ctx.fillStyle = '#1abc9c';
    ctx.fillRect(-12, -10, 24, 8);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-16, 8, 32, 4);
    ctx.fillRect(-22, -8, 6, 18);
    ctx.fillRect(16, -8, 6, 18);
    // Glowing core
    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(0, 2, 5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // Eyes
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(-8, -6, 4, 2);
    ctx.fillRect(4, -6, 4, 2);
  }

  // ---- SOLAR WRAITH (bos 25) ----
  else if (type === 'solar_boss') {
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 34);
    auraGrad.addColorStop(0, 'rgba(255,170,0,0.6)');
    auraGrad.addColorStop(1, 'rgba(255,170,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 34 + Math.sin(playerPulse*5)*3, 0, Math.PI*2); ctx.fill();
    // Solar rays
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI*2/12) * i + playerPulse * 0.4;
      const r1 = 18, r2 = 26 + Math.sin(playerPulse*6 + i)*3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*r1, Math.sin(a)*r1);
      ctx.lineTo(Math.cos(a)*r2, Math.sin(a)*r2);
      ctx.stroke();
    }
    // Body
    const bg = ctx.createRadialGradient(0, -4, 2, 0, 0, 18);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.4, '#ffd700');
    bg.addColorStop(0.8, '#ff6b00');
    bg.addColorStop(1, '#3a0a00');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-7, -2, 3, 0, Math.PI*2);
    ctx.arc(7, -2, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.arc(-7, -2, 1.2, 0, Math.PI*2);
    ctx.arc(7, -2, 1.2, 0, Math.PI*2);
    ctx.fill();
  }

  // ---- OMEGA (bos 30) ----
  else if (type === 'omega_boss') {
    // Multi-layer concentric
    for (let layer = 2; layer >= 0; layer--) {
      const r = 12 + layer * 8;
      const alpha = 0.4 + (2 - layer) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI/6)*i + playerPulse*0.3 + layer*0.3;
        const rr = i % 2 === 0 ? r : r * 0.65;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, '#ff0055');
      g.addColorStop(0.5, '#ffd700');
      g.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff0055'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ---- ABYSS SOVEREIGN (bos 35) ----
  else if (type === 'abyss_boss') {
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 34);
    auraGrad.addColorStop(0, 'rgba(139,0,255,0.6)');
    auraGrad.addColorStop(1, 'rgba(139,0,255,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 34 + Math.sin(playerPulse*4)*3, 0, Math.PI*2); ctx.fill();
    // Tentacles
    ctx.strokeStyle = '#8b00ff';
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const baseA = (Math.PI*2/6) * i + Math.sin(playerPulse*2 + i)*0.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(baseA)*12, Math.sin(baseA)*12);
      ctx.quadraticCurveTo(
        Math.cos(baseA)*22 + Math.sin(playerPulse*3 + i)*6,
        Math.sin(baseA)*22 + Math.cos(playerPulse*3 + i)*6,
        Math.cos(baseA)*30, Math.sin(baseA)*30
      );
      ctx.stroke();
    }
    // Body
    ctx.fillStyle = '#1a0033';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2; ctx.stroke();
    // Eyes
    ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(-5, -2, 3, 0, Math.PI*2);
    ctx.arc(5, -2, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-3, 8); ctx.lineTo(-2, 14); ctx.lineTo(-1, 8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(1, 8); ctx.lineTo(2, 14); ctx.lineTo(3, 8); ctx.closePath(); ctx.fill();
  }

  // ---- NEMESIS (bos 40) ----
  else if (type === 'nemesis_boss') {
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 34);
    auraGrad.addColorStop(0, 'rgba(255,34,0,0.5)');
    auraGrad.addColorStop(1, 'rgba(255,34,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI*2); ctx.fill();
    // Spikes crown
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.moveTo(-14, -14); ctx.lineTo(-18, -28); ctx.lineTo(-10, -18);
    ctx.lineTo(-5, -30); ctx.lineTo(0, -20);
    ctx.lineTo(5, -30); ctx.lineTo(10, -18);
    ctx.lineTo(18, -28); ctx.lineTo(14, -14);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.stroke();
    // Body
    ctx.fillStyle = '#3a0000';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ff2200'; ctx.lineWidth = 2.5; ctx.stroke();
    // Angry eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-7, -2, 4.5, 0, Math.PI*2);
    ctx.arc(7, -2, 4.5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowColor = '#ff2200'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.arc(-7, -2, 2, 0, Math.PI*2);
    ctx.arc(7, -2, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Mouth
    ctx.strokeStyle = '#ff2200'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, 8); ctx.lineTo(6, 8);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(-4 + i*2.7, i % 2 === 0 ? 12 : 8);
    }
    ctx.stroke();
  }

  // ---- ABYSS² (bos 45) ----
  else if (type === 'abyss2_boss') {
    // Double ring
    for (let ring = 0; ring < 2; ring++) {
      const r = 20 + ring * 6;
      ctx.globalAlpha = 0.7 - ring * 0.3;
      ctx.strokeStyle = ring === 0 ? '#8b00ff' : '#ff00ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash(ring === 0 ? [] : [6, 4]);
      ctx.lineDashOffset = -playerPulse * 2;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    ctx.globalAlpha = 1;
    // Inner void
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
    g.addColorStop(0, '#000000');
    g.addColorStop(0.7, '#3d0066');
    g.addColorStop(1, '#8b00ff');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2; ctx.stroke();
    // Double eyes
    ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(-5, -3, 2.5, 0, Math.PI*2);
    ctx.arc(5, -3, 2.5, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-5, 4, 1.5, 0, Math.PI*2);
    ctx.arc(5, 4, 1.5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ---- ETERNITY (bos 50) ----
  else if (type === 'eternity_boss') {
    // Massive golden aura
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
    auraGrad.addColorStop(0, 'rgba(255,215,0,0.6)');
    auraGrad.addColorStop(0.5, 'rgba(255,140,0,0.3)');
    auraGrad.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, 40 + Math.sin(playerPulse*3)*4, 0, Math.PI*2); ctx.fill();
    // Wings
    ctx.fillStyle = 'rgba(255,215,0,0.65)';
    for (let w = -1; w <= 1; w += 2) {
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(w*30, -25, w*28, -2);
      ctx.quadraticCurveTo(w*32, 12, w*20, 16);
      ctx.quadraticCurveTo(w*15, 5, 0, 8);
      ctx.closePath(); ctx.fill();
    }
    // Body
    const g = ctx.createRadialGradient(0, -4, 2, 0, 0, 20);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, '#ffd700');
    g.addColorStop(0.8, '#ff8a00');
    g.addColorStop(1, '#3a1500');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; ctx.stroke();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-7, -2, 3.5, 0, Math.PI*2);
    ctx.arc(7, -2, 3.5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -2, 1.5, 0, Math.PI*2);
    ctx.arc(7, -2, 1.5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Crown
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    for (let i = -2; i <= 2; i++) {
      ctx.moveTo(i*5 - 3, -20);
      ctx.lineTo(i*5, -30 - Math.abs(i)*2);
      ctx.lineTo(i*5 + 3, -20);
    }
    ctx.fill();
  }

  // ==================== MINION HEROES (10) ====================

  // ---- JELLY BOUNCER ----
  else if (type === 'jelly_hero') {
    const bounce = Math.abs(Math.sin(playerPulse * 3)) * 3;
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.ellipse(0, -bounce, 16, 14 - bounce * 0.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-4, -bounce - 4, 5, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -bounce + 2, 2, 0, Math.PI*2);
    ctx.arc(5, -bounce + 2, 2, 0, Math.PI*2);
    ctx.fill();
  }

  // ---- DONUT ROLLER ----
  else if (type === 'donut_hero') {
    ctx.save();
    ctx.rotate(playerPulse * 0.15);
    ctx.fillStyle = '#fa8231';
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff78ae';
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
    // Sprinkles
    const sprinkleColors = ['#ffffff', '#ffd700', '#00d2d3', '#a55eea'];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI*2/8) * i;
      ctx.fillStyle = sprinkleColors[i % 4];
      ctx.fillRect(Math.cos(a)*10 - 1.5, Math.sin(a)*10 - 0.75, 3, 1.5);
    }
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ---- CLOUD PUFF ----
  else if (type === 'cloud_hero') {
    const puff = Math.sin(playerPulse * 2) * 1.5;
    ctx.fillStyle = '#f1f2f6';
    ctx.beginPath();
    ctx.arc(-10, 0, 12 + puff, 0, Math.PI*2);
    ctx.arc(10, 0, 12 + puff, 0, Math.PI*2);
    ctx.arc(0, -8, 14 + puff, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#70a1ff';
    ctx.beginPath();
    ctx.arc(-5, -2, 2.5, 0, Math.PI*2);
    ctx.arc(5, -2, 2.5, 0, Math.PI*2);
    ctx.fill();
  }

  // ---- CRYSTAL SHARD ----
  else if (type === 'crystal_hero') {
    ctx.save();
    ctx.rotate(playerPulse * 0.08);
    const g = ctx.createLinearGradient(0, -22, 0, 22);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#00d2d3');
    g.addColorStop(1, '#006666');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(14, -6);
    ctx.lineTo(8, 20);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-14, -6);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
    // Facets
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -22); ctx.lineTo(0, 20);
    ctx.moveTo(-14, -6); ctx.lineTo(14, -6);
    ctx.stroke();
    ctx.restore();
  }

  // ---- SPLIT BOMB ----
  else if (type === 'splitter_hero') {
    ctx.fillStyle = '#ff7f50';
    ctx.beginPath(); ctx.arc(-8, 0, 11, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, 0, 11, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(-8, -2, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -2, 3, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#05061a'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -8); ctx.lineTo(8, -8);
    ctx.moveTo(0, -14); ctx.lineTo(0, 6);
    ctx.stroke();
  }

  // ---- TRI DASH ----
  else if (type === 'triangle_hero') {
    ctx.save();
    ctx.rotate(Math.sin(playerPulse * 3) * 0.15);
    const g = ctx.createLinearGradient(0, -22, 0, 18);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, '#ffa502');
    g.addColorStop(1, '#8a5500');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(20, 18);
    ctx.lineTo(-20, 18);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-6, 0, 2, 0, Math.PI*2);
    ctx.arc(6, 0, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // ---- HEX TANK ----
  else if (type === 'hexagon_hero') {
    ctx.save();
    ctx.rotate(playerPulse * 0.05);
    const g = ctx.createRadialGradient(-6, -6, 3, 0, 0, 24);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, '#1e90ff');
    g.addColorStop(1, '#003a6a');
    ctx.fillStyle = g;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI*2/6)*i - Math.PI/2;
      const px = Math.cos(a) * 22;
      const py = Math.sin(a) * 22;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
    // Center
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ---- STAR SHOOTER ----
  else if (type === 'star_enemy_hero') {
    ctx.save();
    ctx.rotate(playerPulse * 0.1);
    const g = ctx.createRadialGradient(0, 0, 3, 0, 0, 22);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#ffd700');
    g.addColorStop(1, '#8a6a00');
    ctx.fillStyle = g;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI/5)*i - Math.PI/2;
      const r = i % 2 === 0 ? 22 : 10;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-4, -1, 1.8, 0, Math.PI*2);
    ctx.arc(4, -1, 1.8, 0, Math.PI*2);
    ctx.fill();
  }

  // ---- DIAMOND BLAST ----
  else if (type === 'diamond_hero') {
    ctx.save();
    ctx.rotate(Math.sin(playerPulse * 2) * 0.08);
    const g = ctx.createLinearGradient(0, -22, 0, 22);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, '#70a1ff');
    g.addColorStop(1, '#003a8a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(16, 0);
    ctx.lineTo(0, 22);
    ctx.lineTo(-16, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    // Inner diamond
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-8, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---- WORM TUNNEL ----
  else if (type === 'worm_hero') {
    // Body segments
    for (let i = 2; i >= 0; i--) {
      const segX = Math.sin(playerPulse * 2 + i * 0.5) * 4;
      const segY = i * 10 - 8;
      const segR = 10 - i * 1.5;
      const g = ctx.createRadialGradient(segX - segR*0.3, segY - segR*0.3, segR*0.1, segX, segY, segR);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.4, '#a55eea');
      g.addColorStop(1, '#3d0060');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(segX, segY, segR, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // Head
    const headG = ctx.createRadialGradient(-4, -12, 2, 0, -10, 14);
    headG.addColorStop(0, '#ffffff');
    headG.addColorStop(0.5, '#ff77ff');
    headG.addColorStop(1, '#3d0060');
    ctx.fillStyle = headG;
    ctx.beginPath(); ctx.arc(0, -12, 14, 0, Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -14, 2.5, 0, Math.PI*2);
    ctx.arc(5, -14, 2.5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(-5, -14, 1.2, 0, Math.PI*2);
    ctx.arc(5, -14, 1.2, 0, Math.PI*2);
    ctx.fill();
  }

  // Shared overlays
  if (rageMode) {
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(playerPulse * 3) * 0.15;
    ctx.fillStyle = 'rgba(255, 0, 60, 0.4)';
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI*2); ctx.fill();
    ctx.restore();
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
// W2. SPAWN BULLETS — 20 tipe bullet baru
// =============================================================
const _origSpawnHeroBullets = spawnHeroBullets;
spawnHeroBullets = function(heroId, originX, originY, targetDir, owner) {
  const hero = HERO_DATA[heroId];
  if (!hero) return _origSpawnHeroBullets.call(this, heroId, originX, originY, targetDir, owner);

  const S = GAME_SCALE;
  const bt = hero.bulletType;
  const size = hero.bulletSize * S;
  const speed = hero.bulletSpeed * S;
  const pierce = hero.bulletPierce;
  const bulletsToAdd = [];

  const handleNew = (() => {
    switch (bt) {
      // ============ VILLAIN BULLETS ============
      case 'inferno-meteor':
        for (let i = -1; i <= 1; i++) {
          bulletsToAdd.push({
            x: originX + i * 12 * S, y: originY,
            vx: i * 2 * S, vy: speed,
            color: i === 0 ? '#ffd700' : '#ff2200',
            heroType: heroId, size: size + (i === 0 ? 2 : 0),
            pierce: pierce, owner
          });
        }
        break;
      case 'void-rift':
        bulletsToAdd.push({
          x: originX - 8 * S, y: originY, vx: 0, vy: speed,
          color: '#c86bff', heroType: heroId, size: size + 3, pierce: 3, owner
        });
        bulletsToAdd.push({
          x: originX + 8 * S, y: originY, vx: 0, vy: speed,
          color: '#ff77ff', heroType: heroId, size: size - 2, pierce: 1, owner
        });
        break;
      case 'cryo-shatter':
        for (let i = 0; i < 4; i++) {
          const a = (i - 1.5) * 0.18;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.sin(a) * speed * 0.9,
            vy: Math.cos(a) * speed,
            color: i % 2 === 0 ? '#4de8ff' : '#ffffff',
            heroType: heroId, size, pierce, owner
          });
        }
        break;
      case 'titan-quake':
        bulletsToAdd.push({
          x: originX, y: originY, vx: 0, vy: speed,
          color: '#1abc9c', heroType: heroId, size: size + 4, pierce: 4, owner
        });
        break;
      case 'solar-flare':
        for (let i = -2; i <= 2; i++) {
          const a = i * 0.22;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.sin(a) * speed,
            vy: Math.cos(a) * speed,
            color: i === 0 ? '#ffffff' : '#ffaa00',
            heroType: heroId, size: i === 0 ? size + 2 : size,
            pierce, owner
          });
        }
        break;
      case 'omega-beam':
        for (let i = -1; i <= 1; i++) {
          bulletsToAdd.push({
            x: originX + i * 10 * S, y: originY,
            vx: i * 1.5 * S, vy: speed,
            color: i === 0 ? '#ffffff' : '#ff0055',
            heroType: heroId, size, pierce: 5, owner
          });
        }
        break;
      case 'abyss-tendril':
        for (let i = 0; i < 6; i++) {
          const a = (i - 2.5) * 0.2;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.sin(a) * speed,
            vy: Math.cos(a) * speed,
            color: i % 2 === 0 ? '#8b00ff' : '#ff00ff',
            heroType: heroId, size, pierce, owner
          });
        }
        break;
      case 'nemesis-spiral':
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.cos(angle) * speed * 0.7,
            vy: Math.abs(Math.sin(angle)) * speed * 0.9 + speed * 0.4,
            color: i % 2 === 0 ? '#ff2200' : '#ffd700',
            heroType: heroId, size, pierce, owner
          });
        }
        break;
      case 'abyss2-void':
        for (let i = -2; i <= 2; i++) {
          const a = i * 0.24;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.sin(a) * speed,
            vy: Math.cos(a) * speed,
            color: i === 0 ? '#ff00ff' : '#8b00ff',
            heroType: heroId, size, pierce: 3, owner
          });
        }
        break;
      case 'eternity-star':
        for (let i = -3; i <= 3; i++) {
          const a = i * 0.16;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.sin(a) * speed,
            vy: Math.cos(a) * speed,
            color: i === 0 ? '#ffffff' : '#ffd700',
            heroType: heroId, size: i === 0 ? size + 3 : size,
            pierce: 4, owner
          });
        }
        break;

      // ============ MINION BULLETS ============
      case 'jelly-bounce':
        for (let i = -1; i <= 1; i++) {
          bulletsToAdd.push({
            x: originX + i * 8 * S, y: originY,
            vx: i * 1.5 * S, vy: speed,
            color: '#ff4757', heroType: heroId, size, pierce, owner,
            wobble: i * 0.5
          });
        }
        break;
      case 'donut-spiral':
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.cos(a) * speed * 0.5,
            vy: speed,
            color: i % 2 === 0 ? '#fa8231' : '#ff78ae',
            heroType: heroId, size, pierce, owner
          });
        }
        break;
      case 'cloud-puff':
        for (let i = -1; i <= 1; i++) {
          bulletsToAdd.push({
            x: originX + i * 10 * S, y: originY,
            vx: i * 1 * S, vy: speed * 0.85,
            color: '#f1f2f6', heroType: heroId, size: size + 2, pierce, owner
          });
        }
        break;
      case 'crystal-shard':
        bulletsToAdd.push({
          x: originX - 6 * S, y: originY, vx: -0.5 * S, vy: speed,
          color: '#00d2d3', heroType: heroId, size, pierce: 2, owner
        });
        bulletsToAdd.push({
          x: originX + 6 * S, y: originY, vx: 0.5 * S, vy: speed,
          color: '#ffffff', heroType: heroId, size, pierce: 2, owner
        });
        break;
      case 'split-bullet':
        bulletsToAdd.push({
          x: originX, y: originY, vx: 0, vy: speed,
          color: '#ff7f50', heroType: heroId, size: size + 3, pierce: 1, owner,
          canSplit: true
        });
        break;
      case 'tri-zigzag':
        for (let i = -1; i <= 1; i++) {
          bulletsToAdd.push({
            x: originX + i * 8 * S, y: originY,
            vx: i * 2 * S, vy: speed,
            color: '#ffa502', heroType: heroId, size, pierce, owner,
            zigzag: i !== 0
          });
        }
        break;
      case 'hex-heavy':
        bulletsToAdd.push({
          x: originX - 10 * S, y: originY, vx: 0, vy: speed,
          color: '#1e90ff', heroType: heroId, size: size + 2, pierce: 3, owner
        });
        bulletsToAdd.push({
          x: originX + 10 * S, y: originY, vx: 0, vy: speed,
          color: '#70a1ff', heroType: heroId, size: size - 2, pierce: 3, owner
        });
        break;
      case 'star-cross':
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          bulletsToAdd.push({
            x: originX, y: originY,
            vx: Math.cos(a) * speed * 0.6,
            vy: Math.abs(Math.sin(a)) * speed + speed * 0.3,
            color: i % 2 === 0 ? '#ffd700' : '#ffffff',
            heroType: heroId, size, pierce, owner
          });
        }
        break;
      case 'diamond-richochet':
        bulletsToAdd.push({
          x: originX - 8 * S, y: originY, vx: -1.5 * S, vy: speed,
          color: '#70a1ff', heroType: heroId, size, pierce: 2, owner,
          richochet: true
        });
        bulletsToAdd.push({
          x: originX + 8 * S, y: originY, vx: 1.5 * S, vy: speed,
          color: '#ffffff', heroType: heroId, size, pierce: 2, owner,
          richochet: true
        });
        break;
      case 'worm-multi':
        for (let i = 0; i < 3; i++) {
          bulletsToAdd.push({
            x: originX, y: originY - i * 8 * S,
            vx: 0, vy: speed * (1 - i * 0.15),
            color: i === 0 ? '#ff77ff' : '#a55eea',
            heroType: heroId, size: size - i, pierce: 2, owner
          });
        }
        break;

      default: return false;
    }
    return true;
  })();

  if (!handleNew) {
    return _origSpawnHeroBullets.call(this, heroId, originX, originY, targetDir, owner);
  }
  bulletsToAdd.forEach(b => bullets.push(b));
  return bulletsToAdd.length;
};

// =============================================================
// W3. DRAW BULLET — 20 tipe bullet baru
// =============================================================
const _origDrawBullet = drawBullet;
drawBullet = function(ctx, b, S) {
  const hero = HERO_DATA[b.heroType];
  if (!hero) return _origDrawBullet.call(this, ctx, b, S);
  const isNew = hero.isVillain || MINION_HEROES.includes(b.heroType);

  if (!isNew) return _origDrawBullet.call(this, ctx, b, S);

  ctx.save();
  ctx.translate(b.x, b.y);
  const type = b.heroType;

  // Villain bullets — bigger, menacing
  if (type === 'inferno_boss') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 2);
    glow.addColorStop(0, 'rgba(255,255,255,0.9)');
    glow.addColorStop(0.4, 'rgba(255,215,0,0.8)');
    glow.addColorStop(0.7, 'rgba(255,100,0,0.5)');
    glow.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.6, 0, Math.PI*2); ctx.fill();
  } else if (type === 'void_boss') {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 1.8);
    g.addColorStop(0, '#000');
    g.addColorStop(0.4, '#3d0060');
    g.addColorStop(0.7, '#c86bff');
    g.addColorStop(1, 'rgba(200,107,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 1.8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#c86bff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.9, 0, Math.PI*2); ctx.stroke();
  } else if (type === 'cryo_boss') {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI/3)*i;
      const r = i % 2 === 0 ? b.size : b.size * 0.6;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (type === 'titan_boss') {
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00ffcc';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 3; ctx.stroke();
  } else if (type === 'solar_boss') {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 1.5);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.3, '#ffd700');
    g.addColorStop(0.7, '#ff6b00');
    g.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 1.5, 0, Math.PI*2); ctx.fill();
  } else if (type === 'omega_boss') {
    for (let layer = 1; layer >= 0; layer--) {
      ctx.globalAlpha = 0.5 + (1 - layer) * 0.5;
      ctx.fillStyle = layer === 0 ? '#ff0055' : '#ffd700';
      ctx.beginPath(); ctx.arc(0, 0, b.size * (1 - layer * 0.4), 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (type === 'abyss_boss') {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 1.6);
    g.addColorStop(0, '#ff00ff');
    g.addColorStop(0.5, '#8b00ff');
    g.addColorStop(1, 'rgba(139,0,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 1.6, 0, Math.PI*2); ctx.fill();
  } else if (type === 'nemesis_boss') {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI/3)*i + (b.rot || 0);
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, -b.size);
      ctx.lineTo(b.size * 0.3, -b.size * 0.3);
      ctx.lineTo(0, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.4, 0, Math.PI*2); ctx.fill();
  } else if (type === 'abyss2_boss') {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 1.8);
    g.addColorStop(0, '#000');
    g.addColorStop(0.4, '#ff00ff');
    g.addColorStop(0.7, '#8b00ff');
    g.addColorStop(1, 'rgba(139,0,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 1.8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 1.2, 0, Math.PI*2); ctx.stroke();
  } else if (type === 'eternity_boss') {
    ctx.save();
    ctx.rotate((b.rot = (b.rot || 0) + 0.2));
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 2);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.4, '#ffd700');
    g.addColorStop(0.8, '#ff8a00');
    g.addColorStop(1, 'rgba(255,138,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, b.size * 2, 0, Math.PI*2); ctx.fill();
    // Star cross
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI/2);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(b.size * 1.4, 0); ctx.stroke();
    }
    ctx.restore();
  }

  // Minion bullets — smaller, cute
  else if (type === 'jelly_hero') {
    const wobble = Math.sin((b.rot = (b.rot || 0) + 0.2) * 3) * 2;
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.ellipse(0, 0, b.size * (1 + wobble * 0.02), b.size * (1 - wobble * 0.02), 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  } else if (type === 'donut_hero') {
    ctx.save();
    ctx.rotate((b.rot = (b.rot || 0) + 0.3));
    ctx.fillStyle = '#fa8231';
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff78ae';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.25, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  } else if (type === 'cloud_hero') {
    ctx.fillStyle = 'rgba(241,242,246,0.85)';
    ctx.beginPath();
    ctx.arc(-b.size * 0.5, 0, b.size * 0.7, 0, Math.PI*2);
    ctx.arc(b.size * 0.5, 0, b.size * 0.7, 0, Math.PI*2);
    ctx.arc(0, -b.size * 0.3, b.size * 0.8, 0, Math.PI*2);
    ctx.fill();
  } else if (type === 'crystal_hero') {
    ctx.save();
    ctx.rotate((b.rot = (b.rot || 0) + 0.15));
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(0, -b.size);
    ctx.lineTo(b.size * 0.7, 0);
    ctx.lineTo(0, b.size);
    ctx.lineTo(-b.size * 0.7, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  } else if (type === 'splitter_hero') {
    ctx.fillStyle = '#ff7f50';
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-b.size, 0); ctx.lineTo(b.size, 0); ctx.stroke();
  } else if (type === 'triangle_hero') {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(0, -b.size);
    ctx.lineTo(b.size, b.size * 0.7);
    ctx.lineTo(-b.size, b.size * 0.7);
    ctx.closePath(); ctx.fill();
  } else if (type === 'hexagon_hero') {
    ctx.save();
    ctx.rotate((b.rot = (b.rot || 0) + 0.1));
    ctx.fillStyle = b.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI/3)*i;
      const px = Math.cos(a) * b.size;
      const py = Math.sin(a) * b.size;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, b.size * 0.4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  } else if (type === 'star_enemy_hero') {
    ctx.save();
    ctx.rotate((b.rot = (b.rot || 0) + 0.25));
    ctx.fillStyle = b.color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI/5)*i - Math.PI/2;
      const r = i % 2 === 0 ? b.size : b.size * 0.45;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (type === 'diamond_hero') {
    ctx.save();
    ctx.rotate((b.rot = (b.rot || 0) + 0.2));
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(0, -b.size);
    ctx.lineTo(b.size * 0.7, 0);
    ctx.lineTo(0, b.size);
    ctx.lineTo(-b.size * 0.7, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -b.size * 0.5);
    ctx.lineTo(b.size * 0.35, 0);
    ctx.lineTo(0, b.size * 0.5);
    ctx.lineTo(-b.size * 0.35, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (type === 'worm_hero') {
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  ctx.restore();
};

// =============================================================
// W4. ACTOR TABS + FILTER
// =============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const tabs = document.querySelectorAll('.actor-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat || 'all';
        document.querySelectorAll('.actor-card').forEach(card => {
          const cardCat = card.dataset.cat || 'starter';
          if (cat === 'all' || cardCat === cat) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
        try { sounds.playPop(); } catch(e) {}
      });
    });

    // Refresh setelah load
    setTimeout(updateActorGridUI, 500);
    console.log('✅ [Actor Tabs] Ready with 30 heroes');
  }, 1200);
});

// =============================================================
// W5. LOCK HERO — Cek apakah boleh quiz MTK atau via boss
// =============================================================
// Update click handler: villain hero TIDAK bisa di-unlock via MTK
const _origSetupEventListeners = setupEventListeners;
setupEventListeners = function() {
  _origSetupEventListeners.call(this);
  // Re-bind actor card clicks
  setTimeout(() => {
    document.querySelectorAll('.actor-card').forEach(card => {
      const heroId = card.dataset.actor;
      const isVillain = HERO_DATA[heroId] && HERO_DATA[heroId].isVillain;
      card.onclick = () => {
        if (!heroId) return;
        if (!isHeroUnlocked(heroId)) {
          if (isVillain) {
            // Villain: tunjukkan level boss yang harus dikalahkan
            const bossLevel = Object.entries(VILLAIN_HERO_FROM_BOSS).find(([l, id]) => id === heroId);
            const lvl = bossLevel ? bossLevel[0] : '?';
            alert(`⚔ "${HERO_DATA[heroId].name}" hanya bisa dibuka dengan mengalahkan Bos di Level ${lvl}!`);
            return;
          }
          // Minion/starter: quiz MTK
          startMathQuiz(heroId);
          return;
        }
        // Unlocked — select
        document.querySelectorAll('.actor-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentActor = heroId;
        DB.set('pahlawan_actor', currentActor);
        updateActorSelectionUI();
        trackHeroUsage(currentActor);
        try { sounds.playPowerup(); } catch(e) {}
      };
    });
  }, 1500);
};

// =============================================================
// W6. HOOK UNLOCK HERO → REFRESH UI
// =============================================================
const _origUnlockHero = unlockHero;
unlockHero = async function(heroId) {
  const result = await _origUnlockHero.call(this, heroId);
  if (result) {
    setTimeout(updateActorGridUI, 200);
    console.log('🎉 [Hero Unlocked]', heroId);
  }
  return result;
};

// =============================================================
// W7. UPDATE HERO USAGE → support villain & minion
// =============================================================
const _origTrackHeroUsage = trackHeroUsage;
trackHeroUsage = async function(heroId) {
  if (!heroId) return;
  if (!PLAYER_STATS.heroesUsed.includes(heroId)) {
    PLAYER_STATS.heroesUsed.push(heroId);
    await savePlayerStats();
    await checkAchievements();
    console.log('📊 [Hero Usage]', heroId, '| Total used:', PLAYER_STATS.heroesUsed.length);
  }
};

// =============================================================
// W8. UPDATE ACHIEVEMENT — hitung hero villain & minion juga
// =============================================================
// (existing heroesUsedCount tetap bekerja karena kita pakai array yang sama)

console.log('✅ [game.js] v23.0.0 — PART 7/7 COMPLETE — 30 HEROES READY');
