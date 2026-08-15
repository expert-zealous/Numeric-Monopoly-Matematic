// app.js
import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// --- 1. Logika Auth (Memantau Status Login) ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Pemain berhasil login:", user.email);
    } else {
        console.log("Pemain belum login. Silakan login terlebih dahulu.");
    }
});

// --- 2. Fungsi Simpan Skor (Sesuai Firestore Rules) ---
export async function saveScore(scoreValue) {
    const user = auth.currentUser;

    if (!user) {
        alert("Anda harus login untuk menyimpan skor!");
        return;
    }

    try {
        await addDoc(collection(db, "scores"), {
            userId: user.uid,
            nama: user.displayName || "Pemain Anonim",
            skor: Number(scoreValue),
            tanggal: new Date()
        });
        console.log("Skor berhasil tersimpan di Firestore!");
    } catch (e) {
        console.error("Error menyimpan skor:", e);
        alert("Gagal menyimpan skor. Silakan coba lagi.");
    }
}

// --- 3. Fungsi Ambil Leaderboard (Opsional, untuk tampilkan peringkat) ---
export async function getTopScores() {
    const scoresRef = collection(db, "scores");
    const q = query(scoresRef, orderBy("skor", "desc"), limit(10));
    
    const querySnapshot = await getDocs(q);
    const scores = [];
    querySnapshot.forEach((doc) => {
        scores.push(doc.data());
    });
    return scores;
}

// --- 4. Contoh Penggunaan dalam Game ---
// Saat pemain memenangkan game atau game over, panggil fungsi ini:
// saveScore(1500); // 1500 adalah contoh skor