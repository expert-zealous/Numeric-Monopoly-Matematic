// Firebase di-load dinamis agar demo tetap dapat dibuka dengan double-click index.html.
// Saat dijalankan melalui HTTP/HTTPS, adapter modular di firebase.js dipakai otomatis.
const localCloud = {
  async initCloud() { return { configured: false, user: null }; },
  async purchaseTheme() { return { ok: true, demo: true, diamond: null }; },
  async claimDailyReward() { return { ok: true, demo: true, diamond: 100 }; },
  async submitGameResult() { return { ok: true, demo: true }; },
  async createRoom() { return { ok: true, demo: true, id: null, code: makeRoomCode() }; },
  async joinRoom({ code, name, avatar }) { return { ok: true, demo: true, id: null, code, host: { name: 'Rival demo', avatar: '🌐' }, opponent: { name, avatar } }; },
  async startRoom() { return { ok: true, demo: true }; },
  async updateRoomGame() { return { ok: true, demo: true }; },
  watchRoom() { return () => {}; }
};
let cloudApi = localCloud;
async function initCloud() {
  try {
    // Dynamic import is intentionally attempted only after the page has loaded.
    // file:// browsers may reject module imports; the local adapter handles that case.
    if (window.location.protocol !== 'file:') {
      cloudApi = await import('./firebase.js');
    }
  } catch (error) {
    console.info('[Numeric Monopoly] Firebase adapter fallback local:', error?.message || error);
    cloudApi = localCloud;
  }
  return cloudApi.initCloud();
}
const purchaseTheme = (...args) => cloudApi.purchaseTheme(...args);
const createRoom = (...args) => cloudApi.createRoom(...args);
const joinRoom = (...args) => cloudApi.joinRoom(...args);
const startRoom = (...args) => cloudApi.startRoom(...args);
const updateRoomGame = (...args) => cloudApi.updateRoomGame(...args);
const watchRoom = (...args) => cloudApi.watchRoom(...args);
const claimDailyReward = (...args) => cloudApi.claimDailyReward(...args);
const submitGameResult = (...args) => cloudApi.submitGameResult(...args);

const STORAGE_KEY = 'numeric-monopoly-matematic-v1';
const $ = (selector, root = document) => root.querySelector(selector);
const app = $('#app');

const MODE_LABELS = {
  ai: '1 VS AI',
  local: '1 VS 1 • SATU HP',
  online: '1 VS 1 • ONLINE'
};

const DIFFICULTIES = {
  easy: { label: 'Mudah', color: '#76e6af' },
  medium: { label: 'Sedang', color: '#ffd976' },
  hard: { label: 'Sulit', color: '#ff75bf' }
};

const TILE_BLUEPRINT = [
  { name: 'START', icon: '✦', type: 'corner', color: '#5be4ff', detail: 'Lewati untuk bonus 200' },
  { name: 'LUMINA', icon: '◈', type: 'property', color: '#65d7ff', price: 120, rent: 28 },
  { name: 'SOAL BONUS', icon: '✎', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'NOVA PARK', icon: '◈', type: 'property', color: '#65d7ff', price: 140, rent: 32 },
  { name: 'PAJAK', icon: '◌', type: 'tax', color: '#ff75bf', price: 80 },
  { name: 'ORBIT', icon: '◈', type: 'property', color: '#8ee6a5', price: 160, rent: 38 },
  { name: 'DEEP SPACE', icon: '◆', type: 'corner', color: '#c6ef68', detail: 'Zona aman' },
  { name: 'PIXEL BAY', icon: '◈', type: 'property', color: '#8ee6a5', price: 180, rent: 42 },
  { name: 'KARTU MISTERI', icon: '✧', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'SKYLINE', icon: '◈', type: 'property', color: '#8ee6a5', price: 200, rent: 46 },
  { name: 'PRISON', icon: '▦', type: 'corner', color: '#ff9b78', detail: 'Hanya berkunjung' },
  { name: 'SOLARA', icon: '◈', type: 'property', color: '#ffd976', price: 220, rent: 50 },
  { name: 'AIRPORT', icon: '✈', type: 'utility', color: '#ffd976', price: 150, rent: 34 },
  { name: 'VELVET CITY', icon: '◈', type: 'property', color: '#ffd976', price: 240, rent: 55 },
  { name: 'SOAL BONUS', icon: '✎', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'AURORA', icon: '◈', type: 'property', color: '#ff9b78', price: 260, rent: 60 },
  { name: 'FREE ZONE', icon: '✦', type: 'corner', color: '#5be4ff', detail: 'Tarik napas, tetap fokus' },
  { name: 'CRYSTAL', icon: '◈', type: 'property', color: '#ff9b78', price: 280, rent: 65 },
  { name: 'KARTU MISTERI', icon: '✧', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'MOONLIGHT', icon: '◈', type: 'property', color: '#ff9b78', price: 300, rent: 70 },
  { name: 'FREE PARKING', icon: '✦', type: 'corner', color: '#5be4ff', detail: 'Zona bonus' },
  { name: 'NEBULA', icon: '◈', type: 'property', color: '#c28bff', price: 320, rent: 75 },
  { name: 'SOAL BONUS', icon: '✎', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'QUANTUM', icon: '◈', type: 'property', color: '#c28bff', price: 340, rent: 80 },
  { name: 'PAJAK PREMIUM', icon: '◌', type: 'tax', color: '#ff75bf', price: 110 },
  { name: 'ROYAL ARC', icon: '◈', type: 'property', color: '#c28bff', price: 360, rent: 86 },
  { name: 'HYPERLOOP', icon: 'ϟ', type: 'utility', color: '#ffd976', price: 190, rent: 42 },
  { name: 'GOLDEN HARBOR', icon: '◈', type: 'property', color: '#c28bff', price: 390, rent: 92 },
  { name: 'KARTU MISTERI', icon: '✧', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'INFINITY', icon: '◈', type: 'property', color: '#e1a1ff', price: 420, rent: 100 },
  { name: 'GO TO PRISON', icon: '↘', type: 'corner', color: '#ff75bf', detail: 'Teleport ke Prison' },
  { name: 'PRISM', icon: '◈', type: 'property', color: '#65d7ff', price: 440, rent: 108 },
  { name: 'SOAL BONUS', icon: '✎', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'MIRAGE', icon: '◈', type: 'property', color: '#65d7ff', price: 460, rent: 115 },
  { name: 'PAJAK AURA', icon: '◌', type: 'tax', color: '#ff75bf', price: 140 },
  { name: 'STARLIGHT', icon: '◈', type: 'property', color: '#65d7ff', price: 480, rent: 125 },
  { name: 'SOAL BONUS', icon: '✎', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'ECLIPSE', icon: '◈', type: 'property', color: '#65d7ff', price: 500, rent: 135 },
  { name: 'LUCKY LAB', icon: 'ϟ', type: 'utility', color: '#ffd976', price: 220, rent: 50 },
  { name: 'NEXUS', icon: '◈', type: 'property', color: '#65d7ff', price: 520, rent: 145 }
];

const ASSET_VERSION = '78r7';

function versionedAsset(path) {
  if (!path) return '';
  return `${path}${path.includes('?') ? '&' : '?'}v=${ASSET_VERSION}`;
}

const TILE_ASSET_KEYS = [
  'start', 'lumina', 'soal-bonus-01', 'nova-park', 'pajak', 'orbit', 'deep-space', 'pixel-bay',
  'kartu-misteri-01', 'skyline', 'prison', 'solara', 'airport', 'velvet-city', 'soal-bonus-02',
  'aurora', 'free-zone', 'crystal', 'kartu-misteri-02', 'moonlight', 'free-parking', 'nebula',
  'soal-bonus-03', 'quantum', 'pajak-premium', 'royal-arc', 'hyperloop', 'golden-harbor',
  'kartu-misteri-03', 'infinity', 'go-to-prison', 'prism', 'soal-bonus-04', 'mirage', 'pajak-aura',
  'starlight', 'soal-bonus-05', 'eclipse', 'lucky-lab', 'nexus'
];
TILE_BLUEPRINT.forEach((tile, index) => {
  tile.asset = `assets/tiles/tile-${String(index + 1).padStart(2, '0')}-${TILE_ASSET_KEYS[index]}.png`;
});

// v54: kelompok properti eksplisit agar syarat rumah tidak bergantung pada warna yang kebetulan sama.
const PROPERTY_GROUPS = {
  'LUMINA': 'blue', 'NOVA PARK': 'blue',
  'ORBIT': 'green', 'PIXEL BAY': 'green', 'SKYLINE': 'green',
  'SOLARA': 'yellow', 'VELVET CITY': 'yellow',
  'AURORA': 'red', 'CRYSTAL': 'red', 'MOONLIGHT': 'red',
  'NEBULA': 'purple', 'QUANTUM': 'purple', 'ROYAL ARC': 'purple', 'GOLDEN HARBOR': 'purple',
  'INFINITY': 'violet',
  'PRISM': 'magenta', 'MIRAGE': 'magenta', 'STARLIGHT': 'magenta', 'ECLIPSE': 'magenta', 'NEXUS': 'magenta'
};
TILE_BLUEPRINT.forEach((tile) => { if (tile.type === 'property') tile.group = PROPERTY_GROUPS[tile.name] || tile.name.toLowerCase(); });
const PROPERTY_GROUP_COLORS = { blue:'#38bdf8', green:'#4ade80', yellow:'#facc15', red:'#ff5a67', purple:'#a78bfa', magenta:'#f472d0', violet:'#67e8f9' };
TILE_BLUEPRINT.forEach((tile) => { if (tile.type === 'property' && PROPERTY_GROUP_COLORS[tile.group]) tile.color = PROPERTY_GROUP_COLORS[tile.group]; });

const SHOP_DATA = {
  dice: [
    { id: 'dice-standard', name: 'Standard Nova', description: 'Dadu klasik untuk semua pemain.', cost: 0, glyph: '6', asset: 'assets/themes/dice-theme-00-standard.png' },
    { id: 'dice-01', name: 'Neon Prism', description: 'Cahaya cyan dengan energi futuristik.', cost: 500, glyph: '✦', asset: 'assets/themes/dice-theme-01-neon-prism.png' },
    { id: 'dice-02', name: 'Cosmic Orbit', description: 'Nuansa galaksi untuk pemain visioner.', cost: 1200, glyph: '◉', asset: 'assets/themes/dice-theme-02-cosmic-orbit.png' },
    { id: 'dice-03', name: 'Royal Gold', description: 'Kilau emas, aura juara papan.', cost: 2400, glyph: '7', asset: 'assets/themes/dice-theme-03-royal-gold.png' },
    { id: 'dice-04', name: 'Sakura Bloom', description: 'Pastel lembut dengan kelopak digital.', cost: 4000, glyph: '✿', asset: 'assets/themes/dice-theme-04-sakura-bloom.png' },
    { id: 'dice-05', name: 'Cyber Pulse', description: 'Gelombang listrik untuk level tertinggi.', cost: 7000, glyph: 'ϟ', asset: 'assets/themes/dice-theme-05-cyber-pulse.png' },
    { id: 'dice-custom', name: 'Slot Custom', description: 'Tempat tema dadu PNG milikmu sendiri.', cost: null, custom: true, glyph: '+' }
  ],
  board: [
    { id: 'board-standard', name: 'Classic Midnight', description: 'Papan dasar Numeric Monopoly.', cost: 0, glyph: '✦', asset: 'assets/themes/board-theme-00-classic-midnight.png' },
    { id: 'board-01', name: 'Aurora Valley', description: 'Gradasi aurora yang tenang dan terang.', cost: 800, glyph: '✧', asset: 'assets/themes/board-theme-01-aurora-valley.png' },
    { id: 'board-02', name: 'Velvet Royale', description: 'Ungu beludru, emas, dan nuansa eksklusif.', cost: 1800, glyph: '♛', asset: 'assets/themes/board-theme-02-velvet-royale.png' },
    { id: 'board-03', name: 'Oceanic Glass', description: 'Biru kaca dengan kilau bawah laut.', cost: 3200, glyph: '◒', asset: 'assets/themes/board-theme-03-oceanic-glass.png' },
    { id: 'board-04', name: 'Midnight Gold', description: 'Hitam elegan dengan aksen emas.', cost: 5200, glyph: '◆', asset: 'assets/themes/board-theme-04-midnight-gold.png' },
    { id: 'board-05', name: 'Cyber City', description: 'Kota neon untuk master strategi.', cost: 9000, glyph: '⌁', asset: 'assets/themes/board-theme-05-cyber-city.png' },
    { id: 'board-custom', name: 'Slot Custom', description: 'Tempat tema papan PNG milikmu sendiri.', cost: null, custom: true, glyph: '+' }
  ],
  character: [
    { id: 'character-standard', name: 'Nova Starter', description: 'Karakter awal yang seimbang.', cost: 0, glyph: '🧠', asset: 'assets/characters/character-00-nova-starter.png' },
    { id: 'character-06', name: 'Math Buddy', description: 'Teman belajar sederhana yang gratis untuk semua pemain.', cost: 0, glyph: '📚', asset: 'assets/characters/character-06-math-buddy.png' },
    { id: 'character-01', name: 'Astro Fox', description: 'Lincah, berani, dan siap mengorbit.', cost: 1000, glyph: '🦊', asset: 'assets/characters/character-01-astro-fox.png' },
    { id: 'character-02', name: 'Robo Knight', description: 'Penjaga data dengan armor premium.', cost: 2200, glyph: '🤖', asset: 'assets/characters/character-02-robo-knight.png' },
    { id: 'character-03', name: 'Crystal Golem', description: 'Kokoh seperti angka yang tak terbantahkan.', cost: 3800, glyph: '💎', asset: 'assets/characters/character-03-crystal-golem.png' },
    { id: 'character-04', name: 'Dragon Spark', description: 'Api kecil, ambisi besar, langkah cepat.', cost: 6200, glyph: '🐉', asset: 'assets/characters/character-04-dragon-spark.png' },
    { id: 'character-05', name: 'Void Prince', description: 'Karakter 3D langka dari dimensi tak hingga.', cost: 10000, glyph: '🪐', asset: 'assets/characters/character-05-void-prince.png' },
    { id: 'character-07', name: 'Shadow Master', description: 'Penguasa bayangan dengan aura premium.', cost: 12000, glyph: '🌑', asset: 'assets/characters/character-07-shadow-master.png' },
    { id: 'character-custom', name: 'Slot Custom', description: 'Tempat karakter 3D PNG milikmu sendiri.', cost: null, custom: true, glyph: '+' }
  ]
};

const LEADERBOARD = [
  { name: 'Aurelia', avatar: '👑', score: 9820, change: '+2' },
  { name: 'Raka Prime', avatar: '🧊', score: 9210, change: '+1' },
  { name: 'Mika Orbit', avatar: '🪐', score: 8870, change: '+4' },
  { name: 'Kirana', avatar: '🌙', score: 8410, change: '+1' },
  { name: 'Bima Flux', avatar: '🦾', score: 8030, change: '+3' }
];

function freshState() {
  return {
    session: false,
    player: { name: 'Mathematician', avatar: '🧠', level: 7 },
    mode: 'ai',
    battleCount: 4,
    diceCount: 2,
    gameMenuOpen: false,
    forceFullRender: false,
    boardDirty: false,
    difficulty: 'medium',
    screen: 'dashboard',
    diamond: 1280,
    bankBalance: 100000,
    stats: { games: 12, wins: 7, correct: 83, streak: 5, points: 6240 },
    inventory: {
      dice: ['dice-standard'],
      board: ['board-standard'],
      character: ['character-standard']
    },
    selectedThemes: {
      dice: 'dice-standard',
      board: 'board-standard',
      character: 'character-standard'
    },
    sound: true,
    music: true,
    dailyClaimed: false,
    players: [],
    tiles: [],
    activePlayer: 0,
    question: null,
    answer: '',
    questionDeadline: null,
    questionTimeLeft: 15,
    questionTimerId: null,
    canRoll: false,
    rolling: false,
    moving: false,
    moveStep: 0,
    aiThinking: false,
    turnCount: 0,
    lastRoll: null,
    lastDice: [null, null],
    hasRolled: false,
    activity: [],
    answerNotice: null,
    pendingPayment: null,
    modal: null,
    room: null,
    localPlayerIndex: 0,
    onlineStatus: 'idle',
    pendingInstall: false,
    orientationLocked: false,
    orientationRemainingMs: null,
    diceCharge: 0.5,
    dicePressing: false,
    movementResume: null,
  };
}

const persisted = loadPersisted();
const state = Object.assign(freshState(), persisted || {});
// Selalu mulai dari halaman login saat aplikasi dibuka/di-refresh.
state.session = false;
state.screen = 'dashboard';
state.player = Object.assign(freshState().player, persisted?.player || {});
state.stats = Object.assign(freshState().stats, persisted?.stats || {});
state.inventory = Object.assign(freshState().inventory, persisted?.inventory || {});
state.selectedThemes = Object.assign(freshState().selectedThemes, persisted?.selectedThemes || {});

let deferredInstallPrompt = null;
let roomUnsubscribe = null;
let answerNoticeTimer = null;
let cloudStatus = { configured: false, user: null };

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist() {
  const save = {
    session: false,
    player: state.player,
    mode: state.mode,
    difficulty: state.difficulty,
    diamond: state.diamond,
    stats: state.stats,
    inventory: state.inventory,
    selectedThemes: state.selectedThemes,
    sound: state.sound,
    music: state.music,
    dailyClaimed: state.dailyClaimed
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Math.max(0, Math.round(value)));
}

function formatCurrency(value) {
  return `Rp ${formatNumber(value * 1000)}`;
}

function selectedItem(type) {
  return SHOP_DATA[type].find((item) => item.id === state.selectedThemes[type]) || SHOP_DATA[type][0];
}

function themeClass() {
  const id = state.selectedThemes.board;
  if (id === 'board-01') return 'theme-aurora';
  if (id === 'board-02') return 'theme-velvet';
  if (id === 'board-03') return 'theme-ocean';
  if (id === 'board-04') return 'theme-midnight';
  if (id === 'board-05') return 'theme-cyber';
  return '';
}

function playSound(kind) {
  if (!state.sound) return;
  const element = document.getElementById(`audio-${kind}`);
  if (!element) return;
  try {
    element.currentTime = 0;
    const result = element.play();
    if (result?.catch) result.catch(() => {});
  } catch {}
}

function tryUnlockMusic() {
  const loginAudio = document.getElementById('audio-login');
  const gameAudio = document.getElementById('audio-game');
  const audio = state.screen === 'game' ? gameAudio : loginAudio;
  if (!audio || !state.music) return;
  try {
    audio.muted = false;
    const result = audio.play();
    if (result?.catch) result.catch(() => {});
  } catch {}
}

function updateMusic() {
  const loginAudio = document.getElementById('audio-login');
  const gameAudio = document.getElementById('audio-game');
  if (!loginAudio || !gameAudio) return;
  const play = (audio) => {
    if (!state.music) return;
    try {
      const result = audio.play();
      if (result?.catch) result.catch(() => {});
    } catch {}
  };
  if (state.screen === 'game') {
    loginAudio.pause();
    gameAudio.pause();
    play(gameAudio);
  } else {
    gameAudio.pause();
    play(loginAudio);
  }
}

function characterAsset(playerIndex = 0, player = null) {
  // Player 0 mengikuti karakter yang dipilih pemain. AI/rival memiliki karakter sendiri.
  if (player?.characterId) {
    const item = SHOP_DATA.character.find((entry) => entry.id === player.characterId);
    if (item?.asset) return item.asset;
  }
  if (playerIndex === 0) return selectedItem('character')?.asset || SHOP_DATA.character[0]?.asset || '';
  const fallbackPool = SHOP_DATA.character.filter((entry) => entry.asset && entry.id !== state.selectedThemes.character);
  return fallbackPool[Math.max(0, (playerIndex - 1) % Math.max(1, fallbackPool.length))]?.asset || SHOP_DATA.character[0]?.asset || '';
}

function characterMarkup(playerIndex = 0, player = null, className = 'character-avatar-image') {
  const asset = characterAsset(playerIndex, player);
  if (!asset) return '';
  // PNG adalah satu-satunya visual karakter. Glyph/emoji lama sengaja tidak dirender.
  return `<img class="${className}" src="${versionedAsset(asset)}" alt="" draggable="false" loading="eager" onerror="this.remove()" />`;
}

function logoMarkup() {
  return `<div class="logo-mark" aria-label="Numeric Monopoly Matematic logo"><img src="${versionedAsset('assets/logo-favicon.png')}" alt="" onerror="this.style.display='none'" /><span class="logo-fallback">∑</span></div>`;
}

function renderLogin() {
  return `
    <main class="login-page game-login">
      <section class="login-brand-zone">
        <div class="login-topline"><span><i class="live-dot"></i> LIVE ARENA</span><span>SEASON 08</span></div>
        <div class="brand-lockup compact-brand">${logoMarkup()}<div><div class="brand-name">Numeric Monopoly</div><div class="brand-sub">Matematic</div></div></div>
        <img class="login-full-logo" src="${versionedAsset('assets/logo-numeric-monopoly-matematic.png')}" alt="Numeric Monopoly Matematic" onerror="this.style.display='none'" />
        <div class="login-overline">THINK · ROLL · WIN</div>
        <div class="login-board-preview" aria-hidden="true">
          <div class="preview-orbit orbit-one"></div><div class="preview-orbit orbit-two"></div>
          <div class="preview-tile tile-a">+8</div><div class="preview-tile tile-b">×6</div><div class="preview-tile tile-c">−3</div>
          <div class="preview-dice">6</div><div class="preview-token">${characterMarkup(0, state.player, "login-character-image")}</div>
        </div>
      </section>
      <section class="login-card panel">
        <div class="login-card-top"><span>PLAYER SETUP</span><span class="online-state"><i class="live-dot"></i> READY</span></div>
        <label class="field-label" for="login-name">PLAYER NAME</label>
        <div class="login-input-wrap"><span>♙</span><input id="login-name" class="text-input" maxlength="20" autocomplete="nickname" placeholder="Your name" value="${escapeHtml(state.player.name === 'Mathematician' ? '' : state.player.name)}" /></div>
        <div class="login-mode-label"><span>GAME MODE</span><span>SELECT</span></div>
        <div class="mode-grid">
          ${modeCard('ai', '🤖', 'VS AI', 'SOLO')}
          ${modeCard('local', '👥', 'DUO', '1 DEVICE')}
          ${modeCard('online', '🌐', 'ONLINE', '2 DEVICES')}
        </div>
        <button class="btn btn-primary btn-lg btn-wide play-now-btn" data-action="start-login"><span>PLAY NOW</span><span>↗</span></button>
        <div class="login-mini-row"><span>◆ ${formatNumber(state.diamond)}</span><span>Lv.${state.player.level}</span><span>♪ ${state.music ? 'ON' : 'OFF'}</span></div>
      </section>
    </main>
    ${renderToastStack()}
  `;
}

