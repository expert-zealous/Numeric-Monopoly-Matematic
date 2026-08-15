// Firebase Web App config.
// Web API key bukan service-account secret. Atur keamanan melalui Firebase Auth,
// Firestore Rules, dan Cloud Functions (jangan taruh private key di frontend).
export const firebaseConfig = {
  apiKey: 'AIzaSyAiG78_8Lenss1MQPTKQ5ypK7W70H5HvHQQ',
  authDomain: 'numericmonopolymatematic.firebaseapp.com',
  projectId: 'numericmonopolymatematic',
  storageBucket: 'numericmonopolymatematic.firebasestorage.app',
  messagingSenderId: '622619145610',
  appId: '1:622619145610:web:6b5ccc159d9e11a0780473'
};

export const firebaseReady = Object.values(firebaseConfig).every(Boolean);
