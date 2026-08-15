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
  { name: 'ENERGI', icon: 'ϟ', type: 'utility', color: '#ffd976', price: 150, rent: 34 },
  { name: 'VELVET CITY', icon: '◈', type: 'property', color: '#ffd976', price: 240, rent: 55 },
  { name: 'SOAL BONUS', icon: '✎', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'AURORA', icon: '◈', type: 'property', color: '#ff9b78', price: 260, rent: 60 },
  { name: 'FREE ZONE', icon: '✦', type: 'corner', color: '#5be4ff', detail: 'Tarik napas, tetap fokus' },
  { name: 'CRYSTAL', icon: '◈', type: 'property', color: '#ff9b78', price: 280, rent: 65 },
  { name: 'KARTU MISTERI', icon: '✧', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'MOONLIGHT', icon: '◈', type: 'property', color: '#ff9b78', price: 300, rent: 70 },
  { name: 'GO TO PRISON', icon: '↘', type: 'corner', color: '#ff75bf', detail: 'Teleport ke Prison' },
  { name: 'NEBULA', icon: '◈', type: 'property', color: '#c28bff', price: 320, rent: 75 },
  { name: 'SOAL BONUS', icon: '✎', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'QUANTUM', icon: '◈', type: 'property', color: '#c28bff', price: 340, rent: 80 },
  { name: 'PAJAK PREMIUM', icon: '◌', type: 'tax', color: '#ff75bf', price: 110 },
  { name: 'ROYAL ARC', icon: '◈', type: 'property', color: '#c28bff', price: 360, rent: 86 },
  { name: 'HYPERLOOP', icon: 'ϟ', type: 'utility', color: '#ffd976', price: 190, rent: 42 },
  { name: 'GOLDEN HARBOR', icon: '◈', type: 'property', color: '#c28bff', price: 390, rent: 92 },
  { name: 'KARTU MISTERI', icon: '✧', type: 'chance', color: '#8b77ff', detail: 'Hadiah atau kejutan' },
  { name: 'INFINITY', icon: '◈', type: 'property', color: '#e1a1ff', price: 420, rent: 100 },
  { name: 'FINISH', icon: '★', type: 'corner', color: '#ffd976', detail: 'Kembali ke START' },
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

const TILE_ASSET_KEYS = [
  'start', 'lumina', 'soal-bonus-01', 'nova-park', 'pajak', 'orbit', 'deep-space', 'pixel-bay',
  'kartu-misteri-01', 'skyline', 'prison', 'solara', 'energi', 'velvet-city', 'soal-bonus-02',
  'aurora', 'free-zone', 'crystal', 'kartu-misteri-02', 'moonlight', 'go-to-prison', 'nebula',
  'soal-bonus-03', 'quantum', 'pajak-premium', 'royal-arc', 'hyperloop', 'golden-harbor',
  'kartu-misteri-03', 'infinity', 'finish', 'prism', 'soal-bonus-04', 'mirage', 'pajak-aura',
  'starlight', 'soal-bonus-05', 'eclipse', 'lucky-lab', 'nexus'
];
TILE_BLUEPRINT.forEach((tile, index) => {
  tile.asset = `assets/tiles/tile-${String(index + 1).padStart(2, '0')}-${TILE_ASSET_KEYS[index]}.png`;
});

