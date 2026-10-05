}

// =============================================================
// DATA CADANGAN (DEFAULT FALLBACK LEVEL) JIKA FETCH JSON GAGAL
// GENERATOR 30 LEVEL LENGKAP DENGAN 6 BOSS DAN VARIASI SKOR
// =============================================================
const DEFAULT_LEVELS = [
  { level: 1, targetKills: 10, targetScore: 1000, speed: 1.0, spawnRate: 1500, algorithm: "linear", types: ["jelly"] },
  { level: 2, targetKills: 15, targetScore: 2000, speed: 1.2, spawnRate: 1300, algorithm: "zigzag", types: ["jelly", "donut"] },
  { level: 3, targetKills: 20, targetScore: 3000, speed: 1.4, spawnRate: 1100, algorithm: "gravity", types: ["donut", "cloud"] },
  { level: 4, targetKills: 25, targetScore: 4000, speed: 1.6, spawnRate: 1000, algorithm: "stealth", types: ["cloud", "crystal"] },
  { level: 5, targetKills: 1,  targetScore: 5000, speed: 1.0, spawnRate: 2000, algorithm: "boss_10", types: ["boss10"] }
];
function generate30Levels() {
  const levels = [];
  const enemyTypesPool = ["jelly", "donut", "cloud", "crystal", "splitter"];
  const algorithmsPool = ["linear", "zigzag", "gravity", "stealth", "swarm", "splitter"];

  for (let i = 1; i <= 30; i++) {
    if (i % 5 === 0) {
      // LEVEL BOSS (5, 10, 15, 20, 25, 30)
      const bossNum = i / 5;
      const hpScale = [0, 150, 350, 600, 1000, 1500, 2500];
      levels.push({
        level: i,
        targetKills: 1,
        targetScore: i * 2000,
        speed: 1.0,
        spawnRate: 2000,
        algorithm: `boss_${i}`,
        types: [`boss${i}`],
        bossHp: hpScale[bossNum] || 150
      });
    } else {
      // LEVEL REGULER DENGAN VARIASI MUSUH & SKALASI KECEPATAN
      const availableTypes = enemyTypesPool.slice(0, Math.min( enemyTypesPool.length, Math.floor(i / 3) + 1));
      const chosenAlgo = algorithmsPool[(i - 1) % algorithmsPool.length];
      levels.push({
        level: i,
        targetKills: 10 + (i * 3),
        targetScore: i * 1500,
        speed: 1.0 + (i * 0.08),
        spawnRate: Math.max(500, 1500 - (i * 30)),
        algorithm: chosenAlgo,
        types: availableTypes
      });
    }
  }
  return levels;
}

let levelsData = generate30Levels();

const DEFAULT_STICKERS = [
{ id: 1, title: "Pahlawan Pemula" },
{ id: 2, title: "Penembak Jitu" },
  { id: 3, title: "Penjelajah Galaksi" }
  { id: 3, title: "Penjelajah Galaksi" },
  { id: 4, title: "Penakluk Boss 1" },
  { id: 5, title: "Master Kombinasi" },
  { id: 6, title: "Pahlawan Legendaris" }
];

let stickersData = DEFAULT_STICKERS;

// TABLE SKOR MUSUH
const ENEMY_SCORE_TABLE = {
  jelly: 100,
  donut: 200,
  cloud: 250,
  crystal: 300,
  splitter: 350,
  boss5: 2500,
  boss10: 5000,
  boss15: 7500,
  boss20: 10000,
  boss25: 12500,
  boss30: 20000
};

