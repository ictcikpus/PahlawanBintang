# 📅 CHANGELOG — PAHLAWAN BINTANG

Semua update penting dicatat di sini.
Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/)

---

## [Unreleased]

### Planned
- (Tulis fitur yang akan datang di sini)

---

## [v20.10.1] — 2026-10-10

### 🐛 Fixed
- **Boss tidak spawn** setelah minion target tercapai
  - Root cause: cek `levelKills < targetKills` salah karena minion sudah naikkan `levelKills`
  - Fix: hapus cek `levelKills`, hanya pakai `bossPhase === 'boss'` dan `monsters.length === 0`
- **Objek kegedean** di tablet/laptop
  - Root cause: `GAME_SCALE` clamp max 3.5
  - Fix: clamp max 1.2, arena tetap fluid via viewport

### 🔧 Changed
- `updateGameScale()`: pakai `clamp(0.9, minDim/360, 1.2)` → objek standard
- `spawnMonsterLoop()`: hapus cek `levelKills < targetKills` untuk boss
- `sw.js`: `CACHE_NAME` → `pahlawan-bintang-v20.10.1`
- `index.html`: bump `?v=20.10.1`

### 📁 Files Changed
- 🔴 `sw.js` (bump)
- 🔴 `index.html` (bump query)
- 🔴 `game.js` (2 patch: scaling + boss spawn)

### ❌ Files Unchanged
- 🟢 `style.css` (v20.10.0)
- 🟢 `multiplayer.js` (v20.8.2)
- 🟢 `achievements.json`, `levels.json`, `manifest.json`

---

## [v20.10.0] — 2026-10-09

### ✨ Added
- **Boss minion phase**: sebelum boss muncul, hero lawan minion dulu (8-28 target berdasarkan level)
- **Fluid scaling**: arena mengisi seluruh layar *(rollback di v20.10.1 karena objek kegedean)*
- Loading & intro lebih cepat (400ms / 1200ms)
- Ground & player Y proporsional viewport

### 📁 Files Changed
- 🔴 `sw.js`, `index.html`, `style.css` (append), `game.js` (full replace)

---

## [v20.9.1] — 2026-10-08

### ✨ Added
- **Stage Clear banner** (hijau) + delay 2.5s (normal) / 3.5s (boss)
- Hero bisa ambil koin & bonus sebelum narasi muncul
- Boss approach banner (merah) sebelum boss spawn

### 🐛 Fixed
- Stage clear terlalu cepat → bonus tidak terambil
- Haptic feedback saat stage clear

### 📁 Files Changed
- 🔴 `sw.js`, `index.html`, `style.css`, `game.js`

---

## [v20.9.0] — 2026-10-07

### ✨ Added
- **Desktop Control Hints Panel** — auto-show di laptop
- **Keyboard shortcuts**: Q/W/E (skill), SPACE (fire), ESC (pause), H (hints)
- **5 musuh bentuk baru**: triangle, hexagon, star, diamond, worm
- **10 boss bentuk unik**: inferno (triangle), void (spiral), cryo (ice crystal), titan (armored), solar (matahari), omega (layered star), abyss (octagon+tentacles), nemesis (skull), abyss², eternity (infinity+wings)

### 📁 Files Changed
- 🔴 `sw.js`, `index.html`, `style.css` (append), `game.js` (full replace)

---

## [v20.8.2] — 2026-10-06

### 🐛 Fixed
- Joystick delay — velocity-based movement
- `JOYSTICK_DEADZONE`: 0.10 → 0.06
- `JOYSTICK_SPEED_MULT`: 1.35 → 1.55
- `INPUT_THROTTLE_MS`: 33 → 16
- `STATE_THROTTLE_MS`: 50 → 33

### ✨ Added
- Fire button manual (toggle auto-fire)
- Haptic feedback on skill/fire/pause

### 📁 Files Changed
- 🔴 `sw.js`, `index.html`, `style.css`, `game.js`, `multiplayer.js`

---

## [v20.8.1] — 2026-10-05

### 🐛 Fixed
- Analog joystick responsiveness (perceptual curve)
- `JOYSTICK_CURVE`: 0.7 → 0.65

### 📁 Files Changed
- 🔴 `game.js`

---

## [v20.8.0] — 2026-10-04

### ✨ Added
- **Analog joystick** menggantikan tombol arah kiri/kanan
- Multiplayer sync `moveX` (axis -1..1)

### 📁 Files Changed
- 🔴 `game.js`, `multiplayer.js`, `style.css`, `index.html`

---

## 📝 TEMPLATE UNTUK VERSI BERIKUTNYA

Copy-paste saat mau tambah entri baru:

```markdown
## [vX.Y.Z] — YYYY-MM-DD

### ✨ Added
- Fitur baru 1
- Fitur baru 2

### 🐛 Fixed
- Bug 1 (root cause: ...)
- Bug 2 (root cause: ...)

### 🔧 Changed
- Perubahan 1
- Perubahan 2

### ❌ Removed
- Fitur yang dihapus

### 📁 Files Changed
- 🔴 `file1.js` (bump)
- 🔴 `file2.css` (append)
- 🟢 `file3.json` (unchanged)