function modeCard(id, icon, name, description) {
  return `<button class="mode-card ${state.mode === id ? 'active' : ''}" data-action="select-mode" data-mode="${id}"><span class="mode-icon">${icon}</span><span><span class="mode-name">${name}</span><span class="mode-desc">${description}</span></span></button>`;
}

function renderShell() {
  const nav = renderNav(false);
  const title = screenTitle(state.screen);
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="side-brand">${logoMarkup()}<div><div class="brand-name">Numeric Monopoly</div><div class="brand-sub">Matematic</div></div></div>
        <nav class="side-nav" aria-label="Navigasi utama">
          <p class="nav-caption">Workspace</p>
          ${nav}
        </nav>
        <div class="side-profile">
          <div class="avatar">${characterMarkup(0, state.player)}</div>
          <div style="min-width:0;flex:1"><div class="profile-name">${escapeHtml(state.player.name)}</div><div class="profile-level">Level ${state.player.level} • ${formatNumber(state.stats.points)} XP</div></div>
          <button class="link-btn" style="font-size:.95rem" data-action="go-screen" data-screen="profile" aria-label="Buka profil">⋯</button>
        </div>
      </aside>
      <main class="app-content">
        <header class="topbar">
          <div class="topbar-left">
            <button class="btn btn-ghost btn-icon mobile-menu-btn" data-action="go-screen" data-screen="dashboard" aria-label="Buka beranda">☰</button>
            <div><p class="page-kicker">${state.screen === 'game' ? 'Arena aktif' : 'Numeric Monopoly Matematic'}</p><h1 class="page-heading">${title}</h1></div>
          </div>
          <div class="top-actions">
            <button class="btn btn-ghost btn-icon" data-action="toggle-music" aria-label="${state.music ? 'Matikan musik' : 'Nyalakan musik'}">${state.music ? '♫' : '♩'}</button>
            <div class="diamond-pill"><span class="diamond-glyph">◆</span><span>${formatNumber(state.diamond)}</span></div>
            <button class="btn btn-ghost btn-icon profile-character-button" data-action="go-screen" data-screen="profile" aria-label="Profil">${characterMarkup(0, state.player)}</button>
          </div>
        </header>
        ${renderPage()}
      </main>
      <nav class="mobile-bottom-nav" aria-label="Navigasi seluler">${renderNav(true)}</nav>
    </div>
    ${renderToastStack()}
    ${renderModal()}
    ${renderInstallBanner()}
  `;
}

function renderNav(mobile) {
  const items = [
    ['dashboard', '⌂', 'Beranda'],
    ['battle', '⚔', 'Battle'],
    ['auction', '⚖', 'Lelang'],
    ['properties', '⌂', 'Aset'],
    ['shop', '◇', 'Tema'],
    ['leaderboard', '♛', 'Peringkat'],
    ['profile', '◎', 'Profil']
  ];
  const visibleItems = state.screen === 'dashboard'
    ? items.filter(([id]) => !['game', 'auction'].includes(id))
    : state.screen === 'shop'
      ? items.filter(([id]) => id !== 'game')
      : items;
  return visibleItems.map(([id, icon, label]) => `<button class="nav-btn ${state.screen === id ? 'active' : ''}" data-action="go-screen" data-screen="${id}"><span>${icon}</span><span>${label}</span></button>`).join('');
}

function screenTitle(screen) {
  return ({ dashboard: 'HOME', game: 'ARENA', battle: 'BATTLE ARENA', auction: 'AUCTION', properties: 'ASSETS', shop: 'VAULT', leaderboard: 'RANKING', profile: 'PROFILE', online: 'ONLINE' }[screen] || 'HOME');
}

function renderPage() {
  if (state.screen === 'dashboard') return renderDashboard();
  if (state.screen === 'game') return renderGame();
  if (state.screen === 'battle') return renderBattle();
  if (state.screen === 'auction') return renderAuction();
  if (state.screen === 'properties') return renderPropertiesScreen();
  if (state.screen === 'shop') return renderShop();
  if (state.screen === 'leaderboard') return renderLeaderboard();
  if (state.screen === 'online') return renderOnline();
  return renderProfile();
}

function renderDashboard() {
  const winRate = Math.round((state.stats.wins / Math.max(1, state.stats.games)) * 100);
  return `
    <section class="game-home">
      <article class="home-hero panel">
        <img class="home-brand-logo" src="${versionedAsset('assets/logo-numeric-monopoly-matematic.png')}" alt="" onerror="this.remove()" />
        <div class="home-hero-copy"><div class="hero-badge"><i class="live-dot"></i> SEASON 08 <span>•</span> ${DIFFICULTIES[state.difficulty].label.toUpperCase()}</div><p class="eyebrow">WELCOME, ${escapeHtml(state.player.name).toUpperCase()}</p><h2>READY<br /><span class="gradient-text">TO ROLL?</span></h2><div class="home-actions"><button class="btn btn-primary btn-lg" data-action="quick-start" data-mode="ai"><span>1 VS AI</span><span>↗</span></button><button class="btn btn-ghost btn-lg" data-action="quick-start" data-mode="local"><span>1 VS 1</span></button><button class="btn btn-ghost btn-lg" data-action="quick-start" data-mode="online"><span>1 VS 1 ONLINE</span></button></div></div>
        <div class="home-hero-art" aria-hidden="true"><div class="hero-ring ring-a"></div><div class="hero-ring ring-b"></div><div class="hero-dice">${selectedItem('dice')?.glyph || '6'}</div><div class="hero-pawn">${characterMarkup(0, state.player, "hero-character-image")}</div><div class="hero-spark spark-a">✦</div><div class="hero-spark spark-b">◆</div></div>
      </article>
      <div class="quick-stats"><article class="quick-stat panel"><span class="quick-stat-icon">♛</span><div><strong>${winRate}%</strong><small>WIN RATE</small></div></article><article class="quick-stat panel"><span class="quick-stat-icon">⚡</span><div><strong>${state.stats.correct}%</strong><small>ACCURACY</small></div></article><article class="quick-stat panel"><span class="quick-stat-icon diamond">◆</span><div><strong>${formatNumber(state.diamond)}</strong><small>DIAMONDS</small></div></article></div>
      <div class="home-panels"><article class="section-panel panel"><div class="section-heading"><h3>MISSIONS</h3><button class="link-btn" data-action="claim-daily">CLAIM ◆</button></div><div class="quest-list">${renderQuestList()}</div></article><article class="section-panel panel"><div class="section-heading"><h3>RANKING</h3><button class="link-btn" data-action="go-screen" data-screen="leaderboard">VIEW ALL</button></div><div class="leader-mini">${renderMiniLeaderboard()}</div></article></div>
    </section>
  `;
}

function renderQuestList() {
  const missions = [
    ['✎', 'Selesaikan 3 soal', 'Progress 2 / 3', '◆ 80'],
    ['◈', 'Menang satu arena', 'Progress 0 / 1', '◆ 150'],
    ['ϟ', 'Lakukan lemparan 6', 'Progress 0 / 1', '◆ 100']
  ];
  return missions.map(([icon, title, meta, reward]) => `<div class="quest-row"><div class="quest-icon">${icon}</div><div class="quest-copy"><p class="quest-title">${title}</p><div class="quest-meta">${meta}</div></div><div class="quest-reward">${reward}</div></div>`).join('');
}

function renderMiniLeaderboard() {
  const current = { name: state.player.name, avatar: state.player.avatar, characterAsset: characterAsset(0), score: state.stats.points, change: '—' };
  return [...LEADERBOARD.slice(0, 3), current].sort((a, b) => b.score - a.score).slice(0, 4).map((person, index) => `<div class="leader-row"><div class="rank-number">${index + 1}</div>${leaderboardAvatarMarkup(person, index)}<div class="leader-info"><div class="leader-name">${escapeHtml(person.name)}${person.name === state.player.name ? ' <span style="color:var(--cyan)">(kamu)</span>' : ''}</div><div class="leader-score">${formatNumber(person.score)} rating</div></div><div class="leader-points">${person.change}</div></div>`).join('');
}

function boardGridPosition(index) {
  // Monopoly klasik: START di kanan bawah, PRISON di kiri bawah,
  // FREE PARKING kiri atas, GO TO PRISON kanan atas.
  if (index === 0) return { row: 11, col: 11 };
  if (index <= 10) return { row: 11, col: 11 - index };
  if (index < 20) return { row: 21 - index, col: 1 };
  if (index === 20) return { row: 1, col: 1 };
  if (index <= 30) return { row: 1, col: index - 20 + 1 };
  return { row: index - 29, col: 11 };
}

function tokenMarkup(player, playerIndex) {
  const offset = playerIndex === 0 ? { left: '8%', top: '8%' } : { left: '50%', top: '48%' };
  const pos = boardGridPosition(player?.position ?? 0);
  // v57: top-row characters stay fully inside the camera's safe area.
  // The artwork keeps its full size; only its anchor point changes.
  const asset = characterAsset(playerIndex, player);
  return `<span class="token ${playerIndex === 1 ? 'ai ai-token' : 'player-token'}" data-player-index="${playerIndex}" style="--token-color:${playerColor(playerIndex)}" title="${escapeHtml(player.name)}"><img src="${versionedAsset(asset)}" alt="" draggable="false" loading="eager" onerror="this.remove()" /></span>`;
}

function renderAnswerNotice() {
  if (!state.answerNotice) return '';
  const notice = state.answerNotice;
  return `<div class="answer-notice ${notice.correct ? 'correct' : 'wrong'}"><div class="answer-notice-icon">${notice.correct ? '✓' : '✕'}</div><div><strong>${notice.correct ? 'BENAR' : 'SALAH'}</strong><span>${escapeHtml(notice.message)}</span></div></div>`;
}

function setAnswerNotice(correct, message) {
  state.answerNotice = { correct, message };
  window.clearTimeout(answerNoticeTimer);
  answerNoticeTimer = window.setTimeout(() => {
    state.answerNotice = null;
    if (state.screen === 'game') render();
  }, 1300);
}

function renderPlayerCashStrip() {
  return `<div class="player-cash-strip">${state.players.map((player, index) => `<div class="cash-player ${state.activePlayer === index ? 'active' : ''}" style="--player-color:${playerColor(index)}"><span class="cash-player-avatar">${characterMarkup(index, player, 'cash-character-image')}</span><span><b>${escapeHtml(player.name)}</b><small>${player.eliminated ? 'OUT' : formatCurrency(player.cash)}</small></span></div>`).join('')}</div>`;
}

function dicePips(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 6) return `<span class="dice-question">${value === '?' ? '?' : '—'}</span>`;
  const active = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }[number];
  return `<span class="dice-pips">${Array.from({ length: 9 }, (_, index) => `<i class="pip ${active.includes(index) ? 'on' : ''}"></i>`).join('')}</span>`;
}

function diceFace(value, faceClass) {
  return `<span class="dice-cube-face ${faceClass}" aria-label="Dadu ${value}">${dicePips(value)}</span>`;
}

function diceOrientationClass(value) {
  const map = { 1: 'show-front', 2: 'show-right', 3: 'show-top', 4: 'show-bottom', 5: 'show-left', 6: 'show-back' };
  return map[Number(value)] || 'show-front';
}

function diceCubeMarkup(value, asset) {
  const number = Number(value);
  const label = Number.isInteger(number) && number >= 1 && number <= 6 ? number : (value === '?' ? '?' : '—');
  const orientation = diceOrientationClass(number);
  const themed = asset && !String(asset).includes('dice-theme-00-standard');
  const themeClass = themed ? (String(asset).includes('dice-theme-01-neon-prism') ? 'theme-neon-prism' : 'theme-custom') : '';
  return `<span class="dice-cube ${orientation} ${themed ? `has-dice-theme ${themeClass}` : ''}" aria-label="Dadu ${label}">
    ${diceFace(1, 'face-front')}
    ${diceFace(6, 'face-back')}
    ${diceFace(2, 'face-right')}
    ${diceFace(5, 'face-left')}
    ${diceFace(3, 'face-top')}
    ${diceFace(4, 'face-bottom')}
  </span>`;
}

function dice3DMarkup(id, value, rolling, asset) {
  return `<span class="dice-3d ${rolling ? 'dice-rolling' : ''}" id="${id}" data-dice-asset="${asset || ''}">${diceCubeMarkup(value, asset)}</span>`;
}

function updateDiceFace(id, value, rolling) {
  const die = document.getElementById(id);
  if (!die) return;
  die.classList.toggle('dice-rolling', rolling);
  const asset = die.dataset.diceAsset || selectedItem('dice')?.asset || '';
  die.innerHTML = diceCubeMarkup(value, asset);
}

function diceSkillMarkup() {
  const charge = Math.max(0, Math.min(1, Number(state.diceCharge ?? 0.5)));
  const percent = Math.round(charge * 100);
  return `<div class="nm-hud-skill dice-skill-wrap" aria-label="Kontrol kekuatan lemparan dadu">
    <div class="dice-skill-arc" id="dice-skill-track">
      <svg viewBox="0 0 360 190" aria-hidden="true" class="dice-skill-svg">
        <path class="arc-shadow" d="M25 165 A155 155 0 0 1 335 165" pathLength="100" />
        <path class="arc-zone zone-green" d="M25 165 A155 155 0 0 1 335 165" pathLength="100" stroke-dasharray="25 75" stroke-dashoffset="0" />
        <path class="arc-zone zone-orange" d="M25 165 A155 155 0 0 1 335 165" pathLength="100" stroke-dasharray="20 80" stroke-dashoffset="-25" />
        <path class="arc-zone zone-red" d="M25 165 A155 155 0 0 1 335 165" pathLength="100" stroke-dasharray="10 90" stroke-dashoffset="-45" />
        <path class="arc-zone zone-orange" d="M25 165 A155 155 0 0 1 335 165" pathLength="100" stroke-dasharray="20 80" stroke-dashoffset="-55" />
        <path class="arc-zone zone-green" d="M25 165 A155 155 0 0 1 335 165" pathLength="100" stroke-dasharray="25 75" stroke-dashoffset="-75" />
        <circle id="dice-skill-marker" cx="25" cy="165" r="9" />
        <text x="42" y="178" class="arc-label">2–4</text><text x="112" y="78" class="arc-label">5–7</text><text x="145" y="50" class="arc-label">8–9</text><text x="180" y="36" class="arc-label red-label">10–12</text><text x="215" y="50" class="arc-label">8–9</text><text x="248" y="78" class="arc-label">5–7</text><text x="318" y="178" class="arc-label">2–4</text>
        <text x="25" y="165" class="arc-label perfect-label">★</text><text x="70.5" y="55.5" class="arc-label perfect-label">★</text><text x="180" y="10" class="arc-label perfect-label center-perfect">★</text><text x="289.5" y="55.5" class="arc-label perfect-label">★</text><text x="335" y="165" class="arc-label perfect-label">★</text>
      </svg>
    </div>
  </div>`;
}

let diceChargeRAF = null;
let diceChargeStartedAt = 0;
let diceChargeDirection = 1;
let dicePressHandledUntil = 0;

function setDiceSkillPosition(value) {
  const clamped = Math.max(0, Math.min(1, value));
  state.diceCharge = clamped;
  const marker = document.getElementById('dice-skill-marker');
  const percent = document.getElementById('dice-skill-percent');
  if (marker) {
    const angle = Math.PI - (clamped * Math.PI);
    const cx = 180 + Math.cos(angle) * 155;
    const cy = 165 - Math.sin(angle) * 155;
    marker.setAttribute('cx', cx.toFixed(1));
    marker.setAttribute('cy', cy.toFixed(1));
  }
  if (percent) percent.textContent = `${Math.round(clamped * 100)}%`;
}

function startDiceSkill() {
  if (!canUseHumanRoll()) return false;
  state.dicePressing = true;
  diceChargeStartedAt = performance.now();
  // Selalu mulai dari ujung kiri, lalu bergerak ke kanan.
  diceChargeDirection = 1;
  setDiceSkillPosition(0);
  cancelAnimationFrame(diceChargeRAF);
  const tick = (now) => {
    if (!state.dicePressing) return;
    const elapsed = now - diceChargeStartedAt;
    // Makin lama tombol ditahan, gerakan makin cepat.
    // Posisi memakai fase segitiga 0 -> 1 -> 0 agar bolak-balik mulus.
    // Sedikit lebih cepat sejak awal agar pemain langsung mendapat tantangan.
    // Kecepatan terus meningkat selama tombol ditahan.
    // Tuning yang sudah diuji nyaman: speed dasar 85, maksimum 95.
    // Nilai 85..95 dipetakan ke kecepatan aktual tanpa mengubah rasa kontrol yang sudah pas.
    // Tuning resmi hasil uji pemain: 85 (awal) -> 95 (maksimum).
    const SKILL_BASE_SPEED = 85;
    const SKILL_MAX_SPEED = 95;
    const speedLevel = Math.min(SKILL_MAX_SPEED, SKILL_BASE_SPEED + elapsed / 1000);
    const actualBaseSpeed = 0.00085;
    const actualMaxSpeed = 0.00095;
    const speedRatio = (speedLevel - SKILL_BASE_SPEED) / (SKILL_MAX_SPEED - SKILL_BASE_SPEED);
    const currentSpeed = actualBaseSpeed + (actualMaxSpeed - actualBaseSpeed) * speedRatio;
    const accelerationTime = Math.min(elapsed, 10000);
    const phase = actualBaseSpeed * accelerationTime +
      0.5 * (actualMaxSpeed - actualBaseSpeed) * (accelerationTime * accelerationTime / 10000) +
      (elapsed > 10000 ? actualMaxSpeed * (elapsed - 10000) : 0);
    const cycle = phase % 2;
    const position = cycle <= 1 ? cycle : 2 - cycle;
    setDiceSkillPosition(position);
    diceChargeRAF = requestAnimationFrame(tick);
  };
  diceChargeRAF = requestAnimationFrame(tick);
  return true;
}

function stopDiceSkill(commit = true) {
  if (!state.dicePressing) return;
  state.dicePressing = false;
  cancelAnimationFrame(diceChargeRAF);
  diceChargeRAF = null;
  if (commit) {
    dicePressHandledUntil = Date.now() + 650;
    rollDice(false, Number(state.diceCharge ?? .5));
  }
}

function canUseHumanRoll() {
  if (state.orientationLocked || !state.canRoll || state.rolling || state.moving || state.aiThinking) return false;
  if (state.mode === 'ai' && state.activePlayer === 1) return false;
  if (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex) return false;
  if (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex) return false;
  return true;
}

function rollPairFromSkill(skill) {
  const x = Math.max(0, Math.min(1, Number(skill ?? 0)));

  // Lima titik bintang adalah target PERFECT DOUBLE.
  // Ujung kiri/kanan: 1+1 atau 2+2.
  // Batas hijau-orange: 3+3 atau 4+4.
  // Tengah merah: 5+5 atau 6+6.
  const starPoints = [0, 0.25, 0.5, 0.75, 1];
  let nearestStar = 0;
  let nearestDistance = Infinity;
  for (const point of starPoints) {
    const distance = Math.abs(x - point);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestStar = point;
    }
  }

  // Berhenti sangat dekat bintang = peluang double 95–100%.
  // Tidak dipaksa 100% agar pemain tetap merasakan unsur keberuntungan.
  const perfectWindow = 0.028;
  const perfectChance = 0.90;
  const inPerfectZone = nearestDistance <= perfectWindow;
  const forceDouble = inPerfectZone && Math.random() < perfectChance;

  let minTotal = 2;
  let maxTotal = 4;

  if (x < 0.25) {
    minTotal = 2; maxTotal = 4;
  } else if (x < 0.45) {
    minTotal = 5; maxTotal = 7;
  } else if (x < 0.50) {
    minTotal = 8; maxTotal = 9;
  } else if (x <= 0.55) {
    minTotal = 10; maxTotal = 12;
  } else if (x <= 0.75) {
    minTotal = 5; maxTotal = 7;
  } else if (x <= 0.80) {
    minTotal = 2; maxTotal = 4;
  } else {
    minTotal = 2; maxTotal = 4;
  }

  // Jika tepat di sekitar bintang, target double mengikuti bintangnya.
  // Bintang 0/1 -> 1+1 atau 2+2; 0.25/0.75 -> 3+3 atau 4+4;
  // bintang 0.5 -> 5+5 atau 6+6.
  if (forceDouble) {
    let doubleValues;
    if (nearestStar === 0 || nearestStar === 1) doubleValues = [1, 2];
    else if (nearestStar === 0.25 || nearestStar === 0.75) doubleValues = [3, 4];
    else doubleValues = [5, 6];

    const value = doubleValues[randomInt(0, doubleValues.length - 1)];
    return {
      a: value,
      b: value,
      total: value * 2,
      rareBig: value >= 5,
      perfectDouble: true,
      perfectStar: nearestStar
    };
  }

  const total = randomInt(minTotal, maxTotal);
  const pairs = [];
  for (let i = 1; i <= 6; i++) {
    const j = total - i;
    if (j >= 1 && j <= 6) pairs.push([i, j]);
  }
  const [a, b] = pairs[randomInt(0, pairs.length - 1)];
  return { a, b, total, rareBig: total >= 10, perfectDouble: false, perfectStar: null };
}

function renderGameHeader(active, turnStatus, activeColor) {
  return `<div class="game-header compact-game-header"><div class="turn-focus-banner" style="--player-color:${activeColor}"><span class="turn-focus-avatar">${characterMarkup(state.activePlayer, active, "turn-character-image")}</span><span class="turn-focus-copy"><small>GILIRAN</small><strong>${escapeHtml(active.name)}</strong></span><b>${turnStatus}</b></div>${renderPlayerCashStrip()}<div class="game-header-actions"><div class="game-chips"><span class="soft-chip active-turn">● ${escapeHtml(active.name)}</span><span class="soft-chip">${state.mode === 'battle' ? `${state.players.length} PEMAIN` : DIFFICULTIES[state.difficulty].label}</span><span class="soft-chip">GILIRAN ${Math.max(1, state.turnCount + 1)}</span></div>${state.mode === 'battle' ? '<button class="btn btn-danger battle-leave-btn" data-action="leave-battle">KELUAR</button>' : ''}</div></div>`;
}

function renderGame() {
  const board = state.tiles.length ? state.tiles : TILE_BLUEPRINT.map((tile) => ({ ...tile, owner: null, houses: 0, hotel: false }));
  const active = state.players[state.activePlayer] || { name: state.player.name, cash: 5000, position: 0 };
  const currentDice = selectedItem('dice');
  const showDiceResult = state.hasRolled || state.rolling || state.moving;
  const diceValue = state.rolling ? '?' : (showDiceResult ? (state.lastRoll ?? '—') : '—');
  const diceA = state.rolling ? '?' : (showDiceResult ? (state.lastDice?.[0] ?? '—') : '—');
  const diceB = state.rolling ? '?' : (showDiceResult ? (state.lastDice?.[1] ?? '—') : '—');
  const isMoving = state.moving;
  const turnStatus = isMoving ? 'BERJALAN' : state.canRoll ? 'SIAP LEMPAR' : state.aiThinking ? 'BERPIKIR' : 'JAWAB SOAL';
  const activeColor = playerColor(state.activePlayer);
  const rollLocked = !state.canRoll || state.rolling || state.moving || state.aiThinking || (state.mode === 'ai' && state.activePlayer === 1) || (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex) || (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex);
  const rollLabel = state.rolling ? 'MENGGELINDING…' : state.moving ? 'BERJALAN…' : 'LEMPAR';
  return `
    <section class="game-screen">
      <button class="game-menu-toggle" data-action="toggle-game-menu" aria-label="Menu permainan">☰</button>
      ${renderGameHeader(active, turnStatus, activeColor)}
      ${renderAnswerNotice()}
      <div class="game-layout">
        <div class="board-wrap ${themeClass()} has-board-theme" style="isolation:isolate">
          <img class="board-theme-image" src="${versionedAsset(selectedItem('board')?.asset || '')}" alt="" onerror="this.style.display='none'" />
          <div class="board-camera" id="board-camera">
            <div class="board" aria-label="Papan permainan">
              ${board.map((tile, index) => renderBoardCell(tile, index)).join('')}
            </div>
          </div>
          <div class="board-vignette"></div>
        </div>
        <div class="nm-hud-layer" aria-label="Kontrol permainan">
          <div class="nm-hud-stage">
            <div class="nm-hud-stack">
              <span class="nm-hud-mode">${state.mode === 'ai' ? 'Mode 1 VS AI' : (MODE_LABELS[state.mode] || 'BATTLE ARENA')}</span>
              <div class="nm-hud-dice"><span>DADU</span><div class="nm-hud-dice-pair"><span class="dice-3d-mini-wrap">${dice3DMarkup('center-die-a', diceA, state.rolling, currentDice?.asset)}</span><em>+</em><span class="dice-3d-mini-wrap">${dice3DMarkup('center-die-b', diceB, state.rolling, currentDice?.asset)}</span></div><b id="center-roll-value">${diceValue}</b><small id="center-roll-progress">${isMoving ? `${state.moveStep}/${state.lastRoll}` : ''}</small></div>
              ${diceSkillMarkup()}
              <button class="nm-hud-roll" data-action="roll-dice" ${rollLocked ? 'disabled' : ''}>${rollLabel}</button>
            </div>
          </div>
        </div>
        <aside class="game-side">
          <section class="turn-card panel"><div class="turn-heading"><h3>GILIRAN</h3><span class="turn-status">${turnStatus}</span></div>${state.players.map((player, index) => renderPlayerLine(player, index)).join('')}</section>
          ${renderOwnershipLegend()}
          <section class="dice-panel panel"><div class="dice-visual ${state.rolling ? 'rolling' : isMoving ? 'dice-moving' : ''}">${dice3DMarkup('side-die', diceValue, state.rolling, currentDice?.asset)}</div><div class="dice-copy"><h3 id="dice-label">${isMoving ? `PINDAH ${state.moveStep}/${state.lastRoll}` : `DADU ${diceValue}`}</h3><p>${state.canRoll ? 'SIAP' : isMoving ? 'BERJALAN' : 'JAWAB SOAL'}</p></div><button class="btn btn-primary roll-btn" data-action="roll-dice" ${rollLocked ? 'disabled' : ''}>${rollLabel}</button></section>
          ${renderBankPanel()}
          ${renderOwnedProperties()}
          <section class="activity-card panel"><h3>AKTIVITAS</h3><div class="activity-list">${renderActivity()}</div></section>
        </aside>
      </div>
      ${state.question || state.aiThinking ? renderQuestionOverlay() : ''}
    </section>
  `;
}

function getRent(tile) {
  if (!tile) return 0;
  const base = Math.round((tile.rent || 0) * 1.5);
  const fullGroup = tile.type === 'property' && tile.owner !== null && tile.owner !== undefined && ownsFullGroup(tile, tile.owner);
  const groupMultiplier = fullGroup ? 2 : 1;
  if (tile.hotel) return Math.round(base * groupMultiplier * 18);
  const houses = Math.max(0, Math.min(4, Number(tile.houses || 0)));
  const houseMultiplier = [1, 2.4, 4.2, 6.8, 10.5][houses];
  return Math.round(base * groupMultiplier * houseMultiplier);
}

function houseCost(tile) {
  return Math.max(80, Math.round((tile?.price || 100) * .28));
}

function ownsFullGroup(tile, owner) {
  if (!tile || tile.type !== 'property' || !tile.group) return false;
  const group = state.tiles.filter((candidate) => candidate.type === 'property' && candidate.group === tile.group);
  return group.length > 1 && group.every((candidate) => candidate.owner === owner);
}

function renderJailPanel() {
  const player = state.players[state.localPlayerIndex] || state.players[0];
  if (!player?.inJail) return '';
  const attempts = Number(player.jailAttempts || 0);
  return `<section class="jail-panel panel"><div class="jail-panel-head"><span class="jail-icon">⛓</span><div><h3>PRISON</h3><p>Percobaan ${attempts}/3</p></div></div><p class="jail-panel-text">Dadu kembar = keluar gratis. Setelah 3 percobaan, denda ${formatCurrency(JAIL_FINE)} wajib dibayar.</p><button class="btn btn-primary" data-action="pay-jail-fine" ${player.cash < JAIL_FINE ? 'disabled' : ''}>Bayar denda ${formatCurrency(JAIL_FINE)} sekarang</button></section>`;
}

function renderOwnedProperties() {
  const owner = state.activePlayer;
  const owned = (state.tiles || []).map((tile, index) => ({ tile, index })).filter(({ tile }) => tile.type === 'property' && tile.owner === owner);
  if (!owned.length) return `<section class="property-panel panel"><div class="property-panel-head"><h3>PROPERTI</h3><span>0</span></div><div class="empty-properties">Belum ada</div></section>`;
  return `<section class="property-panel panel"><div class="property-panel-head"><h3>PROPERTI</h3><span>${owned.length}</span></div><div class="owned-properties">${owned.slice(0, 5).map(({ tile, index }) => {
    const buildings = tile.hotel ? '🏨' : tile.houses ? '▴'.repeat(tile.houses) : '—';
    const canManage = state.players[state.activePlayer]?.position === index;
    const house = tile.hotel || tile.houses >= 4 ? `<button class="property-action" data-action="buy-hotel" data-tile-index="${index}" title="Hotel" ${canManage ? '' : 'disabled'}>🏨</button>` : `<button class="property-action" data-action="buy-house" data-tile-index="${index}" title="Rumah" ${canManage ? '' : 'disabled'}>＋</button>`;
    return `<div class="owned-property"><span class="property-color" style="background:${tile.color}"></span><div class="owned-property-copy"><strong>${escapeHtml(tile.name)}</strong><small>${buildings} · rent ${formatCurrency(getRent(tile))}</small></div>${house}<button class="property-action sell" data-action="sell-property" data-tile-index="${index}" title="Jual" ${canManage ? '' : 'disabled'}>↗</button></div>`;
  }).join('')}</div></section>`;
}

function playerColor(index) {
  return ['#5be4ff', '#ff75bf', '#ffd976', '#c6ef68', '#a895ff', '#ff9d70'][index % 6];
}

function renderBoardCell(tile, index) {
  const pos = boardGridPosition(index);
  const owner = tile.owner;
  const playersHere = (state.players || []).map((player, pIndex) => player.position === index ? tokenMarkup(player, pIndex) : '').join('');
  const name = tile.name;
  const ownerColor = owner !== null && owner !== undefined ? playerColor(owner) : tile.color;
  const ownerPlayer = owner !== null && owner !== undefined ? state.players[owner] : null;
  const isBuyable = tile.type === 'property' || tile.type === 'utility';
  const ownerBadge = isBuyable && ownerPlayer ? `<div class="owner-marker" style="--owner-color:${ownerColor}" title="Milik ${escapeHtml(ownerPlayer.name)}" aria-label="Milik ${escapeHtml(ownerPlayer.name)}"><span>${escapeHtml(ownerPlayer.name.slice(0, 8))}</span></div>` : '';
  const building = tile.hotel ? '<span class="building-badge hotel">🏨</span>' : tile.houses ? `<span class="building-badge">${'▴'.repeat(tile.houses)}</span>` : '';
  const tileKey = TILE_ASSET_KEYS[index] || '';
  const tileNo = String(index + 1).padStart(2, '0');
  const exactAsset = tile.asset || `assets/tiles/tile-${tileNo}-${tileKey}.png`;
  const fallbackAsset = `assets/tiles/tile-${tileNo}.png`;
  const fallbackAsset2 = tileKey ? `assets/tiles/${tileKey}.png` : '';
  const tileSrc = versionedAsset(exactAsset);
  const tileFallback1 = versionedAsset(fallbackAsset);
  const tileFallback2 = versionedAsset(fallbackAsset2);
  const tileFallback3 = index === 6 ? versionedAsset('assets/tiles/tile-07-deep-space .png') : '';
  const tileOnError = `if(!this.dataset.fallbackStage){this.dataset.fallbackStage='1';this.src=this.dataset.fallback1;}else if(this.dataset.fallbackStage==='1' && this.dataset.fallback2){this.dataset.fallbackStage='2';this.src=this.dataset.fallback2;}else if(this.dataset.fallbackStage==='2' && this.dataset.fallback3){this.dataset.fallbackStage='3';this.src=this.dataset.fallback3;}else{this.classList.add('tile-art-missing');}`;
  const edgeClass = pos.row === 11 ? 'edge-bottom' : pos.row === 1 ? 'edge-top' : pos.col === 1 ? 'edge-left' : pos.col === 11 ? 'edge-right' : '';
  const labelClass = edgeClass || 'edge-bottom';
  const hideCornerName = [0, 10, 20, 30].includes(index);
  const nameMarkup = hideCornerName ? '' : `<div class="cell-name-outside ${labelClass} tile-label-${index}">${escapeHtml(name)}</div>`;
  return `<div class="board-cell ${tile.type === 'corner' ? 'corner' : ''} ${owner !== null && owner !== undefined ? 'owned' : ''} ${edgeClass}" data-tile-index="${index}" style="grid-row:${pos.row};grid-column:${pos.col};--cell-color:${tile.color}" title="${escapeHtml(tile.name)} — klik untuk melihat detail" role="button" tabindex="0"><img class="cell-art" src="${tileSrc}" data-fallback-1="${tileFallback1}" data-fallback-2="${tileFallback2}" data-fallback-3="${tileFallback3}" alt="${escapeHtml(tile.name)}" fetchpriority="high" decoding="async" onload="this.classList.remove('tile-art-missing')" onerror="${tileOnError}" />${nameMarkup}${building}${ownerBadge}${playersHere}</div>`;
}

function renderPlayerLine(player, index) {
  const role = index === 0 ? 'YOU' : state.mode === 'battle' ? `P${index + 1}` : state.mode === 'ai' ? 'AI' : 'P2';
  return `<div class="player-line ${state.activePlayer === index ? 'active' : ''} ${index > 0 ? 'ai' : ''} ${player.eliminated ? 'eliminated' : ''}" style="--player-color:${playerColor(index)}"><div class="avatar player-character-avatar" style="background:${playerColor(index)}">${characterMarkup(index, player)}</div><div class="player-copy"><div class="player-label">${escapeHtml(player.name)} ${state.activePlayer === index && !player.eliminated ? '<span class="active-turn-badge">TURN</span>' : ''}</div><div class="player-money">${player.eliminated ? 'OUT' : `${formatCurrency(player.cash)} • petak ${player.position + 1}${player.debt ? ` • hutang ${formatCurrency(player.debt)}` : ''}`}</div></div><div class="player-position">${player.eliminated ? 'OUT' : role}</div></div>`;
}

function renderOwnershipLegend() {
  return `<section class="ownership-legend panel"><div class="ownership-title">WARNA PEMILIK</div><div class="ownership-list">${state.players.map((player, index) => `<span class="ownership-item"><i style="background:${playerColor(index)}"></i>${escapeHtml(player.name)}</span>`).join('')}</div></section>`;
}

function renderActivity() {
  const fallback = [{ icon: '✦', text: 'Jawab soal untuk dadu.' }, { icon: '◆', text: 'Tema: <strong>Classic Midnight</strong>' }, { icon: '♛', text: 'Target: 3 properti.' }];
  const items = state.activity.length ? state.activity : fallback;
  return items.slice(0, 4).map((item) => `<div class="activity"><div class="activity-icon">${item.icon}</div><div>${item.text}</div></div>`).join('');
}

function renderQuestionOverlay() {
  if (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex) {
    return `<div class="nm-question-layer"><div class="question-card"><div class="question-top"><p class="eyebrow">Online realtime</p><span class="difficulty-pill">LIVE</span></div><div class="thinking" aria-label="Menunggu lawan"><span></span><span></span><span></span></div><h3>Menunggu ${escapeHtml(state.players[state.activePlayer]?.name || 'lawan')}…</h3><p class="muted small">Giliran lawan sedang menjawab atau melempar dadu.</p></div></div>`;
  }
  if (state.aiThinking) {
    const thinkingPlayer = state.players[state.activePlayer] || { name: 'AI' };
    return `<div class="nm-question-layer"><div class="question-card"><div class="question-top"><p class="question-for"><span>GILIRAN</span><strong>${escapeHtml(thinkingPlayer.name)}</strong></p><span class="difficulty-pill">${DIFFICULTIES[state.difficulty].label}</span></div><div class="thinking" aria-label="AI sedang menghitung"><span></span><span></span><span></span></div><h3>${escapeHtml(thinkingPlayer.name)} sedang berpikir</h3><p class="muted small">Jika salah, dadu direbut.</p></div></div>`;
  }
  const q = state.question;
  const difficulty = DIFFICULTIES[state.difficulty];
  const targetPlayer = state.players[state.activePlayer] || { name: 'Pemain' };
  return `<div class="nm-question-layer"><div class="question-card"><div class="question-top"><p class="question-for"><span>SOAL UNTUK</span><strong>${escapeHtml(targetPlayer.name)}</strong></p><span class="difficulty-pill" style="color:${difficulty.color}">${difficulty.label}</span><span id="question-timer" class="question-timer">${state.questionTimeLeft}s</span></div><h3>Jawab untuk membuka dadu</h3><p class="question-text">${q.text} = ?</p><div id="answer-display" class="answer-display ${state.answer ? '' : 'empty'}">${state.answer ? escapeHtml(state.answer) : 'ketik jawabanmu'}</div><div class="numeric-keyboard">${['1','2','3','4','5','6','7','8','9','-','0','⌫'].map((key) => `<button class="key-btn ${key === '⌫' ? 'control' : ''}" data-action="answer-key" data-key="${key === '⌫' ? 'backspace' : key}">${key}</button>`).join('')}<button class="key-btn control" data-action="answer-key" data-key="clear">Hapus</button><button class="key-btn ok" data-action="submit-answer">OK</button></div><p class="question-hint">Tekan OK untuk lanjut.</p></div></div>`;
}

function renderBattle() {
  const counts = [3, 4, 6];
  return `<section class="battle-screen"><div class="battle-hero panel"><div class="battle-hero-copy"><p class="eyebrow">MULTI PLAYER MODE</p><h2>Fight for the <span class="gradient-text">crown.</span></h2><div class="battle-badges"><span class="soft-chip">⚔ ELIMINATION</span><span class="soft-chip">◆ RANKED</span><span class="soft-chip">LIVE TURNS</span></div></div><div class="battle-orb" aria-hidden="true"><span>⚔</span></div></div><div class="battle-grid">${counts.map((count) => `<button class="battle-count-card panel ${state.battleCount === count ? 'active' : ''}" data-action="battle-count" data-count="${count}"><span class="battle-count">${count}</span><span class="battle-count-label">PLAYERS</span><span class="battle-avatars">${Array.from({ length: count }, (_, index) => `<i>${['🧠','🤖','🦊','🐉','🤖','🪐'][index]}</i>`).join('')}</span></button>`).join('')}</div><div class="battle-controls panel"><div><p class="eyebrow">BATTLE RULES</p><div class="battle-rule-row"><span>✓</span><strong>Jawab untuk dadu</strong><span>•</span><strong>Salah = direbut</strong><span>•</span><strong>Cash 0 = OUT</strong></div></div><button class="btn btn-primary btn-lg" data-action="start-battle">START BATTLE ↗</button></div><div class="battle-exit-note"><span>Yang kalah boleh keluar kapan saja.</span><button class="link-btn" data-action="go-screen" data-screen="leaderboard">VIEW RANKING</button></div></section>`;
}

function renderAuction() {
  const tiles = state.tiles.length ? state.tiles : TILE_BLUEPRINT;
  const available = tiles.map((tile, index) => ({ tile, index })).filter(({ tile }) => (tile.type === 'property' || tile.type === 'utility') && (tile.owner === null || tile.owner === undefined));
  return `<section class="auction-screen"><div class="shop-head"><div><p class="eyebrow">RUMAH LELANG</p><h2 class="title-lg">Tawar <span class="gradient-text">properti.</span></h2><p>Properti hanya dilelang dari menu ini.</p></div><div class="shop-balance"><div class="shop-balance-label">Uangmu</div><div class="shop-balance-value" style="color:var(--cyan)">${state.players[0] ? formatCurrency(state.players[0].cash) : 'Mulai arena'}</div></div></div><div class="auction-list">${available.length ? available.map(({ tile, index }) => `<article class="auction-property panel"><span class="auction-property-color" style="background:${tile.color}"></span><div class="auction-property-art">${tile.icon}</div><div class="auction-property-copy"><strong>${escapeHtml(tile.name)}</strong><small>${formatCurrency(tile.price)} · rent ${formatCurrency(getRent(tile))}</small></div><button class="btn btn-primary" data-action="auction-menu-open" data-tile-index="${index}" ${state.players.length ? '' : 'disabled'}>LELANG</button></article>`).join('') : '<div class="empty-auction panel">Semua properti sudah dimiliki.</div>'}</div></section>`;
}

function renderPropertiesScreen() {
  const owned = state.tiles.map((tile, index) => ({ tile, index })).filter(({ tile }) => tile.owner === 0);
  return `<section class="properties-screen"><div class="shop-head"><div><p class="eyebrow">ASET KAMU</p><h2 class="title-lg">Penyimpanan <span class="gradient-text">properti.</span></h2><p>Jual properti kapan saja untuk menambah modal.</p></div><div class="shop-balance"><div class="shop-balance-label">Nilai aset</div><div class="shop-balance-value" style="color:var(--gold)">${state.players.length ? formatCurrency(playerAssetsValue(0)) : 'Mulai arena'}</div></div></div><div class="properties-grid">${owned.length ? owned.map(({ tile, index }) => `<article class="asset-card panel"><div class="asset-card-art" style="--asset-color:${tile.color}">${tile.icon}</div><div class="asset-card-copy"><strong>${escapeHtml(tile.name)}</strong><small>Sewa ${formatCurrency(getRent(tile))} · ${tile.hotel ? 'Hotel' : `${tile.houses || 0} rumah`}</small></div><button class="btn btn-danger" data-action="sell-property" data-tile-index="${index}" ${state.players[0]?.position === index ? '' : 'disabled'}>${state.players[0]?.position === index ? 'JUAL' : 'DI PETAK LAIN'}</button></article>`).join('') : '<div class="empty-auction panel">Belum ada properti. Mulai arena untuk membeli.</div>'}</div><button class="btn btn-primary" data-action="go-screen" data-screen="game" ${state.players.length ? '' : 'disabled'}>KEMBALI KE ARENA</button></section>`;
}

function renderShop() {
  const type = state.shopType || 'dice';
  const label = type === 'dice' ? 'dadu' : type === 'board' ? 'papan' : 'karakter';
  return `<section><div class="shop-head"><div><p class="eyebrow">Vault of styles</p><h2 class="title-lg">Tema premium <span class="gradient-text">siap dibuka.</span></h2><p>Buka berurutan dengan diamond.</p></div><div class="shop-balance"><div class="shop-balance-label">Diamond tersedia</div><div class="shop-balance-value">◆ ${formatNumber(state.diamond)}</div></div></div><div class="shop-tabs"><button class="shop-tab ${type === 'dice' ? 'active' : ''}" data-action="shop-tab" data-shop-type="dice">◈ Tema dadu</button><button class="shop-tab ${type === 'board' ? 'active' : ''}" data-action="shop-tab" data-shop-type="board">▦ Tema papan</button><button class="shop-tab ${type === 'character' ? 'active' : ''}" data-action="shop-tab" data-shop-type="character">♟ Karakter 3D</button></div><div class="shop-grid">${SHOP_DATA[type].map((item, index) => renderShopCard(item, type, index)).join('')}</div></section>`;
}

function isItemOwned(type, item) {
  return state.inventory[type]?.includes(item.id);
}

function isItemAvailable(type, index) {
  const item = SHOP_DATA[type][index];
  if (!item || item.custom) return false;
  if (isItemOwned(type, item)) return true;
  if (index === 0) return true;
  return SHOP_DATA[type].slice(0, index).filter((candidate) => !candidate.custom).every((candidate) => isItemOwned(type, candidate));
}

function renderShopCard(item, type, index) {
  const owned = isItemOwned(type, item);
  const available = isItemAvailable(type, index);
  const selected = state.selectedThemes[type] === item.id;
  if (item.custom) {
    return `<article class="shop-card custom-slot"><div class="shop-art"><div class="theme-glyph">＋</div></div><h3>${item.name}</h3><p>${item.description}</p><div class="shop-card-foot"><span class="item-status">Siap dikembangkan</span><button class="btn btn-ghost" style="min-height:30px;padding:0 8px;font-size:.6rem" data-action="custom-slot" data-shop-type="${type}">Detail</button></div></article>`;
  }
  const fallbackVisual = `<span class="theme-asset-fallback" aria-hidden="true">${item.glyph}</span>`;
  const actionLabel = owned ? (selected ? 'Dipakai' : 'Pakai') : available ? 'Buka' : 'Terkunci';
  const action = owned || available ? `<button class="btn ${selected ? 'btn-ghost' : 'btn-primary'}" style="min-height:30px;padding:0 9px;font-size:.6rem" data-action="shop-item" data-shop-type="${type}" data-item-id="${item.id}">${actionLabel}</button>` : `<span class="item-status">Urutan ${index}</span>`;
  const asset = versionedAsset(item.asset);
  return `<article class="shop-card ${selected ? 'selected' : ''} ${!available && !owned ? 'locked' : ''}">${!owned ? `<span class="lock-tag">${available ? '◇' : '🔒'}</span>` : '<span class="lock-tag" style="color:var(--success)">✓</span>'}<div class="shop-art"><img class="asset-preview" src="${asset}" alt="${escapeHtml(item.name)}" draggable="false" loading="eager" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'" />${fallbackVisual}</div><h3>${item.name}</h3><p>${item.description}</p><div class="shop-card-foot"><span class="item-price ${item.cost === 0 ? 'free' : ''}">${item.cost === 0 ? 'Gratis' : `◆ ${formatNumber(item.cost)}`}</span>${action}</div></article>`;
}