const SHOP_DATA = {
  dice: [
    { id: 'dice-standard', name: 'Standard Nova', description: 'Dadu klasik untuk semua pemain.', cost: 0, glyph: '6', asset: 'assets/themes/dice-theme-00-standard.png' },
    { id: 'dice-01', name: 'Neon Prism', description: 'Cahaya cyan dengan energi futuristik.', cost: 200, glyph: '✦', asset: 'assets/themes/dice-theme-01-neon-prism.png' },
    { id: 'dice-02', name: 'Cosmic Orbit', description: 'Nuansa galaksi untuk pemain visioner.', cost: 450, glyph: '◉', asset: 'assets/themes/dice-theme-02-cosmic-orbit.png' },
    { id: 'dice-03', name: 'Royal Gold', description: 'Kilau emas, aura juara papan.', cost: 700, glyph: '7', asset: 'assets/themes/dice-theme-03-royal-gold.png' },
    { id: 'dice-04', name: 'Sakura Bloom', description: 'Pastel lembut dengan kelopak digital.', cost: 1000, glyph: '✿', asset: 'assets/themes/dice-theme-04-sakura-bloom.png' },
    { id: 'dice-05', name: 'Cyber Pulse', description: 'Gelombang listrik untuk level tertinggi.', cost: 1500, glyph: 'ϟ', asset: 'assets/themes/dice-theme-05-cyber-pulse.png' },
    { id: 'dice-custom', name: 'Slot Custom', description: 'Tempat tema dadu PNG milikmu sendiri.', cost: null, custom: true, glyph: '+' }
  ],
  board: [
    { id: 'board-standard', name: 'Classic Midnight', description: 'Papan dasar Numeric Monopoly.', cost: 0, glyph: '✦', asset: 'assets/themes/board-theme-00-classic-midnight.png' },
    { id: 'board-01', name: 'Aurora Valley', description: 'Gradasi aurora yang tenang dan terang.', cost: 250, glyph: '✧', asset: 'assets/themes/board-theme-01-aurora-valley.png' },
    { id: 'board-02', name: 'Velvet Royale', description: 'Ungu beludru, emas, dan nuansa eksklusif.', cost: 500, glyph: '♛', asset: 'assets/themes/board-theme-02-velvet-royale.png' },
    { id: 'board-03', name: 'Oceanic Glass', description: 'Biru kaca dengan kilau bawah laut.', cost: 800, glyph: '◒', asset: 'assets/themes/board-theme-03-oceanic-glass.png' },
    { id: 'board-04', name: 'Midnight Gold', description: 'Hitam elegan dengan aksen emas.', cost: 1200, glyph: '◆', asset: 'assets/themes/board-theme-04-midnight-gold.png' },
    { id: 'board-05', name: 'Cyber City', description: 'Kota neon untuk master strategi.', cost: 1800, glyph: '⌁', asset: 'assets/themes/board-theme-05-cyber-city.png' },
    { id: 'board-custom', name: 'Slot Custom', description: 'Tempat tema papan PNG milikmu sendiri.', cost: null, custom: true, glyph: '+' }
  ],
  character: [
    { id: 'character-standard', name: 'Nova Starter', description: 'Karakter awal yang seimbang.', cost: 0, glyph: '🧠', asset: 'assets/characters/character-00-nova-starter.png' },
    { id: 'character-01', name: 'Astro Fox', description: 'Lincah, berani, dan siap mengorbit.', cost: 300, glyph: '🦊', asset: 'assets/characters/character-01-astro-fox.png' },
    { id: 'character-02', name: 'Robo Knight', description: 'Penjaga data dengan armor premium.', cost: 600, glyph: '🤖', asset: 'assets/characters/character-02-robo-knight.png' },
    { id: 'character-03', name: 'Crystal Golem', description: 'Kokoh seperti angka yang tak terbantahkan.', cost: 900, glyph: '💎', asset: 'assets/characters/character-03-crystal-golem.png' },
    { id: 'character-04', name: 'Dragon Spark', description: 'Api kecil, ambisi besar, langkah cepat.', cost: 1300, glyph: '🐉', asset: 'assets/characters/character-04-dragon-spark.png' },
    { id: 'character-05', name: 'Void Prince', description: 'Karakter 3D langka dari dimensi tak hingga.', cost: 2000, glyph: '🪐', asset: 'assets/characters/character-05-void-prince.png' },
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
    difficulty: 'medium',
    screen: 'dashboard',
    diamond: 1280,
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
    canRoll: false,
    rolling: false,
    aiThinking: false,
    turnCount: 0,
    lastRoll: 5,
    activity: [],
    modal: null,
    room: null,
    localPlayerIndex: 0,
    onlineStatus: 'idle',
    pendingInstall: false
  };
}

const persisted = loadPersisted();
const state = Object.assign(freshState(), persisted || {});
state.player = Object.assign(freshState().player, persisted?.player || {});
state.stats = Object.assign(freshState().stats, persisted?.stats || {});
state.inventory = Object.assign(freshState().inventory, persisted?.inventory || {});
state.selectedThemes = Object.assign(freshState().selectedThemes, persisted?.selectedThemes || {});

let deferredInstallPrompt = null;
let roomUnsubscribe = null;
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
    session: state.session,
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
  return `${formatNumber(value)} cr`;
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
  if (state.session) {
    loginAudio.pause();
    gameAudio.pause();
    if (state.screen === 'game') play(gameAudio);
  } else {
    gameAudio.pause();
    play(loginAudio);
  }
}

function logoMarkup() {
  return `<div class="logo-mark" aria-label="Numeric Monopoly Matematic logo"><img src="assets/logo-favicon.png" alt="" onerror="this.style.display='none'" /><span class="logo-fallback">∑</span></div>`;
}

