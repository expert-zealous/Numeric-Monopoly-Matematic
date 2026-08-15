
## Artwork setiap petak papan

Game sekarang mendukung artwork PNG pada **40 petak**. Letakkan file berikut di `assets/tiles/`. Jika belum ada, ikon bawaan tetap tampil.

```text
assets/tiles/tile-01-start.png
assets/tiles/tile-02-lumina.png
assets/tiles/tile-03-soal-bonus-01.png
assets/tiles/tile-04-nova-park.png
assets/tiles/tile-05-pajak.png
assets/tiles/tile-06-orbit.png
assets/tiles/tile-07-deep-space.png
assets/tiles/tile-08-pixel-bay.png
assets/tiles/tile-09-kartu-misteri-01.png
assets/tiles/tile-10-skyline.png
assets/tiles/tile-11-prison.png
assets/tiles/tile-12-solara.png
assets/tiles/tile-13-airport.png
assets/tiles/tile-14-velvet-city.png
assets/tiles/tile-15-soal-bonus-02.png
assets/tiles/tile-16-aurora.png
assets/tiles/tile-17-free-zone.png
assets/tiles/tile-18-crystal.png
assets/tiles/tile-19-kartu-misteri-02.png
assets/tiles/tile-20-moonlight.png
assets/tiles/tile-21-free-parking.png
assets/tiles/tile-22-nebula.png
assets/tiles/tile-23-soal-bonus-03.png
assets/tiles/tile-24-quantum.png
assets/tiles/tile-25-pajak-premium.png
assets/tiles/tile-26-royal-arc.png
assets/tiles/tile-27-hyperloop.png
assets/tiles/tile-28-golden-harbor.png
assets/tiles/tile-29-kartu-misteri-03.png
assets/tiles/tile-30-infinity.png
assets/tiles/tile-31-go-to-prison.png
assets/tiles/tile-32-prism.png
assets/tiles/tile-33-soal-bonus-04.png
assets/tiles/tile-34-mirage.png
assets/tiles/tile-35-pajak-aura.png
assets/tiles/tile-36-starlight.png
assets/tiles/tile-37-soal-bonus-05.png
assets/tiles/tile-38-eclipse.png
assets/tiles/tile-39-lucky-lab.png
assets/tiles/tile-40-nexus.png
```

Spesifikasi artwork petak:

- PNG transparan atau square 512×512.
- 1 objek utama per gambar.
- Jangan menaruh teks kecil di dalam artwork.
- Property: kota/menara/landmark sesuai nama.
- Kartu misteri: kartu bercahaya.
- Pajak: simbol koin/pajak.
- Utility: airport/portal.
- Corner: ilustrasi besar seperti START, PRISON, FINISH.