function leaderboardCharacterAsset(person, index) {
  if (person?.current) return characterAsset(0);
  const map = ['character-01','character-02','character-03','character-04','character-05','character-06','character-07'];
  const id = person?.characterId || map[index % map.length] || 'character-standard';
  return SHOP_DATA.character.find(item => item.id === id)?.asset || SHOP_DATA.character[0].asset;
}

function leaderboardAvatarMarkup(person, index, className = '') {
  const asset = leaderboardCharacterAsset(person, index);
  return `<span class="avatar ${className}"><img class="rank-character-image" src="${versionedAsset(asset)}" alt="" draggable="false" loading="eager" onerror="this.remove()" /></span>`;
}

function renderLeaderboard() {
  const all = [...LEADERBOARD, { name: state.player.name, avatar: state.player.avatar, score: state.stats.points, change: '—', current: true, characterId: state.selectedThemes.character }].sort((a, b) => b.score - a.score);
  const podium = all.slice(0, 3);
  return `<section><div class="shop-head"><div><p class="eyebrow">Season 08 • Aurora League</p><h2 class="title-lg">Main cerdas, <span class="gradient-text">naik peringkat.</span></h2><p>Menang, kumpulkan rating, jadi #1.</p></div><div class="shop-balance"><div class="shop-balance-label">Peringkatmu</div><div class="shop-balance-value" style="color:var(--cyan)">#${all.findIndex((person) => person.current) + 1}</div></div></div><div class="leaderboard-layout"><div class="panel"><div class="podium">${podium.map((person, index) => renderPodiumCard(person, index)).join('')}</div><div class="rank-table"><div class="rank-table-head"><span>#</span><span>Pemain</span><span>Rating</span><span>Trend</span></div>${all.map((person, index) => `<div class="rank-table-row ${person.current ? 'current' : ''}"><span class="rank-col">${index + 1}</span><span class="rank-user">${leaderboardAvatarMarkup(person, index)}<span class="rank-user-name">${escapeHtml(person.name)}${person.current ? ' (kamu)' : ''}</span></span><span class="rank-points">${formatNumber(person.score)}</span><span class="rank-change">${person.change === '—' ? '•' : `↑ ${person.change}`}</span></div>`).join('')}</div></div><aside class="ranking-card panel"><p class="eyebrow">Your season</p><h3>Perjalanan menuju #1</h3><p>Menang arena untuk naik rating.</p><div class="ranking-number">${formatNumber(state.stats.points)}</div><div class="muted small">rating saat ini</div><div class="divider"></div><div class="row between"><span class="muted small">Target top 3</span><strong style="color:var(--cyan);font-size:.8rem">${Math.min(100, Math.round((state.stats.points / 8870) * 100))}%</strong></div><div style="height:9px"></div><div class="progress-track"><div class="progress-bar" style="width:${Math.min(100, Math.round((state.stats.points / 8870) * 100))}%"></div></div><div style="height:18px"></div><button class="btn btn-primary btn-wide" data-action="begin-game">Kejar rating</button></aside></div></section>`;
}