function renderLogin() {
  return `
    <main class="login-page game-login">
      <section class="login-brand-zone">
        <div class="login-topline"><span><i class="live-dot"></i> LIVE ARENA</span><span>SEASON 08</span></div>
        <div class="brand-lockup compact-brand">${logoMarkup()}<div><div class="brand-name">Numeric Monopoly</div><div class="brand-sub">Matematic</div></div></div>
        <img class="login-full-logo" src="assets/logo-numeric-monopoly-matematic.png" alt="Numeric Monopoly Matematic" onerror="this.style.display='none'" />
        <div class="login-overline">THINK · ROLL · WIN</div>
        <div class="login-board-preview" aria-hidden="true">
          <div class="preview-orbit orbit-one"></div><div class="preview-orbit orbit-two"></div>
          <div class="preview-tile tile-a">+8</div><div class="preview-tile tile-b">×6</div><div class="preview-tile tile-c">−3</div>
          <div class="preview-dice">6</div><div class="preview-token">${state.player.avatar}</div>
        </div>
        <div class="login-stat-strip"><span><b>40</b> TILES</span><span><b>∞</b> MOVES</span><span><b>1</b> CHAMPION</span></div>
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
          <div class="avatar">${state.player.avatar}</div>
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
            <button class="btn btn-ghost btn-icon" data-action="go-screen" data-screen="profile" aria-label="Profil">${state.player.avatar}</button>
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
    ['dashboard', '⌂', 'Home'],
    ['game', '◈', 'Play'],
    ['shop', '◇', 'Themes'],
    ['leaderboard', '♛', 'Ranking'],
    ['profile', '◎', 'Profile']
  ];
  return items.map(([id, icon, label]) => `<button class="nav-btn ${state.screen === id ? 'active' : ''}" data-action="go-screen" data-screen="${id}"><span>${icon}</span><span>${label}</span></button>`).join('');
}

function screenTitle(screen) {
  return ({ dashboard: 'HOME', game: 'ARENA', shop: 'VAULT', leaderboard: 'RANKING', profile: 'PROFILE', online: 'ONLINE' }[screen] || 'HOME');
}

function renderPage() {
  if (state.screen === 'dashboard') return renderDashboard();
  if (state.screen === 'game') return renderGame();
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
        <img class="home-brand-logo" src="assets/logo-numeric-monopoly-matematic.png" alt="" onerror="this.remove()" />
        <div class="home-hero-copy"><div class="hero-badge"><i class="live-dot"></i> SEASON 08 <span>•</span> ${DIFFICULTIES[state.difficulty].label.toUpperCase()}</div><p class="eyebrow">WELCOME, ${escapeHtml(state.player.name).toUpperCase()}</p><h2>READY<br /><span class="gradient-text">TO ROLL?</span></h2><div class="home-actions"><button class="btn btn-primary btn-lg" data-action="begin-game"><span>PLAY</span><span>↗</span></button><button class="btn btn-ghost btn-icon btn-lg" data-action="go-screen" data-screen="online" aria-label="Online">🌐</button></div></div>
        <div class="home-hero-art" aria-hidden="true"><div class="hero-ring ring-a"></div><div class="hero-ring ring-b"></div><div class="hero-dice">${selectedItem('dice')?.glyph || '6'}</div><div class="hero-pawn">${state.player.avatar}</div><div class="hero-spark spark-a">✦</div><div class="hero-spark spark-b">◆</div></div>
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
  const current = { name: state.player.name, avatar: state.player.avatar, score: state.stats.points, change: '—' };
  return [...LEADERBOARD.slice(0, 3), current].sort((a, b) => b.score - a.score).slice(0, 4).map((person, index) => `<div class="leader-row"><div class="rank-number">${index + 1}</div><div class="avatar" style="width:29px;height:29px;border-radius:9px;font-size:.82rem">${person.avatar}</div><div class="leader-info"><div class="leader-name">${escapeHtml(person.name)}${person.name === state.player.name ? ' <span style="color:var(--cyan)">(kamu)</span>' : ''}</div><div class="leader-score">${formatNumber(person.score)} rating</div></div><div class="leader-points">${person.change}</div></div>`).join('');
}

function boardGridPosition(index) {
  if (index <= 10) return { row: 1, col: index + 1 };
  if (index <= 20) return { row: index - 10 + 1, col: 11 };
  if (index <= 30) return { row: 11, col: 30 - index + 1 };
  return { row: 41 - index, col: 1 };
}

function tokenMarkup(player, playerIndex) {
  const offset = playerIndex === 0 ? { left: '8%', top: '8%' } : { left: '50%', top: '48%' };
  const character = playerIndex === 0 ? selectedItem('character') : (SHOP_DATA.character.find((item) => item.id === 'character-01') || SHOP_DATA.character[0]);
  return `<span class="token ${playerIndex === 1 ? 'ai' : ''} ${state.rolling ? 'pulse' : ''}" style="left:${offset.left};top:${offset.top}" title="${escapeHtml(player.name)}"><img src="${character.asset}" alt="" onerror="this.style.display='none'" /><span class="token-fallback">${player.avatar}</span></span>`;
}

function renderGame() {
  const board = state.tiles.length ? state.tiles : TILE_BLUEPRINT.map((tile) => ({ ...tile, owner: null }));
  const active = state.players[state.activePlayer] || { name: state.player.name, cash: 1500, position: 0 };
  const currentDice = selectedItem('dice');
  return `
    <section class="game-screen">
      <div class="game-header"><div><p class="eyebrow">${MODE_LABELS[state.mode]}</p><h2 class="title-lg">Taklukkan papan</h2></div><div class="game-chips"><span class="soft-chip active-turn">● ${escapeHtml(active.name)} bergerak</span><span class="soft-chip">${DIFFICULTIES[state.difficulty].label}</span><span class="soft-chip">Turn ${Math.max(1, state.turnCount + 1)}</span></div></div>
      <div class="game-layout">
        <div class="board-wrap ${themeClass()}" style="isolation:isolate">
          <img class="board-theme-image" src="${selectedItem('board')?.asset || ''}" alt="" onerror="this.style.display='none'" />
          <div class="board" aria-label="Papan permainan">
            <div class="board-center"><div class="board-center-copy"><div class="board-center-mark">∑</div><h2>NUMERIC<br /><span class="gradient-text">MONOPOLY</span></h2><p>Jawaban cerdas. Langkah berani.<br />Diamond untuk gaya, strategi untuk menang.</p><span class="center-mode">${MODE_LABELS[state.mode]}</span></div></div>
            ${board.map((tile, index) => renderBoardCell(tile, index)).join('')}
          </div>
          <div class="board-vignette"></div>
          ${state.question || state.aiThinking ? renderQuestionOverlay() : ''}
        </div>
        <aside class="game-side">
          <section class="turn-card panel"><div class="turn-heading"><h3>Turn tracker</h3><span class="turn-status">${state.canRoll ? 'Bisa lempar' : state.aiThinking ? 'AI berpikir' : 'Jawab soal'}</span></div>${state.players.map((player, index) => renderPlayerLine(player, index)).join('')}</section>
          <section class="dice-panel panel"><div class="dice-visual ${state.rolling ? 'rolling' : ''}"><img src="${currentDice?.asset || ''}" alt="" onerror="this.style.display='none'" /><span>${state.rolling ? '?' : (currentDice?.glyph || state.lastRoll)}</span></div><div class="dice-copy"><h3>${currentDice?.name || 'Standard Nova'}</h3><p>${state.canRoll ? 'Kunci jawaban benar. Saatnya lempar.' : 'Jawab soal untuk membuka dadu.'}</p></div><button class="btn btn-primary roll-btn" data-action="roll-dice" ${(!state.canRoll || state.rolling || state.aiThinking || (state.mode === 'ai' && state.activePlayer === 1) || (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex)) ? 'disabled' : ''}>${state.rolling ? 'Menggelinding…' : 'Lempar dadu'}</button></section>
          <section class="activity-card panel"><h3>Live activity</h3><div class="activity-list">${renderActivity()}</div></section>
        </aside>
      </div>
    </section>
  `;
}

function renderBoardCell(tile, index) {
  const pos = boardGridPosition(index);
  const owner = tile.owner;
  const playersHere = (state.players || []).map((player, pIndex) => player.position === index ? tokenMarkup(player, pIndex) : '').join('');
  const name = tile.type === 'property' ? tile.name : tile.name;
  const price = tile.price ? `<div class="cell-price">${formatCurrency(tile.price)}</div>` : `<div class="cell-price">${tile.detail || '—'}</div>`;
  return `<div class="board-cell ${tile.type === 'corner' ? 'corner' : ''} ${owner !== null && owner !== undefined ? 'owned' : ''}" style="grid-row:${pos.row};grid-column:${pos.col};--cell-color:${tile.color}" title="${escapeHtml(tile.name)}"><img class="cell-art" src="${tile.asset || ''}" alt="" onerror="this.remove()" /><div class="cell-content"><div class="cell-icon">${tile.icon}</div><div class="cell-name">${escapeHtml(name)}</div></div>${price}${owner !== null && owner !== undefined ? `<div class="cell-owners"><span class="owner-dot ${owner === 1 ? 'ai' : ''}"></span></div>` : ''}${playersHere}</div>`;
}

function renderPlayerLine(player, index) {
  return `<div class="player-line ${state.activePlayer === index ? 'active' : ''} ${index === 1 ? 'ai' : ''}"><div class="avatar">${player.avatar}</div><div class="player-copy"><div class="player-label">${escapeHtml(player.name)} ${state.activePlayer === index ? '<span style="color:var(--cyan)">•</span>' : ''}</div><div class="player-money">${formatCurrency(player.cash)} • petak ${player.position + 1}</div></div><div class="player-position">${index === 0 ? 'YOU' : state.mode === 'ai' ? 'AI' : 'P2'}</div></div>`;
}

function renderActivity() {
  const fallback = [{ icon: '✦', text: 'Jawab soal untuk dadu.' }, { icon: '◆', text: 'Tema: <strong>Classic Midnight</strong>' }, { icon: '♛', text: 'Target: 3 properti.' }];
  const items = state.activity.length ? state.activity : fallback;
  return items.slice(0, 4).map((item) => `<div class="activity"><div class="activity-icon">${item.icon}</div><div>${item.text}</div></div>`).join('');
}

function renderQuestionOverlay() {
  if (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex) {
    return `<div class="question-layer"><div class="question-card"><div class="question-top"><p class="eyebrow">Online realtime</p><span class="difficulty-pill">LIVE</span></div><div class="thinking" aria-label="Menunggu lawan"><span></span><span></span><span></span></div><h3>Menunggu ${escapeHtml(state.players[state.activePlayer]?.name || 'lawan')}…</h3><p class="muted small">Giliran lawan sedang menjawab atau melempar dadu.</p></div></div>`;
  }
  if (state.aiThinking) {
    return `<div class="question-layer"><div class="question-card"><div class="question-top"><p class="eyebrow">Giliran AI</p><span class="difficulty-pill">${DIFFICULTIES[state.difficulty].label}</span></div><div class="thinking" aria-label="AI sedang menghitung"><span></span><span></span><span></span></div><h3>${escapeHtml(state.players[1]?.name || 'AI')} sedang menghitung…</h3><p class="muted small">Kesempatanmu bisa direbut jika AI salah.</p></div></div>`;
  }
  const q = state.question;
  const difficulty = DIFFICULTIES[state.difficulty];
  return `<div class="question-layer"><div class="question-card"><div class="question-top"><p class="eyebrow">Jawaban ${state.players[state.activePlayer]?.name || 'pemain'}</p><span class="difficulty-pill" style="color:${difficulty.color}">${difficulty.label}</span></div><h3>Jawab untuk membuka pelemparan</h3><p class="question-text">${q.text} = ?</p><div class="answer-display ${state.answer ? '' : 'empty'}">${state.answer ? escapeHtml(state.answer) : 'ketik jawabanmu'}</div><div class="numeric-keyboard">${['1','2','3','4','5','6','7','8','9','-','0','⌫'].map((key) => `<button class="key-btn ${key === '⌫' ? 'control' : ''}" data-action="answer-key" data-key="${key === '⌫' ? 'backspace' : key}">${key}</button>`).join('')}<button class="key-btn control" data-action="answer-key" data-key="clear">Hapus</button><button class="key-btn ok" data-action="submit-answer">OK</button></div><p class="question-hint">Tekan OK untuk lanjut.</p></div></div>`;
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
  const visual = type === 'dice' ? `<div class="theme-dice">${item.glyph}</div>` : `<div class="theme-glyph theme-${type === 'character' ? 'character' : 'glyph'}">${item.glyph}</div>`;
  const actionLabel = owned ? (selected ? 'Dipakai' : 'Pakai') : available ? 'Buka' : 'Terkunci';
  const action = owned || available ? `<button class="btn ${selected ? 'btn-ghost' : 'btn-primary'}" style="min-height:30px;padding:0 9px;font-size:.6rem" data-action="shop-item" data-shop-type="${type}" data-item-id="${item.id}">${actionLabel}</button>` : `<span class="item-status">Urutan ${index}</span>`;
  return `<article class="shop-card ${selected ? 'selected' : ''} ${!available && !owned ? 'locked' : ''}">${!owned ? `<span class="lock-tag">${available ? '◇' : '🔒'}</span>` : '<span class="lock-tag" style="color:var(--success)">✓</span>'}<div class="shop-art"><img class="asset-preview" src="${item.asset}" alt="" onerror="this.style.display='none'" />${visual}</div><h3>${item.name}</h3><p>${item.description}</p><div class="shop-card-foot"><span class="item-price ${item.cost === 0 ? 'free' : ''}">${item.cost === 0 ? 'Gratis' : `◆ ${formatNumber(item.cost)}`}</span>${action}</div></article>`;
}

function renderLeaderboard() {
  const all = [...LEADERBOARD, { name: state.player.name, avatar: state.player.avatar, score: state.stats.points, change: '—', current: true }].sort((a, b) => b.score - a.score);
  const podium = all.slice(0, 3);
  return `<section><div class="shop-head"><div><p class="eyebrow">Season 08 • Aurora League</p><h2 class="title-lg">Main cerdas, <span class="gradient-text">naik peringkat.</span></h2><p>Menang, kumpulkan rating, jadi #1.</p></div><div class="shop-balance"><div class="shop-balance-label">Peringkatmu</div><div class="shop-balance-value" style="color:var(--cyan)">#${all.findIndex((person) => person.current) + 1}</div></div></div><div class="leaderboard-layout"><div class="panel"><div class="podium">${podium.map((person, index) => renderPodiumCard(person, index)).join('')}</div><div class="rank-table"><div class="rank-table-head"><span>#</span><span>Pemain</span><span>Rating</span><span>Trend</span></div>${all.map((person, index) => `<div class="rank-table-row ${person.current ? 'current' : ''}"><span class="rank-col">${index + 1}</span><span class="rank-user"><span class="avatar">${person.avatar}</span><span class="rank-user-name">${escapeHtml(person.name)}${person.current ? ' (kamu)' : ''}</span></span><span class="rank-points">${formatNumber(person.score)}</span><span class="rank-change">${person.change === '—' ? '•' : `↑ ${person.change}`}</span></div>`).join('')}</div></div><aside class="ranking-card panel"><p class="eyebrow">Your season</p><h3>Perjalanan menuju #1</h3><p>Menang arena untuk naik rating.</p><div class="ranking-number">${formatNumber(state.stats.points)}</div><div class="muted small">rating saat ini</div><div class="divider"></div><div class="row between"><span class="muted small">Target top 3</span><strong style="color:var(--cyan);font-size:.8rem">${Math.min(100, Math.round((state.stats.points / 8870) * 100))}%</strong></div><div style="height:9px"></div><div class="progress-track"><div class="progress-bar" style="width:${Math.min(100, Math.round((state.stats.points / 8870) * 100))}%"></div></div><div style="height:18px"></div><button class="btn btn-primary btn-wide" data-action="begin-game">Kejar rating</button></aside></div></section>`;
}

