<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>EcoHole Master 3D: Pro Edition</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Three.js Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');

        * {
            user-select: none;
            -webkit-user-select: none;
            font-family: 'Plus Jakarta Sans', sans-serif;
            box-sizing: border-box;
        }

        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #020617;
            touch-action: manipulation;
        }

        /* Glassmorphism styling */
        .glass-panel {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Compact HUD Pill badges */
        .hud-pill {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 9999px;
            padding: 5px 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5);
            pointer-events: auto !important;
            cursor: pointer;
        }

        /* Leaderboard Item */
        .lb-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
        }

        /* Floating score popup */
        .score-float-pop {
            position: absolute;
            font-weight: 900;
            font-size: 18px;
            pointer-events: none;
            z-index: 35;
            animation: scoreFloatAnim 0.85s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
            text-shadow: 0 0 10px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9);
        }

        @keyframes scoreFloatAnim {
            0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
            30% { transform: translate(-50%, -18px) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50px) scale(1); opacity: 0; }
        }

        /* Joystick Visualizer */
        #joystick-base {
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(56, 189, 248, 0.5);
            pointer-events: none;
            display: none;
            transform: translate(-50%, -50%);
            z-index: 25;
        }

        #joystick-stick {
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #06b6d4);
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.7);
            pointer-events: none;
            transform: translate(-50%, -50%);
        }

        /* Fever Glow Pulse */
        .fever-active-glow {
            box-shadow: 0 0 25px rgba(245, 158, 11, 0.8), inset 0 0 15px rgba(239, 68, 68, 0.6);
            border-color: rgba(251, 191, 36, 0.9) !important;
        }

        /* Boss HP bar pulsing */
        @keyframes bossPulse {
            0%, 100% { box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }
            50% { box-shadow: 0 0 26px rgba(239, 68, 68, 0.9); }
        }
        .boss-bar-active { animation: bossPulse 1.4s ease-in-out infinite; }

        #announcement {
            transition: opacity 0.35s ease, transform 0.35s ease;
        }
        #announcement.hidden-ann {
            opacity: 0;
            transform: scale(0.85);
        }

        button, .level-card {
            cursor: pointer !important;
            pointer-events: auto !important;
        }
    </style>