function renderPodiumCard(person, index) {
  const classes = ['first', 'second', 'third'];
  return `<div class="podium-card ${classes[index]}">${leaderboardAvatarMarkup(person, index)}<div class="podium-name">${escapeHtml(person.name)}</div><div class="podium-points">${formatNumber(person.score)} rating</div><div class="podium-rank">${index + 1}</div></div>`;
}

function renderOnline() {
  const room = state.room;
  const joined = Boolean(room?.opponent);
  const waitingLabel = room?.role === 'guest' ? 'Menunggu host…' : 'Menunggu lawan…';
  const roomActions = joined && room?.role === 'host'
    ? '<button class="btn btn-purple" data-action="start-online-match">Mulai match</button>'
    : `<span class="soft-chip">⏳ ${waitingLabel}</span>`;
  return `<section><div class="online-layout"><article class="online-hero panel"><p class="eyebrow">Cross-device arena</p><h2>Undang rival terbaikmu ke <span class="gradient-text">papan yang sama.</span></h2><p>Buat room. Kirim kode. Main bareng.</p>${room ? `<div class="room-code" aria-label="Kode room">${room.code}</div><div class="row wrap" style="margin-top:18px"><button class="btn btn-primary" data-action="copy-room">Salin kode</button>${roomActions}</div><p class="small muted" style="margin-top:14px">${cloudStatus.configured ? 'Room realtime aktif via Firebase.' : 'Mode demo aktif. Isi konfigurasi Firebase untuk matchmaking antar HP.'}</p>` : `<div class="row wrap"><button class="btn btn-primary btn-lg" data-action="create-room">Buat room</button><span class="soft-chip">Room aman & unik</span></div>`}</article><aside class="online-side panel"><p class="eyebrow">Online</p><h3>Room cepat</h3><p>Masukkan kode room teman.</p><div class="steps"><div class="step"><div class="step-num">01</div><div><strong>Buat room</strong><span>Kode 6 karakter.</span></div></div><div class="step"><div class="step-num">02</div><div><strong>Kirim kode</strong><span>Kirim kode ke teman.</span></div></div><div class="step"><div class="step-num">03</div><div><strong>Jawab & rebut dadu</strong><span>Jawab, lempar, menang.</span></div></div></div><div class="divider"></div><label class="field-label" for="room-input">Punya kode room?</label><div class="row"><input id="room-input" class="text-input" style="height:43px;text-transform:uppercase;letter-spacing:.1em" maxlength="6" placeholder="ABC123" value="" /><button class="btn btn-ghost" data-action="join-room">Gabung</button></div></aside></div></section>`;
}

function renderProfile() {
  return `<section><div class="content-card panel"><div class="profile-grid"><div class="profile-identity"><div class="avatar">${characterMarkup(0, state.player)}</div><div><h2>${escapeHtml(state.player.name)}</h2><p>Level ${state.player.level} • Member Aurora League</p></div></div><div class="profile-form"><div><div class="label-with-hint"><label class="field-label" for="profile-name">Nama panggilan</label><span class="muted mini">Tersimpan lokal</span></div><input id="profile-name" class="text-input" maxlength="20" value="${escapeHtml(state.player.name)}" /></div><div class="setting-row"><div class="setting-copy"><strong>Suara tombol & efek</strong><span>Feedback saat klik, benar, salah, dan dadu.</span></div><label class="switch"><input type="checkbox" data-setting="sound" ${state.sound ? 'checked' : ''} /><span class="switch-track"></span></label></div><div class="setting-row"><div class="setting-copy"><strong>Background music</strong><span>Musik berbeda untuk login dan arena.</span></div><label class="switch"><input type="checkbox" data-setting="music" ${state.music ? 'checked' : ''} /><span class="switch-track"></span></label></div><div class="setting-row"><div class="setting-copy"><strong>Mode soal default</strong><span>Level yang dipakai saat arena baru dimulai.</span></div><select class="select-input" data-setting="difficulty"><option value="easy" ${state.difficulty === 'easy' ? 'selected' : ''}>Mudah</option><option value="medium" ${state.difficulty === 'medium' ? 'selected' : ''}>Sedang</option><option value="hard" ${state.difficulty === 'hard' ? 'selected' : ''}>Sulit</option></select></div><div class="row wrap" style="margin-top:6px"><button class="btn btn-primary" data-action="save-profile">Simpan profil</button><button class="btn btn-ghost" data-action="install-app">Pasang ke HP</button><button class="btn btn-danger" data-action="reset-progress">Reset demo</button><button class="btn btn-ghost" data-action="logout">Logout</button></div></div></div></div><div style="height:18px"></div><div class="content-card panel"><div class="section-heading"><h3>Firebase</h3><span class="soft-chip ${cloudStatus.configured ? 'active-turn' : ''}">${cloudStatus.configured ? '● Firebase connected' : '○ Demo local mode'}</span></div><p class="muted small" style="line-height:1.6;margin-bottom:0">${cloudStatus.configured ? 'Diamond diproses lewat Cloud Functions.' : 'Demo lokal aktif. Deploy Functions untuk online.'}</p></div></section>`;
}

function renderToastStack() {
  return '';
}

function renderModal() {
  if (!state.modal) return '';
  const modal = state.modal;
  if (modal.type === 'tile-info') {
    const tile = modal.tile;
    const asset = tile?.asset ? versionedAsset(tile.asset) : '';
    const isProperty = tile?.type === 'property';
    const isUtility = tile?.type === 'utility';
    const priceRows = tile?.price ? `
      <div class="tile-info-prices">
        <div><span>Harga beli</span><strong>${formatCurrency(tile.price)}</strong></div>
        ${tile.rent ? `<div><span>Sewa dasar</span><strong>${formatCurrency(tile.rent)}</strong></div>` : ''}
        ${isProperty ? `<div><span>Biaya rumah</span><strong>${formatCurrency(houseCost(tile))}</strong></div><div><span>Sewa hotel</span><strong>${formatCurrency(Math.round((tile.rent || 0) * 1.5 * 18 * ((tile.owner !== null && tile.owner !== undefined && ownsFullGroup(tile, tile.owner)) ? 2 : 1)))}</strong></div>` : ''}
        ${isUtility ? `<div><span>Sewa saat ini</span><strong>${formatCurrency(getRent(tile))}</strong></div>` : ''}
      </div>` : `<div class="tile-info-special">${escapeHtml(tile?.detail || 'Petak khusus')}</div>`;
    return `<div class="modal-layer"><div class="modal-card tile-info-modal">${asset ? `<div class="tile-info-art"><img src="${asset}" alt="${escapeHtml(tile.name)}" /></div>` : ''}<p class="eyebrow">${isProperty ? 'PROPERTI' : isUtility ? 'FASILITAS' : 'PETAK KHUSUS'}</p><h3>${escapeHtml(tile.name)}</h3>${priceRows}<div class="tile-info-owner">${tile.owner !== null && tile.owner !== undefined ? `Dimiliki oleh <strong>${escapeHtml(state.players[tile.owner]?.name || 'Pemain')}</strong>` : 'Belum dimiliki'}</div><div class="modal-actions"><button class="btn btn-primary btn-wide" data-action="modal-close">Tutup</button></div></div></div>`;
  }
  if (modal.type === 'purchase') {
    return `<div class="modal-layer"><div class="modal-card property-modal"><div class="modal-property-icon">◈</div><p class="eyebrow">PROPERTY</p><h3>${escapeHtml(modal.tile.name)}</h3><p><strong style="color:var(--gold)">${formatCurrency(modal.tile.price)}</strong> · rent ${formatCurrency(getRent(modal.tile))}</p><div class="row between" style="margin-top:15px"><span class="muted small">Saldo ${formatCurrency(state.players[state.activePlayer]?.cash || 0)}</span><span style="color:var(--success);font-size:.72rem">+ LAND</span></div><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-skip">Lewati</button><button class="btn btn-primary" data-action="modal-buy">Beli</button></div></div></div>`;
  }
  if (modal.type === 'turn-end') {
    return `<div class="modal-layer turn-end-layer"><div class="modal-card turn-end-modal"><div class="turn-end-icon">✓</div><p class="eyebrow">PETAK TUJUAN</p><h3>${escapeHtml(modal.tile?.name || 'Giliran selesai')}</h3><p>${escapeHtml(modal.message || 'Giliran selesai.')}</p><button class="btn btn-primary btn-wide" data-action="continue-turn">LANJUT</button></div></div>`;
  }
  if (modal.type === 'emergency') {
    const player = state.players[state.activePlayer];
    const need = Math.max(0, modal.amount - (player?.cash || 0));
    const maxLoan = maxBankLoan(state.activePlayer);
    const owned = state.tiles.map((tile, index) => ({ tile, index })).filter(({ tile }) => tile.owner === state.activePlayer);
    return `<div class="modal-layer"><div class="modal-card emergency-modal"><div class="modal-property-icon">🏦</div><p class="eyebrow">DANA DARURAT</p><h3>${escapeHtml(modal.reason || (modal.paymentType === 'rent' ? 'Bayar rent' : 'Bayar pajak'))}</h3><p>Butuh <strong style="color:var(--danger)">${formatCurrency(need)}</strong> lagi. Pilih pinjaman bank atau jual properti.</p><div class="emergency-summary"><span>Uang ${formatCurrency(player?.cash || 0)}</span><span>Pinjaman max ${formatCurrency(maxLoan)}</span></div><div class="emergency-assets">${owned.length ? owned.map(({ tile, index }) => `<button class="emergency-asset" data-action="emergency-sell" data-tile-index="${index}"><span style="--asset-color:${tile.color}">${tile.icon}</span><b>${escapeHtml(tile.name)}</b><small>Jual ${formatCurrency(Math.floor(tile.price * .6))}</small></button>`).join('') : '<span class="muted small">Tidak ada properti untuk dijual.</span>'}</div><div class="modal-actions">${maxLoan > 0 ? `<button class="btn btn-primary" data-action="borrow-bank" data-loan-amount="${Math.min(need, maxLoan)}">Pinjam ${formatCurrency(Math.min(need, maxLoan))}</button>` : ''}<button class="btn btn-danger" data-action="declare-bankruptcy">Bangkrut</button></div></div></div>`;
  }
  if (modal.type === 'manage-group') {
    const tile = modal.tile;
    const group = propertyGroup(tile);
    const options = groupBuildOptions(tile, state.activePlayer);
    const groupText = group.map(candidate => `${candidate.name}: ${candidate.hotel ? 'HOTEL' : `${candidate.houses || 0} rumah`}`).join(' • ');
    const optionRows = group.map((candidate) => {
      const tileIndex = state.tiles.indexOf(candidate);
      const hotel = canBuildHotelOn(candidate, state.activePlayer);
      const house = canBuildHouseOn(candidate, state.activePlayer);
      const cost = houseCost(candidate);
      const canAfford = (state.players[state.activePlayer]?.cash || 0) >= (hotel ? cost * 2 : cost);
      let action = '';
      if (hotel && canAfford) action = `<button class="property-action" data-action="buy-hotel" data-tile-index="${tileIndex}" title="Bangun hotel">🏨</button>`;
      else if (house && canAfford) action = `<button class="property-action" data-action="buy-house" data-tile-index="${tileIndex}" title="Bangun rumah">＋</button>`;
      else if (hotel) action = '<span class="soft-chip">HOTEL</span>';
      else if (house) action = '<span class="soft-chip">SALDO KURANG</span>';
      else action = '<span class="soft-chip">TUNGGU MERATA</span>';
      return `<div class="owned-property manage-build-row"><span class="property-color" style="background:${candidate.color}"></span><div class="owned-property-copy"><strong>${escapeHtml(candidate.name)}</strong><small>${candidate.hotel ? 'Hotel aktif' : `${candidate.houses || 0} rumah`} · ${formatCurrency(hotel ? cost * 2 : cost)}</small></div>${action}</div>`;
    }).join('');
    return `<div class="modal-layer"><div class="modal-card property-modal manage-group-modal"><div class="modal-property-icon">⌂</div><p class="eyebrow">BANGUN RUMAH • SATU GRUP</p><h3>${escapeHtml(tile.group || 'GRUP PROPERTI')}</h3><p>Pilih petak dalam grup ini. Karakter boleh tetap berada di petak tujuan.</p><div class="manage-group-status"><strong>STATUS GRUP</strong><small>${escapeHtml(groupText)}</small></div><div class="manage-build-list">${optionRows || '<span class="build-rule-note">Belum ada rumah/hotel yang memenuhi syarat untuk dibangun.</span>'}</div><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-close">Tutup</button></div></div></div>`;
  }
  if (modal.type === 'manage') {
    const tile = modal.tile;
    const availability = buildAvailability(tile, state.activePlayer);
    const group = propertyGroup(tile);
    const groupText = group.map(candidate => `${candidate.name}: ${candidate.hotel ? 'HOTEL' : `${candidate.houses || 0} rumah`}`).join(' • ');
    let buildButton = '';
    if (availability.ok && availability.kind === 'house') buildButton = `<button class="btn btn-primary" data-action="buy-house" data-tile-index="${modal.tileIndex}">Beli rumah</button>`;
    else if (availability.ok && availability.kind === 'hotel') buildButton = `<button class="btn btn-primary" data-action="buy-hotel" data-tile-index="${modal.tileIndex}">Beli hotel</button>`;
    else if (tile.hotel) buildButton = '<span class="soft-chip">HOTEL AKTIF</span>';
    else buildButton = `<span class="build-rule-note">${escapeHtml(availability.message)}</span>`;
    return `<div class="modal-layer"><div class="modal-card property-modal"><div class="modal-property-icon">⌂</div><p class="eyebrow">PROPERTI MILIKMU</p><h3>${escapeHtml(tile.name)}</h3><p>${tile.hotel ? 'HOTEL' : `${tile.houses || 0} rumah`} · rent ${formatCurrency(getRent(tile))}</p><div class="manage-group-status"><strong>GRUP ${escapeHtml(tile.group || '—')}</strong><small>${escapeHtml(groupText)}</small></div><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-close">Tutup</button>${buildButton}</div></div></div>`;
  }
  if (modal.type === 'auction') {
    return `<div class="modal-layer"><div class="modal-card auction-modal"><div class="modal-property-icon">⚖</div><p class="eyebrow">AUCTION</p><h3>${escapeHtml(modal.tile.name)}</h3><div class="auction-bid"><span>CURRENT BID</span><strong>${formatCurrency(modal.bid)}</strong></div><p class="muted small">Naikkan tawaran atau menangkan properti.</p><div class="modal-actions"><button class="btn btn-ghost" data-action="auction-cancel">Batal</button><button class="btn btn-ghost" data-action="auction-raise">+50</button><button class="btn btn-primary" data-action="auction-accept">Menang</button></div></div></div>`;
  }
  if (modal.type === 'chance') {
    return `<div class="modal-layer"><div class="modal-card chance-modal"><div class="chance-card-large">${modal.card.icon}</div><p class="eyebrow">CHANCE CARD</p><h3>${escapeHtml(modal.card.title)}</h3><p>${escapeHtml(modal.card.message)}</p><div class="modal-actions"><button class="btn btn-primary" data-action="resolve-chance">Ambil kartu</button></div></div></div>`;
  }
  if (modal.type === 'sell') {
    return `<div class="modal-layer"><div class="modal-card"><div class="modal-property-icon">↗</div><p class="eyebrow">SELL PROPERTY</p><h3>${escapeHtml(modal.tile.name)}</h3><p>Jual kembali untuk <strong style="color:var(--gold)">${formatCurrency(Math.floor(modal.tile.price * .6))}</strong>.</p><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-close">Batal</button><button class="btn btn-danger" data-action="confirm-sell">Jual</button></div></div></div>`;
  }
  if (modal.type === 'notice') {
    return `<div class="modal-layer"><div class="modal-card"><p class="eyebrow">${modal.good ? 'Nice move' : 'Attention'}</p><h3>${escapeHtml(modal.title)}</h3><p>${modal.message}</p><div class="modal-actions"><button class="btn btn-primary" data-action="modal-close">Lanjutkan</button></div></div></div>`;
  }
  if (modal.type === 'reset') {
    return `<div class="modal-layer"><div class="modal-card"><p class="eyebrow">Local demo</p><h3>Reset semua progres?</h3><p>Data lokal di perangkat ini akan dihapus. Aksi ini tidak menghapus data Firebase.</p><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-close">Batal</button><button class="btn btn-danger" data-action="confirm-reset">Reset progres</button></div></div></div>`;
  }
  if (modal.type === 'win') {
    const sparks = Array.from({length:72},(_,i)=>{ const burst=i%9; const group=Math.floor(i/9); const angle=(burst*40)-20; const hue=(group*47+burst*9)%360; const delay=((i%9)*-0.08-(group%3)*0.35).toFixed(2); return `<i style="--angle:${angle}deg;--hue:${hue};--delay:${delay}s;--burst:${group}"></i>`; }).join('');
    return `<div class="modal-layer win-layer"><div class="fireworks" aria-hidden="true">${sparks}</div><div class="victory-glow"></div><div class="modal-card win-card" style="text-align:center"><div class="win-trophy">🏆</div><p class="eyebrow">GAME OVER • VICTORY</p><h3>Selamat, ${escapeHtml(modal.winnerName || 'Pemenang')}!</h3><p>${escapeHtml(modal.reason || 'Permainan selesai.')} <strong>${escapeHtml(modal.winnerName || 'Pemenang')}</strong> menjadi pemenang Numeric Monopoly Matematic.</p><div class="row" style="justify-content:center;gap:9px;margin-top:14px"><span class="soft-chip">+${modal.points} rating</span><span class="soft-chip">◆ ${modal.diamond} bonus</span></div><div class="modal-actions" style="justify-content:center"><button class="btn btn-ghost" data-action="go-screen" data-screen="leaderboard">Lihat ranking</button></div></div></div>`;
  }
  return '';
}