function renderPodiumCard(person, index) {
  const classes = ['first', 'second', 'third'];
  return `<div class="podium-card ${classes[index]}"><div class="avatar" style="width:42px;height:42px;border-radius:14px;font-size:1.2rem">${person.avatar}</div><div class="podium-name">${escapeHtml(person.name)}</div><div class="podium-points">${formatNumber(person.score)} rating</div><div class="podium-rank">${index + 1}</div></div>`;
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
  return `<section><div class="content-card panel"><div class="profile-grid"><div class="profile-identity"><div class="avatar">${state.player.avatar}</div><div><h2>${escapeHtml(state.player.name)}</h2><p>Level ${state.player.level} • Member Aurora League</p></div></div><div class="profile-form"><div><div class="label-with-hint"><label class="field-label" for="profile-name">Nama panggilan</label><span class="muted mini">Tersimpan lokal</span></div><input id="profile-name" class="text-input" maxlength="20" value="${escapeHtml(state.player.name)}" /></div><div class="setting-row"><div class="setting-copy"><strong>Suara tombol & efek</strong><span>Feedback saat klik, benar, salah, dan dadu.</span></div><label class="switch"><input type="checkbox" data-setting="sound" ${state.sound ? 'checked' : ''} /><span class="switch-track"></span></label></div><div class="setting-row"><div class="setting-copy"><strong>Background music</strong><span>Musik berbeda untuk login dan arena.</span></div><label class="switch"><input type="checkbox" data-setting="music" ${state.music ? 'checked' : ''} /><span class="switch-track"></span></label></div><div class="setting-row"><div class="setting-copy"><strong>Mode soal default</strong><span>Level yang dipakai saat arena baru dimulai.</span></div><select class="select-input" data-setting="difficulty"><option value="easy" ${state.difficulty === 'easy' ? 'selected' : ''}>Mudah</option><option value="medium" ${state.difficulty === 'medium' ? 'selected' : ''}>Sedang</option><option value="hard" ${state.difficulty === 'hard' ? 'selected' : ''}>Sulit</option></select></div><div class="row wrap" style="margin-top:6px"><button class="btn btn-primary" data-action="save-profile">Simpan profil</button><button class="btn btn-ghost" data-action="install-app">Pasang ke HP</button><button class="btn btn-danger" data-action="reset-progress">Reset demo</button><button class="btn btn-ghost" data-action="logout">Logout</button></div></div></div></div><div style="height:18px"></div><div class="content-card panel"><div class="section-heading"><h3>Firebase</h3><span class="soft-chip ${cloudStatus.configured ? 'active-turn' : ''}">${cloudStatus.configured ? '● Firebase connected' : '○ Demo local mode'}</span></div><p class="muted small" style="line-height:1.6;margin-bottom:0">${cloudStatus.configured ? 'Diamond diproses lewat Cloud Functions.' : 'Demo lokal aktif. Deploy Functions untuk online.'}</p></div></section>`;
}

