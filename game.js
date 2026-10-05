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
            <!-- Top Header Stats & Leaderboard -->
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

            <p class="text-slate-300 max-w-lg text-xs md:text-sm mb-5 leading-relaxed">
                Kendalikan hole 3D nyata dengan efek kedalaman kedalam tanah. Berlomba memakan kota melawan AI Competitor!
            </p>

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
                    <div class="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">Status Target</div>
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
                } catch(e){}
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
                } catch(e){}
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
                } catch(e){}
            }
        }

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
            { id: 'earth_master', title: 'Penguasa Bumi', desc: 'Lahap seluruh Planet Bumi di Level 5', icon: 'fa-earth-americas', unlocked: false }
        ];

        const LEVELS_CONFIG = [
            { id: 1, name: "Level 1: Taman & Sampah", targetScore: 1500, duration: 120, icon: "fa-tree", mapSize: 80 },
            { id: 2, name: "Level 2: Perumahan Surya", targetScore: 4000, duration: 150, icon: "fa-solar-panel", mapSize: 110 },
            { id: 3, name: "Level 3: Kawasan Industri", targetScore: 9000, duration: 180, icon: "fa-industry", mapSize: 150 },
            { id: 4, name: "Level 4: Wilayah Pesisir", targetScore: 20000, duration: 210, icon: "fa-volcano", mapSize: 220 },
            { id: 5, name: "Level 5: Planet Bumi", targetScore: 45000, duration: 240, icon: "fa-earth-americas", mapSize: 350 }
        ];

        let scene, camera, renderer;
        let soundFX;
        let selectedLevel = 1;
        let unlockedLevels = [1];
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

        // 3D Depth Mask Hole elements
        let playerHoleGroup, coverDiskMesh, pitCylinderMesh, holeBorderMesh;
        let eatableObjects = [];
        let particles = [];
        let movingVehicles = [];
        let pedestrians = [];
        let aiBots = [];

        function createDepthHoleMesh(colorHex = 0x10b981) {
            const group = new THREE.Group();

            // 1. Cover Disk with Depth Mask (Writes to Depth Buffer at Y=0.01 to visually cut ground)
            const coverGeo = new THREE.CircleGeometry(1, 32);
            const coverMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true });
            const coverDisk = new THREE.Mesh(coverGeo, coverMat);
            coverDisk.rotation.x = -Math.PI / 2;
            coverDisk.position.y = 0.01;
            coverDisk.renderOrder = 0;
            group.add(coverDisk);

            // 2. 3D Pit Cylinder extending down into ground Y = -0.1 to -12
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

            // 3. Glowing Border Ring on ground surface
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

            // Ground plane (renderOrder 1)
            const groundGeo = new THREE.PlaneGeometry(size * 2, size * 2);
            const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
            const groundMesh = new THREE.Mesh(groundGeo, groundMat);
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.receiveShadow = true;
            groundMesh.renderOrder = 1;
            groundGroup.add(groundMesh);

            // Green park blocks
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

            return { mesh: grp, radius: 1.1, points: 30, type: 'tree' };
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

            return { mesh: grp, radius: 0.25, points: 10, type: 'trash' };
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

            return { mesh: grp, radius: 3.2, points: 250, type: 'building' };
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

            return { mesh: grp, radius: 5.5, points: 1200, type: 'building' };
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
                    const levelCfg = LEVELS_CONFIG.find(l => l.id === selectedLevel) || LEVELS_CONFIG[0];
                    const mapLimit = levelCfg.mapSize - 10;
                    bot.target.set(
                        (Math.random() - 0.5) * mapLimit * 1.5,
                        0,
                        (Math.random() - 0.5) * mapLimit * 1.5
                    );
                }

                bot.pos.lerp(bot.target, delta * 0.8);
                bot.meshGroup.position.copy(bot.pos);
                bot.meshGroup.scale.set(bot.radius, 1, bot.radius);

                // AI eating logic
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

            updateLeaderboardUI();
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

                            spawnMaterialDebris(item.mesh.position, item.type);
                            spawnFloatingScoreText(item.mesh.position, `+${item.points}`);

                            scene.remove(item.mesh);
                            eatableObjects.splice(i, 1);

                            document.getElementById('score').innerText = score.toLocaleString();
                            updateTargetProgressBar();

                            playerHoleRadius += item.radius * 0.03;
                            updatePlayerHoleTransform();

                            if (totalItemsEaten % 6 === 0) triggerEcoFactPopup();
                            checkAchievements();
                        }
                    }
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

        function updatePlayerHoleTransform() {
            if (playerHoleGroup) playerHoleGroup.scale.set(playerHoleRadius, 1, playerHoleRadius);
        }

        function updateTargetProgressBar() {
            const levelCfg = LEVELS_CONFIG.find(l => l.id === selectedLevel) || LEVELS_CONFIG[0];
            const pct = Math.min(100, Math.floor((score / levelCfg.targetScore) * 100));
            document.getElementById('target-progress-bar').style.width = `${pct}%`;
            document.getElementById('target-text').innerText = `Target: ${score.toLocaleString()} / ${levelCfg.targetScore.toLocaleString()} Pts (${pct}%)`;
        }

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

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

                const speed = 11 + (playerHoleRadius * 0.2);
                if (touchActive || keys.w || keys.s || keys.a || keys.d || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) {
                    targetPos.x += moveX * speed * delta;
                    targetPos.z += moveZ * speed * delta;
                }

                const levelCfg = LEVELS_CONFIG.find(l => l.id === selectedLevel) || LEVELS_CONFIG[0];
                const clampLimit = levelCfg.mapSize - playerHoleRadius - 1;
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

                // Update moving vehicles & pedestrians
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
                checkSwallowCollisions();
                updateParticles(delta);
            }

            renderer.render(scene, camera);
        }

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

                return `
                    <div data-level-id="${lvl.id}" class="level-card glass-panel p-2.5 rounded-xl border text-left transition-all ${borderStyle}">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-extrabold text-xs flex items-center gap-1.5 ${isSelected ? 'text-emerald-300' : 'text-slate-200'}">
                                <i class="fa-solid ${lvl.icon}"></i> ${lvl.name}
                            </span>
                            ${!isUnlocked ? '<i class="fa-solid fa-lock text-slate-500 text-xs"></i>' : (isSelected ? '<span class="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">AKTIF</span>' : '')}
                        </div>
                        <div class="text-[9px] text-amber-400 font-bold">Target: ${lvl.targetScore.toLocaleString()} Pts</div>
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

        function spawnCityObjects() {
            eatableObjects.forEach(item => scene.remove(item.mesh));
            eatableObjects = [];
            movingVehicles = [];
            pedestrians = [];

            const levelCfg = LEVELS_CONFIG.find(l => l.id === selectedLevel) || LEVELS_CONFIG[0];
            const size = levelCfg.mapSize;

            createCityGridRoads(size);

            for (let i = 0; i < 180; i++) {
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
                spawnMovingVehicle((Math.random() - 0.5) * size, (Math.random() - 0.5) * size, (Math.random() > 0.5 ? 1 : -1), 0);
                spawnPedestrian((Math.random() - 0.5) * size, (Math.random() - 0.5) * size);
            }
        }

        function startGame() {
            const levelCfg = LEVELS_CONFIG.find(l => l.id === selectedLevel) || LEVELS_CONFIG[0];

            score = 0;
            playerHoleRadius = 1.6;
            gameTimer = levelCfg.duration;
            totalItemsEaten = 0;

            targetPos.set(0, 0, 0);
            currentPos.set(0, 0, 0);

            document.getElementById('score').innerText = '0';
            document.getElementById('timer').innerText = `${gameTimer}s`;

            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('gameover-screen').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');

            renderAchievementsList();
            updatePlayerHoleTransform();
            spawnCityObjects();
            createAIBots();
            updateTargetProgressBar();

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

            const levelCfg = LEVELS_CONFIG.find(l => l.id === selectedLevel) || LEVELS_CONFIG[0];
            const passed = score >= levelCfg.targetScore;

            if (passed && selectedLevel < 5 && !unlockedLevels.includes(selectedLevel + 1)) {
                unlockedLevels.push(selectedLevel + 1);
            }

            const list = [
                { name: "Player", score: score },
                ...aiBots.map(b => ({ name: b.name, score: Math.round(b.score) }))
            ];
            list.sort((a, b) => b.score - a.score);
            const rankIdx = list.findIndex(i => i.name === "Player") + 1;

            document.getElementById('recap-title').innerText = passed ? 'Level Selesai!' : 'Belum Mencapai Target';
            document.getElementById('recap-title').className = `text-3xl md:text-5xl font-black mb-1 ${passed ? 'text-emerald-400' : 'text-rose-500'}`;
            document.getElementById('final-score').innerText = score.toLocaleString();
            document.getElementById('final-rank').innerText = `#${rankIdx} ${rankIdx === 1 ? 'PERTAMA' : 'POSISI'}`;
            document.getElementById('final-items').innerText = `${totalItemsEaten} Objek`;
            document.getElementById('final-status').innerText = passed ? 'Terbuka' : 'Gagal';
            document.getElementById('final-status').className = `text-sm font-black ${passed ? 'text-emerald-400' : 'text-rose-400'}`;

            const nextBtn = document.getElementById('next-level-btn');
            if (passed && selectedLevel < 5) nextBtn.classList.remove('hidden');
            else nextBtn.classList.add('hidden');

            document.getElementById('hud').classList.add('hidden');
            document.getElementById('gameover-screen').classList.remove('hidden');

            renderLevelCardsUI();
        }

        function goToNextLevel() {
            if (selectedLevel < 5) selectedLevel++;
            startGame();
        }

        function backToMenu() {
            document.getElementById('gameover-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        }

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

        window.onload = function() {
            initEngine();
        };
    </script>
</body>
</html>
