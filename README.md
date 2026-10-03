# Personal AI WhatsApp Bot & Dashboard

Proyek ini adalah Asisten AI Pribadi di WhatsApp yang terintegrasi dengan Dashboard Next.js untuk melihat riwayat pesan dan mengatur gaya bahasa (kepribadian) AI.

## 🚀 Panduan Deployment di VPS (menggunakan Docker)

Berikut adalah panduan lengkap dari awal sampai aplikasi online 24 jam di VPS Anda.

### 1. Masuk ke VPS & Ambil Kode
Buka terminal dan masuk ke VPS via SSH, lalu clone repository ini:
```bash
git clone https://github.com/taufik-hdyt25/wa-chat-bot.git
cd wa-chat-bot
```

### 2. Buat File Konfigurasi Rahasia (`.env`)
Karena API Key bersifat rahasia dan tidak di-upload ke GitHub, Anda wajib membuat filenya secara manual:
```bash
cd whatsapp-bot
nano .env
```
Isi dengan teks berikut (ganti dengan API Key Groq Anda):
```env
AI_API_KEY="ISI_DENGAN_API_KEY_GROQ_ANDA"
```
*(Tekan `Ctrl+X`, lalu `Y`, lalu `Enter` untuk menyimpan).*

Kembali ke folder utama:
```bash
cd ..
```

### 3. Nyalakan Bot & Dashboard (Docker)
Jalankan perintah ini untuk menginstall dan menghidupkan semuanya di latar belakang (*background*):
```bash
docker compose up -d --build
```

### 4. Login WhatsApp (Scan Barcode)
Karena ini adalah perangkat baru bagi WhatsApp, Anda harus melakukan scan barcode satu kali saja:
```bash
docker logs wa-bot -f
```
- Silakan scan barcode yang muncul di layar terminal menggunakan HP Anda (seperti login WhatsApp Web).
- Jika sudah muncul tulisan `connected to WA`, tekan **`Ctrl + C`** untuk keluar dari log.
- Bot akan tetap menyala 24 jam non-stop!

### 5. Akses Dashboard
Buka browser di laptop atau HP Anda, lalu ketikkan:
**`http://<IP_VPS_ANDA>:3333`**

Di Dashboard ini Anda bisa:
- Melihat daftar kontak yang pernah nge-chat.
- Membaca riwayat percakapan.
- Mengubah kepribadian AI (Menu *Settings*).

---

## 🛠️ Perintah-Perintah Penting (Cheat Sheet)

Jika sewaktu-waktu Anda perlu mengatur ulang, perbaiki, atau cek status bot, gunakan perintah di bawah ini (jalankan di folder `wa-chat-bot`):

- **Melihat status aplikasi yang berjalan:**
  ```bash
  docker compose ps
  ```
- **Melihat log bot WhatsApp (melihat chat masuk/error):**
  ```bash
  docker logs wa-bot -f
  ```
- **Melihat log Dashboard Next.js:**
  ```bash
  docker logs wa-dashboard -f
  ```
- **Mematikan seluruh bot & dashboard:**
  ```bash
  docker compose down
  ```
- **Restart (misal setelah mengubah sesuatu di kode):**
  ```bash
  docker compose restart
  ```
- **Update kode terbaru dari GitHub lalu jalankan ulang:**
  ```bash
  git pull origin main
  docker compose down
  docker compose up -d --build
  ```