function renderToastStack() {
  return '';
}

function renderModal() {
  if (!state.modal) return '';
  const modal = state.modal;
  if (modal.type === 'purchase') {
    return `<div class="modal-layer"><div class="modal-card"><p class="eyebrow">Property landing</p><h3>${escapeHtml(modal.tile.name)} tersedia</h3><p>Kamu mendarat di <strong style="color:#fff">${escapeHtml(modal.tile.name)}</strong>. Beli properti ini seharga <strong style="color:var(--gold)">${formatCurrency(modal.tile.price)}</strong> dan tagih rent kepada lawan.</p><div class="row between" style="margin-top:15px"><span class="muted small">Saldo ${formatCurrency(state.players[state.activePlayer]?.cash || 0)}</span><span style="color:var(--success);font-size:.72rem">+ strategi</span></div><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-skip">Lewati</button><button class="btn btn-primary" data-action="modal-buy">Beli properti</button></div></div></div>`;
  }
  if (modal.type === 'notice') {
    return `<div class="modal-layer"><div class="modal-card"><p class="eyebrow">${modal.good ? 'Nice move' : 'Attention'}</p><h3>${escapeHtml(modal.title)}</h3><p>${modal.message}</p><div class="modal-actions"><button class="btn btn-primary" data-action="modal-close">Lanjutkan</button></div></div></div>`;
  }
  if (modal.type === 'reset') {
    return `<div class="modal-layer"><div class="modal-card"><p class="eyebrow">Local demo</p><h3>Reset semua progres?</h3><p>Data lokal di perangkat ini akan dihapus. Aksi ini tidak menghapus data Firebase.</p><div class="modal-actions"><button class="btn btn-ghost" data-action="modal-close">Batal</button><button class="btn btn-danger" data-action="confirm-reset">Reset progres</button></div></div></div>`;
  }
  if (modal.type === 'win') {
    return `<div class="modal-layer"><div class="modal-card" style="text-align:center"><div style="font-size:2.7rem;margin-bottom:8px">${modal.winner === 0 ? '🏆' : '🤖'}</div><p class="eyebrow">Arena selesai</p><h3>${modal.winner === 0 ? 'Kamu menjadi nomor satu!' : 'AI merebut kemenangan'}</h3><p>${modal.winner === 0 ? 'Jawaban akurat dan langkah strategis menaikkan ratingmu.' : 'Tidak apa-apa. Pelajari pola soal dan balas di arena berikutnya.'}</p><div class="row" style="justify-content:center;gap:9px;margin-top:14px"><span class="soft-chip">+${modal.points} rating</span><span class="soft-chip">◆ ${modal.diamond} bonus</span></div><div class="modal-actions" style="justify-content:center"><button class="btn btn-ghost" data-action="go-screen" data-screen="leaderboard">Lihat ranking</button><button class="btn btn-primary" data-action="begin-game">Main lagi</button></div></div></div>`;
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
      { id: 0, name: host.name, avatar: host.avatar, position: 0, cash: 1500 },
      { id: 1, name: guest.name, avatar: guest.avatar, position: 0, cash: 1500 }
    ];
  } else {
    const opponent = state.mode === 'ai' ? { id: 1, name: 'Luna Logic', avatar: '🤖', position: 0, cash: 1500 } : { id: 1, name: 'Pemain 2', avatar: '🦊', position: 0, cash: 1500 };
    players = [{ id: 0, name: state.player.name, avatar: state.player.avatar, position: 0, cash: 1500 }, opponent];
  }
  state.players = players;
  state.tiles = TILE_BLUEPRINT.map((tile) => ({ ...tile, owner: null }));
  state.activePlayer = 0;
  state.question = null;
  state.answer = '';
  state.canRoll = false;
  state.rolling = false;
  state.aiThinking = false;
  state.turnCount = 0;
  state.lastRoll = 5;
  state.activity = [];
  state.modal = null;
}

