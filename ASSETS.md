# Asset naming guide — Numeric Monopoly Matematic

UI sudah memiliki fallback CSS/emoji, jadi game tetap tampil tanpa PNG/MP3. Jika asset asli sudah siap, letakkan file dengan nama **persis** seperti daftar berikut. File PNG akan otomatis muncul di Vault dan audio akan dipakai oleh tag `<audio>` di `index.html`.

## Logo dan favicon

- `assets/logo-numeric-monopoly-matematic.png` — logo login, saran 1024×1024 atau 1200×400 bila dibuat horizontal.
- `assets/logo-favicon.png` — favicon, saran 512×512 transparan.
- `assets/logo-favicon.svg` — fallback ringan yang sudah disertakan.

## Audio

- `assets/audio/music-login.mp3` — musik layar login, seamless loop, sekitar 60–120 detik.
- `assets/audio/music-game.mp3` — musik saat bermain, seamless loop, sekitar 60–120 detik.
- `assets/audio/sfx-click.mp3` — klik tombol, sangat pendek.
- `assets/audio/sfx-correct.mp3` — jawaban benar.
- `assets/audio/sfx-wrong.mp3` — jawaban salah.
- `assets/audio/sfx-roll.mp3` — suara dadu menggelinding.

## Tema dadu

- `assets/themes/dice-theme-00-standard.png`
- `assets/themes/dice-theme-01-neon-prism.png`
- `assets/themes/dice-theme-02-cosmic-orbit.png`
- `assets/themes/dice-theme-03-royal-gold.png`
- `assets/themes/dice-theme-04-sakura-bloom.png`
- `assets/themes/dice-theme-05-cyber-pulse.png`

## Tema papan

- `assets/themes/board-theme-00-classic-midnight.png`
- `assets/themes/board-theme-01-aurora-valley.png`
- `assets/themes/board-theme-02-velvet-royale.png`
- `assets/themes/board-theme-03-oceanic-glass.png`
- `assets/themes/board-theme-04-midnight-gold.png`
- `assets/themes/board-theme-05-cyber-city.png`

## Karakter 3D

PNG berikut ditampilkan sebagai preview katalog dan fondasi slot karakter unik. Untuk kualitas paling tajam, siapkan PNG transparan render 3D dari sudut 3/4:

- `assets/characters/character-00-nova-starter.png`
- `assets/characters/character-01-astro-fox.png`
- `assets/characters/character-02-robo-knight.png`
- `assets/characters/character-03-crystal-golem.png`
- `assets/characters/character-04-dragon-spark.png`
- `assets/characters/character-05-void-prince.png`

Slot tambahan yang disiapkan di Vault: `dice-custom`, `board-custom`, dan `character-custom`. Tidak perlu mengubah kode ketika asset custom siap dikembangkan.

## Rekomendasi teknis

- PNG transparan, sRGB, tanpa teks kecil agar tetap terbaca di HP.
- Dadu/papan: 1024×1024.
- Karakter: 1024×1024, objek utama berada di tengah dengan ruang 10–15% di tepi.
- Audio: MP3 44.1 kHz, level tidak terlalu keras; browser dapat memblokir autoplay sebelum interaksi pertama, sehingga musik mulai setelah tombol login ditekan.