function renderInstallBanner() {
  if (!deferredInstallPrompt) return '';
  return `<div class="install-banner show"><div class="install-icon">＋</div><div class="install-copy"><strong>Pasang Numeric Monopoly</strong><span>Main langsung dari layar HP, tanpa mencari link lagi.</span></div><button class="btn btn-primary" style="min-height:34px;padding:0 11px;font-size:.67rem" data-action="install">Pasang</button><button class="btn btn-ghost btn-icon" style="width:30px;height:30px;min-height:30px;font-size:.75rem" data-action="dismiss-install" aria-label="Tutup">×</button></div>`;
}

function resetGame() {
  let players;
  if (state.mode === 'online') {
    const host = state.room?.host || { name: 'Host', avatar: '♛' };
    const guest = state.room?.opponent || { name: 'Menunggu lawan', avatar: '🌐' };
    players = [
      { id: 0, name: host.name, avatar: host.avatar, position: 0, cash: 5000, debt: 0, eliminated: false, inJail: false, jailAttempts: 0 },
      { id: 1, name: guest.name, avatar: guest.avatar, position: 0, cash: 5000, debt: 0, eliminated: false, inJail: false, jailAttempts: 0 }
    ];
  } else if (state.mode === 'battle') {
    const names = ['Luna Logic', 'Astro Fox', 'Robo Knight', 'Dragon Spark', 'Crystal Golem'];
    const avatars = ['🤖', '🦊', '🤖', '🐉', '💎'];
    const count = Math.max(3, Math.min(6, Number(state.battleCount) || 4));
    players = [{ id: 0, name: state.player.name, avatar: state.player.avatar, position: 0, cash: 5000, debt: 0, eliminated: false, inJail: false, jailAttempts: 0 }];
    for (let i = 1; i < count; i += 1) players.push({ id: i, name: names[i - 1] || `Rival ${i}`, avatar: avatars[i - 1] || '🤖', position: 0, cash: 5000, debt: 0, eliminated: false, inJail: false, jailAttempts: 0 });
  } else {
    const playerCharacterId = state.selectedThemes.character || 'character-standard';
    const aiPool = SHOP_DATA.character.filter((entry) => entry.id !== playerCharacterId && entry.asset);
    const aiCharacterId = aiPool[0]?.id || 'character-standard';
    const opponent = state.mode === 'ai'
      ? { id: 1, name: 'Luna Logic', avatar: '🤖', characterId: aiCharacterId, position: 0, cash: 5000, debt: 0, eliminated: false, inJail: false, jailAttempts: 0 }
      : { id: 1, name: 'Pemain 2', avatar: '🦊', characterId: aiCharacterId, position: 0, cash: 5000, debt: 0, eliminated: false, inJail: false, jailAttempts: 0 };
    players = [
      { id: 0, name: state.player.name, avatar: state.player.avatar, characterId: playerCharacterId, position: 0, cash: 5000, debt: 0, eliminated: false, inJail: false, jailAttempts: 0 },
      opponent
    ];
  }
  state.players = players;
  state.tiles = TILE_BLUEPRINT.map((tile) => ({ ...tile, owner: null, houses: 0, hotel: false }));
  state.boardDirty = true;
  state.activePlayer = 0;
  state.question = null;
  state.answer = '';
  state.canRoll = false;
  state.rolling = false;
  state.moving = false;
  state.moveStep = 0;
  state.aiThinking = false;
  state.turnCount = 0;
  state.lastRoll = null;
  state.lastDice = [null, null];
  state.hasRolled = false;
  clearQuestionTimer();
  state.questionDeadline = null;
  state.questionTimeLeft = 15;
  state.bankBalance = 100000;
  state.activity = [];
  state.answerNotice = null;
  state.pendingPayment = null;
  state.modal = null;
}

function startGame(mode = state.mode) {
  state.mode = mode;
  state.gameMenuOpen = false;
  if (mode === 'online') {
    state.screen = 'online';
    render();
    return;
  }
  resetGame();
  state.screen = 'game';
  state.forceFullRender = true;
  askQuestion();
  persist();
  render();
  window.setTimeout(preloadTileAssets, 250);
  updateMusic();
}

function startBattle() {
  state.mode = 'battle';
  state.gameMenuOpen = false;
  state.localPlayerIndex = 0;
  resetGame();
  state.screen = 'game';
  state.forceFullRender = true;
  askQuestion();
  persist();
  render();
  window.setTimeout(preloadTileAssets, 250);
  updateMusic();
}

function leaveBattle() {
  if (state.mode !== 'battle') return;
  const player = state.players[state.localPlayerIndex];
  if (player) player.eliminated = true;
  addActivity('↪', `<strong>${escapeHtml(player?.name || 'Pemain')}</strong> keluar dari Battle Arena.`);
  state.question = null;
  state.answer = '';
  state.aiThinking = false;
  state.canRoll = false;
  state.modal = null;
  state.screen = 'battle';
  persist();
  render();
  showToast('Kamu keluar dari Battle Arena.', '');
}

function resetDiceDisplay() {
  state.hasRolled = false;
  state.lastRoll = null;
  state.lastDice = [null, null];
}

function nextAlivePlayer(fromIndex = state.activePlayer) {
  if (!state.players.length) return 0;
  for (let step = 1; step <= state.players.length; step += 1) {
    const index = (fromIndex + step) % state.players.length;
    if (!state.players[index].eliminated) return index;
  }
  return fromIndex;
}

function playerAssetsValue(playerIndex) {
  return state.tiles.filter((tile) => tile.owner === playerIndex).reduce((total, tile) => total + (tile.price || 0) + (tile.houses || 0) * houseCost(tile) + (tile.hotel ? houseCost(tile) * 2 : 0), 0);
}

function isBankrupt(playerIndex) {
  const player = state.players[playerIndex];
  return Boolean(player && (player.eliminated || (player.cash <= 0 && playerAssetsValue(playerIndex) <= 0)));
}

function markEliminatedPlayers() {
  state.players.forEach((player) => {
    if (isBankrupt(player.id)) player.eliminated = true;
  });
}

function generateQuestion(level = state.difficulty) {
  let a; let b; let c; let text; let answer;
  if (level === 'easy') {
    a = randomInt(1, 30);
    b = randomInt(1, 25);
    const op = Math.random() < .55 ? '+' : '−';
    answer = op === '+' ? a + b : a - b;
    text = `${a} ${op} ${b}`;
  } else if (level === 'medium') {
    const type = randomInt(0, 3);
    if (type === 0) { a = randomInt(15, 90); b = randomInt(10, 70); answer = a + b; text = `${a} + ${b}`; }
    else if (type === 1) { a = randomInt(30, 130); b = randomInt(10, 80); answer = a - b; text = `${a} − ${b}`; }
    else if (type === 2) { a = randomInt(2, 12); b = randomInt(2, 12); answer = a * b; text = `${a} × ${b}`; }
    else { b = randomInt(2, 12); answer = randomInt(2, 12); a = b * answer; text = `${a} ÷ ${b}`; }
  } else {
    const type = randomInt(0, 2);
    if (type === 0) { a = randomInt(3, 18); b = randomInt(3, 16); c = randomInt(2, 40); answer = a * b - c; text = `(${a} × ${b}) − ${c}`; }
    else if (type === 1) { a = randomInt(20, 90); b = randomInt(2, 12); c = randomInt(2, 12); answer = a + b * c; text = `${a} + (${b} × ${c})`; }
    else { b = randomInt(2, 12); const quotient = randomInt(3, 18); a = b * quotient; c = randomInt(2, 24); answer = quotient + c; text = `(${a} ÷ ${b}) + ${c}`; }
  }
  return { text, answer };
}

function clearQuestionTimer() {
  if (state.questionTimerId) window.clearInterval(state.questionTimerId);
  state.questionTimerId = null;
}

function updateQuestionTimerDom() {
  const timer = document.getElementById('question-timer');
  if (!timer) return;
  timer.textContent = `${state.questionTimeLeft}s`;
  timer.classList.toggle('urgent', state.questionTimeLeft <= 5);
}

function startQuestionTimer() {
  clearQuestionTimer();
  state.questionDeadline = Date.now() + 15000;
  state.questionTimeLeft = 15;
  updateQuestionTimerDom();
  state.questionTimerId = window.setInterval(() => {
    if (!state.question || state.aiThinking || state.screen !== 'game') {
      clearQuestionTimer();
      return;
    }
    state.questionTimeLeft = Math.max(0, Math.ceil((state.questionDeadline - Date.now()) / 1000));
    updateQuestionTimerDom();
    if (state.questionTimeLeft <= 0) {
      clearQuestionTimer();
      timeoutAnswer();
    }
  }, 250);
}

function timeoutAnswer() {
  if (!state.question || state.aiThinking) return;
  const correctAnswer = state.question.answer;
  const playerName = state.players[state.activePlayer]?.name || state.player.name;
  clearQuestionTimer();
  state.question = null;
  state.answer = '';
  state.canRoll = false;
  state.questionDeadline = null;
  state.questionTimeLeft = 0;
  playSound('wrong');
  addActivity('⌛', `<strong>${escapeHtml(playerName)}</strong> kehabisan waktu. Lemparan direbut lawan.`);
  setAnswerNotice(false, `Waktu habis. Jawaban ${correctAnswer}.`);
  if (state.mode === 'ai') {
    resetDiceDisplay();
    state.activePlayer = 1;
    state.canRoll = true;
    render();
    window.setTimeout(() => rollDice(true), 650);
    return;
  }
  state.activePlayer = state.mode === 'battle' ? nextAlivePlayer(state.activePlayer) : state.activePlayer === 0 ? 1 : 0;
  state.canRoll = true;
  if (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex) window.setTimeout(() => rollDice(true), 650);
  render();
}

function askQuestion() {
  if (state.mode === 'ai' && state.activePlayer === 1) return startAITurn();
  if (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex) return startAITurn();
  if (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex) {
    state.aiThinking = false;
    state.question = null;
    state.answer = '';
    state.canRoll = false;
    return;
  }
  state.aiThinking = false;
  state.question = generateQuestion();
  state.answer = '';
  state.canRoll = false;
  startQuestionTimer();
}

function startAITurn() {
  clearQuestionTimer();
  const aiIndex = state.activePlayer;
  const aiPlayer = state.players[aiIndex];
  state.question = generateQuestion();
  state.answer = '';
  state.canRoll = false;
  state.aiThinking = true;
  render();
  window.setTimeout(() => {
    if (state.screen !== 'game' || !state.aiThinking) return;
    const chance = state.difficulty === 'easy' ? .88 : state.difficulty === 'medium' ? .72 : .58;
    const correct = Math.random() < chance;
    state.aiThinking = false;
    state.question = null;
    if (correct) {
      state.canRoll = true;
      addActivity('✓', `<strong>${escapeHtml(aiPlayer?.name || 'AI')}</strong> benar dan mendapat dadu.`);
      render();
      window.setTimeout(() => rollDice(true), 650);
    } else {
      resetDiceDisplay();
      const next = state.mode === 'battle' ? nextAlivePlayer(aiIndex) : 0;
      state.activePlayer = next;
      state.canRoll = true;
      addActivity('↺', `<strong>${escapeHtml(aiPlayer?.name || 'AI')}</strong> salah. Lemparan direbut lawan.`);
      showToast(`Lemparan ${aiPlayer?.name || 'AI'} direbut lawan.`, 'good');
      if (state.mode === 'battle' && next !== state.localPlayerIndex) window.setTimeout(() => rollDice(true), 650);
      else if (state.mode !== 'battle') askQuestion();
      render();
    }
  }, 1250);
}

function syncAnswerDisplay() {
  const display = document.getElementById('answer-display');
  if (!display) return;
  display.textContent = state.answer || 'ketik jawabanmu';
  display.classList.toggle('empty', !state.answer);
}

function handleAnswerKey(key) {
  if (!state.question || state.aiThinking) return;
  if (key === 'clear') state.answer = '';
  else if (key === 'backspace') state.answer = state.answer.slice(0, -1);
  else if (key === '-') state.answer = state.answer.startsWith('-') ? state.answer.slice(1) : `-${state.answer}`;
  else if (/^\d$/.test(key) && state.answer.replace('-', '').length < 7) state.answer += key;
  syncAnswerDisplay();
}

function submitAnswer() {
  if (!state.question || state.aiThinking) return;
  if (!state.answer || state.answer === '-') {
    showToast('Masukkan jawaban terlebih dahulu.', 'bad');
    return;
  }
  const given = Number(state.answer);
  const correct = given === state.question.answer;
  const correctAnswer = state.question.answer;
  const playerName = state.players[state.activePlayer]?.name || state.player.name;
  state.question = null;
  state.answer = '';
  if (correct) {
    state.stats.correct = Math.min(99, Math.round((state.stats.correct * 9 + 100) / 10));
    state.canRoll = true;
    playSound('correct');
    addActivity('✓', `<strong>${escapeHtml(playerName)}</strong> benar. Dadu terbuka.`);
    setAnswerNotice(true, `Dadu terbuka untuk ${playerName}.`);
  } else {
    state.canRoll = false;
    playSound('wrong');
    addActivity('↺', `<strong>${escapeHtml(playerName)}</strong> salah. Lemparan direbut lawan.`);
    setAnswerNotice(false, `Jawaban ${correctAnswer}. Dadu direbut lawan.`);
    if (state.mode === 'ai') {
      resetDiceDisplay();
      state.activePlayer = 1;
      state.canRoll = true;
      render();
      window.setTimeout(() => rollDice(true), 700);
      return;
    }
    state.activePlayer = state.mode === 'battle' ? nextAlivePlayer(state.activePlayer) : state.activePlayer === 0 ? 1 : 0;
    state.canRoll = true;
    if (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex) window.setTimeout(() => rollDice(true), 650);
  }
  persist();
  if (state.mode === 'online') syncOnlineGame();
  render();
}

function updateMoveHud() {
  const dice = document.getElementById('dice-number');
  const label = document.getElementById('dice-label');
  const center = document.getElementById('center-roll-value');
  const progress = document.getElementById('center-roll-progress');
  const rolling = state.rolling;
  if (dice) dice.textContent = state.hasRolled ? (state.lastRoll || '—') : '—';
  if (label) label.textContent = state.moving ? `PINDAH ${state.moveStep}/${state.lastRoll}` : state.hasRolled ? `DADU ${state.lastRoll}` : 'DADU —';
  if (center) center.textContent = state.hasRolled ? (state.lastRoll || '—') : '—';
  updateDiceFace('center-die-a', rolling ? '?' : state.hasRolled ? (state.lastDice?.[0] ?? '—') : '—', rolling);
  updateDiceFace('center-die-b', rolling ? '?' : state.hasRolled ? (state.lastDice?.[1] ?? '—') : '—', rolling);
  updateDiceFace('side-die', rolling ? '?' : state.hasRolled ? (state.lastRoll ?? '—') : '—', rolling);
  if (progress) progress.textContent = state.moving ? `${state.moveStep}/${state.lastRoll}` : '';
}

function moveTokenInDom(playerIndex, position) {
  cleanupDuplicateTokens();
  const token = document.querySelector(`.token[data-player-index="${playerIndex}"]`);
  const cell = document.querySelector(`.board-cell[data-tile-index="${position}"]`);
  if (!token || !cell) return;
  cell.appendChild(token);
  token.classList.remove('step-hop');
  void token.offsetWidth;
  token.classList.add('step-hop');
  window.setTimeout(() => token.classList.remove('step-hop'), 240);
}

function updateMovementZoomFocus(playerIndex, activateZoom = false, startPosition = null, targetPosition = null) {
  const camera = document.getElementById('board-camera');
  const board = camera?.querySelector('.board');
  const token = camera?.querySelector(`.token[data-player-index="${playerIndex}"]`);
  if (!camera || !board || !token) return;
  const cr = camera.getBoundingClientRect();
  const br = board.getBoundingClientRect();
  if (!cr.width || !cr.height || !br.width || !br.height) return;

  if (!activateZoom) {
    camera.style.removeProperty('--movement-scale');
    camera.style.removeProperty('--movement-shift-x');
    camera.style.removeProperty('--movement-shift-y');
    camera.style.setProperty('--movement-origin', '0 0');
    return;
  }

  const startCell = startPosition == null ? token.closest('.board-cell') : camera.querySelector(`.board-cell[data-tile-index="${startPosition}"]`);
  const targetCell = targetPosition == null ? startCell : camera.querySelector(`.board-cell[data-tile-index="${targetPosition}"]`);
  const sr = startCell?.getBoundingClientRect() || token.getBoundingClientRect();
  const tr = targetCell?.getBoundingClientRect() || sr;
  const boardOffsetX = br.left - cr.left;
  const boardOffsetY = br.top - cr.top;
  const point = (r) => ({ x:r.left + r.width/2 - br.left, y:r.top + r.height/2 - br.top });
  const start = point(sr);
  const target = point(tr);
  const tokenRect = token.getBoundingClientRect();
  const safeX = Math.max(16, tokenRect.width * .48);
  const safeY = Math.max(22, tokenRect.height * .58);
  const requestedScale = 1.35;
  const spanX = Math.abs(target.x - start.x);
  const spanY = Math.abs(target.y - start.y);
  let scale = requestedScale;
  if (spanX > 1) scale = Math.min(scale, (cr.width - safeX * 2) / spanX);
  if (spanY > 1) scale = Math.min(scale, (cr.height - safeY * 2) / spanY);
  scale = Math.max(1, Math.min(requestedScale, scale));

  // Keep BOTH endpoint centers inside the camera's safe rectangle. The board is
  // translated toward the center, never beyond the camera edge. This also protects
  // the oversized character on the top row from the header boundary.
  const desiredX = cr.width/2 - (boardOffsetX + ((start.x + target.x)/2) * scale);
  const desiredY = cr.height/2 - (boardOffsetY + ((start.y + target.y)/2) * scale);
  const minCenterX = safeX;
  const maxCenterX = cr.width - safeX;
  const minCenterY = safeY;
  const maxCenterY = cr.height - safeY;
  const endpointMinX = Math.min(start.x, target.x) * scale;
  const endpointMaxX = Math.max(start.x, target.x) * scale;
  const endpointMinY = Math.min(start.y, target.y) * scale;
  const endpointMaxY = Math.max(start.y, target.y) * scale;
  let shiftX = desiredX;
  let shiftY = desiredY;
  shiftX = Math.max(maxCenterX - (boardOffsetX + endpointMaxX), Math.min(minCenterX - (boardOffsetX + endpointMinX), shiftX));
  shiftY = Math.max(maxCenterY - (boardOffsetY + endpointMaxY), Math.min(minCenterY - (boardOffsetY + endpointMinY), shiftY));

  // Keep the whole board inside the camera when possible. If the board is smaller
  // than the viewport, center it rather than allowing an artificial drift.
  const scaledW = br.width * scale;
  const scaledH = br.height * scale;
  const boardMinX = cr.width - (boardOffsetX + scaledW);
  const boardMaxX = -boardOffsetX;
  const boardMinY = cr.height - (boardOffsetY + scaledH);
  const boardMaxY = -boardOffsetY;
  if (scaledW >= cr.width) shiftX = Math.max(boardMinX, Math.min(boardMaxX, shiftX));
  else shiftX = (cr.width - scaledW)/2 - boardOffsetX;
  if (scaledH >= cr.height) shiftY = Math.max(boardMinY, Math.min(boardMaxY, shiftY));
  else shiftY = (cr.height - scaledH)/2 - boardOffsetY;

  // Re-apply endpoint safety after board-edge clamping; if 1.35x cannot satisfy
  // both constraints, the scale above has already reduced it as far as possible.
  const startScreen = { x:boardOffsetX + start.x*scale + shiftX, y:boardOffsetY + start.y*scale + shiftY };
  const targetScreen = { x:boardOffsetX + target.x*scale + shiftX, y:boardOffsetY + target.y*scale + shiftY };
  const correctionX = Math.max(minCenterX - Math.min(startScreen.x,targetScreen.x), Math.min(0, maxCenterX - Math.max(startScreen.x,targetScreen.x)));
  const correctionY = Math.max(minCenterY - Math.min(startScreen.y,targetScreen.y), Math.min(0, maxCenterY - Math.max(startScreen.y,targetScreen.y)));
  shiftX += correctionX;
  shiftY += correctionY;

  camera.style.setProperty('--movement-scale', scale.toFixed(4));
  camera.style.setProperty('--movement-shift-x', `${shiftX.toFixed(2)}px`);
  camera.style.setProperty('--movement-shift-y', `${shiftY.toFixed(2)}px`);
  camera.style.setProperty('--movement-origin', '0 0');
  camera.classList.add('movement-zoom');
}