function startGame(mode = state.mode) {
  state.mode = mode;
  if (mode === 'online') {
    state.screen = 'online';
    render();
    return;
  }
  resetGame();
  state.screen = 'game';
  askQuestion();
  persist();
  render();
  updateMusic();
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

function askQuestion() {
  if (state.mode === 'ai' && state.activePlayer === 1) return startAITurn();
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
}

function startAITurn() {
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
      addActivity('✓', `<strong>${escapeHtml(state.players[1].name)}</strong> menjawab benar dan mendapat dadu.`);
      render();
      window.setTimeout(() => rollDice(true), 650);
    } else {
      state.canRoll = false;
      state.activePlayer = 0;
      addActivity('↺', `<strong>${escapeHtml(state.players[1].name)}</strong> salah. Lemparan direbut kamu!`);
      showToast('Lemparan direbut kamu karena AI salah menjawab.', 'good');
      askQuestion();
      render();
    }
  }, 1250);
}

function handleAnswerKey(key) {
  if (!state.question || state.aiThinking) return;
  if (key === 'clear') state.answer = '';
  else if (key === 'backspace') state.answer = state.answer.slice(0, -1);
  else if (key === '-') state.answer = state.answer.startsWith('-') ? state.answer.slice(1) : `-${state.answer}`;
  else if (/^\d$/.test(key) && state.answer.replace('-', '').length < 7) state.answer += key;
  render();
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
    showToast('Benar! Lemparan dadu terbuka.', 'good');
  } else {
    state.canRoll = false;
    playSound('wrong');
    addActivity('↺', `<strong>${escapeHtml(playerName)}</strong> salah. Lemparan direbut lawan.`);
    showToast(`Belum tepat. Jawaban benar: ${correctAnswer}. Lemparan direbut lawan.`, 'bad');
    if (state.mode === 'ai') {
      state.activePlayer = 1;
      state.canRoll = true;
      render();
      window.setTimeout(() => rollDice(true), 700);
      return;
    }
    state.activePlayer = state.activePlayer === 0 ? 1 : 0;
    state.canRoll = true;
  }
  persist();
  if (state.mode === 'online') syncOnlineGame();
  render();
}

