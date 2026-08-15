const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const REGION = 'asia-southeast2';

// Server-side catalog. Client tidak dipercaya untuk menentukan harga atau urutan item.
const CATALOG = {
  dice: [
    ['dice-standard', 0], ['dice-01', 500], ['dice-02', 1200], ['dice-03', 2400], ['dice-04', 4000], ['dice-05', 7000]
  ],
  board: [
    ['board-standard', 0], ['board-01', 800], ['board-02', 1800], ['board-03', 3200], ['board-04', 5200], ['board-05', 9000]
  ],
  character: [
    ['character-standard', 0], ['character-01', 1000], ['character-02', 2200], ['character-03', 3800], ['character-04', 6200], ['character-05', 10000]
  ]
};

function requireAuth(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login anonim diperlukan.');
  return request.auth.uid;
}

function profileRef(uid) {
  return db.collection('profiles').doc(uid);
}

function defaultProfile(uid) {
  return {
    uid,
    diamond: 1280,
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
    rating: 0,
    games: 0,
    wins: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

exports.purchaseTheme = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const type = request.data?.type;
  const itemId = request.data?.itemId;
  const items = CATALOG[type];
  if (!items) throw new HttpsError('invalid-argument', 'Kategori tema tidak valid.');
  const index = items.findIndex(([id]) => id === itemId);
  if (index < 0) throw new HttpsError('invalid-argument', 'Item tidak ada di katalog server.');
  const cost = items[index][1];
  const ref = profileRef(uid);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const profile = snapshot.exists ? snapshot.data() : defaultProfile(uid);
    const inventory = profile.inventory || { dice: ['dice-standard'], board: ['board-standard'], character: ['character-standard'] };
    const owned = inventory[type] || [];
    if (owned.includes(itemId)) {
      return { ok: true, diamond: profile.diamond || 0, alreadyOwned: true };
    }
    const previousIds = items.slice(0, index).map(([id]) => id);
    const missingPrevious = previousIds.find((id) => !owned.includes(id));
    if (missingPrevious) throw new HttpsError('failed-precondition', `Pembelian wajib berurutan. Buka ${missingPrevious} terlebih dahulu.`);
    const diamond = Number(profile.diamond || 0);
    if (diamond < cost) throw new HttpsError('failed-precondition', 'Diamond tidak cukup.');
    const nextInventory = { ...inventory, [type]: [...owned, itemId] };
    const nextSelected = { ...(profile.selectedThemes || {}), [type]: itemId };
    const next = {
      ...profile,
      uid,
      diamond: diamond - cost,
      inventory: nextInventory,
      selectedThemes: nextSelected,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    transaction.set(ref, next, { merge: true });
    return { ok: true, diamond: next.diamond, itemId, type };
  });
});

exports.claimDailyReward = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const ref = profileRef(uid);
  const today = new Date().toISOString().slice(0, 10);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const profile = snapshot.exists ? snapshot.data() : defaultProfile(uid);
    if (profile.lastDailyClaim === today) throw new HttpsError('already-exists', 'Hadiah harian sudah diklaim.');
    const reward = 100;
    const next = { ...profile, uid, diamond: Number(profile.diamond || 0) + reward, lastDailyClaim: today, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    transaction.set(ref, next, { merge: true });
    return { ok: true, diamond: reward, balance: next.diamond };
  });
});

exports.recordGameResult = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const winner = Number(request.data?.winner) === 0;
  const allowedPoints = winner ? 240 : 75;
  const allowedDiamond = winner ? 180 : 40;
  const ref = profileRef(uid);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const profile = snapshot.exists ? snapshot.data() : defaultProfile(uid);
    const next = {
      ...profile,
      uid,
      games: Number(profile.games || 0) + 1,
      wins: Number(profile.wins || 0) + (winner ? 1 : 0),
      rating: Number(profile.rating || 0) + allowedPoints,
      diamond: Number(profile.diamond || 0) + allowedDiamond,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    transaction.set(ref, next, { merge: true });
    transaction.set(db.collection('leaderboard').doc(uid), {
      uid,
      displayName: profile.displayName || 'Mathematician',
      avatar: profile.avatar || '🧠',
      rating: next.rating,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    const scoreRef = db.collection('scores').doc();
    transaction.set(scoreRef, {
      userId: uid,
      nama: profile.displayName || 'Mathematician',
      skor: next.rating,
      tanggal: admin.firestore.FieldValue.serverTimestamp()
    });
    return { ok: true, rating: next.rating };
  });
});

exports.onRoomCreated = onDocumentCreated({ document: 'rooms/{roomId}', region: REGION }, async (event) => {
  const room = event.data?.data();
  if (!room) return;
  await event.data.ref.set({ createdAt: room.createdAt || admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
});
