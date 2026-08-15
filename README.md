# Numeric Monopoly Matematic

Prototype web game PWA responsif dengan tema premium: soal matematika acak menentukan hak melempar dadu. Dibuat dengan HTML, CSS, JavaScript vanilla, Firebase modular SDK, dan Cloud Functions.

## Fitur yang sudah ada

- Login guest dengan nama panggilan dan pilihan **1 vs AI**, **1 vs 1 satu HP**, atau **1 vs 1 online**.
- Soal hitung dasar acak level **Mudah / Sedang / Sulit**.
- Input singkat di tengah papan, keyboard angka 0–9, negatif, Hapus, Backspace, dan tombol OK ekstra besar.
- Keyboard/question overlay otomatis hilang setelah submit; muncul lagi di giliran berikutnya.
- Jika jawaban salah, lemparan direbut lawan. AI langsung mengambil kesempatan; mode satu HP memindahkan hak lempar ke pemain 2.
- Papan klasik 40 petak: START kanan bawah, PRISON kiri bawah, FREE PARKING kiri atas, GO TO PRISON kanan atas, kartu CHANCE di tengah, properti, pajak, airport, dan bonus START.
- Gerakan pion bertahap per petak, hasil angka dadu terlihat di HUD dan di tengah papan.
- Manajemen properti: beli rumah sampai 4, upgrade hotel, rent bertambah, jual properti, dan lelang sederhana.
- Vault tema: 5 item berbayar + item standard gratis + 1 custom slot pada masing-masing kategori dadu, papan, dan karakter.
- Pembelian wajib berurutan. Saldo diamond tidak cukup menghasilkan notifikasi.
- Karakter unik memiliki fallback emoji 3D-style dan siap diganti PNG transparan sesuai `ASSETS.md`.
- Suara tombol, benar, salah, dadu, musik login, dan musik bermain.
- Leaderboard/season UI, statistik, daily reward, profil, pengaturan suara/musik.
- Battle Arena 3/4/6 pemain local + bot, rotasi turn, eliminasi cash 0, dan tombol keluar tanpa menunggu.
- PWA manifest, service worker, dan tombol install sehingga dapat ditambahkan ke Home Screen HP.
- Firebase Auth anonim, Firestore room/leaderboard, dan callable Cloud Functions untuk pembelian diamond, daily reward, dan rating.

## Menjalankan lokal

Tidak membutuhkan build step.

```bash
python3 -m http.server 4173
```

Buka `http://localhost:4173`.

## Mengaktifkan Firebase

1. Buat project Firebase.
2. Aktifkan **Authentication → Anonymous**.
3. Aktifkan Firestore.
4. Salin Web App config ke `firebase-config.js`.
5. Deploy rules dan functions:

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
cd firebase/functions && npm install && cd ../..
firebase deploy --only firestore:rules,functions
```

6. Pastikan region Cloud Functions dan region Firestore sesuai kebutuhan. Prototype memakai `asia-southeast2`.

**Catatan keamanan:** jangan mengurangi `firestore.rules` menjadi writable dari browser. Saldo diamond, harga katalog, urutan pembelian, daily reward, dan rating sudah divalidasi di `firebase/functions/index.js` melalui Admin SDK. Untuk produksi, state online sebaiknya dibuat authoritative di Cloud Function/transaction agar client tidak dapat memalsukan hasil turn.

## Menambahkan asset

Ikuti semua nama file di `ASSETS.md`. Fallback CSS/emoji akan tetap tampil jika asset belum tersedia. File audio cukup diletakkan di `assets/audio/` tanpa perubahan kode.

## Struktur penting

- `index.html` — shell PWA dan audio hooks.
- `styles.css` — komponen dasar dan layout responsif.
- `game-ui.css` — skin game compact: HUD, splash arena, icon rail, neon board, kartu minimal.
- `app.js` — state game, soal, turn, AI, shop, leaderboard, online lobby, PWA install.
- `firebase.js` — adapter Firebase yang otomatis fallback ke demo local jika config kosong.
- `firebase-config.js` — tempat Web App config.
- `firebase/functions/index.js` — validasi server untuk diamond dan rating.
- `firebase/firestore.rules` — aturan akses Firestore.
