/**
 * PAHLAWAN BINTANG - Upgrade & Hero Configuration
 * v1.0 - Config lengkap untuk toko dan hero
 */

// ========== SHOP UPGRADES ==========
// Total 7 item upgrade (semula 4, ditambah 3 item baru)
const SHOP_UPGRADES_CONFIG = [
  {
    id: 'firerate',
    name: 'Fire Rate',
    desc: 'Menambah kecepatan tembakan',
    price: 120,
    icon: 'i-bolt',
    bonus: 0.12
  },
  {
    id: 'shield',
    name: 'Shield',
    desc: 'Meningkatkan daya tahan shield',
    price: 160,
    icon: 'i-shield',
    bonus: 0.2
  },
  {
    id: 'bomb',
    name: 'Bomb',
    desc: 'Menambah jumlah bomb',
    price: 200,
    icon: 'i-bomb',
    bonus: 1
  },
  {
    id: 'freeze',
    name: 'Freeze',
    desc: 'Membuat musuh lebih lambat',
    price: 180,
    icon: 'i-snow',
    bonus: 0.15
  },
  {
    id: 'rapid',
    name: 'Rapid Burst',
    desc: 'Menaikkan efek serangan cepat',
    price: 240,
    icon: 'i-bolt',
    bonus: 0.18
  },
  {
    id: 'regen',
    name: 'Regen Shield',
    desc: 'Memulihkan HP saat bertahan lama',
    price: 260,
    icon: 'i-shield',
    bonus: 0.1
  },
  {
    id: 'crit',
    name: 'Critical Damage',
    desc: 'Meningkatkan damage kritis',
    price: 300,
    icon: 'i-star',
    bonus: 0.12
  }
];

// ========== HERO DATA ==========
// Total 12 hero (semula lebih sedikit, sekarang lengkap)
const HEROES_CONFIG = [
  {
    id: 'robot',
    name: 'Robot Cyber',
    rarity: 'starter',
    cost: 0,
    icon: 'i-robot',
    desc: 'Hero awal, seimbang'
  },
  {
    id: 'cannon',
    name: 'Meriam Bintang',
    rarity: 'common',
    cost: 120,
    icon: 'i-cannon',
    desc: 'Tembakan yang kuat'
  },
  {
    id: 'dragon',
    name: 'Cyber Dragon',
    rarity: 'rare',
    cost: 260,
    icon: 'i-dragon',
    desc: 'Api membakar area'
  },
  {
    id: 'cat',
    name: 'Ninja Cat',
    rarity: 'rare',
    cost: 320,
    icon: 'i-cat',
    desc: 'Cepat dan lincah'
  },
  {
    id: 'unicorn',
    name: 'Unicorn Star',
    rarity: 'epic',
    cost: 420,
    icon: 'i-unicorn',
    desc: 'Cahaya sihir murni'
  },
  {
    id: 'phoenix',
    name: 'Phoenix Api',
    rarity: 'epic',
    cost: 520,
    icon: 'i-phoenix',
    desc: 'Lahir kembali dari api'
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    rarity: 'legendary',
    cost: 620,
    icon: 'i-ninja',
    desc: 'Serangan kilat bayangan'
  },
  {
    id: 'wizard',
    name: 'Star Wizard',
    rarity: 'legendary',
    cost: 720,
    icon: 'i-wizard',
    desc: 'Sihir bintang galaksi'
  },
  {
    id: 'archer',
    name: 'Elite Archer',
    rarity: 'legendary',
    cost: 820,
    icon: 'i-archer',
    desc: 'Pemanah presisi tinggi'
  },
  {
    id: 'ghost',
    name: 'Void Ghost',
    rarity: 'mythic',
    cost: 950,
    icon: 'i-ghost',
    desc: 'Hantu dari dimensi lain'
  },
  {
    id: 'comet',
    name: 'Comet Dash',
    rarity: 'mythic',
    cost: 1100,
    icon: 'i-star',
    desc: 'Komet berkecepatan tinggi'
  },
  {
    id: 'nova',
    name: 'Nova Pulse',
    rarity: 'mythic',
    cost: 1300,
    icon: 'i-star',
    desc: 'Ledakan energi nova'
  }
];

// ========== HELPER FUNCTIONS ==========
function getUpgradeConfig(upgradeId) {
  return SHOP_UPGRADES_CONFIG.find(u => u.id === upgradeId);
}

function getHeroConfig(heroId) {
  return HEROES_CONFIG.find(h => h.id === heroId);
}

function getAllUpgrades() {
  return SHOP_UPGRADES_CONFIG;
}

function getAllHeroes() {
  return HEROES_CONFIG;
}

function getTotalUpgradeCount() {
  return SHOP_UPGRADES_CONFIG.length;
}

function getTotalHeroCount() {
  return HEROES_CONFIG.length;
}

// Timer untuk membuka hero modal
const HERO_MODAL_OPEN_DURATION_MS = 60000; // 60 detik