function stopMovementZoom() {
  const camera = document.getElementById('board-camera');
  if (!camera) return;
  camera.classList.remove('movement-zoom');
  camera.style.removeProperty('--movement-origin');
  camera.style.removeProperty('--movement-scale');
  camera.style.removeProperty('--movement-shift-x');
  camera.style.removeProperty('--movement-shift-y');
}

function animateTokenMovement(playerIndex, path, onComplete, onPassStart = null, playerStartPosition = null) {
  let step = 0;
  if (playerStartPosition == null) playerStartPosition = state.players[playerIndex]?.position ?? path[0];
  state.moving = true;
  // Tahap 1: kamera melihat pion yang akan bergerak dalam kondisi normal.
  updateMovementZoomFocus(playerIndex, false, playerStartPosition, path[path.length - 1]);
  updateMoveHud();

  // Tahap 2: beri jeda kecil, lalu zoom ke 1.35x sebelum pion bergerak.
  window.setTimeout(() => {
    if (state.screen !== 'game' || !state.players[playerIndex]) return;
    updateMovementZoomFocus(playerIndex, true, playerStartPosition, path[path.length - 1]);
    window.setTimeout(() => advance(0), 620);
  }, 300);

  const advance = (nextStep = step) => {
    step = nextStep;
    if (state.screen !== 'game' || !state.players[playerIndex]) return;
    const position = path[step];
    state.players[playerIndex].position = position;
    state.moveStep = step + 1;
    moveTokenInDom(playerIndex, position);
    // Kamera tetap terkunci pada fokus awal selama perjalanan agar layar tidak patah-patah.
    updateMoveHud();
    if (position === 0 && step < path.length - 1) {
      const resume = () => {
        window.setTimeout(() => advance(step + 1), 520);
      };
      if (onPassStart) {
        onPassStart(resume);
      } else {
        resume();
      }
      return;
    }
    if (step < path.length - 1) {
      step += 1;
      window.setTimeout(advance, 470);
    } else {
      // Tahap 3: pion sudah sampai. Beri jeda agar tujuan terlihat jelas.
      window.setTimeout(() => {
        stopMovementZoom();
        // Tahap 4: zoom kembali normal secara halus, baru resolve petak tujuan.
        window.setTimeout(() => {
          state.moving = false;
          onComplete?.();
        }, 720);
      }, 520);
    }
  };
}

const JAIL_INDEX = 10;
const JAIL_FINE = 50;

function isDoubleRoll(dieA, dieB) {
  return state.diceCount === 2 && dieA === dieB;
}

function movePlayerImmediately(playerIndex, position) {
  const player = state.players[playerIndex];
  if (!player) return;
  player.position = position;
  moveTokenInDom(playerIndex, position);
  focusActiveToken();
}

function sendPlayerToJail(playerIndex) {
  const player = state.players[playerIndex];
  if (!player) return;
  player.inJail = true;
  player.jailAttempts = 0;
  movePlayerImmediately(playerIndex, JAIL_INDEX);
  addActivity('⛓', `<strong>${escapeHtml(player.name)}</strong> langsung dipindahkan ke PRISON.`);
}

function leaveJailFree(playerIndex, reason = 'Dadu kembar') {
  const player = state.players[playerIndex];
  if (!player) return;
  player.inJail = false;
  player.jailAttempts = 0;
  addActivity('🔓', `<strong>${escapeHtml(player.name)}</strong> keluar dari PRISON gratis karena ${reason}.`);
}

function payJailFine(playerIndex, immediate = false) {
  const player = state.players[playerIndex];
  if (!player || !player.inJail) return false;
  if (player.cash < JAIL_FINE) {
    showToast(`Uang tidak cukup untuk membayar denda ${formatCurrency(JAIL_FINE)}.`, 'bad');
    return false;
  }
  player.cash -= JAIL_FINE;
  bankDeposit(JAIL_FINE);
  player.inJail = false;
  player.jailAttempts = 0;
  addActivity('⛓', `<strong>${escapeHtml(player.name)}</strong> membayar denda PRISON ${formatCurrency(JAIL_FINE)}${immediate ? ' dan keluar sekarang' : ''}.`);
  return true;
}

function finishJailAttempt() {
  const player = state.players[state.activePlayer];
  if (!player?.inJail) return false;
  player.jailAttempts = (player.jailAttempts || 0) + 1;
  if (player.jailAttempts >= 3) {
    if (!payJailFine(state.activePlayer)) {
      player.eliminated = true;
      state.modal = null;
      finishTurn();
      return true;
    }
    showTurnEnd(state.tiles[JAIL_INDEX], `Percobaan ke-3 gagal. Denda ${formatCurrency(JAIL_FINE)} wajib dibayar.`);
    return true;
  }
  showTurnEnd(state.tiles[JAIL_INDEX], `Tidak kembar. Percobaan penjara ${player.jailAttempts}/3 selesai.`);
  return true;
}

function rollDice(isAi = false, skill = null) {
  if (!state.canRoll || state.rolling || state.moving) return;
  if (state.mode === 'ai' && state.activePlayer === 1 && !isAi) return;
  if (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex && !isAi) return;
  if (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex) return;
  state.rolling = true;
  state.canRoll = false;
  playSound('roll');
  render();
  window.setTimeout(() => {
    const skillResult = isAi || skill === null ? null : rollPairFromSkill(skill);
    const dieA = skillResult ? skillResult.a : randomInt(1, 6);
    const dieB = state.diceCount === 2 ? (skillResult ? skillResult.b : randomInt(1, 6)) : 0;
    const roll = dieA + dieB;
    state.lastDice = [dieA, dieB];
    state.lastRoll = roll;
    state.hasRolled = true;
    state.rolling = false;
    state.moving = false;
    state.moveStep = 0;
    const playerIndex = state.activePlayer;
    const player = state.players[playerIndex];
    const doubled = isDoubleRoll(dieA, dieB);

    // Aturan PRISON: dadu kembar membebaskan pemain tanpa denda.
    if (player.inJail) {
      if (doubled) {
        leaveJailFree(playerIndex, 'dadu kembar');
      } else {
        finishJailAttempt();
        if (state.mode === 'ai' || (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex)) {
          state.modal = null;
          render();
          window.setTimeout(() => finishTurn(), 650);
        } else {
          render();
        }
        return;
      }
    }

    const oldPosition = player.position;
    const path = Array.from({ length: roll }, (_, step) => (oldPosition + step + 1) % state.tiles.length);
    const newPosition = path[path.length - 1];
    // Beri jeda agar angka dadu terlihat dulu sebelum pion mulai berjalan.
    render();
    window.setTimeout(() => {
      animateTokenMovement(playerIndex, path, () => {
        addActivity('◈', `<strong>${escapeHtml(player.name)}</strong> melempar ${roll} dan tiba di <strong>${escapeHtml(state.tiles[newPosition].name)}</strong>.`);
        resolveLanding(newPosition);
        if (doubled && !player.inJail) {
          state.canRoll = true;
          addActivity('🎲', `<strong>${escapeHtml(player.name)}</strong> mendapat DADU KEMBAR dan berhak melempar lagi.`);
          showToast('Dadu kembar! Kamu mendapat lemparan tambahan.', 'good');
        }
        if (state.mode === 'online') syncOnlineGame();
        render();
      }, (resume) => {
        // START hanya memberi bonus dan jeda singkat. Tidak ada lagi modal membangun
        // yang menutupi perjalanan; pembangunan dilakukan dengan klik petak milik sendiri.
        player.cash += 200;
        bankWithdraw(200);
        addActivity('✦', `<strong>${escapeHtml(player.name)}</strong> melewati START dan mendapat bonus ${formatCurrency(200)}.`);
        if (state.mode === 'ai' && playerIndex === 1) aiDecideBuildAtStart();
        else if (state.mode === 'battle' && playerIndex !== state.localPlayerIndex) aiDecideBuildAtStart();
        render();
        window.setTimeout(resume, 700);
      }, oldPosition);
    }, 700);
  }, 850);
}

function maxBankLoan(playerIndex) {
  const player = state.players[playerIndex];
  return Math.max(0, playerAssetsValue(playerIndex) - Number(player?.debt || 0));
}

function requestEmergencyFunds(amount, type, ownerIndex = null) {
  const player = state.players[state.activePlayer];
  const need = Math.max(0, amount - player.cash);
  state.pendingPayment = { amount, type, ownerIndex, reason: type === 'rent' ? 'Bayar rent' : 'Bayar pajak' };
  if (state.activePlayer !== state.localPlayerIndex && state.mode !== 'local') {
    const loan = Math.min(need, maxBankLoan(state.activePlayer));
    if (loan > 0) {
      player.cash += loan;
      player.debt = (player.debt || 0) + loan;
      bankWithdraw(loan);
    }
    if (player.cash < amount) {
      const owned = state.tiles.map((tile, index) => ({ tile, index })).filter(({ tile }) => tile.owner === state.activePlayer);
      for (const item of owned) {
        if (player.cash >= amount) break;
        const payout = Math.floor(item.tile.price * .6) + (item.tile.houses || 0) * houseCost(item.tile) * .5 + (item.tile.hotel ? houseCost(item.tile) : 0);
        player.cash += payout;
        bankWithdraw(payout);
        item.tile.owner = null;
        item.tile.houses = 0;
        item.tile.hotel = false;
        refreshBoardCellDom(item.index);
      }
    }
    if (player.cash >= amount) completePendingPayment();
    else { player.cash = 0; player.eliminated = true; state.pendingPayment = null; addActivity('💥', `<strong>${escapeHtml(player.name)}</strong> tidak mampu membayar dan bangkrut.`); finishTurn(); }
    return;
  }
  state.modal = { type: 'emergency', amount, paymentType: type, ownerIndex, reason: type === 'rent' ? 'Bayar rent' : 'Bayar pajak' };
  render();
}

function completePendingPayment() {
  const pending = state.pendingPayment;
  const player = state.players[state.activePlayer];
  if (!pending || !player) return;
  if (player.cash < pending.amount) {
    state.modal = { type: 'emergency', amount: pending.amount, paymentType: pending.type, ownerIndex: pending.ownerIndex, reason: pending.type === 'rent' ? 'Bayar rent' : 'Bayar pajak' };
    render();
    return;
  }
  player.cash -= pending.amount;
  if (pending.type === 'rent' && state.players[pending.ownerIndex]) {
    state.players[pending.ownerIndex].cash += pending.amount;
    moneyFX(pending.amount, 'rent');
  } else {
    bankDeposit(pending.amount);
  }
  addActivity(pending.type === 'rent' ? '◆' : '◌', `<strong>${escapeHtml(player.name)}</strong> membayar ${pending.type === 'rent' ? 'rent' : 'pajak'} ${formatCurrency(pending.amount)}.`);
  state.pendingPayment = null;
  const paymentMessage = pending.type === 'rent' ? `Sewa ${formatCurrency(pending.amount)} dibayar kepada ${state.players[pending.ownerIndex]?.name || 'pemilik'}.` : `Pajak ${formatCurrency(pending.amount)} dibayar ke bank.`;
  showTurnEnd(state.tiles[player.position], paymentMessage);
  render();
}

function emergencySellProperty(tileIndex) {
  const tile = state.tiles[tileIndex];
  const player = state.players[state.activePlayer];
  if (!tile || tile.owner !== state.activePlayer || !player) return;
  const payout = Math.floor(tile.price * .6) + (tile.houses || 0) * houseCost(tile) * .5 + (tile.hotel ? houseCost(tile) : 0);
  player.cash += payout;
  bankWithdraw(payout);
  tile.owner = null;
  tile.houses = 0;
  tile.hotel = false;
  refreshBoardCellDom(tileIndex);
  addActivity('↗', `<strong>${escapeHtml(player.name)}</strong> menjual ${escapeHtml(tile.name)} ke bank.`);
  if (state.pendingPayment && player.cash >= state.pendingPayment.amount) completePendingPayment();
  else { state.modal = { type: 'emergency', amount: state.pendingPayment?.amount || 0, paymentType: state.pendingPayment?.type || 'rent', ownerIndex: state.pendingPayment?.ownerIndex ?? null, reason: state.pendingPayment?.type === 'tax' ? 'Bayar pajak' : 'Bayar rent' }; render(); }
}

function borrowFromBank(amount) {
  const player = state.players[state.activePlayer];
  const requested = Math.max(0, Number(amount) || 0);
  const allowed = Math.min(requested, maxBankLoan(state.activePlayer));
  if (!player || allowed <= 0) {
    showToast('Pinjaman melebihi nilai properti.', 'bad');
    return;
  }
  player.cash += allowed;
  player.debt = (player.debt || 0) + allowed;
  bankWithdraw(allowed);
  addActivity('🏦', `<strong>${escapeHtml(player.name)}</strong> meminjam ${formatCurrency(allowed)} dari bank.`);
  completePendingPayment();
}

function declareBankruptcy() {
  const player = state.players[state.activePlayer];
  if (player) { player.cash = 0; player.eliminated = true; }
  state.pendingPayment = null;
  state.modal = null;
  addActivity('OUT', `<strong>${escapeHtml(player?.name || 'Pemain')}</strong> bangkrut.`);
  finishTurn();
}

function showTurnEnd(tile, message) {
  state.modal = { type: 'turn-end', tile, message };
}

function propertyGroup(tile) {
  return tile?.type === 'property' ? state.tiles.filter((candidate) => candidate.type === 'property' && candidate.group === tile.group) : [];
}

// R7: ketika pemain mendarat di properti miliknya yang sudah melengkapi satu grup,
// tampilkan seluruh grup sekaligus agar pembangunan tidak bergantung pada klik petak
// yang bisa tertutup token. Pemain tetap memilih petak rumah dari dialog grup.
function groupBuildOptions(tile, playerIndex) {
  if (!tile || tile.type !== 'property' || !ownsFullGroup(tile, playerIndex)) return [];
  return propertyGroup(tile).map((candidate, index) => {
    const tileIndex = state.tiles.indexOf(candidate);
    const hotel = canBuildHotelOn(candidate, playerIndex);
    const house = canBuildHouseOn(candidate, playerIndex);
    const cost = houseCost(candidate);
    const player = state.players[playerIndex];
    return { candidate, tileIndex, hotel, house, affordable: !!player && player.cash >= (hotel ? cost * 2 : cost) };
  }).filter(item => item.house || item.hotel);
}

function canBuildHouseOn(tile, playerIndex) {
  if (!tile || tile.type !== 'property' || tile.owner !== playerIndex || tile.hotel || tile.houses >= 4) return false;
  if (!ownsFullGroup(tile, playerIndex)) return false;
  const group = propertyGroup(tile);
  const minLevel = Math.min(...group.map((candidate) => candidate.hotel ? 5 : Number(candidate.houses || 0)));
  return Number(tile.houses || 0) <= minLevel;
}

function canBuildHotelOn(tile, playerIndex) {
  if (!tile || tile.type !== 'property' || tile.owner !== playerIndex || tile.hotel || tile.houses < 4) return false;
  if (!ownsFullGroup(tile, playerIndex)) return false;
  return propertyGroup(tile).every((candidate) => candidate.hotel || Number(candidate.houses || 0) >= 4);
}

function buildAvailability(tile, playerIndex) {
  if (!tile || tile.type !== 'property' || tile.owner !== playerIndex) return { ok:false, message:'Petak ini bukan milikmu.' };
  if (!ownsFullGroup(tile, playerIndex)) return { ok:false, message:'Kuasai semua petak dalam grup warna ini terlebih dahulu.' };
  if (canBuildHotelOn(tile, playerIndex)) return { ok:true, kind:'hotel', message:'Semua petak grup sudah memiliki 4 rumah. Hotel siap dibeli.' };
  if (tile.houses >= 4) return { ok:false, message:'Lengkapi 4 rumah di semua petak grup sebelum hotel.' };
  if (!canBuildHouseOn(tile, playerIndex)) return { ok:false, message:'Bangun rumah merata: petak lain dalam grup harus memiliki jumlah rumah yang sama atau lebih.' };
  return { ok:true, kind:'house', message:`Rumah ${Number(tile.houses || 0) + 1}/4 dapat dibangun di sini.` };
}

function eligibleBuildTiles(playerIndex) {
  const player = state.players[playerIndex];
  if (!player) return [];
  return state.tiles.map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => canBuildHouseOn(tile, playerIndex) && player.cash >= houseCost(tile));
}

function aiDecideBuildAtStart() {
  const playerIndex = state.activePlayer;
  const player = state.players[playerIndex];
  if (!player) return false;
  const candidates = eligibleBuildTiles(playerIndex).filter(({ tile }) => player.cash - houseCost(tile) >= 300);
  const hotelCandidates = state.tiles.map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => canBuildHotelOn(tile, playerIndex))
    .filter(({ tile }) => player.cash - houseCost(tile) * 2 >= 300000);
  if (!candidates.length && !hotelCandidates.length) return false;
  if (Math.random() > 0.82) return false;
  const pick = hotelCandidates.length ? hotelCandidates.sort((a,b) => getRent(b.tile) - getRent(a.tile))[0] : candidates.sort((a,b) => getRent(b.tile) - getRent(a.tile))[0];
  const hotel = hotelCandidates.includes(pick);
  const cost = hotel ? houseCost(pick.tile) * 2 : houseCost(pick.tile);
  player.cash -= cost;
  bankDeposit(cost);
  if (hotel) {
    pick.tile.houses = 0;
    pick.tile.hotel = true;
    addActivity('🏨', `<strong>${escapeHtml(player.name)}</strong> membangun hotel di ${escapeHtml(pick.tile.name)}.`);
  } else {
    pick.tile.houses = (pick.tile.houses || 0) + 1;
    addActivity('⌂', `<strong>${escapeHtml(player.name)}</strong> membangun rumah di ${escapeHtml(pick.tile.name)}.`);
  }
  refreshBoardCellDom(pick.index);
  return true;
}

function aiHandleLandingFinish() {
  state.modal = null;
  render();
  window.setTimeout(() => finishTurn(), 650);
}

function resolveLanding(index) {
  const tile = state.tiles[index];
  const player = state.players[state.activePlayer];
  if (tile.type === 'property' || tile.type === 'utility') {
    if (tile.owner === null || tile.owner === undefined) {
      if (state.mode === 'online') {
        if (player.cash >= tile.price) {
          player.cash -= tile.price;
          bankDeposit(tile.price);
          tile.owner = state.activePlayer;
          refreshBoardCellDom(index);
          addActivity('♛', `<strong>${escapeHtml(player.name)}</strong> otomatis membeli ${escapeHtml(tile.name)} di room online.`);
        } else {
          addActivity('♛', `<strong>${escapeHtml(player.name)}</strong> belum membeli ${escapeHtml(tile.name)} di room online.`);
        }
        state.modal = null;
        finishTurn();
        return;
      }
      if (state.mode === 'ai' && state.activePlayer === 1) {
        const affordable = player.cash >= tile.price;
        const reserve = 350;
        const groupOwned = state.tiles.filter(t => t.owner === 1 && t.group === tile.group).length;
        const smartBuy = affordable && (player.cash - tile.price >= reserve || groupOwned > 0 || tile.price <= 220);
        if (smartBuy) {
          player.cash -= tile.price;
          bankDeposit(tile.price);
          tile.owner = state.activePlayer;
          // Segarkan petak saat AI membeli agar penanda pemilik langsung terlihat.
          refreshBoardCellDom(index);
          addActivity('🤖', `<strong>${escapeHtml(player.name)}</strong> memutuskan membeli ${escapeHtml(tile.name)}.`);
          aiHandleLandingFinish();
        } else {
          addActivity('🤖', `<strong>${escapeHtml(player.name)}</strong> memilih tidak membeli ${escapeHtml(tile.name)}.`);
          aiHandleLandingFinish();
        }
        return;
      }
      if (player.cash >= tile.price) {
        state.modal = { type: 'purchase', tile, tileIndex: index, source: 'landing' };
        return;
      }
      showTurnEnd(tile, `Saldo belum cukup untuk membeli ${tile.name}.`);
      return;
    }
    if (tile.owner !== state.activePlayer) {
      const owner = state.players[tile.owner];
      const rent = getRent(tile);
      if (player.cash < rent) {
        requestEmergencyFunds(rent, 'rent', tile.owner);
        return;
      }
      player.cash -= rent;
      owner.cash += rent;
      moneyFX(rent, 'rent');
      addActivity('◆', `<strong>${escapeHtml(player.name)}</strong> membayar sewa ${formatCurrency(rent)} kepada ${escapeHtml(owner.name)}.`);
      showToast(`Membayar sewa ${formatCurrency(rent)} ke ${owner.name}.`, 'bad');
      showTurnEnd(tile, `Sewa ${formatCurrency(rent)} dibayar ke ${owner.name}.`);
    } else {
      addActivity('★', `<strong>${escapeHtml(player.name)}</strong> kembali ke properti miliknya.`);
      if (tile.type === 'property') {
        // AI mengelola asetnya sendiri; pemain tidak boleh menjadi pengambil keputusan AI.
        if (state.mode === 'ai' && state.activePlayer === 1) {
          const candidates = eligibleBuildTiles(state.activePlayer).filter(({ index: candidateIndex }) => candidateIndex === index);
          if (candidates.length && Math.random() < 0.65) {
            const cost = houseCost(tile);
            if (player.cash - cost >= 300) {
              player.cash -= cost;
              bankDeposit(cost);
              tile.houses = (tile.houses || 0) + 1;
              refreshBoardCellDom(index);
              addActivity('⌂', `<strong>${escapeHtml(player.name)}</strong> membeli rumah di ${escapeHtml(tile.name)}.`);
            }
          }
          aiHandleLandingFinish();
          return;
        }
        const isLanding = state.players[state.activePlayer]?.position === index;
        const groupOptions = isLanding ? groupBuildOptions(tile, state.activePlayer) : [];
        if (isLanding && ownsFullGroup(tile, state.activePlayer) && groupOptions.length) {
          state.modal = { type: 'manage-group', tile, tileIndex: index, source: 'landing' };
        } else {
          state.modal = { type: 'manage', tile, tileIndex: index, source: isLanding ? 'landing' : 'board' };
        }
        return;
      }
      if (state.mode === 'ai' && state.activePlayer === 1) {
        aiHandleLandingFinish();
        return;
      }
      showTurnEnd(tile, 'Kamu berada di tempat milikmu.');
    }
  } else if (tile.type === 'tax') {
    const tax = tile.price || 80;
    if (player.cash < tax) {
      requestEmergencyFunds(tax, 'tax');
      return;
    }
    player.cash -= tax;
    bankDeposit(tax);
    addActivity('◌', `<strong>${escapeHtml(player.name)}</strong> membayar pajak ${formatCurrency(tax)}.`);
    showTurnEnd(tile, `Pajak ${formatCurrency(tax)} masuk ke bank.`);
  } else if (tile.type === 'chance') {
    state.modal = { type: 'chance', card: randomChanceCard() };
    if (state.mode === 'ai' && state.activePlayer === 1) {
      render();
      window.setTimeout(() => resolveChanceCard(), 700);
      return;
    }
  } else if (tile.name === 'GO TO PRISON') {
    sendPlayerToJail(state.activePlayer);
    showTurnEnd(state.tiles[JAIL_INDEX], 'Pion langsung dipindahkan ke PRISON. Percobaan keluar dimulai pada giliran berikutnya.');
  } else {
    const specialMessage = tile.name === 'FREE PARKING' || tile.name === 'FREE ZONE' ? `${tile.name} adalah petak aman dan tidak bisa dibeli.` : `Berhenti di ${tile.name}.`;
    showTurnEnd(tile, specialMessage);
  }
}

