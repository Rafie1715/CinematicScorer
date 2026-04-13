# Cinematic Scorer

Aplikasi klasifikasi lagu ke persona soundtrack film berbasis data Spotify.

## Fitur

- Weighted scoring classifier lintas trope (bukan first-match)
- Confidence meter + keyword explainability
- Mode analisis `Metadata` dan `Lyric`
- Panel tema, makna lagu, dan alasan sinematik
- Semi-online learning ringan dari feedback kalibrasi user
- Search history (maksimal 5 query terakhir)
- Preferensi mode analisis terakhir otomatis disimpan
- Spotify token flow yang lebih aman lewat endpoint server-side (`/api/spotify-token`)
- Proxy endpoint lirik multi-provider (`/api/lyrics`) untuk hindari CORS di client

## Accuracy Dashboard (Dev)

Untuk evaluasi cepat classifier di dataset nyata (Indonesia + global), jalankan:

```bash
npm run accuracy:dashboard
```

Untuk evaluasi dataset yang lebih noisy/ambigu (hard set), jalankan:

```bash
npm run accuracy:hard
```

Script akan:
- Menjalankan evaluasi baseline pada dataset `scripts/data/real-world-test-dataset.json`
- Me-replay log feedback kalibrasi (sample: `scripts/data/calibration-feedback.sample.json`)
- Menampilkan perbandingan akurasi baseline vs tuned
- Menampilkan metrik per trope, top error, confusion matrix ringkas, dan top adaptive boosts

Opsional override path:

```bash
npm run accuracy:dashboard -- --dataset=path/to/dataset.json --feedback=path/to/feedback.json
```

Catatan format dataset:
- `genres`: array string genre/artis
- `expectedTrope`: salah satu key trope (`MELANCHOLY`, `ACTION`, dll)
- `analysisMode`: `metadata` atau `lyric` (opsional)
- `lyricsSnippet`: dipakai jika `analysisMode` = `lyric` (opsional)

## Kalibrasi: Export / Import

Di UI tersedia tombol:
- `Export Feedback`: download JSON berisi `profile` + `history`
- `Import Feedback`: upload JSON (boleh array event langsung, atau object dengan properti `history`)
- `Reset Kalibrasi`: reset profile dan history lokal

Format minimal satu event feedback:

```json
{
	"predictedTrope": "ROMCOM",
	"targetTrope": "MELANCHOLY",
	"sceneContext": "auto",
	"analysisMode": "lyric",
	"trackName": "Goodbye Love",
	"artistName": "Nadin Amizah",
	"timestamp": 1713050100000
}
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Buat file `.env` di root project

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

Catatan kompatibilitas: `VITE_SPOTIFY_CLIENT_ID` dan `VITE_SPOTIFY_CLIENT_SECRET` masih didukung sebagai fallback, tapi disarankan pakai `SPOTIFY_*` karena ini kredensial server-side.

3. Jalankan dev server

```bash
npm run dev
```

Pada mode development, endpoint `/api/spotify-token` dilayani oleh middleware di `vite.config.js`, jadi secret tidak dikirim ke browser.

Endpoint `/api/lyrics` juga dilayani oleh middleware dev agar mode Lyric bisa dipakai langsung.

## Deploy

- Untuk platform yang mendukung serverless functions (contoh Vercel), endpoint tersedia di `api/spotify-token.js`.
- Endpoint lirik tersedia di `api/lyrics.js` (fallback provider: `lyrics.ovh` -> `lrclib`).
- Pastikan environment variables `SPOTIFY_CLIENT_ID` dan `SPOTIFY_CLIENT_SECRET` diset di server/deployment settings.

Catatan mode Lyric:
- Tidak semua lagu punya lirik tersedia di provider publik.
- Jika lirik tidak ditemukan, sistem otomatis fallback ke Metadata mode tanpa error.