// =============================================================
// 2. SYNTHESIZER AUDIO (AUDIO FX & BGM RETRO ARCADE)
// =============================================================
@@ -344,8 +396,6 @@ function triggerVibrate(pattern) {
// =============================================================
// 3. GAME STATE & VARIABEL GLOBAL
// =============================================================
let levelsData = DEFAULT_LEVELS;
let stickersData = DEFAULT_STICKERS;
let currentLevelIndex = 0;
let score = 0;
let levelKills = 0;
@@ -455,14 +505,14 @@ function resizeCanvas() {
async function loadGameData() {
try {
const [resLevels, resStickers] = await Promise.all([
      fetch('./levels.json?v=8.0'),
      fetch('./stickers.json?v=8.0')
      fetch('./levels.json?v=9.0'),
      fetch('./stickers.json?v=9.0')
]);
if (resLevels.ok) levelsData = await resLevels.json();
if (resStickers.ok) stickersData = await resStickers.json();
} catch (err) {
    console.warn('Gagal memuat JSON eksternal, memakai data default cadangan:', err);
    levelsData = DEFAULT_LEVELS;
    console.warn('Gagal memuat JSON eksternal, memakai 30 Level bawaan terintegrasi.');
    levelsData = generate30Levels();
stickersData = DEFAULT_STICKERS;
}
}
@@ -600,11 +650,16 @@ function setupEventListeners() {
updateSkillButtonsUI();

monsters.forEach(m => createBurstParticles3D(m.x, m.y, m.color));
    let pointsGained = monsters.length * 100 * combo;
    score += pointsGained;
    let totalScoreFromBomb = 0;
    monsters.forEach(m => {
      let baseVal = ENEMY_SCORE_TABLE[m.type] || 150;
      totalScoreFromBomb += baseVal * combo;
    });

    score += totalScoreFromBomb;
levelKills += monsters.length;

    spawnFloatingText(canvas.width / 2, canvas.height / 2, `BOOM! +${pointsGained}`, '#ff4757');
    spawnFloatingText(canvas.width / 2, canvas.height / 2, `BOOM! +${totalScoreFromBomb}`, '#ff4757');
monsters = [];

updateHUDValues();
@@ -721,7 +776,7 @@ function startGame() {
lives = 3;

if (!levelsData || levelsData.length === 0) {
    levelsData = DEFAULT_LEVELS;
    levelsData = generate30Levels();
}

document.getElementById('screen-main-menu').classList.add('hidden');
@@ -770,7 +825,7 @@ function startCurrentLevel() {
}

function updateHUDValues() {
  const levelConfig = (levelsData && levelsData[currentLevelIndex]) ? levelsData[currentLevelIndex] : DEFAULT_LEVELS[0];
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
document.getElementById('hud-level').innerText = levelConfig.level;
document.getElementById('hud-score').innerText = score;
document.getElementById('hud-coins').innerText = coins;
@@ -796,40 +851,49 @@ function updateLivesDisplay() {

function triggerBossSiren() {
const overlay = document.getElementById('boss-warning-overlay');
  overlay.classList.remove('hidden');
  sounds.playBossWarning();
  triggerVibrate([100, 50, 100, 50, 200]);
  setTimeout(() => overlay.classList.add('hidden'), 2200);
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
    const levelConfig = (levelsData && levelsData[currentLevelIndex]) ? levelsData[currentLevelIndex] : DEFAULT_LEVELS[0];
    const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
if (levelConfig) {
const algo = levelConfig.algorithm;
const typeList = levelConfig.types || ['jelly'];

      if (algo === 'boss_10' || algo === 'boss_20' || algo === 'boss_30') {
      if (algo.startsWith('boss_')) {
if (monsters.length === 0 && levelKills < levelConfig.targetKills) {
triggerBossSiren();

          let hpVal = algo === 'boss_10' ? 25 : (algo === 'boss_20' ? 50 : 100);
          let colorVal = algo === 'boss_10' ? '#e67e22' : (algo === 'boss_20' ? '#9b59b6' : '#e74c3c');
          
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
            speed: 1.2,
            size: 70,
            speed: 1.0,
            size: 75,
hp: hpVal,
maxHp: hpVal,
color: colorVal,
            type: typeList[0],
            type: `boss${levelConfig.level}`,
algorithm: algo,
shootTimer: 0,
            minionTimer: 0,
            enrageTimer: 0,
timeAlive: 0,
opacity: 1
});
@@ -838,15 +902,16 @@ function spawnMonsterLoop() {
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
            hp: (chosenType === 'donut' ? 2 : 1),
            maxHp: (chosenType === 'donut' ? 2 : 1),
            color: ['#ff4757', '#2ed573', '#ffa502', '#1e90ff'][Math.floor(Math.random() * 4)],
            hp: hpVal,
            maxHp: hpVal,
            color: ['#ff4757', '#2ed573', '#ffa502', '#1e90ff', '#a55eea'][Math.floor(Math.random() * 5)],
type: chosenType,
algorithm: algo,
shootTimer: 0,
@@ -858,7 +923,7 @@ function spawnMonsterLoop() {
}
}

  const currentRate = (levelsData && levelsData[currentLevelIndex]) ? levelsData[currentLevelIndex].spawnRate : 1500;
  const currentRate = levelsData[currentLevelIndex] ? levelsData[currentLevelIndex].spawnRate : 1500;
setTimeout(spawnMonsterLoop, currentRate);
}

@@ -901,7 +966,7 @@ function createBurstParticles3D(x, y, color) {
}

function checkLevelObjectives() {
  const levelConfig = (levelsData && levelsData[currentLevelIndex]) ? levelsData[currentLevelIndex] : DEFAULT_LEVELS[0];
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
if (levelKills >= levelConfig.targetKills) {
if (score >= levelConfig.targetScore) {
levelComplete();
@@ -1097,7 +1162,8 @@ function gameLoop() {
createBurstParticles3D(m.x, m.y, m.color);
trySpawnDrop(m.x, m.y);

          let pointsGained = 150 * combo;
          let basePoints = ENEMY_SCORE_TABLE[m.type] || 150;
          let pointsGained = basePoints * combo;
score += pointsGained;
levelKills++;

@@ -1273,44 +1339,64 @@ function gameLoop() {

drawHeroVector(ctx, playerX, canvas.height - 45, currentActor);

  // LOGIKA MOVEMENT & ENRAGE BOSS
for (let i = monsters.length - 1; i >= 0; i--) {
const m = monsters[i];
m.timeAlive += 0.05;
m.shootTimer++;
    if (m.minionTimer !== undefined) m.minionTimer++;
    if (m.enrageTimer !== undefined) m.enrageTimer++;

if (!isFrozen) {
      if (m.algorithm === 'boss_10') {
      if (m.algorithm.startsWith('boss_')) {
m.y = Math.min(100, m.y + m.speed);
        m.x = canvas.width / 2 + Math.sin(m.timeAlive * 2) * 120;
        m.x = canvas.width / 2 + Math.sin(m.timeAlive * 2) * 140;

        if (m.shootTimer > 90) {
          bossBullets.push({ x: m.x, y: m.y + m.size, vx: 0, vy: 5 });
        // Tembakan Peluru Boss
        if (m.shootTimer > 60) {
          bossBullets.push({ x: m.x - 20, y: m.y + m.size, vx: -1.5, vy: 6 });
          bossBullets.push({ x: m.x + 20, y: m.y + m.size, vx: 1.5, vy: 6 });
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
        // Panggil Pasukan Minion Setiap 5-6 Detik
        if (m.minionTimer > 300) {
          m.minionTimer = 0;
          monsters.push(
            { x: m.x - 60, startX: m.x - 60, y: m.y + 40, speed: 1.5, size: 28, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 },
            { x: m.x + 60, startX: m.x + 60, y: m.y + 40, speed: 1.5, size: 28, hp: 2, maxHp: 2, color: '#ff7f50', type: 'jelly', algorithm: 'linear', shootTimer: 0, timeAlive: 0, opacity: 1 }
          );
          spawnFloatingText(m.x, m.y + 60, 'PANGGIL PASUKAN!', '#ff4757');
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

        // Mekanisme ENRAGE / REGEN untuk Boss Level 30 Setiap 15 Detik
        if (m.type === 'boss30' && m.enrageTimer > 900) {
          m.enrageTimer = 0;
          let healVal = Math.floor(m.maxHp * 0.10);
          m.hp = Math.min(m.maxHp, m.hp + healVal);
          screenShake = 15;
          sounds.playBossWarning();
          spawnFloatingText(m.x, m.y - 20, `ENRAGE! REGEN +${healVal} HP`, '#2ed573');
}

        // DRAW TOP BOSS HP BAR
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
@@ -1333,7 +1419,7 @@ function gameLoop() {

ctx.translate(m.x, m.y);

    if (m.type === 'boss10' || m.type === 'boss20' || m.type === 'boss30') {
    if (m.type.startsWith('boss')) {
ctx.beginPath();
ctx.arc(0, 0, m.size, 0, Math.PI * 2);
ctx.fillStyle = m.color;
@@ -1376,7 +1462,7 @@ function gameLoop() {
ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
}

    if (m.maxHp > 1) {
    if (m.maxHp > 1 && !m.type.startsWith('boss')) {
let widthBar = m.size * 1.5;
ctx.fillStyle = 'rgba(0,0,0,0.6)';
ctx.fillRect(-widthBar/2, -m.size - 18, widthBar, 8);
@@ -1386,7 +1472,7 @@ function gameLoop() {

ctx.restore();

    if (m.y > canvas.height - 55 && !m.algorithm.startsWith('boss')) {
    if (m.y > canvas.height - 55 && !m.type.startsWith('boss')) {
monsters.splice(i, 1);

if (isShieldActive) {
@@ -1431,9 +1517,9 @@ function levelComplete() {
sounds.stopBGM();
sounds.playWin();
triggerVibrate([50, 50, 50, 50, 100]);
  unlockSticker(currentLevelIndex + 1);

  const levelConfig = (levelsData && levelsData[currentLevelIndex]) ? levelsData[currentLevelIndex] : DEFAULT_LEVELS[0];
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
  unlockSticker(levelConfig.level);
saveScoreToGlobalLeaderboard(playerName, score, levelConfig.level);

document.getElementById('result-title').innerText = "MISI SELESAI!";
@@ -1453,7 +1539,7 @@ function levelFailed(reasonTitle = "MISI GAGAL!") {
sounds.stopBGM();
triggerVibrate([200, 100, 200]);

  const levelConfig = (levelsData && levelsData[currentLevelIndex]) ? levelsData[currentLevelIndex] : DEFAULT_LEVELS[0];
  const levelConfig = levelsData[currentLevelIndex] || levelsData[0];
saveScoreToGlobalLeaderboard(playerName, score, levelConfig.level);

document.getElementById('result-title').innerText = reasonTitle;
@@ -1467,7 +1553,7 @@ function levelFailed(reasonTitle = "MISI GAGAL!") {
document.getElementById('modal-result').classList.remove('hidden');
}

// FUNGSI SIMPAN HANYA JIKA REKOR PEMAIN MEMBAIK (1 NAMA = 1 REKOR TERBAIK GLOBAL)
// FUNGSI SIMPAN DENGAN DEDUPLIKASI NAMA & COMPARISON REKOR TERBAIK
function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
const cleanName = (name || 'Pahlawan').trim();
if (!cleanName) return;
@@ -1535,7 +1621,7 @@ function saveScoreToGlobalLeaderboard(name, scoreVal, levelVal) {
}
}

// BUKA PAPAN PERINGKAT ONLINE DENGAN DEDUPLIKASI KETAT
// BUKA PAPAN PERINGKAT ONLINE DENGAN DEDUPLIKASI NAMA KETAT
function openLeaderboard() {
document.getElementById('modal-leaderboard').classList.remove('hidden');
const tbody = document.getElementById('leaderboard-body');
@@ -1548,7 +1634,6 @@ function openLeaderboard() {
return;
}

      // Group & Deduplikasi berdasarkan Nama Pemain (Ambil HANYA yang terbaik)
let bestMap = new Map();

snapshot.forEach((childSnapshot) => {
@@ -1575,7 +1660,6 @@ function openLeaderboard() {

let uniqueList = Array.from(bestMap.values());

      // Urutkan secara ketat: Level Tertinggi -> Skor Tertinggi
uniqueList.sort((a, b) => {
let lvlA = Number(a.level) || 1;
let lvlB = Number(b.level) || 1;