function finishTurnSoon() {
  window.setTimeout(() => {
    if (!state.modal) finishTurn();
  }, 800);
}

function finishTurn() {
  // Lemparan tambahan karena dadu kembar tidak mengganti pemain.
  if (state.canRoll && state.lastDice && isDoubleRoll(state.lastDice[0], state.lastDice[1]) && !state.players[state.activePlayer]?.inJail) {
    state.modal = null;
    state.question = null;
    state.answer = '';
    askQuestion();
    render();
    return;
  }
  state.turnCount += 1;
  resetDiceDisplay();
  if (state.mode === 'battle') {
    markEliminatedPlayers();
    const alive = state.players.filter((player) => !player.eliminated);
    if (alive.length <= 1) {
      finishGame();
      return;
    }
    state.activePlayer = nextAlivePlayer(state.activePlayer);
    state.canRoll = false;
    state.question = null;
    state.answer = '';
    if (state.activePlayer === state.localPlayerIndex) askQuestion();
    else startAITurn();
    render();
    return;
  }
  markEliminatedPlayers();
  if (state.players.some((player) => player.eliminated)) {
    finishGame();
    return;
  }
  state.activePlayer = state.activePlayer === 0 ? 1 : 0;
  state.canRoll = false;
  state.question = null;
  state.answer = '';
  if (state.mode === 'online') {
    askQuestion();
    syncOnlineGame();
    render();
    return;
  }
  if (state.mode === 'ai' && state.activePlayer === 1) startAITurn();
  else askQuestion();
  render();
}

function finishGame() {
  const contenders = state.mode === 'battle' ? state.players.filter((player) => !player.eliminated) : state.players.filter((player) => !isBankrupt(player.id));
  const winnerPlayer = contenders.slice().sort((a, b) => (b.cash + playerAssetsValue(b.id)) - (a.cash + playerAssetsValue(a.id)))[0] || state.players[0];
  const winner = winnerPlayer.id;
  const points = winner === 0 ? (state.mode === 'battle' ? 450 : 240) : 75;
  const diamond = winner === 0 ? (state.mode === 'battle' ? 320 : 180) : 40;
  state.stats.games += 1;
  if (winner === 0) { state.stats.wins += 1; state.stats.points += points; state.diamond += diamond; }
  else { state.stats.points += points; state.diamond += diamond; }
  state.modal = { type: 'win', winner, winnerName: winnerPlayer.name, points, diamond, reason: state.players.find((player) => player.eliminated)?.name ? `${state.players.find((player) => player.eliminated)?.name} bangkrut.` : 'Permainan selesai.' };
  state.canRoll = false;
  state.question = null;
  persist();
  render();
  submitGameResult({ winner, points, difficulty: state.difficulty }).catch(() => {});
}

function buyProperty() {
  if (!state.modal?.tile) return;
  const tileIndex = Number.isInteger(state.modal.tileIndex) ? state.modal.tileIndex : state.tiles.indexOf(state.modal.tile);
  const tile = state.tiles[tileIndex];
  const playerIndex = state.activePlayer;
  const player = state.players[playerIndex];
  if (!tile || !player || tile.owner !== null && tile.owner !== undefined) {
    state.modal = null;
    render();
    return;
  }
  if (player.cash < tile.price) {
    showToast('Saldo belum cukup untuk properti ini.', 'bad');
    state.modal = null;
    finishTurn();
    return;
  }
  player.cash -= tile.price;
  bankDeposit(tile.price);
  tile.owner = playerIndex;
  refreshBoardCellDom(tileIndex);
  addActivity('♛', `<strong>${escapeHtml(player.name)}</strong> membeli ${escapeHtml(tile.name)}.`);
  showToast(`${tile.name} resmi menjadi milikmu.`, 'good');
  state.modal = null;
  persist();
  // Pembelian properti langsung menutup fase landing dan meneruskan giliran.
  // Tidak memakai timer tambahan agar callback lama tidak bisa memakan giliran berikutnya.
  finishTurn();
}

function randomChanceCard() {
  const cards = [
    { icon: '◆', title: 'BONUS INVESTOR', message: `Dapatkan ${formatCurrency(150)} dari bank.`, kind: 'cash', value: 150 },
    { icon: '◌', title: 'PAJAK KOTA', message: `Bayar ${formatCurrency(100)} untuk layanan kota.`, kind: 'cash', value: -100 },
    { icon: '↗', title: 'EXPRESS MOVE', message: 'Maju 3 petak.', kind: 'move', value: 3 },
    { icon: '↙', title: 'BACKTRACK', message: 'Mundur 2 petak.', kind: 'move', value: -2 },
    { icon: '✦', title: 'START BONUS', message: `Kembali ke START dan ambil ${formatCurrency(200)}.`, kind: 'start', value: 200 },
    { icon: '✈', title: 'AIRPORT PASS', message: 'Terbang langsung ke AIRPORT.', kind: 'airport', value: 0 }
  ];
  return cards[randomInt(0, cards.length - 1)];
}

function buildForwardPath(from, to) {
  const count = state.tiles.length;
  if (!count || from === to) return [];
  const distance = (to - from + count) % count;
  return Array.from({ length: distance }, (_, step) => (from + step + 1) % count);
}

function buildBackwardPath(from, to) {
  const count = state.tiles.length;
  if (!count || from === to) return [];
  const distance = (from - to + count) % count;
  return Array.from({ length: distance }, (_, step) => (from - step - 1 + count) % count);
}

function animateSpecialPath(playerIndex, path, onComplete, onPassStart = null) {
  if (!path.length) { onComplete?.(); return; }
  state.moving = true;
  state.moveStep = 0;
  const advance = (step = 0) => {
    if (state.screen !== 'game' || !state.players[playerIndex]) return;
    const position = path[step];
    state.players[playerIndex].position = position;
    state.moveStep = step + 1;
    moveTokenInDom(playerIndex, position);
    updateMoveHud();
    if (position === 0 && step < path.length - 1) {
      onPassStart?.();
      window.setTimeout(() => advance(step + 1), 800);
      return;
    }
    if (step < path.length - 1) {
      window.setTimeout(() => advance(step + 1), 260);
    } else {
      state.moving = false;
      onComplete?.();
    }
  };
  advance();
}

function resolveChanceLanding(player, targetIndex, cardTitle) {
  state.moveStep = 0;
  resolveLanding(targetIndex);
  if (!state.modal) showTurnEnd(state.tiles[targetIndex], `Kartu selesai: ${cardTitle}.`);
  render();
}

function resolveChanceCard() {
  if (!state.modal?.card) return;
  const card = state.modal.card;
  const player = state.players[state.activePlayer];
  state.modal = null;
  if (card.kind === 'cash') {
    if (card.value >= 0) {
      player.cash += card.value;
      bankWithdraw(card.value);
    } else {
      const paid = Math.min(player.cash, Math.abs(card.value));
      player.cash -= paid;
      bankDeposit(paid);
    }
    addActivity(card.value >= 0 ? '◆' : '◌', `<strong>${escapeHtml(player.name)}</strong> ${card.value >= 0 ? 'mendapat' : 'membayar'} ${formatCurrency(Math.abs(card.value))}.`);
    showTurnEnd(state.tiles[player.position], `Kartu selesai: ${card.title}.`);
    render();
    return;
  }

  const current = player.position;
  let path = [];
  let target = current;
  let direction = 'forward';

  if (card.kind === 'move') {
    direction = card.value >= 0 ? 'forward' : 'backward';
    const distance = Math.abs(card.value);
    target = (current + card.value + state.tiles.length) % state.tiles.length;
    path = direction === 'forward'
      ? Array.from({ length: distance }, (_, step) => (current + step + 1) % state.tiles.length)
      : Array.from({ length: distance }, (_, step) => (current - step - 1 + state.tiles.length) % state.tiles.length);
  } else if (card.kind === 'start') {
    target = 0;
    path = buildForwardPath(current, 0);
    if (!path.length) {
      player.cash += card.value;
      bankWithdraw(card.value);
      addActivity('✦', `<strong>${escapeHtml(player.name)}</strong> kembali ke START dan mendapat ${formatCurrency(card.value)}.`);
      resolveChanceLanding(player, 0, card.title);
      return;
    }
  } else if (card.kind === 'airport') {
    target = state.tiles.findIndex((tile) => tile.name === 'AIRPORT');
    if (target < 0) {
      showTurnEnd(state.tiles[current], 'AIRPORT belum tersedia.');
      render();
      return;
    }
    // Airport is always reached by moving forward around the board, never by reversing.
    path = buildForwardPath(current, target);
  }

  const crossedStart = direction === 'forward' && card.kind !== 'start' && path.some((position) => position === 0) && current !== 0;
  render();
  window.setTimeout(() => {
    animateSpecialPath(state.activePlayer, path, () => {
      if (card.kind === 'move') addActivity('↗', `<strong>${escapeHtml(player.name)}</strong> bergerak ${Math.abs(card.value)} petak secara ${card.value >= 0 ? 'maju' : 'mundur'}.`);
      if (card.kind === 'start') {
        player.cash += card.value;
        bankWithdraw(card.value);
        addActivity('✦', `<strong>${escapeHtml(player.name)}</strong> kembali ke START dan mendapat ${formatCurrency(card.value)}.`);
      }
      if (card.kind === 'airport') addActivity('✈', `<strong>${escapeHtml(player.name)}</strong> bergerak maju menuju AIRPORT.`);
      resolveChanceLanding(player, target, card.title);
    }, crossedStart ? () => {
      // Pause at START and award the bonus before continuing to the destination.
      player.cash += 200;
      bankWithdraw(200);
      addActivity('✦', `<strong>${escapeHtml(player.name)}</strong> melewati START dan mendapat bonus ${formatCurrency(200)}. Melanjutkan perjalanan...`);
      state.moveStep = 0;
      updateMoveHud();
      render();
    } : null);
  }, 250);
}

function buyHouse(tileIndex, fromLanding = false) {
  const tile = state.tiles[tileIndex];
  const player = state.players[state.activePlayer];
  if (!tile || !player || tile.owner !== state.activePlayer || tile.type !== 'property') return;
  const availability = buildAvailability(tile, state.activePlayer);
  if (!availability.ok || availability.kind !== 'house') {
    showToast(availability.message, 'bad');
    return;
  }
  const cost = houseCost(tile);
  if (player.cash < cost) {
    showToast(`Butuh ${formatCurrency(cost)} untuk rumah.`, 'bad');
    return;
  }
  player.cash -= cost;
  bankDeposit(cost);
  tile.houses = (tile.houses || 0) + 1;
  refreshBoardCellDom(tileIndex);
  addActivity('⌂', `<strong>${escapeHtml(player.name)}</strong> membangun rumah di ${escapeHtml(tile.name)}.`);
  showToast(`Rumah ${tile.houses}/4 dibangun. Sewa grup naik.`, 'good');
  state.modal = null;
  persist();
  if (fromLanding && !state.canRoll) finishTurn();
  else render();
}

function buyHotel(tileIndex, fromLanding = false) {
  const tile = state.tiles[tileIndex];
  const player = state.players[state.activePlayer];
  if (!tile || !player || tile.owner !== state.activePlayer || tile.type !== 'property') return;
  if (!canBuildHotelOn(tile, state.activePlayer)) {
    showToast('Hotel baru bisa dibeli setelah semua petak grup memiliki 4 rumah.', 'bad');
    return;
  }
  const cost = houseCost(tile) * 2;
  if (player.cash < cost) {
    showToast(`Butuh ${formatCurrency(cost)} untuk hotel.`, 'bad');
    return;
  }
  player.cash -= cost;
  bankDeposit(cost);
  tile.houses = 0;
  tile.hotel = true;
  refreshBoardCellDom(tileIndex);
  addActivity('🏨', `<strong>${escapeHtml(player.name)}</strong> membangun hotel di ${escapeHtml(tile.name)}.`);
  showToast('Hotel aktif. Sewa melonjak signifikan.', 'good');
  state.modal = null;
  persist();
  if (fromLanding && !state.canRoll) finishTurn();
  else render();
}

function openAuction() {
  if (!state.modal?.tile) return;
  const tile = state.modal.tile;
  const tileIndex = state.tiles.findIndex((candidate) => candidate.name === tile.name);
  state.modal = { type: 'auction', tile, tileIndex, bid: Math.max(50, Math.ceil(tile.price * .5)), source: 'landing' };
  render();
}

function raiseAuction() {
  if (!state.modal?.tile) return;
  const player = state.players[state.activePlayer];
  const nextBid = state.modal.bid + 50;
  if (player.cash < nextBid) {
    showToast('Saldo tidak cukup untuk tawaran ini.', 'bad');
    return;
  }
  state.modal.bid = nextBid;
  render();
}

function acceptAuction() {
  if (!state.modal?.tile) return;
  const tile = state.modal.tile;
  const source = state.modal.source;
  const player = state.players[state.activePlayer];
  const bid = state.modal.bid;
  if (player.cash < bid) {
    showToast('Saldo tidak cukup.', 'bad');
    return;
  }
  player.cash -= bid;
  bankDeposit(bid);
  const index = state.tiles.findIndex((candidate) => candidate.name === tile.name && candidate.owner === null);
  if (index >= 0) { state.tiles[index].owner = state.activePlayer; refreshBoardCellDom(index); }
  addActivity('⚖', `<strong>${escapeHtml(player.name)}</strong> memenangkan lelang ${escapeHtml(tile.name)}.`);
  state.modal = null;
  if (source === 'menu') state.screen = 'game';
  finishTurn();
}

function sellProperty(tileIndex) {
  const tile = state.tiles[tileIndex];
  const ownerIndex = tile?.owner;
  const player = state.players[ownerIndex];
  if (!tile || ownerIndex === null || ownerIndex === undefined || !player) return;
  const allowedOwner = state.screen === 'properties' ? 0 : state.activePlayer;
  if (ownerIndex !== allowedOwner || player.position !== tileIndex) {
    showToast('Pion harus berada di petak properti untuk menjualnya.', 'bad');
    return;
  }
  const payout = Math.floor(tile.price * .6) + (tile.houses || 0) * houseCost(tile) * .5 + (tile.hotel ? houseCost(tile) : 0);
  player.cash += payout;
  bankWithdraw(payout);
  tile.owner = null;
  tile.houses = 0;
  tile.hotel = false;
  refreshBoardCellDom(tileIndex);
  addActivity('↗', `<strong>${escapeHtml(player.name)}</strong> menjual ${escapeHtml(tile.name)}.`);
  state.modal = null;
  showToast(`${tile.name} berhasil dijual.`, 'good');
  render();
}

function addActivity(icon, text) {
  state.activity.unshift({ icon, text });
  state.activity = state.activity.slice(0, 8);
}

function onlinePayload() {
  return {
    players: state.players.map((player) => ({ id: player.id, name: player.name, avatar: player.avatar, position: player.position, cash: player.cash, debt: player.debt || 0, eliminated: Boolean(player.eliminated), inJail: Boolean(player.inJail), jailAttempts: Number(player.jailAttempts || 0) })),
    tiles: state.tiles,
    activePlayer: state.activePlayer,
    question: state.question ? { text: state.question.text, answer: state.question.answer } : null,
    canRoll: state.canRoll,
    lastRoll: state.lastRoll,
    lastDice: state.lastDice,
    hasRolled: state.hasRolled,
    turnCount: state.turnCount,
    activity: state.activity.slice(0, 8)
  };
}

function syncOnlineGame() {
  if (state.mode !== 'online' || !state.room?.id) return;
  updateRoomGame(state.room.id, onlinePayload()).catch(() => {});
}

function applyRemoteGame(game) {
  if (!game || state.mode !== 'online') return;
  state.players = Array.isArray(game.players) ? game.players : state.players;
  state.tiles = Array.isArray(game.tiles) ? game.tiles : state.tiles;
  state.activePlayer = Number.isInteger(game.activePlayer) ? game.activePlayer : state.activePlayer;
  state.question = game.question || null;
  state.answer = '';
  state.canRoll = Boolean(game.canRoll);
  state.lastRoll = game.lastRoll || state.lastRoll;
  state.lastDice = game.lastDice || state.lastDice;
  state.hasRolled = Boolean(game.hasRolled ?? game.lastRoll !== null);
  state.turnCount = game.turnCount || state.turnCount;
  state.activity = Array.isArray(game.activity) ? game.activity : state.activity;
  state.modal = null;
  state.aiThinking = false;
  const shouldAskLocalQuestion = state.activePlayer === state.localPlayerIndex && !state.canRoll && !state.question;
  if (shouldAskLocalQuestion) {
    askQuestion();
    syncOnlineGame();
  }
  render();
}

function showToast(message, tone = '') {
  const stack = $('#global-toast-stack') || $('#toast-stack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = `toast ${tone}`;
  toast.innerHTML = `<span class="toast-icon">${tone === 'good' ? '✓' : tone === 'bad' ? '!' : '✦'}</span><span>${message}</span>`;
  stack.appendChild(toast);
  window.setTimeout(() => { toast.classList.add('fade-out'); window.setTimeout(() => toast.remove(), 280); }, 3000);
}

function moneyFX(amount, direction = 'from-bank') {
  if (!amount || !document.body) return;
  const node = document.createElement('div');
  node.className = `money-float ${direction}`;
  const label = direction === 'to-bank' ? 'BANK' : direction === 'rent' ? 'RENT' : 'WALLET';
  node.innerHTML = `<span class="money-coin">◆</span><strong>${direction === 'to-bank' ? '−' : '+'}${formatCurrency(Math.abs(amount))}</strong><small>${label}</small>`;
  document.body.appendChild(node);
  window.setTimeout(() => node.remove(), 1250);
}

function bankDeposit(amount) {
  const value = Math.max(0, Number(amount) || 0);
  state.bankBalance = (state.bankBalance || 0) + value;
  moneyFX(value, 'to-bank');
}

function bankWithdraw(amount) {
  const value = Math.max(0, Number(amount) || 0);
  state.bankBalance = Math.max(0, (state.bankBalance || 0) - value);
  moneyFX(value, 'from-bank');
}

function renderBankPanel() {
  return `<section id="bank-panel" class="bank-panel panel"><div class="bank-icon">🏦</div><div class="bank-copy"><strong>BANK</strong><small>Cadangan bank</small></div><div class="bank-balance">${formatCurrency(state.bankBalance || 0)}</div></section>`;
}

async function claimReward() {
  if (state.dailyClaimed) {
    showToast('Hadiah harian sudah diklaim hari ini.', 'bad');
    return;
  }
  const result = await claimDailyReward();
  if (result?.ok === false) {
    showToast(result.message || 'Hadiah belum bisa diambil.', 'bad');
    return;
  }
  if (result?.ok !== false) {
    const reward = result?.diamond || 100;
    state.diamond += reward;
    state.dailyClaimed = true;
    persist();
    showToast(`Daily reward masuk: ◆ ${reward} diamond.`, 'good');
    render();
  }
}

async function handleShopItem(type, id) {
  const items = SHOP_DATA[type];
  const index = items.findIndex((item) => item.id === id);
  const item = items[index];
  if (!item) return;
  if (isItemOwned(type, item)) {
    state.selectedThemes[type] = item.id;
    persist();
    showToast(`${item.name} dipakai di arena.`, 'good');
    render();
    return;
  }
  if (!isItemAvailable(type, index)) {
    const next = items.slice(0, index).find((candidate) => !isItemOwned(type, candidate));
    showToast(`Pembelian wajib berurutan. Buka ${next?.name || 'tema sebelumnya'} terlebih dahulu.`, 'bad');
    return;
  }
  if (state.diamond < item.cost) {
    showToast(`Diamond tidak cukup. Kamu butuh ◆ ${formatNumber(item.cost - state.diamond)} lagi.`, 'bad');
    return;
  }
  const result = await purchaseTheme({ type, itemId: item.id, cost: item.cost });
  if (result?.ok === false) {
    showToast(result.message || 'Pembelian ditolak oleh server.', 'bad');
    return;
  }
  state.diamond = result.diamond ?? state.diamond - item.cost;
  state.inventory[type].push(item.id);
  state.selectedThemes[type] = item.id;
  persist();
  showToast(`${item.name} terbuka dan langsung dipakai.`, 'good');
  render();
}

function makeRoomCode() {
  return Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randomInt(0, 31)]).join('');
}

