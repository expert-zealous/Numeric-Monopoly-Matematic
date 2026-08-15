import { firebaseConfig, firebaseReady } from './firebase-config.js';

const SDK_VERSION = '10.12.2';
let services = null;
let currentUser = null;

function sdkUrl(name) {
  return `https://www.gstatic.com/firebasejs/${SDK_VERSION}/${name}.js`;
}

export async function initCloud() {
  if (!firebaseReady) return { configured: false, user: null };
  try {
    const [{ initializeApp }, authSdk, firestoreSdk, functionsSdk] = await Promise.all([
      import(sdkUrl('firebase-app')),
      import(sdkUrl('firebase-auth')),
      import(sdkUrl('firebase-firestore')),
      import(sdkUrl('firebase-functions'))
    ]);
    const app = initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(app);
    const db = firestoreSdk.getFirestore(app);
    const functions = functionsSdk.getFunctions(app, 'asia-southeast2');
    const credential = await authSdk.signInAnonymously(auth);
    currentUser = credential.user;
    services = { app, auth, db, functions, authSdk, firestoreSdk, functionsSdk };
    return { configured: true, user: currentUser };
  } catch (error) {
    console.warn('[Numeric Monopoly] Firebase belum siap:', error);
    services = null;
    currentUser = null;
    return { configured: false, user: null, error };
  }
}

export function getCloudStatus() {
  return { configured: Boolean(services), user: currentUser };
}

export async function purchaseTheme({ type, itemId, cost }) {
  if (!services) return { ok: true, demo: true, diamond: null };
  try {
    const callable = services.functionsSdk.httpsCallable(services.functions, 'purchaseTheme');
    const response = await callable({ type, itemId, cost });
    return response.data;
  } catch (error) {
    return { ok: false, message: error?.message || 'Pembelian ditolak oleh server.' };
  }
}

export async function claimDailyReward() {
  if (!services) return { ok: true, demo: true, diamond: 100 };
  try {
    const callable = services.functionsSdk.httpsCallable(services.functions, 'claimDailyReward');
    const response = await callable({});
    return response.data;
  } catch (error) {
    return { ok: false, message: error?.message || 'Hadiah belum bisa diambil.' };
  }
}

export async function submitGameResult(payload) {
  if (!services) return { ok: true, demo: true };
  try {
    const callable = services.functionsSdk.httpsCallable(services.functions, 'recordGameResult');
    const response = await callable(payload);
    return response.data;
  } catch (error) {
    return { ok: false, message: error?.message || 'Hasil game belum tersinkron.' };
  }
}

export async function createRoom({ name, avatar, difficulty }) {
  const code = makeRoomCode();
  if (!services) return { ok: true, demo: true, id: null, code };
  try {
    const { collection, addDoc, serverTimestamp } = services.firestoreSdk;
    const ref = await addDoc(collection(services.db, 'rooms'), {
      code,
      status: 'waiting',
      hostUid: currentUser.uid,
      host: { name, avatar },
      guestUid: null,
      guest: null,
      settings: { difficulty },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { ok: true, id: ref.id, code };
  } catch (error) {
    return { ok: false, message: error?.message || 'Room gagal dibuat.' };
  }
}

export async function joinRoom({ code, name, avatar }) {
  if (!services) return { ok: true, demo: true, code, opponent: { name: 'Rival demo', avatar: '🌐' } };
  try {
    const { collection, getDocs, query, where, limit, updateDoc, doc, serverTimestamp } = services.firestoreSdk;
    const result = await getDocs(query(collection(services.db, 'rooms'), where('code', '==', code), where('status', '==', 'waiting'), limit(1)));
    if (result.empty) return { ok: false, message: 'Room tidak ditemukan atau sudah dimulai.' };
    const roomDoc = result.docs[0];
    const room = roomDoc.data();
    if (room.hostUid === currentUser.uid) return { ok: false, message: 'Host tidak dapat bergabung ke room sendiri.' };
    await updateDoc(doc(services.db, 'rooms', roomDoc.id), {
      guestUid: currentUser.uid,
      guest: { name, avatar },
      status: 'ready',
      updatedAt: serverTimestamp()
    });
    return { ok: true, id: roomDoc.id, code, host: room.host, opponent: room.host };
  } catch (error) {
    return { ok: false, message: error?.message || 'Gagal bergabung ke room.' };
  }
}

export async function startRoom(roomId, game) {
  if (!services || !roomId) return { ok: true, demo: true };
  try {
    const { doc, updateDoc, serverTimestamp } = services.firestoreSdk;
    await updateDoc(doc(services.db, 'rooms', roomId), { status: 'playing', game, updatedAt: serverTimestamp() });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error?.message || 'Match gagal dimulai.' };
  }
}

export async function updateRoomGame(roomId, game) {
  if (!services || !roomId) return { ok: true, demo: true };
  try {
    const { doc, updateDoc, serverTimestamp } = services.firestoreSdk;
    await updateDoc(doc(services.db, 'rooms', roomId), { game, updatedAt: serverTimestamp() });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error?.message || 'State online gagal disinkronkan.' };
  }
}

export function watchRoom(roomId, callback) {
  if (!services || !roomId) return () => {};
  const { doc, onSnapshot } = services.firestoreSdk;
  return onSnapshot(doc(services.db, 'rooms', roomId), (snapshot) => {
    if (!snapshot.exists()) return callback(null);
    const data = snapshot.data();
    callback({ id: snapshot.id, code: data.code, status: data.status, opponent: data.guest || null, host: data.host || null, game: data.game || null });
  });
}

function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}