</head>
<body>

    <div id="game-container" class="relative w-full h-full overflow-hidden">
        
        <!-- Top HUD Overlay -->
        <div id="hud" class="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 z-20 hidden">
            
            <!-- Top Header Stats & Leaderboard + BOSS BAR -->
            <div class="flex flex-col w-full gap-2">
                <div class="flex items-start justify-between w-full gap-2">
                    
                    <!-- Player Score Badge -->
                    <div class="hud-pill text-white flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs border border-emerald-500/30">
                            <i class="fa-solid fa-leaf"></i>
                        </div>
                        <div>
                            <div class="text-[9px] tracking-wider uppercase text-emerald-400 font-bold leading-none">SKOR ANDA</div>
                            <div id="score" class="text-base sm:text-lg font-black text-white leading-tight">0</div>
                        </div>
                    </div>

                    <!-- Timer Badge -->
                    <div class="hud-pill text-white text-center flex flex-col items-center px-4 py-1.5">
                        <div class="flex items-center gap-1.5">
                            <span class="text-[9px] uppercase text-amber-400 font-bold tracking-wider">WAKTU:</span>
                            <span id="timer" class="text-lg sm:text-xl font-black text-amber-400 tracking-wider">120s</span>
                        </div>
                        <div class="w-24 bg-slate-800/80 rounded-full h-1 mt-0.5 overflow-hidden border border-slate-700">
                            <div id="target-progress-bar" class="bg-gradient-to-r from-amber-400 to-emerald-400 h-full w-0 transition-all duration-300"></div>
                        </div>
                        <div id="target-text" class="text-[8px] text-slate-300 mt-0.5 font-semibold">Target: 1.500 Pts</div>
                    </div>

                    <!-- Live AI Leaderboard -->
                    <div class="glass-panel rounded-2xl p-2 text-white w-36 sm:w-44 shadow-xl pointer-events-auto">
                        <div class="text-[9px] font-black uppercase text-cyan-400 mb-1 flex items-center gap-1 border-b border-slate-700/60 pb-1">
                            <i class="fa-solid fa-trophy"></i> LEADERBOARD KOTA
                        </div>
                        <div id="leaderboard-list" class="space-y-1">
                            <!-- Dynamic items -->
                        </div>
                    </div>
                </div>

                <!-- BOSS HEALTH BAR -->
                <div id="boss-bar-wrap" class="hidden self-center w-full max-w-md pointer-events-none">
                    <div id="boss-bar-inner" class="glass-panel rounded-xl px-3 py-2 border border-rose-500/50 boss-bar-active">
                        <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-1">
                            <span class="text-rose-400 flex items-center gap-1.5">
                                <i id="boss-icon" class="fa-solid fa-skull"></i>
                                <span id="boss-name">BOSS</span>
                            </span>
                            <span id="boss-hp-text" class="text-rose-200">0 / 0</span>
                        </div>
                        <div class="w-full h-3 bg-slate-900/90 rounded-full overflow-hidden border border-rose-900/70">
                            <div id="boss-hp-fill" class="h-full bg-gradient-to-r from-rose-700 via-red-500 to-orange-400 transition-all duration-200" style="width:100%"></div>
                        </div>
                        <div id="boss-hint" class="text-[9px] text-amber-300 font-bold mt-1 text-center">
                            Perbesar lubangmu untuk menyerang!
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dynamic Eco-Educational Banner Popup -->
            <div id="eco-fact-banner" class="self-center glass-panel rounded-xl px-4 py-1.5 max-w-md text-center border-l-4 border-l-emerald-400 shadow-xl transition-all duration-500 opacity-0 transform -translate-y-4 pointer-events-auto">
                <div class="flex items-center justify-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase mb-0.5 tracking-wider">
                    <i class="fa-solid fa-graduation-cap"></i> FAKTA LINGKUNGAN
                </div>
                <div id="eco-fact-text" class="text-xs text-slate-200 font-medium leading-tight">
                    Melahap sampah plastik menyelamatkan laut dari pencemaran mikroplastik!
                </div>
            </div>

            <!-- Bottom Controls & Action Buttons -->
            <div class="flex justify-between items-end w-full">
                <div class="hud-pill text-[10px] text-slate-300 shadow-lg hidden sm:flex items-center gap-1.5">
                    <i class="fa-solid fa-hand-pointer text-emerald-400"></i>
                    <span><b>Mouse Drag</b> / <b>WASD</b> / <b>Layar Sentuh</b></span>
                </div>

                <div class="flex gap-1.5 pointer-events-auto">
                    <button id="achievements-btn" class="hud-pill w-9 h-9 flex items-center justify-center text-amber-400 hover:bg-slate-700/60 active:scale-95 transition">
                        <i class="fa-solid fa-award"></i>
                    </button>
                    <button id="fullscreen-btn" class="hud-pill w-9 h-9 flex items-center justify-center text-emerald-400 hover:bg-slate-700/60 active:scale-95 transition">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    <button id="sound-btn" class="hud-pill w-9 h-9 flex items-center justify-center text-cyan-400 hover:bg-slate-700/60 active:scale-95 transition">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Damage Flash Vignette -->
        <div id="damage-flash" class="absolute inset-0 bg-rose-600/40 opacity-0 transition-opacity duration-150 pointer-events-none z-30"></div>

        <!-- Boss Announcement -->
        <div id="announcement" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 hidden-ann">
            <div id="announcement-title" class="text-3xl md:text-6xl font-black text-rose-500 drop-shadow-2xl tracking-wider text-center px-4">BOS MUNCUL</div>
            <div id="announcement-sub" class="text-xs md:text-base text-slate-100 font-bold mt-2 tracking-widest uppercase">Smog Titan</div>
        </div>

        <!-- Touch Joystick Element -->
        <div id="joystick-base">
            <div id="joystick-stick"></div>
        </div>

        <!-- START OVERLAY SCREEN -->
        <div id="start-screen" class="absolute inset-0 glass-panel z-40 flex flex-col items-center justify-center p-6 text-center text-white overflow-y-auto pointer-events-auto">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-3xl mb-3 shadow-2xl shadow-emerald-500/40 border border-emerald-300/30">
                <i class="fa-solid fa-earth-americas text-slate-950"></i>
            </div>
            
            <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-extrabold tracking-widest uppercase mb-2 border border-emerald-500/30">
                🌱 SIMULATOR PRO 3D
            </span>

            <h1 class="text-3xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                EcoHole 3D: Pro
            </h1>

            <p class="text-slate-300 max-w-lg text-xs md:text-sm mb-2 leading-relaxed">
                Kendalikan hole 3D nyata dengan efek kedalaman kedalam tanah. Kumpulkan skor melawan AI Competitor — atau hancurkan Bos Raksasa di level khusus!
            </p>

            <div class="flex items-center gap-2 mb-5 text-[10px] font-bold uppercase tracking-wider">
                <span class="px-2 py-1 rounded-full bg-slate-800/70 border border-slate-600 text-slate-300">
                    <i class="fa-solid fa-flag-checkered text-emerald-400"></i> Level Skor
                </span>
                <span class="px-2 py-1 rounded-full bg-rose-900/40 border border-rose-600/60 text-rose-300">
                    <i class="fa-solid fa-skull"></i> Level Bos
                </span>
            </div>

            <!-- Level Selector Cards -->
            <div class="w-full max-w-2xl mb-6">
                <div class="text-xs text-slate-400 uppercase font-bold mb-3 tracking-wider">PILIH LEVEL:</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs" id="level-cards-grid">
                    <!-- Dynamic rendering -->
                </div>
            </div>

            <!-- Launch Button -->
            <button id="start-btn" class="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-black text-base md:text-lg px-10 py-3.5 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-emerald-400/40 cursor-pointer">
                <i class="fa-solid fa-play"></i> Mulai Permainan
            </button>
        </div>

        <!-- ACHIEVEMENTS MODAL -->
        <div id="achievements-modal" class="absolute inset-0 glass-panel z-50 flex items-center justify-center p-4 hidden pointer-events-auto">
            <div class="bg-slate-900/95 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl">
                <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                    <div class="flex items-center gap-2 text-amber-400 font-black text-lg">
                        <i class="fa-solid fa-award"></i> Pencapaian Game
                    </div>
                    <button id="close-achievements-btn" class="text-slate-400 hover:text-white text-xl p-2">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div id="achievements-list" class="space-y-3 max-h-80 overflow-y-auto pr-1">
                    <!-- Achievements injected -->
                </div>
            </div>
        </div>

        <!-- GAME OVER / RECAP OVERLAY -->
        <div id="gameover-screen" class="absolute inset-0 glass-panel z-40 flex flex-col items-center justify-center p-6 text-center text-white hidden pointer-events-auto">
            <div id="recap-icon" class="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mb-3 shadow-xl">
                <i class="fa-solid fa-recycle"></i>
            </div>
            <h2 id="recap-title" class="text-3xl md:text-5xl font-black text-emerald-400 mb-1">Level Selesai</h2>
            <p id="recap-subtitle" class="text-slate-300 text-xs md:text-sm mb-5 max-w-sm">
                Ringkasan Hasil Permainan:
            </p>
            
            <div class="glass-panel rounded-2xl p-4 w-full max-w-md mb-6 grid grid-cols-2 gap-3 border border-slate-700/60 text-left">
                <div class="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                    <div class="text-[10px] text-emerald-400 font-bold uppercase mb-0.5">Skor Akhir</div>
                    <div id="final-score" class="text-2xl font-black text-white">0</div>
                </div>
                <div class="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                    <div class="text-[10px] text-cyan-400 font-bold uppercase mb-0.5">Peringkat Akhir</div>
                    <div id="final-rank" class="text-xl font-black text-amber-400">#1 PERTAMA</div>
                </div>
                <div class="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                    <div class="text-[10px] text-amber-400 font-bold uppercase mb-0.5">Objek Ditelan</div>
                    <div id="final-items" class="text-lg font-black text-white">0 Objek</div>
                </div>
                <div class="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                    <div id="final-status-label" class="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">Status Target</div>
                    <div id="final-status" class="text-sm font-black text-emerald-400">Berhasil</div>
                </div>
            </div>

            <div class="flex flex-wrap justify-center gap-3">
                <button id="next-level-btn" class="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-black text-base px-8 py-3.5 rounded-full shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 hidden cursor-pointer">
                    <i class="fa-solid fa-forward"></i> Level Berikutnya
                </button>
                <button id="restart-btn" class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base px-8 py-3.5 rounded-full shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-rotate-right"></i> Coba Lagi
                </button>
                <button id="back-menu-btn" class="glass-panel text-slate-200 font-bold text-base px-6 py-3.5 rounded-full hover:bg-slate-700/60 transition cursor-pointer">
                    Menu Utama
                </button>
            </div>
        </div>
    </div>

    <script>
        /* =====================================================================
           SOUND CONTROLLER
           ===================================================================== */
        class SoundController {
            constructor() {
                this.ctx = null;
                this.muted = false;
            }

            init() {
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) this.ctx = new AudioCtx();
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }

            toggleMute() {
                this.muted = !this.muted;
                return this.muted;
            }

            playClick() {
                if (this.muted || !this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.06);
                } catch (e) {}
            }

            playEat(type = 'trash') {
                if (this.muted || !this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();

                    if (type === 'tree') {
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(180, now);
                        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
                        gain.gain.setValueAtTime(0.3, now);
                    } else if (type === 'building') {
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(120, now);
                        osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);
                        gain.gain.setValueAtTime(0.4, now);
                    } else {
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(400, now);
                        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
                        gain.gain.setValueAtTime(0.25, now);
                    }

                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.36);
                } catch (e) {}
            }

            playBossHit() {
                if (this.muted || !this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } catch (e) {}
            }

            playBossDefeat() {
                if (this.muted || !this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(30, now + 1.1);
                    gain.gain.setValueAtTime(0.45, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 1.25);
                } catch (e) {}
            }

            playAchievement() {
                if (this.muted || !this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, now + i * 0.06);
                        gain.gain.setValueAtTime(0.2, now + i * 0.06);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
                        osc.connect(gain);
                        gain.connect(this.ctx.destination);
                        osc.start(now + i * 0.06);
                        osc.stop(now + i * 0.06 + 0.22);
                    });
                } catch (e) {}
            }
        }

        /* =====================================================================
           GAME DATA
           ===================================================================== */
        const ECO_FACTS = [
            "Melahap & mendaur ulang plastik membantu mencegah mikroplastik meracuni laut.",
            "Panel surya yang didaur ulang menghasilkan energi bersih baru tanpa limbah beracun.",
            "Daur ulang 1 ton kertas menyelamatkan 17 pohon dewasa dan 26.000 liter air.",
            "Limbah elektronik mengandung logam berharga seperti emas & tembaga yang bisa didaur ulang.",
            "Mendaur ulang kaleng aluminium menghemat 95% energi dibanding membuat dari bahan mentah."
        ];

        const ACHIEVEMENTS_DATA = [
            { id: 'first_eat', title: 'Pembersih Kota', desc: 'Lahap 10 objek pertama', icon: 'fa-leaf', unlocked: false },
            { id: 'bot_slayer', title: 'Juara Arena', desc: 'Raih peringkat #1 melampaui AI Bots', icon: 'fa-crown', unlocked: false },
            { id: 'eco_hero', title: 'Pahlawan Lingkungan', desc: 'Raih 5.000 Skor dalam 1 game', icon: 'fa-shield-halved', unlocked: false },
            { id: 'boss_slayer', title: 'Penakluk Polusi', desc: 'Hancurkan Bos pertama kali', icon: 'fa-skull', unlocked: false },
            { id: 'earth_master', title: 'Penguasa Bumi', desc: 'Hancurkan Polusi Overlord di Level 5', icon: 'fa-earth-americas', unlocked: false }
        ];

        /* LEVEL CONFIG
           - isBoss: true  -> kondisi menang = DARAH BOS HABIS (bukan skor)
           - boss.hp / boss.radius / boss.speed / boss.color / boss.icon
        */
        const LEVELS_CONFIG = [
            {
                id: 1, name: "Level 1: Taman & Sampah", targetScore: 1500, duration: 120,
                icon: "fa-tree", mapSize: 80, isBoss: false
            },
            {
                id: 2, name: "Level 2: Perumahan Surya", targetScore: 4000, duration: 150,
                icon: "fa-solar-panel", mapSize: 110, isBoss: false
            },
            {
                id: 3, name: "Level 3: Kawasan Industri", targetScore: 9000, duration: 180,
                icon: "fa-industry", mapSize: 150, isBoss: true,
                boss: {
                    name: "SMOG TITAN", hp: 2500, radius: 5.0, speed: 3.4,
                    color: 0xef4444, icon: "fa-smog", reward: 5000
                }
            },
            {
                id: 4, name: "Level 4: Wilayah Pesisir", targetScore: 20000, duration: 210,
                icon: "fa-volcano", mapSize: 220, isBoss: false
            },
            {
                id: 5, name: "Level 5: Planet Bumi", targetScore: 45000, duration: 240,
                icon: "fa-earth-americas", mapSize: 350, isBoss: true,
                boss: {
                    name: "POLUSI OVERLORD", hp: 7000, radius: 7.0, speed: 4.2,
                    color: 0xa855f7, icon: "fa-meteor", reward: 15000
                }
            }
        ];

        /* =====================================================================
           BOSS BALANCE CONSTANTS
           ===================================================================== */
        const BOSS_BITE_RATIO       = 0.45;   // radius pemain harus >= boss.radius * ini untuk bisa menggigit
        const BOSS_BITE_DPS         = 60;     // damage per detik per 1 unit radius pemain
        const BOSS_SHRINK_RATE      = 0.35;   // radius pemain yang hilang per detik saat diterkam bos
        const BOSS_EAT_DAMAGE_MULT  = 0.35;   // damage ke bos tiap 1 poin objek yang ditelan
        const BOSS_MIN_PLAYER_RAD   = 1.0;    // radius minimum pemain
        const BOSS_BAR_WIDTH_3D     = 6;

        /* =====================================================================
           GLOBAL STATE
           ===================================================================== */
        let scene, camera, renderer;
        let soundFX;

        let selectedLevel = 1;
        let unlockedLevels = [1];
        let activeLevelCfg = LEVELS_CONFIG[0];

        let score = 0;
        let playerHoleRadius = 1.6;
        let gameTimer = 120;
        let timerInterval = null;
        let isPlaying = false;
        let totalItemsEaten = 0;

        // Player Motion
        const targetPos = new THREE.Vector3();
        const currentPos = new THREE.Vector3();
        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();

        let touchActive = false;
        const touchStartPos = { x: 0, y: 0 };
        const joystickVector = new THREE.Vector2();
        const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

        // 3D world entities
        let playerHoleGroup;
        let eatableObjects = [];
        let particles = [];
        let movingVehicles = [];
        let pedestrians = [];
        let aiBots = [];
        let boss = null;
        let bossDefeated = false;

        // Throttles
        let leaderboardAccum = 0;
        let bossHintAccum = 0;
        let lastBossHint = '';
        let bossHitSoundCooldown = 0;
        let announceTimeout = null;

        const clock = new THREE.Clock();

        /* =====================================================================
           MESH FACTORY
           ===================================================================== */
        function createDepthHoleMesh(colorHex = 0x10b981) {
            const group = new THREE.Group();

            // 1. Cover Disk dengan Depth Mask
            const coverGeo = new THREE.CircleGeometry(1, 32);
            const coverMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true });
            const coverDisk = new THREE.Mesh(coverGeo, coverMat);
            coverDisk.rotation.x = -Math.PI / 2;
            coverDisk.position.y = 0.01;
            coverDisk.renderOrder = 0;
            group.add(coverDisk);

            // 2. Pit Cylinder
            const pitGeo = new THREE.CylinderGeometry(1, 0.9, 12, 32, 1, true);
            const pitMat = new THREE.MeshStandardMaterial({
                color: 0x050505,
                roughness: 0.9,
                side: THREE.BackSide
            });
            const pitCylinder = new THREE.Mesh(pitGeo, pitMat);
            pitCylinder.position.y = -6;
            pitCylinder.renderOrder = 0;
            group.add(pitCylinder);

            // 3. Glowing Border Ring
            const ringGeo = new THREE.RingGeometry(0.95, 1.12, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
            const borderRing = new THREE.Mesh(ringGeo, ringMat);
            borderRing.rotation.x = -Math.PI / 2;
            borderRing.position.y = 0.02;
            borderRing.renderOrder = 2;
            group.add(borderRing);

            return { group, coverDisk, pitCylinder, borderRing };
        }

        function createCityGridRoads(size) {
            const existing = scene.getObjectByName('cityGround');
            if (existing) scene.remove(existing);

            const groundGroup = new THREE.Group();
            groundGroup.name = 'cityGround';

            const groundGeo = new THREE.PlaneGeometry(size * 2, size * 2);
            const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
            const groundMesh = new THREE.Mesh(groundGeo, groundMat);
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.receiveShadow = true;
            groundMesh.renderOrder = 1;
            groundGroup.add(groundMesh);

            const blockGeo = new THREE.PlaneGeometry(24, 24);
            const blockMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6 });

            for (let x = -size + 20; x <= size - 20; x += 32) {
                for (let z = -size + 20; z <= size - 20; z += 32) {
                    const block = new THREE.Mesh(blockGeo, blockMat);
                    block.rotation.x = -Math.PI / 2;
                    block.position.set(x, 0.005, z);
                    block.renderOrder = 1;
                    groundGroup.add(block);
                }
            }

            scene.add(groundGroup);
        }

        function spawnTree(x, z, type = 'oak') {
            const grp = new THREE.Group();
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.3, 1.8, 8),
                new THREE.MeshStandardMaterial({ color: 0x78350f })
            );
            trunk.position.y = 0.9;
            trunk.castShadow = true;
            grp.add(trunk);

            const leafColor = type === 'oak' ? 0x15803d : 0x166534;
            const foliage = new THREE.Mesh(
                type === 'oak' ? new THREE.DodecahedronGeometry(1.2) : new THREE.ConeGeometry(1.4, 2.2, 8),
                new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.6 })
            );
            foliage.position.y = 2.2;
            foliage.castShadow = true;
            grp.add(foliage);

            grp.position.set(x, 0, z);
            scene.add(grp);

            return { mesh: grp, radius: 1.1, points: 30, type: 'tree', isFalling: false };
        }

        function spawnPlasticLitter(x, z) {
            const grp = new THREE.Group();
            const bottle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8),
                new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
            );
            bottle.position.y = 0.08;
            bottle.rotation.z = Math.PI / 2;
            grp.add(bottle);

            grp.position.set(x, 0, z);
            scene.add(grp);

            return { mesh: grp, radius: 0.25, points: 10, type: 'trash', isFalling: false };
        }

        function spawnHouse(x, z) {
            const grp = new THREE.Group();
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(4.0, 2.8, 4.0),
                new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
            );
            base.position.y = 1.4;
            base.castShadow = true;
            grp.add(base);

            const roof = new THREE.Mesh(
                new THREE.ConeGeometry(3.2, 1.8, 4),
                new THREE.MeshStandardMaterial({ color: 0x991b1b })
            );
            roof.position.y = 3.7;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            grp.add(roof);

            grp.position.set(x, 0, z);
            scene.add(grp);

            return { mesh: grp, radius: 3.2, points: 250, type: 'building', isFalling: false };
        }

        function spawnSkyscraper(x, z) {
            const grp = new THREE.Group();
            const height = 18 + Math.random() * 10;
            const bldg = new THREE.Mesh(
                new THREE.BoxGeometry(6.5, height, 6.5),
                new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.1 })
            );
            bldg.position.y = height / 2;
            bldg.castShadow = true;
            grp.add(bldg);

            grp.position.set(x, 0, z);
            scene.add(grp);

            return { mesh: grp, radius: 5.5, points: 1200, type: 'building', isFalling: false };
        }

        function spawnMovingVehicle(x, z, dirX, dirZ) {
            const grp = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.7, 3.5),
                new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0xef4444 : 0x3b82f6, metalness: 0.6 })
            );
            body.position.y = 0.45;
            body.castShadow = true;
            grp.add(body);

            grp.position.set(x, 0, z);
            scene.add(grp);

            const vehData = {
                mesh: grp,
                radius: 2.0,
                points: 150,
                type: 'car',
                vel: new THREE.Vector3(dirX * 6, 0, dirZ * 6),
                isFalling: false
            };

            movingVehicles.push(vehData);
            eatableObjects.push(vehData);
        }

        function spawnPedestrian(x, z) {
            const grp = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.7, 8),
                new THREE.MeshStandardMaterial({ color: 0xf59e0b })
            );
            body.position.y = 0.35;
            grp.add(body);

            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0xfde047 })
            );
            head.position.y = 0.8;
            grp.add(head);

            grp.position.set(x, 0, z);
            scene.add(grp);

            const pedData = {
                mesh: grp,
                radius: 0.3,
                points: 20,
                type: 'trash',
                angle: Math.random() * Math.PI * 2,
                isFalling: false
            };

            pedestrians.push(pedData);
            eatableObjects.push(pedData);
        }

        /* =====================================================================
           BOSS CREATION
           ===================================================================== */
        function createBossEntity(cfg) {
            const group = new THREE.Group();

            // --- Depth mask cover (membuat efek lubang 3D) ---
            const cover = new THREE.Mesh(
                new THREE.CircleGeometry(1, 48),
                new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true })
            );
            cover.rotation.x = -Math.PI / 2;
            cover.position.y = 0.012;
            cover.renderOrder = 0;
            group.add(cover);

            // --- Dinding pit dalam ---
            const pit = new THREE.Mesh(
                new THREE.CylinderGeometry(1, 0.78, 16, 48, 1, true),
                new THREE.MeshStandardMaterial({ color: 0x09090f, roughness: 0.95, side: THREE.BackSide })
            );
            pit.position.y = -8;
            pit.renderOrder = 0;
            group.add(pit);

            // --- Cahaya polusi di dasar lubang ---
            const glowDisk = new THREE.Mesh(
                new THREE.CircleGeometry(0.78, 32),
                new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.5 })
            );
            glowDisk.rotation.x = -Math.PI / 2;
            glowDisk.position.y = -15.6;
            glowDisk.renderOrder = 0;
            group.add(glowDisk);

            // --- Cincin tepi bercahaya ---
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.93, 1.12, 48),
                new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.022;
            ring.renderOrder = 2;
            group.add(ring);

            // --- Gigi / taring di tepi lubang ---
            const teethGroup = new THREE.Group();
            const toothCount = 18;
            for (let i = 0; i < toothCount; i++) {
                const a = (i / toothCount) * Math.PI * 2;
                const tooth = new THREE.Mesh(
                    new THREE.ConeGeometry(0.2, 0.85, 5),
                    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.4 })
                );
                tooth.position.set(Math.cos(a) * 0.9, 0.32, Math.sin(a) * 0.9);
                tooth.rotation.z = -Math.cos(a) * 0.45;
                tooth.rotation.x = Math.sin(a) * 0.45;
                tooth.castShadow = true;
                teethGroup.add(tooth);
            }
            group.add(teethGroup);

            // --- Puing berputar di atas bos ---
            const debrisGroup = new THREE.Group();
            for (let i = 0; i < 7; i++) {
                const a = (i / 7) * Math.PI * 2;
                const chunk = new THREE.Mesh(
                    new THREE.BoxGeometry(0.35, 0.35, 0.35),
                    new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? cfg.color : 0x334155, roughness: 0.6 })
                );
                chunk.position.set(Math.cos(a) * 1.25, 0.2 + Math.random() * 0.6, Math.sin(a) * 1.25);
                debrisGroup.add(chunk);
            }
            debrisGroup.position.y = 1.6;
            group.add(debrisGroup);

            return { group, teethGroup, debrisGroup, ring, glowDisk };
        }

        function createBoss3DBar(cfg) {
            const barGroup = new THREE.Group();

            const barBg = new THREE.Mesh(
                new THREE.PlaneGeometry(BOSS_BAR_WIDTH_3D + 0.35, 0.95),
                new THREE.MeshBasicMaterial({ color: 0x0f172a, depthTest: false, transparent: true, opacity: 0.85 })
            );
            barBg.renderOrder = 998;

            const barFill = new THREE.Mesh(
                new THREE.PlaneGeometry(BOSS_BAR_WIDTH_3D, 0.6),
                new THREE.MeshBasicMaterial({ color: cfg.color, depthTest: false })
            );
            barFill.position.z = 0.02;
            barFill.renderOrder = 999;

            barGroup.add(barBg);
            barGroup.add(barFill);

            return { barGroup, barFill };
        }

        function spawnBoss() {
            const levelCfg = activeLevelCfg;
            if (!levelCfg.isBoss) return;

            const cfg = levelCfg.boss;
            const parts = createBossEntity(cfg);
            parts.group.scale.set(cfg.radius, 1, cfg.radius);

            const startDist = levelCfg.mapSize * 0.55;
            parts.group.position.set(startDist, 0, -startDist);
            scene.add(parts.group);

            const bar = createBoss3DBar(cfg);
            bar.barGroup.position.set(startDist, cfg.radius * 0.4 + 5.5, -startDist);
            scene.add(bar.barGroup);

            boss = {
                cfg: cfg,
                group: parts.group,
                teethGroup: parts.teethGroup,
                debrisGroup: parts.debrisGroup,
                ring: parts.ring,
                glowDisk: parts.glowDisk,
                barGroup: bar.barGroup,
                barFill: bar.barFill,
                hp: cfg.hp,
                maxHp: cfg.hp,
                active: true,
                spin: 0,
                hitFlash: 0,
                playerHitCooldown: 0
            };

            updateBossHpUI();
        }

        function clearBoss() {
            if (boss) {
                if (boss.group) scene.remove(boss.group);
                if (boss.barGroup) scene.remove(boss.barGroup);
            }
            boss = null;
            bossDefeated = false;
            const wrap = document.getElementById('boss-bar-wrap');
            if (wrap) wrap.classList.add('hidden');
        }

        /* =====================================================================
           BOSS LOGIC
           ===================================================================== */
        function updateBoss(delta) {
            if (!boss || !boss.active || boss.hp <= 0) return;

            const bossPos = boss.group.position;

            // --- Kejar pemain ---
            const toPlayer = new THREE.Vector3().subVectors(currentPos, bossPos);
            toPlayer.y = 0;
            const dist = toPlayer.length();
            if (dist > 0.001) toPlayer.normalize();

            bossPos.addScaledVector(toPlayer, boss.cfg.speed * delta);

            // Batasi di dalam peta
            const lim = activeLevelCfg.mapSize - boss.cfg.radius;
            bossPos.x = Math.max(-lim, Math.min(lim, bossPos.x));
            bossPos.z = Math.max(-lim, Math.min(lim, bossPos.z));

            // --- Animasi ---
            boss.spin += delta * 0.7;
            boss.teethGroup.rotation.y = boss.spin;
            boss.debrisGroup.rotation.y = -boss.spin * 1.5;
            boss.debrisGroup.position.y = 1.6 + Math.sin(boss.spin * 2.4) * 0.3;

            // --- Efek getar saat terkena damage ---
            if (boss.hitFlash > 0) {
                boss.hitFlash -= delta;
                const s = 1 + Math.sin(boss.hitFlash * 70) * 0.025;
                boss.group.scale.set(boss.cfg.radius * s, 1, boss.cfg.radius * s);
            } else {
                boss.group.scale.set(boss.cfg.radius, 1, boss.cfg.radius);
            }

            // --- Bar HP 3D mengikuti bos & selalu menghadap kamera ---
            if (boss.barGroup) {
                boss.barGroup.position.set(bossPos.x, boss.cfg.radius * 0.4 + 5.5, bossPos.z);
                boss.barGroup.quaternion.copy(camera.quaternion);
            }

            // --- Kontak dengan pemain ---
            const contactDist = boss.cfg.radius + playerHoleRadius * 0.6;
            const canBite = playerHoleRadius >= boss.cfg.radius * BOSS_BITE_RATIO;

            if (dist < contactDist) {
                if (canBite) {
                    // Pemain menggigit bos -> damage per detik
                    const dmg = playerHoleRadius * BOSS_BITE_DPS * delta;
                    damageBoss(dmg, false);
                } else {
                    // Bos menerkam pemain -> lubang pemain menyusut
                    playerHoleRadius = Math.max(BOSS_MIN_PLAYER_RAD, playerHoleRadius - BOSS_SHRINK_RATE * delta);
                    updatePlayerHoleTransform();

                    if (boss.playerHitCooldown <= 0) {
                        boss.playerHitCooldown = 0.5;
                        flashDamage();
                    }
                }
            }

            if (boss.playerHitCooldown > 0) boss.playerHitCooldown -= delta;
            if (bossHitSoundCooldown > 0) bossHitSoundCooldown -= delta;

            // --- Update UI bar ---
            updateBossHpUI();

            // --- Hint teks (throttled) ---
            bossHintAccum += delta;
            if (bossHintAccum > 0.25) {
                bossHintAccum = 0;
                const needed = (boss.cfg.radius * BOSS_BITE_RATIO).toFixed(1);
                const hint = canBite
                    ? '⚔️ SERANG! Lubangmu cukup besar untuk menggigit bos!'
                    : `Perbesar lubangmu (min. radius ${needed}) untuk bisa menyerang!`;
                if (hint !== lastBossHint) {
                    lastBossHint = hint;
                    const hintEl = document.getElementById('boss-hint');
                    if (hintEl) {
                        hintEl.innerText = hint;
                        hintEl.className = canBite
                            ? 'text-[9px] text-emerald-300 font-bold mt-1 text-center'
                            : 'text-[9px] text-amber-300 font-bold mt-1 text-center';
                    }
                }
            }
        }

        function damageBoss(amount, playSound = true) {
            if (!boss || !boss.active || boss.hp <= 0) return;

            boss.hp -= amount;
            boss.hitFlash = 0.14;

            if (playSound && bossHitSoundCooldown <= 0) {
                bossHitSoundCooldown = 0.12;
                if (soundFX) soundFX.playBossHit();
            }

            if (boss.hp <= 0) {
                boss.hp = 0;
                updateBossHpUI();
                defeatBoss();
            }
        }

        function defeatBoss() {
            if (!boss) return;

            boss.active = false;
            bossDefeated = true;

            const bossPos = boss.group.position.clone();

            // Ledakan puing besar-besaran
            for (let i = 0; i < 10; i++) {
                spawnMaterialDebris(
                    new THREE.Vector3(
                        bossPos.x + (Math.random() - 0.5) * boss.cfg.radius * 1.5,
                        0,
                        bossPos.z + (Math.random() - 0.5) * boss.cfg.radius * 1.5
                    ),
                    'building'
                );
            }

            if (soundFX) soundFX.playBossDefeat();

            scene.remove(boss.group);
            scene.remove(boss.barGroup);

            // Bonus skor besar
            const reward = boss.cfg.reward || 5000;
            score += reward;
            document.getElementById('score').innerText = score.toLocaleString();
            updateTargetProgressBar();
            spawnFloatingScoreText(bossPos, `+${reward}`);

            showAnnouncement('BOS HANCUR!', `${boss.cfg.name} BERHASIL DIKALAHKAN`, 'text-emerald-400');

            boss = null;

            // Selesaikan level setelah animasi singkat
            setTimeout(() => {
                if (isPlaying) endGame();
            }, 1500);
        }

        function updateBossHpUI() {
            if (!boss) return;

            const ratio = Math.max(0, boss.hp / boss.maxHp);

            const fill = document.getElementById('boss-hp-fill');
            const txt = document.getElementById('boss-hp-text');
            const nameEl = document.getElementById('boss-name');
            const iconEl = document.getElementById('boss-icon');

            if (fill) fill.style.width = `${ratio * 100}%`;
            if (txt) txt.innerText = `${Math.ceil(Math.max(0, boss.hp)).toLocaleString()} / ${boss.maxHp.toLocaleString()}`;
            if (nameEl && nameEl.innerText !== boss.cfg.name) nameEl.innerText = boss.cfg.name;
            if (iconEl && boss.cfg.icon) iconEl.className = `fa-solid ${boss.cfg.icon}`;

            if (boss.barFill) {
                const r = Math.max(0.001, ratio);
                boss.barFill.scale.x = r;
                boss.barFill.position.x = -(BOSS_BAR_WIDTH_3D * (1 - r)) / 2;
            }
        }

        function flashDamage() {
            const el = document.getElementById('damage-flash');
            if (!el) return;
            el.classList.remove('opacity-0');
            el.classList.add('opacity-100');
            setTimeout(() => {
                el.classList.remove('opacity-100');
                el.classList.add('opacity-0');
            }, 130);
        }

        function showAnnouncement(title, sub, colorClass = 'text-rose-500') {
            const el = document.getElementById('announcement');
            const t = document.getElementById('announcement-title');
            const s = document.getElementById('announcement-sub');
            if (!el || !t || !s) return;

            t.innerText = title;
            t.className = `text-3xl md:text-6xl font-black drop-shadow-2xl tracking-wider text-center px-4 ${colorClass}`;
            s.innerText = sub;

            el.classList.remove('hidden-ann');
            clearTimeout(announceTimeout);
            announceTimeout = setTimeout(() => {
                el.classList.add('hidden-ann');
            }, 1900);
        }

        /* =====================================================================
           AI BOTS
           ===================================================================== */
        function createAIBots() {
            aiBots.forEach(bot => scene.remove(bot.meshGroup));
            aiBots = [];

            const botNames = ["EcoBot Alpha", "EcoBot Beta"];
            const botColors = [0xef4444, 0xf59e0b];

            for (let i = 0; i < 2; i++) {
                const depthObj = createDepthHoleMesh(botColors[i]);
                scene.add(depthObj.group);

                aiBots.push({
                    name: botNames[i],
                    color: botColors[i],
                    meshGroup: depthObj.group,
                    radius: 1.5,
                    score: 0,
                    pos: new THREE.Vector3((i === 0 ? 25 : -25), 0, (i === 0 ? -25 : 25)),
                    target: new THREE.Vector3()
                });
            }
        }

        function updateAIBots(delta) {
            aiBots.forEach(bot => {
                if (bot.target.distanceTo(bot.pos) < 2 || Math.random() < 0.02) {
                    const mapLimit = activeLevelCfg.mapSize - 10;
                    bot.target.set(
                        (Math.random() - 0.5) * mapLimit * 1.5,
                        0,
                        (Math.random() - 0.5) * mapLimit * 1.5
                    );
                }

                bot.pos.lerp(bot.target, delta * 0.8);
                bot.meshGroup.position.copy(bot.pos);
                bot.meshGroup.scale.set(bot.radius, 1, bot.radius);

                for (let i = eatableObjects.length - 1; i >= 0; i--) {
                    const item = eatableObjects[i];
                    if (item.isFalling) continue;

                    const d = bot.pos.distanceTo(item.mesh.position);
                    if (d < bot.radius * 0.85 && bot.radius > item.radius * 0.8) {
                        item.isFalling = true;
                        bot.score += item.points;
                        bot.radius += item.radius * 0.02;

                        scene.remove(item.mesh);
                        eatableObjects.splice(i, 1);
                    }
                }
            });
        }

        function updateLeaderboardUI() {
            const list = [
                { name: "Anda (Player)", score: score, isPlayer: true },
                ...aiBots.map(b => ({ name: b.name, score: Math.round(b.score), isPlayer: false }))
            ];

            list.sort((a, b) => b.score - a.score);

            const container = document.getElementById('leaderboard-list');
            if (!container) return;

            container.innerHTML = list.map((item, idx) => `
                <div class="lb-item ${item.isPlayer ? 'border border-emerald-500/50 bg-emerald-500/20' : ''}">
                    <span class="font-bold ${item.isPlayer ? 'text-emerald-300' : 'text-slate-300'}">
                        #${idx + 1} ${item.name}
                    </span>
                    <span class="font-black text-amber-400">${item.score.toLocaleString()}</span>
                </div>
            `).join('');
        }

        /* =====================================================================
           INPUT
           ===================================================================== */
        function setupInputListeners() {
            window.addEventListener('pointermove', (e) => {
                if (!isPlaying || isUIElement(e.target)) return;

                mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
                    targetPos.copy(intersectionPoint);
                }
            });

            window.addEventListener('touchstart', (e) => {
                if (isUIElement(e.target)) return;
                if (e.touches.length > 0) {
                    touchActive = true;
                    touchStartPos.x = e.touches[0].clientX;
                    touchStartPos.y = e.touches[0].clientY;

                    const base = document.getElementById('joystick-base');
                    if (base) {
                        base.style.left = `${touchStartPos.x}px`;
                        base.style.top = `${touchStartPos.y}px`;
                        base.style.display = 'block';
                    }
                }
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (!touchActive || isUIElement(e.target)) return;
                if (e.touches.length > 0) {
                    const deltaX = e.touches[0].clientX - touchStartPos.x;
                    const deltaY = e.touches[0].clientY - touchStartPos.y;
                    const dist = Math.hypot(deltaX, deltaY);
                    const clamped = Math.min(dist, 40);
                    const angle = Math.atan2(deltaY, deltaX);

                    joystickVector.x = (clamped / 40) * Math.cos(angle);
                    joystickVector.y = (clamped / 40) * Math.sin(angle);

                    const stick = document.getElementById('joystick-stick');
                    if (stick) {
                        stick.style.left = `${50 + joystickVector.x * 30}px`;
                        stick.style.top = `${50 + joystickVector.y * 30}px`;
                    }
                }
            }, { passive: true });

            const endTouch = () => {
                touchActive = false;
                joystickVector.set(0, 0);
                const base = document.getElementById('joystick-base');
                if (base) base.style.display = 'none';
            };

            window.addEventListener('touchend', endTouch);
            window.addEventListener('touchcancel', endTouch);

            window.addEventListener('keydown', (e) => {
                if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
            });

            window.addEventListener('keyup', (e) => {
                if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
            });

            bindButton('start-btn', () => { if (soundFX) soundFX.init(); startGame(); });
            bindButton('restart-btn', () => startGame());
            bindButton('next-level-btn', () => goToNextLevel());
            bindButton('back-menu-btn', () => backToMenu());
            bindButton('achievements-btn', () => toggleAchievements());
            bindButton('close-achievements-btn', () => toggleAchievements());
            bindButton('fullscreen-btn', () => toggleFullscreen());
            bindButton('sound-btn', () => toggleSound());
        }

        function isUIElement(target) {
            if (!target) return false;
            return !!target.closest('button, .hud-pill, .glass-panel, #start-screen, #gameover-screen, #achievements-modal, #level-cards-grid');
        }

        function bindButton(id, callback) {
            const btn = document.getElementById(id);
            if (!btn) return;

            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (soundFX) soundFX.playClick();
                callback();
            };

            btn.addEventListener('click', handler);
            btn.addEventListener('pointerdown', (e) => e.stopPropagation());
            btn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        }

        /* =====================================================================
           PARTICLES & FX
           ===================================================================== */
        function spawnMaterialDebris(pos, type = 'trash') {
            const colorHex = type === 'tree' ? 0x15803d : (type === 'building' ? 0x0284c7 : 0x38bdf8);
            const geo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
            const mat = new THREE.MeshBasicMaterial({ color: colorHex });

            for (let i = 0; i < 10; i++) {
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(pos.x, 0.4, pos.z);
                const vel = new THREE.Vector3(
                    (Math.random() - 0.5) * 8,
                    Math.random() * 6 + 3,
                    (Math.random() - 0.5) * 8
                );
                scene.add(mesh);
                particles.push({ mesh, vel, life: 1.0 });
            }
        }

        function updateParticles(delta) {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life -= delta * 2.5;
                p.mesh.position.addScaledVector(p.vel, delta);
                p.vel.y -= 12 * delta;
                p.mesh.scale.multiplyScalar(0.92);

                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    particles.splice(i, 1);
                }
            }
        }

        function spawnFloatingScoreText(pos3D, text) {
            const vector = pos3D.clone();
            vector.project(camera);

            const x = (vector.x * .5 + .5) * window.innerWidth;
            const y = (-(vector.y * .5) + .5) * window.innerHeight;

            const pop = document.createElement('div');
            pop.className = 'score-float-pop text-amber-400';
            pop.innerText = text;
            pop.style.left = `${x}px`;
            pop.style.top = `${y}px`;
            document.getElementById('game-container').appendChild(pop);

            setTimeout(() => pop.remove(), 850);
        }

        function triggerEcoFactPopup() {
            const fact = ECO_FACTS[Math.floor(Math.random() * ECO_FACTS.length)];
            const banner = document.getElementById('eco-fact-banner');
            if (!banner) return;
            document.getElementById('eco-fact-text').innerText = fact;

            banner.classList.remove('opacity-0', '-translate-y-4');
            banner.classList.add('opacity-100', 'translate-y-0');

            setTimeout(() => {
                banner.classList.remove('opacity-100', 'translate-y-0');
                banner.classList.add('opacity-0', '-translate-y-4');
            }, 4000);
        }

        /* =====================================================================
           PLAYER / CORE LOOP HELPERS
           ===================================================================== */
        function updatePlayerHoleTransform() {
            if (playerHoleGroup) playerHoleGroup.scale.set(playerHoleRadius, 1, playerHoleRadius);
        }

        function updateTargetProgressBar() {
            const levelCfg = activeLevelCfg;
            const bar = document.getElementById('target-progress-bar');
            const txt = document.getElementById('target-text');
            if (!bar || !txt) return;

            if (levelCfg.isBoss) {
                // Pada level bos, progress bar atas menampilkan sisa HP bos
                const ratio = boss ? Math.max(0, boss.hp / boss.maxHp) : (bossDefeated ? 0 : 1);
                bar.style.width = `${ratio * 100}%`;
                bar.className = 'bg-gradient-to-r from-rose-600 to-orange-400 h-full transition-all duration-300';
                txt.innerText = `Target: Hancurkan ${levelCfg.boss.name}!`;
                return;
            }

            const pct = Math.min(100, Math.floor((score / levelCfg.targetScore) * 100));
            bar.style.width = `${pct}%`;
            bar.className = 'bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300';
            txt.innerText = `Target: ${score.toLocaleString()} / ${levelCfg.targetScore.toLocaleString()} Pts (${pct}%)`;
        }

        function checkSwallowCollisions() {
            for (let i = eatableObjects.length - 1; i >= 0; i--) {
                const item = eatableObjects[i];
                if (item.isFalling) continue;

                const dist = playerHoleGroup.position.distanceTo(item.mesh.position);

                if (playerHoleRadius > item.radius * 0.82) {
                    if (dist < playerHoleRadius * 0.85) {
                        item.isFalling = true;
                    }

                    if (item.isFalling) {
                        item.mesh.position.x = THREE.MathUtils.lerp(item.mesh.position.x, playerHoleGroup.position.x, 0.3);
                        item.mesh.position.z = THREE.MathUtils.lerp(item.mesh.position.z, playerHoleGroup.position.z, 0.3);
                        item.mesh.position.y -= 0.5;
                        item.mesh.scale.multiplyScalar(0.82);

                        if (item.mesh.position.y < -4) {
                            if (soundFX) soundFX.playEat(item.type);

                            score += Math.round(item.points);
                            totalItemsEaten++;

                            // ---- DAMAGE KE BOS (dari objek yang ditelan) ----
                            if (activeLevelCfg.isBoss && boss && boss.active && boss.hp > 0) {
                                damageBoss(item.points * BOSS_EAT_DAMAGE_MULT, true);
                            }

                            spawnMaterialDebris(item.mesh.position, item.type);
                            spawnFloatingScoreText(item.mesh.position, `+${item.points}`);

                            scene.remove(item.mesh);
                            eatableObjects.splice(i, 1);

                            document.getElementById('score').innerText = score.toLocaleString();
                            updateTargetProgressBar();

                            const growMult = activeLevelCfg.isBoss ? 0.045 : 0.03;
                            playerHoleRadius += item.radius * growMult;
                            updatePlayerHoleTransform();

                            if (totalItemsEaten % 6 === 0) triggerEcoFactPopup();
                            checkAchievements();
                        }
                    }
                }
            }
        }

        /* =====================================================================
           MAIN ANIMATION LOOP
           ===================================================================== */
        function animate() {
            requestAnimationFrame(animate);
            const delta = Math.min(clock.getDelta(), 0.05);

            if (isPlaying) {
                let moveX = 0, moveZ = 0;
                if (keys.w || keys.ArrowUp) moveZ -= 1;
                if (keys.s || keys.ArrowDown) moveZ += 1;
                if (keys.a || keys.ArrowLeft) moveX -= 1;
                if (keys.d || keys.ArrowRight) moveX += 1;

                if (touchActive) {
                    moveX = joystickVector.x;
                    moveZ = joystickVector.y;
                } else {
                    const len = Math.hypot(moveX, moveZ);
                    if (len > 0) { moveX /= len; moveZ /= len; }
                }

                const speed = 13 + (playerHoleRadius * 0.2);
                if (touchActive || keys.w || keys.s || keys.a || keys.d ||
                    keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) {
                    targetPos.x += moveX * speed * delta;
                    targetPos.z += moveZ * speed * delta;
                }

                const clampLimit = activeLevelCfg.mapSize - playerHoleRadius - 1;
                targetPos.x = Math.max(-clampLimit, Math.min(clampLimit, targetPos.x));
                targetPos.z = Math.max(-clampLimit, Math.min(clampLimit, targetPos.z));

                currentPos.lerp(targetPos, 0.14);
                if (playerHoleGroup) playerHoleGroup.position.copy(currentPos);

                const camDistY = 18 + (playerHoleRadius * 3.0);
                const camDistZ = 16 + (playerHoleRadius * 2.8);

                if (playerHoleGroup && camera) {
                    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerHoleGroup.position.x, 0.12);
                    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camDistY, 0.12);
                    camera.position.z = THREE.MathUtils.lerp(camera.position.z, playerHoleGroup.position.z + camDistZ, 0.12);
                    camera.lookAt(playerHoleGroup.position);
                }

                // Kendaraan & pejalan kaki
                movingVehicles.forEach(v => {
                    if (!v.isFalling) v.mesh.position.addScaledVector(v.vel, delta);
                });

                pedestrians.forEach(p => {
                    if (!p.isFalling) {
                        p.mesh.position.x += Math.cos(p.angle) * delta * 2;
                        p.mesh.position.z += Math.sin(p.angle) * delta * 2;
                    }
                });

                updateAIBots(delta);
                updateBoss(delta);
                checkSwallowCollisions();
                updateParticles(delta);

                // Leaderboard throttled (tiap 0.3 detik)
                leaderboardAccum += delta;
                if (leaderboardAccum > 0.3) {
                    leaderboardAccum = 0;
                    updateLeaderboardUI();
                }
            }

            renderer.render(scene, camera);
        }

        /* =====================================================================
           LEVEL CARDS UI
           ===================================================================== */
        function renderLevelCardsUI() {
            const grid = document.getElementById('level-cards-grid');
            if (!grid) return;

            grid.innerHTML = LEVELS_CONFIG.map(lvl => {
                const isUnlocked = unlockedLevels.includes(lvl.id);
                const isSelected = selectedLevel === lvl.id;

                let borderStyle = 'border-slate-800 bg-slate-900/50 opacity-60 cursor-not-allowed';
                if (isUnlocked) {
                    borderStyle = isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20 cursor-pointer ring-2 ring-emerald-400'
                        : 'border-slate-700 bg-slate-800/60 hover:border-emerald-500/50 cursor-pointer';
                }

                const bossBadge = lvl.isBoss
                    ? `<span class="text-[8px] bg-rose-600 text-white font-black px-1.5 py-0.5 rounded-full ml-1"><i class="fa-solid fa-skull"></i> BOS</span>`
                    : '';

                const objective = lvl.isBoss
                    ? `<div class="text-[9px] text-rose-400 font-bold"><i class="fa-solid fa-heart-crack"></i> Habisi ${lvl.boss.name} (${lvl.boss.hp.toLocaleString()} HP)</div>`
                    : `<div class="text-[9px] text-amber-400 font-bold">Target: ${lvl.targetScore.toLocaleString()} Pts</div>`;

                return `
                    <div data-level-id="${lvl.id}" class="level-card glass-panel p-2.5 rounded-xl border text-left transition-all ${borderStyle}">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-extrabold text-xs flex items-center gap-1.5 ${isSelected ? 'text-emerald-300' : 'text-slate-200'}">
                                <i class="fa-solid ${lvl.icon}"></i> ${lvl.name}
                            </span>
                            ${!isUnlocked
                                ? '<i class="fa-solid fa-lock text-slate-500 text-xs"></i>'
                                : (isSelected ? '<span class="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">AKTIF</span>' : '')}
                        </div>
                        <div class="flex items-center flex-wrap gap-1 mb-1">${bossBadge}</div>
                        ${objective}
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.level-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lvlId = parseInt(card.getAttribute('data-level-id'));
                    if (unlockedLevels.includes(lvlId)) {
                        selectedLevel = lvlId;
                        if (soundFX) soundFX.playClick();
                        renderLevelCardsUI();
                    }
                });
            });
        }

        /* =====================================================================
           ACHIEVEMENTS
           ===================================================================== */
        function checkAchievements() {
            const list = [
                { name: "Player", score: score },
                ...aiBots.map(b => ({ name: b.name, score: Math.round(b.score) }))
            ];
            list.sort((a, b) => b.score - a.score);
            const isRank1 = list[0].name === "Player";

            ACHIEVEMENTS_DATA.forEach(ach => {
                if (!ach.unlocked) {
                    if (ach.id === 'first_eat' && totalItemsEaten >= 10) unlockAchievement(ach);
                    if (ach.id === 'bot_slayer' && isRank1 && score >= 1000) unlockAchievement(ach);
                    if (ach.id === 'eco_hero' && score >= 5000) unlockAchievement(ach);
                }
            });
        }

        function unlockAchievement(ach) {
            ach.unlocked = true;
            if (soundFX) soundFX.playAchievement();
            renderAchievementsList();
        }

        function renderAchievementsList() {
            const container = document.getElementById('achievements-list');
            if (!container) return;

            container.innerHTML = ACHIEVEMENTS_DATA.map(ach => `
                <div class="glass-panel p-3 rounded-2xl flex items-center gap-3 border ${ach.unlocked ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-800'}">
                    <div class="w-10 h-10 rounded-xl ${ach.unlocked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-lg">
                        <i class="fa-solid ${ach.icon}"></i>
                    </div>
                    <div>
                        <div class="text-xs font-black ${ach.unlocked ? 'text-amber-400' : 'text-slate-400'}">${ach.title}</div>
                        <div class="text-[10px] text-slate-300">${ach.desc}</div>
                    </div>
                </div>
            `).join('');
        }

        function toggleAchievements() {
            if (soundFX) soundFX.playClick();
            const modal = document.getElementById('achievements-modal');
            if (modal) modal.classList.toggle('hidden');
        }

        function toggleFullscreen() {
            if (soundFX) soundFX.playClick();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        }

        function toggleSound() {
            if (!soundFX) return;
            const isMuted = soundFX.toggleMute();
            const icon = document.querySelector('#sound-btn i');
            if (icon) icon.className = isMuted ? 'fa-solid fa-volume-xmark text-rose-400' : 'fa-solid fa-volume-high text-cyan-400';
        }

        /* =====================================================================
           WORLD SPAWNING
           ===================================================================== */
        function spawnCityObjects() {
            eatableObjects.forEach(item => scene.remove(item.mesh));
            eatableObjects = [];
            movingVehicles = [];
            pedestrians = [];

            const size = activeLevelCfg.mapSize;
            createCityGridRoads(size);

            // Jumlah objek menyesuaikan luas peta
            const objectCount = Math.round(150 + size * 0.8);

            for (let i = 0; i < objectCount; i++) {
                const x = (Math.random() - 0.5) * (size * 1.6);
                const z = (Math.random() - 0.5) * (size * 1.6);
                if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;

                const rand = Math.random();
                let item;

                if (rand < 0.35) item = spawnPlasticLitter(x, z);
                else if (rand < 0.65) item = spawnTree(x, z, rand < 0.5 ? 'oak' : 'pine');
                else if (rand < 0.85) item = spawnHouse(x, z);
                else item = spawnSkyscraper(x, z);

                eatableObjects.push(item);
            }

            for (let i = 0; i < 12; i++) {
                spawnMovingVehicle(
                    (Math.random() - 0.5) * size,
                    (Math.random() - 0.5) * size,
                    (Math.random() > 0.5 ? 1 : -1), 0
                );
                spawnPedestrian(
                    (Math.random() - 0.5) * size,
                    (Math.random() - 0.5) * size
                );
            }
        }

        /* =====================================================================
           GAME FLOW
           ===================================================================== */
        function startGame() {
            activeLevelCfg = LEVELS_CONFIG.find(l => l.id === selectedLevel) || LEVELS_CONFIG[0];

            score = 0;
            playerHoleRadius = 1.6;
            gameTimer = activeLevelCfg.duration;
            totalItemsEaten = 0;
            bossDefeated = false;
            leaderboardAccum = 0;
            lastBossHint = '';

            targetPos.set(0, 0, 0);
            currentPos.set(0, 0, 0);

            document.getElementById('score').innerText = '0';
            document.getElementById('timer').innerText = `${gameTimer}s`;

            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('gameover-screen').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');

            // Bersihkan bos dari sesi sebelumnya
            clearBoss();

            renderAchievementsList();
            updatePlayerHoleTransform();
            spawnCityObjects();
            createAIBots();

            // ---- SETUP BOS (jika level bos) ----
            const bossWrap = document.getElementById('boss-bar-wrap');
            if (activeLevelCfg.isBoss) {
                spawnBoss();
                if (bossWrap) bossWrap.classList.remove('hidden');
                updateBossHpUI();

                setTimeout(() => {
                    showAnnouncement('⚠ BOS MUNCUL ⚠', activeLevelCfg.boss.name, 'text-rose-500');
                }, 350);
            } else {
                if (bossWrap) bossWrap.classList.add('hidden');
            }

            updateTargetProgressBar();
            updateLeaderboardUI();

            isPlaying = true;

            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (!isPlaying) return;
                gameTimer--;
                document.getElementById('timer').innerText = `${gameTimer}s`;
                if (gameTimer <= 0) endGame();
            }, 1000);
        }

        function endGame() {
            isPlaying = false;
            clearInterval(timerInterval);

            // ---- KONDISI MENANG ----
            // Level biasa : skor >= target
            // Level bos   : darah bos habis (boss hancur)
            const passed = activeLevelCfg.isBoss
                ? bossDefeated
                : (score >= activeLevelCfg.targetScore);

            if (passed && selectedLevel < 5 && !unlockedLevels.includes(selectedLevel + 1)) {
                unlockedLevels.push(selectedLevel + 1);
            }

            // Achievement khusus bos
            if (activeLevelCfg.isBoss && bossDefeated) {
                const achBoss = ACHIEVEMENTS_DATA.find(a => a.id === 'boss_slayer');
                if (achBoss && !achBoss.unlocked) unlockAchievement(achBoss);

                if (selectedLevel === 5) {
                    const achEarth = ACHIEVEMENTS_DATA.find(a => a.id === 'earth_master');
                    if (achEarth && !achEarth.unlocked) unlockAchievement(achEarth);
                }
            }

            const list = [
                { name: "Player", score: score },
                ...aiBots.map(b => ({ name: b.name, score: Math.round(b.score) }))
            ];
            list.sort((a, b) => b.score - a.score);
            const rankIdx = list.findIndex(i => i.name === "Player") + 1;

            // ---- Judul recap ----
            const titleEl = document.getElementById('recap-title');
            const subEl = document.getElementById('recap-subtitle');
            const iconEl = document.getElementById('recap-icon');
            const statusLabel = document.getElementById('final-status-label');

            if (activeLevelCfg.isBoss) {
                if (passed) {
                    titleEl.innerText = 'BOS DIHANCURKAN!';
                    titleEl.className = 'text-3xl md:text-5xl font-black mb-1 text-emerald-400';
                    subEl.innerText = `${activeLevelCfg.boss.name} telah musnah. Kota kembali bersih!`;
                    iconEl.className = 'w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mb-3 shadow-xl';
                    iconEl.innerHTML = '<i class="fa-solid fa-trophy"></i>';
                } else {
                    titleEl.innerText = 'BOS BELUM TUMBANG';
                    titleEl.className = 'text-3xl md:text-5xl font-black mb-1 text-rose-500';
                    subEl.innerText = `${activeLevelCfg.boss.name} masih hidup. Perbesar lubangmu dan serang terus!`;
                    iconEl.className = 'w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-3xl mb-3 shadow-xl';
                    iconEl.innerHTML = '<i class="fa-solid fa-skull"></i>';
                }
                statusLabel.innerText = 'Status Bos';
            } else {
                titleEl.innerText = passed ? 'Level Selesai!' : 'Belum Mencapai Target';
                titleEl.className = `text-3xl md:text-5xl font-black mb-1 ${passed ? 'text-emerald-400' : 'text-rose-500'}`;
                subEl.innerText = 'Ringkasan Hasil Permainan:';
                iconEl.className = 'w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mb-3 shadow-xl';
                iconEl.innerHTML = '<i class="fa-solid fa-recycle"></i>';
                statusLabel.innerText = 'Status Target';
            }

            document.getElementById('final-score').innerText = score.toLocaleString();
            document.getElementById('final-rank').innerText = `#${rankIdx} ${rankIdx === 1 ? 'PERTAMA' : 'POSISI'}`;
            document.getElementById('final-items').innerText = `${totalItemsEaten} Objek`;
            document.getElementById('final-status').innerText = passed ? 'Berhasil' : 'Gagal';
            document.getElementById('final-status').className = `text-sm font-black ${passed ? 'text-emerald-400' : 'text-rose-400'}`;

            const nextBtn = document.getElementById('next-level-btn');
            if (passed && selectedLevel < 5) nextBtn.classList.remove('hidden');
            else nextBtn.classList.add('hidden');

            document.getElementById('hud').classList.add('hidden');
            document.getElementById('gameover-screen').classList.remove('hidden');

            clearBoss();
            renderLevelCardsUI();
        }

        function goToNextLevel() {
            if (selectedLevel < 5) selectedLevel++;
            startGame();
        }

        function backToMenu() {
            document.getElementById('gameover-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            clearBoss();
        }

        /* =====================================================================
           ENGINE INIT
           ===================================================================== */
        function initEngine() {
            const container = document.getElementById('game-container');

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x020617);

            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
            camera.position.set(0, 30, 25);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            container.appendChild(renderer.domElement);

            const ambient = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
            dirLight.position.set(40, 80, 40);
            dirLight.castShadow = true;
            scene.add(dirLight);

            const playerHoleDepth = createDepthHoleMesh(0x10b981);
            playerHoleGroup = playerHoleDepth.group;
            scene.add(playerHoleGroup);

            soundFX = new SoundController();

            setupInputListeners();
            renderLevelCardsUI();
            renderAchievementsList();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            animate();
        }

        window.onload = function () {
            initEngine();
        };
    </script>
</body>
</html>