function rollDice(isAi = false) {
  if (!state.canRoll || state.rolling) return;
  if (state.mode === 'ai' && state.activePlayer === 1 && !isAi) return;
  if (state.mode === 'online' && state.activePlayer !== state.localPlayerIndex) return;
  state.rolling = true;
  state.canRoll = false;
  playSound('roll');
  render();
  window.setTimeout(() => {
    const roll = randomInt(1, 6);
    state.lastRoll = roll;
    const player = state.players[state.activePlayer];
    const oldPosition = player.position;
    const newPosition = (oldPosition + roll) % state.tiles.length;
    if (oldPosition + roll >= state.tiles.length) {
      player.cash += 200;
      addActivity('✦', `<strong>${escapeHtml(player.name)}</strong> melewati START dan mendapat bonus 200 cr.`);
    }
    player.position = newPosition;
    state.rolling = false;
    addActivity('◈', `<strong>${escapeHtml(player.name)}</strong> melempar ${roll} dan mendarat di <strong>${escapeHtml(state.tiles[newPosition].name)}</strong>.`);
    resolveLanding(newPosition);
    if (state.mode === 'online') syncOnlineGame();
    render();
  }, 850);
}

function resolveLanding(index) {
  const tile = state.tiles[index];
  const player = state.players[state.activePlayer];
  if (tile.type === 'property') {
    if (tile.owner === null || tile.owner === undefined) {
      if (state.mode === 'online') {
        if (player.cash >= tile.price) {
          player.cash -= tile.price;
          tile.owner = state.activePlayer;
          addActivity('♛', `<strong>${escapeHtml(player.name)}</strong> otomatis membeli ${escapeHtml(tile.name)} di room online.`);
        } else {
          addActivity('!', `<strong>${escapeHtml(player.name)}</strong> belum cukup saldo untuk ${escapeHtml(tile.name)}.`);
        }
        finishTurnSoon();
        return;
      }
      if (player.cash >= tile.price) {
        state.modal = { type: 'purchase', tile };
        return;
      }
      addActivity('!', `<strong>${escapeHtml(player.name)}</strong> belum cukup saldo untuk ${escapeHtml(tile.name)}.`);
      finishTurnSoon();
      return;
    }
    if (tile.owner !== state.activePlayer) {
      const owner = state.players[tile.owner];
      const rent = Math.min(player.cash, tile.rent);
      player.cash -= rent;
      owner.cash += rent;
      addActivity('◆', `<strong>${escapeHtml(player.name)}</strong> membayar rent ${formatCurrency(rent)} kepada ${escapeHtml(owner.name)}.`);
      showToast(`Membayar rent ${formatCurrency(rent)} ke ${owner.name}.`, 'bad');
    } else {
      addActivity('★', `<strong>${escapeHtml(player.name)}</strong> kembali ke properti miliknya.`);
    }
    finishTurnSoon();
  } else if (tile.type === 'tax') {
    const tax = Math.min(player.cash, tile.price || 80);
    player.cash -= tax;
    addActivity('◌', `<strong>${escapeHtml(player.name)}</strong> membayar pajak ${formatCurrency(tax)}.`);
    finishTurnSoon();
  } else if (tile.type === 'chance') {
    const reward = randomInt(20, 100);
    player.cash += reward;
    addActivity('✧', `<strong>${escapeHtml(player.name)}</strong> mendapat bonus kartu ${formatCurrency(reward)}.`);
    showToast(`Kartu misteri memberi bonus ${formatCurrency(reward)}.`, 'good');
    finishTurnSoon();
  } else if (tile.name === 'GO TO PRISON') {
    player.position = 10;
    addActivity('↘', `<strong>${escapeHtml(player.name)}</strong> dikirim ke PRISON.`);
    finishTurnSoon();
  } else {
    finishTurnSoon();
  }
}