async function createOnlineRoom() {
  const room = await createRoom({ name: state.player.name, avatar: state.player.avatar, difficulty: state.difficulty });
  if (room?.ok === false) {
    showToast(room.message || 'Room gagal dibuat.', 'bad');
    return;
  }
  state.room = { ...room, role: 'host', host: { name: state.player.name, avatar: state.player.avatar }, opponent: null };
  state.localPlayerIndex = 0;
  state.onlineStatus = 'waiting';
  render();
  if (room.id && cloudStatus.configured) {
    roomUnsubscribe?.();
    roomUnsubscribe = watchRoom(room.id, (data) => {
      if (!data) return;
      state.room = { ...state.room, ...data };
      if (data.game && data.status === 'playing') {
        state.mode = 'online';
        state.localPlayerIndex = 0;
        state.screen = 'game';
        applyRemoteGame(data.game);
      } else render();
    });
  }
  showToast(`Room ${state.room.code} berhasil dibuat.`, 'good');
}

async function joinOnlineRoom() {
  const input = $('#room-input');
  const code = input?.value.trim().toUpperCase();
  if (!code || code.length < 4) {
    showToast('Masukkan kode room yang valid.', 'bad');
    return;
  }
  const room = await joinRoom({ code, name: state.player.name, avatar: state.player.avatar });
  if (room?.ok === false) {
    showToast(room.message || 'Room tidak ditemukan.', 'bad');
    return;
  }
  state.room = { ...room, code, role: 'guest', host: room.host || room.opponent || { name: 'Host', avatar: '♛' }, opponent: { name: state.player.name, avatar: state.player.avatar } };
  state.localPlayerIndex = 1;
  state.onlineStatus = 'joined';
  render();
  if (room.id && cloudStatus.configured) {
    roomUnsubscribe?.();
    roomUnsubscribe = watchRoom(room.id, (data) => {
      if (!data) return;
      state.room = { ...state.room, ...data, role: 'guest', opponent: { name: state.player.name, avatar: state.player.avatar } };
      if (data.game && data.status === 'playing') {
        state.mode = 'online';
        state.localPlayerIndex = 1;
        state.screen = 'game';
        applyRemoteGame(data.game);
      } else render();
    });
  }
  showToast('Berhasil bergabung. Tunggu host memulai match.', 'good');
}

async function startOnlineMatch() {
  if (!state.room) return;
  if (state.room.role !== 'host') {
    showToast('Hanya host yang memulai match.', 'bad');
    return;
  }
  if (!state.room.opponent) {
    showToast('Tunggu lawan bergabung terlebih dahulu.', 'bad');
    return;
  }
  state.mode = 'online';
  state.localPlayerIndex = 0;
  resetGame();
  state.screen = 'game';
  askQuestion();
  render();
  const result = await startRoom(state.room.id, onlinePayload());
  if (result?.ok === false) {
    showToast(result.message || 'Match gagal dimulai.', 'bad');
    return;
  }
  syncOnlineGame();
  showToast('Match online dimulai. Jawab soal untuk membuka dadu.', 'good');
}

async function installApp() {
  if (!deferredInstallPrompt) {
    showToast('Gunakan menu browser “Tambahkan ke layar utama”.', '');
    return;
  }
  deferredInstallPrompt.prompt();
  try { await deferredInstallPrompt.userChoice; } catch {}
  deferredInstallPrompt = null;
  render();
}

function focusActiveToken() {
  if (state.screen !== 'game' || !window.matchMedia?.('(max-width: 900px)').matches) return;
  const camera = document.getElementById('board-camera');
  const token = camera?.querySelector(`.token[data-player-index="${state.activePlayer}"]`);
  if (!camera || !token) return;
  const cameraRect = camera.getBoundingClientRect();
  const tokenRect = token.getBoundingClientRect();
  const targetLeft = camera.scrollLeft + tokenRect.left - cameraRect.left - (cameraRect.width - tokenRect.width) / 2;
  const targetTop = camera.scrollTop + tokenRect.top - cameraRect.top - (cameraRect.height - tokenRect.height) / 2;
  camera.scrollTo({ left: Math.max(0, Math.min(targetLeft, camera.scrollWidth - camera.clientWidth)), top: Math.max(0, Math.min(targetTop, camera.scrollHeight - camera.clientHeight)), behavior: 'smooth' });
}

function cleanupDuplicateTokens() {
  const seen = new Set();
  document.querySelectorAll('.board-camera .token[data-player-index]').forEach((token) => {
    const index = token.dataset.playerIndex;
    if (seen.has(index)) token.remove();
    else seen.add(index);
  });
}

function refreshBoardCellDom(index) {
  cleanupDuplicateTokens();
  const oldCell = document.querySelector(`.board-cell[data-tile-index="${index}"]`);
  const tile = state.tiles[index];
  if (!oldCell || !tile) return;
  const tokens = Array.from(oldCell.querySelectorAll('.token'));
  oldCell.outerHTML = renderBoardCell(tile, index);
  const newCell = document.querySelector(`.board-cell[data-tile-index="${index}"]`);
  tokens.forEach((token) => newCell?.appendChild(token));
}

function updateGameInPlace() {
  const screen = document.querySelector('.game-screen');
  cleanupDuplicateTokens();
  if (!screen) return false;
  const active = state.players[state.activePlayer] || { name: state.player.name, avatar: state.player.avatar };
  const status = state.moving ? 'BERJALAN' : state.canRoll ? 'SIAP LEMPAR' : state.aiThinking ? 'BERPIKIR' : 'JAWAB SOAL';
  const header = screen.querySelector('.game-header');
  if (header) header.outerHTML = renderGameHeader(active, status, playerColor(state.activePlayer));
  const needsQuestion = Boolean(state.question || state.aiThinking);
  const questionLayer = screen.querySelector('.nm-question-layer');
  if (needsQuestion && questionLayer) questionLayer.outerHTML = renderQuestionOverlay();
  else if (needsQuestion && !questionLayer) screen.insertAdjacentHTML('beforeend', renderQuestionOverlay());
  else if (!needsQuestion && questionLayer) questionLayer.remove();
  const notice = screen.querySelector('.answer-notice');
  if (state.answerNotice && notice) notice.outerHTML = renderAnswerNotice();
  else if (state.answerNotice && !notice) screen.insertAdjacentHTML('afterbegin', renderAnswerNotice());
  else if (!state.answerNotice && notice) notice.remove();
  updateMoveHud();
  const rollLocked = !state.canRoll || state.rolling || state.moving || state.aiThinking || (state.mode === 'ai' && state.activePlayer === 1) || (state.mode === 'battle' && state.activePlayer !== state.localPlayerIndex) || (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex);
  const rollLabel = state.rolling ? 'MENGGELINDING…' : state.moving ? 'BERJALAN…' : 'LEMPAR';
  const rollButton = screen.querySelector('.nm-hud-roll');
  if (rollButton) { rollButton.disabled = rollLocked; rollButton.textContent = rollLabel; }
  const modal = document.querySelector('.modal-layer');
  if (state.modal && modal) modal.outerHTML = renderModal();
  else if (state.modal && !modal) app.insertAdjacentHTML('beforeend', renderModal());
  else if (!state.modal && modal) modal.remove();
  return true;
}

function render() {
  const inGame = Boolean(state.session && state.screen === 'game');
  document.body.classList.toggle('is-game-screen', inGame);
  document.body.classList.toggle('game-menu-open', Boolean(state.gameMenuOpen && inGame));
  if (inGame && !state.forceFullRender && updateGameInPlace()) {
    updateMusic();
    window.requestAnimationFrame?.(() => focusActiveToken());
    return;
  }
  app.innerHTML = state.session ? renderShell() : renderLogin();
  state.forceFullRender = false;
  state.boardDirty = false;
  document.getElementById('boot-fallback')?.remove();
  updateMusic();
  renderOrientationLock();
  window.requestAnimationFrame?.(() => focusActiveToken());
}

function navigate(screen) {
  if (screen === 'game' && state.players.length && state.players.some(player => player.eliminated)) {
    startGame(state.mode);
    return;
  }
  state.screen = screen;
  if (screen !== 'game') {
    state.gameMenuOpen = false;
    clearQuestionTimer();
    state.question = null;
    state.aiThinking = false;
    state.modal = null;
  } else if (state.players.length && !state.question && !state.canRoll && !state.rolling && !state.moving) {
    askQuestion();
  }
  render();
}

function handleClick(event) {
  if (state.orientationLocked) return;
  const boardCell = event.target.closest('.board-cell[data-tile-index]');
  if (boardCell && !event.target.closest('.token') && !event.target.closest('[data-action]')) {
    const index = Number(boardCell.dataset.tileIndex);
    const tile = state.tiles[index] || TILE_BLUEPRINT[index];
    if (tile) {
      if (state.screen === 'game' && tile.type === 'property' && tile.owner === state.activePlayer && state.activePlayer === state.localPlayerIndex) {
        state.modal = { type: 'manage', tile, tileIndex: index, source: state.players[state.activePlayer]?.position === index ? 'landing' : 'board' };
      } else {
        state.modal = { type: 'tile-info', tile, tileIndex: index };
      }
      render();
    }
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (!['toggle-music', 'answer-key', 'submit-answer'].includes(action)) playSound('click');
  if (action === 'select-mode') {
    state.mode = target.dataset.mode;
    render();
  } else if (action === 'start-login') {
    const name = $('#login-name')?.value.trim() || 'Mathematician';
    state.player.name = name.slice(0, 20);
    state.session = true;
    persist();
    if (state.mode === 'online') navigate('online'); else navigate('dashboard');
  } else if (action === 'go-screen') {
    navigate(target.dataset.screen);
  } else if (action === 'toggle-game-menu') {
    state.gameMenuOpen = !state.gameMenuOpen;
    render();
  } else if (action === 'begin-game') {
    startGame(state.mode === 'online' ? 'ai' : state.mode);
  } else if (action === 'quick-start') {
    const quickMode = target.dataset.mode || 'ai';
    if (quickMode === 'online') navigate('online');
    else startGame(quickMode);
  } else if (action === 'toggle-music') {
    state.music = !state.music;
    persist();
    render();
  } else if (action === 'answer-key') {
    handleAnswerKey(target.dataset.key);
  } else if (action === 'submit-answer') {
    submitAnswer();
  } else if (action === 'roll-dice') {
    if (Date.now() < dicePressHandledUntil) { dicePressHandledUntil = 0; return; }
    rollDice(false, Number(state.diceCharge ?? .5));
  } else if (action === 'pay-jail-fine') {
    if (payJailFine(state.activePlayer, true)) {
      state.modal = null;
      showTurnEnd(state.tiles[JAIL_INDEX], `Denda ${formatCurrency(JAIL_FINE)} dibayar. Kamu keluar dari PRISON.`);
      render();
    }
  } else if (action === 'buy-house') {
    buyHouse(Number(target.dataset.tileIndex), target.dataset.fromLanding === 'true');
  } else if (action === 'buy-hotel') {
    buyHotel(Number(target.dataset.tileIndex), target.dataset.fromLanding === 'true');
  } else if (action === 'sell-property') {
    const tile = state.tiles[Number(target.dataset.tileIndex)];
    if (tile) { state.modal = { type: 'sell', tile, tileIndex: Number(target.dataset.tileIndex) }; render(); }
  } else if (action === 'confirm-sell') {
    sellProperty(Number(state.modal?.tileIndex));
  } else if (action === 'emergency-sell') {
    emergencySellProperty(Number(target.dataset.tileIndex));
  } else if (action === 'borrow-bank') {
    borrowFromBank(Number(target.dataset.loanAmount));
  } else if (action === 'declare-bankruptcy') {
    declareBankruptcy();
  } else if (action === 'auction-menu-open') {
    const auctionIndex = Number(target.dataset.tileIndex);
    const auctionTile = state.tiles[auctionIndex];
    if (!state.players.length || !auctionTile) {
      showToast('Mulai arena dulu untuk ikut lelang.', 'bad');
    } else if (auctionTile.owner !== null && auctionTile.owner !== undefined) {
      showToast('Properti ini sudah dimiliki.', 'bad');
    } else {
      state.modal = { type: 'auction', tile: auctionTile, tileIndex: auctionIndex, bid: Math.max(50, Math.ceil(auctionTile.price * .5)), source: 'menu' };
      render();
    }
  } else if (action === 'open-auction') {
    openAuction();
  } else if (action === 'auction-raise') {
    raiseAuction();
  } else if (action === 'auction-accept') {
    acceptAuction();
  } else if (action === 'auction-cancel') {
    if (state.modal?.source === 'menu') {
      state.modal = null;
      navigate('auction');
    } else {
      state.modal = { type: 'purchase', tile: state.modal?.tile };
      render();
    }
  } else if (action === 'resolve-chance') {
    resolveChanceCard();
  } else if (action === 'continue-turn') {
    state.modal = null;
    finishTurn();
  } else if (action === 'modal-buy') {
    buyProperty();
  } else if (action === 'modal-skip') {
    state.modal = null;
    finishTurn();
  } else if (action === 'modal-close') {
    const closingType = state.modal?.type;
    const closesLanding = state.modal?.source === 'landing';
    state.modal = null;
    if (closesLanding && (closingType === 'manage' || closingType === 'purchase' || closingType === 'auction')) {
      finishTurn();
    } else {
      render();
    }
  } else if (action === 'shop-tab') {
    state.shopType = target.dataset.shopType;
    render();
  } else if (action === 'shop-item') {
    handleShopItem(target.dataset.shopType, target.dataset.itemId);
  } else if (action === 'custom-slot') {
    showToast('Slot custom sudah disiapkan. Tambahkan PNG sesuai ASSETS.md untuk pengembangan berikutnya.', '');
  } else if (action === 'claim-daily') {
    claimReward();
  } else if (action === 'create-room') {
    createOnlineRoom();
  } else if (action === 'join-room') {
    joinOnlineRoom();
  } else if (action === 'copy-room') {
    navigator.clipboard?.writeText(state.room?.code || '').then(() => showToast('Kode room disalin.', 'good')).catch(() => showToast(`Kode room: ${state.room?.code || ''}`, ''));
  } else if (action === 'start-online-match') {
    startOnlineMatch();
  } else if (action === 'battle-count') {
    state.battleCount = Number(target.dataset.count) || 4;
    render();
  } else if (action === 'start-battle') {
    startBattle();
  } else if (action === 'leave-battle') {
    leaveBattle();
  } else if (action === 'logout') {
    state.session = false;
    state.screen = 'dashboard';
    state.room = null;
    persist();
    render();
  } else if (action === 'save-profile') {
    const input = $('#profile-name');
    if (input?.value.trim()) state.player.name = input.value.trim().slice(0, 20);
    persist();
    showToast('Profil berhasil disimpan.', 'good');
    render();
  } else if (action === 'install-app') {
    installApp();
  } else if (action === 'reset-progress') {
    state.modal = { type: 'reset' };
    render();
  } else if (action === 'install') {
    installApp();
  } else if (action === 'dismiss-install') {
    deferredInstallPrompt = null;
    render();
  }
}

function renderResetModal() {
  const layer = document.querySelector('.modal-layer');
  if (!layer) return;
  layer.querySelector('.modal-card').innerHTML = `<p class="eyebrow">Local demo</p><h3>Reset semua progres?</h3><p>Data lokal di perangkat ini akan dihapus. Aksi ini tidak menghapus data Firebase.</p><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-close">Batal</button><button class="btn btn-danger" data-action="confirm-reset">Reset progres</button></div>`;
}

function resetProgress() {
  const keepName = state.player.name;
  const next = freshState();
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, next);
  state.player.name = keepName;
  state.session = true;
  persist();
  showToast('Progres demo dikembalikan ke awal.', 'good');
  render();
}

function handleInput(event) {
  if (event.target.id === 'profile-name') {
    state.player.name = event.target.value.slice(0, 20);
    persist();
  }
}

function handleChange(event) {
  const setting = event.target.dataset.setting;
  if (!setting) return;
  if (setting === 'sound' || setting === 'music') state[setting] = event.target.checked;
  if (setting === 'difficulty') state.difficulty = event.target.value;
  persist();
  render();
}

function handleKeydown(event) {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.board-cell[data-tile-index]')) {
    event.preventDefault();
    const cell = event.target.closest('.board-cell[data-tile-index]');
    const index = Number(cell.dataset.tileIndex);
    const tile = state.tiles[index] || TILE_BLUEPRINT[index];
    if (tile) { state.modal = { type: 'tile-info', tile, tileIndex: index }; render(); }
    return;
  }
  if (state.orientationLocked || !state.question || state.aiThinking) return;
  if (/^\d$/.test(event.key)) { event.preventDefault(); handleAnswerKey(event.key); }
  else if (event.key === '-') { event.preventDefault(); handleAnswerKey('-'); }
  else if (event.key === 'Backspace') { event.preventDefault(); handleAnswerKey('backspace'); }
  else if (event.key === 'Enter') { event.preventDefault(); submitAnswer(); }
}

function isMobilePortrait() {
  return window.matchMedia?.('(max-width: 900px) and (orientation: portrait)').matches || false;
}

function renderOrientationLock() {
  let overlay = document.getElementById('orientation-lock');
  if (!overlay) return;
  const locked = Boolean(state.session && state.screen === 'game' && isMobilePortrait());
  overlay.classList.toggle('show', locked);
  overlay.setAttribute('aria-hidden', locked ? 'false' : 'true');
}

function updateOrientationLock() {
  const locked = Boolean(state.session && state.screen === 'game' && isMobilePortrait());
  if (locked && !state.orientationLocked) {
    state.orientationLocked = true;
    if (state.question && state.questionDeadline) {
      state.orientationRemainingMs = Math.max(0, state.questionDeadline - Date.now());
      clearQuestionTimer();
    }
  } else if (!locked && state.orientationLocked) {
    state.orientationLocked = false;
    if (state.question && state.orientationRemainingMs !== null) {
      state.questionDeadline = Date.now() + state.orientationRemainingMs;
      state.questionTimerId = window.setInterval(() => {
        if (!state.question || state.aiThinking || state.screen !== 'game' || state.orientationLocked) {
          clearQuestionTimer();
          return;
        }
        state.questionTimeLeft = Math.max(0, Math.ceil((state.questionDeadline - Date.now()) / 1000));
        updateQuestionTimerDom();
        if (state.questionTimeLeft <= 0) {
          clearQuestionTimer();
          timeoutAnswer();
        }
      }, 250);
      state.orientationRemainingMs = null;
    }
  }
  renderOrientationLock();
}

app.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('[data-action="roll-dice"]');
  if (!button || button.disabled || !canUseHumanRoll()) return;
  event.preventDefault();
  button.setPointerCapture?.(event.pointerId);
  startDiceSkill();
});
app.addEventListener('pointerup', (event) => {
  const button = event.target.closest('[data-action="roll-dice"]');
  if (!button && !state.dicePressing) return;
  event.preventDefault();
  stopDiceSkill(true);
});
app.addEventListener('pointercancel', () => stopDiceSkill(false));
app.addEventListener('pointerleave', () => {
  if (state.dicePressing) stopDiceSkill(true);
});
app.addEventListener('contextmenu', (event) => {
  if (event.target.closest('.token, .token img, .character-avatar-image, .asset-preview, .cell-art, .cell-name-outside, .board-cell, .dice-3d, .dice-cube')) {
    event.preventDefault();
  }
});
app.addEventListener('dragstart', (event) => {
  if (event.target.closest('img, .token, .dice-3d')) event.preventDefault();
});
app.addEventListener('click', handleClick);
document.addEventListener('pointerdown', tryUnlockMusic, { once: true, passive: true });
document.addEventListener('keydown', tryUnlockMusic, { once: true });
app.addEventListener('input', handleInput);
app.addEventListener('change', handleChange);
document.addEventListener('keydown', handleKeydown);
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (state.session) render();
});
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; render(); showToast('Numeric Monopoly berhasil dipasang di HP.', 'good'); });
window.addEventListener('resize', updateOrientationLock, { passive: true });
window.addEventListener('orientationchange', () => window.setTimeout(updateOrientationLock, 80), { passive: true });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=78r5').catch(() => {}));
}

function preloadTileAssets() {
  const urls = TILE_BLUEPRINT.map((tile) => versionedAsset(tile.asset)).filter(Boolean);
  let cursor = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      await new Promise((resolve) => {
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = 'high';
        image.onload = resolve;
        image.onerror = () => { console.warn('[Numeric Monopoly] Tile gagal dimuat:', url); resolve(); };
        image.src = url;
      });
    }
  });
  Promise.all(workers).catch(() => {});
}

(async function bootstrap() {
  cloudStatus = await initCloud();
  render();
  updateOrientationLock();
})();

// Needed by the reset confirmation action without adding a second modal system.
app.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'confirm-reset') resetProgress();
});