function finishTurnSoon() {
  window.setTimeout(() => {
    if (!state.modal) finishTurn();
  }, 800);
}

function finishTurn() {
  state.turnCount += 1;
  if (state.turnCount >= 18 || state.players.some((player) => player.cash <= 0)) {
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
  const winner = state.players[0].cash >= state.players[1].cash ? 0 : 1;
  const points = winner === 0 ? 240 : 75;
  const diamond = winner === 0 ? 180 : 40;
  state.stats.games += 1;
  if (winner === 0) { state.stats.wins += 1; state.stats.points += points; state.diamond += diamond; }
  else { state.stats.points += points; state.diamond += diamond; }
  state.modal = { type: 'win', winner, points, diamond };
  state.canRoll = false;
  state.question = null;
  persist();
  render();
  submitGameResult({ winner, points, difficulty: state.difficulty }).catch(() => {});
}

function buyProperty() {
  if (!state.modal?.tile) return;
  const tile = state.modal.tile;
  const player = state.players[state.activePlayer];
  if (player.cash < tile.price) {
    showToast('Saldo belum cukup untuk properti ini.', 'bad');
    state.modal = null;
    finishTurn();
    return;
  }
  player.cash -= tile.price;
  const index = state.tiles.findIndex((candidate) => candidate.name === tile.name && candidate.owner === null);
  if (index >= 0) state.tiles[index].owner = state.activePlayer;
  addActivity('♛', `<strong>${escapeHtml(player.name)}</strong> membeli ${escapeHtml(tile.name)}.`);
  showToast(`${tile.name} resmi menjadi milikmu.`, 'good');
  state.modal = null;
  finishTurn();
}

function addActivity(icon, text) {
  state.activity.unshift({ icon, text });
  state.activity = state.activity.slice(0, 8);
}

function onlinePayload() {
  return {
    players: state.players.map((player) => ({ id: player.id, name: player.name, avatar: player.avatar, position: player.position, cash: player.cash })),
    tiles: state.tiles,
    activePlayer: state.activePlayer,
    question: state.question ? { text: state.question.text, answer: state.question.answer } : null,
    canRoll: state.canRoll,
    lastRoll: state.lastRoll,
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

function render() {
  app.innerHTML = state.session ? renderShell() : renderLogin();
  document.getElementById('boot-fallback')?.remove();
  updateMusic();
}

function navigate(screen) {
  state.screen = screen;
  if (screen !== 'game') {
    state.question = null;
    state.aiThinking = false;
  }
  render();
}

function handleClick(event) {
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
  } else if (action === 'begin-game') {
    startGame(state.mode === 'online' ? 'ai' : state.mode);
  } else if (action === 'toggle-music') {
    state.music = !state.music;
    persist();
    render();
  } else if (action === 'answer-key') {
    handleAnswerKey(target.dataset.key);
  } else if (action === 'submit-answer') {
    submitAnswer();
  } else if (action === 'roll-dice') {
    rollDice(false);
  } else if (action === 'modal-buy') {
    buyProperty();
  } else if (action === 'modal-skip') {
    state.modal = null;
    finishTurn();
  } else if (action === 'modal-close') {
    state.modal = null;
    render();
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
  if (!state.question || state.aiThinking) return;
  if (/^\d$/.test(event.key)) { event.preventDefault(); handleAnswerKey(event.key); }
  else if (event.key === '-') { event.preventDefault(); handleAnswerKey('-'); }
  else if (event.key === 'Backspace') { event.preventDefault(); handleAnswerKey('backspace'); }
  else if (event.key === 'Enter') { event.preventDefault(); submitAnswer(); }
}

app.addEventListener('click', handleClick);
app.addEventListener('input', handleInput);
app.addEventListener('change', handleChange);
document.addEventListener('keydown', handleKeydown);
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (state.session) render();
});
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; render(); showToast('Numeric Monopoly berhasil dipasang di HP.', 'good'); });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

(async function bootstrap() {
  cloudStatus = await initCloud();
  render();
})();

// Needed by the reset confirmation action without adding a second modal system.
app.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'confirm-reset') resetProgress();
});
