# Radio Operator Interface

Interface web-based untuk radio operator memainkan dan mengatur lagu yang diputar di radio streaming dengan memanfaatkan fitur dari [GO-AUDIO-BROADCASTER](https://github.com/hrizal/GO-AUDIO-BROADCASTER).

## Fitur Utama

### 1. Music Library (Panel Kiri)
- **Pustaka Lagu Lokal**: Menampilkan semua lagu yang tersedia di server
- **Pencarian & Filter**: Cari berdasarkan judul/artis, filter berdasarkan genre
- **Upload Lagu**: Drag & drop atau browse file audio untuk diupload
- **Multi-select**: Pilih beberapa lagu sekaligus untuk ditambahkan ke playlist

### 2. Player Controls & Mixer (Panel Tengah)
- **Now Playing**: Informasi lagu yang sedang diputar dengan progress bar
- **Player Controls**: Play/Pause, Stop, Previous, Next, Repeat
- **4-Channel Mixer**: 
  - Music Volume
  - Microphone Volume
  - Effects Volume
  - Master Volume
- **Breaking Audio**: Trigger breaking news/alert dengan ducking otomatis
- **Stream Information**: Bitrate, listeners, uptime, station name

### 3. Playlist (Panel Kanan)
- **Queue Management**: Lagu yang akan diputar secara berurutan
- **Playlist Actions**: Clear, Shuffle, Save
- **Drag to Reorder**: (coming soon) Urutkan ulang playlist
- **Real-time Stats**: Jumlah lagu dan total durasi

### 4. Push-to-Talk (PTT) Mic
- **WebRTC Ingress**: Siaran langsung menggunakan microphone via WebRTC
- **Hold-to-Talk**: Tekan dan tahan tombol (atau spasi) untuk berbicara
- **Mic Gain Control**: Atur sensitivitas microphone
- **Visual Feedback**: Indikator status microphone on/off

### 5. Monitor Siaran
- **WebRTC Egress**: Monitor siaran dengan zero-latency via WebRTC
- **Monitor Volume**: Kontrol volume monitoring terpisah
- **Toggle On/Off**: Aktifkan/nonaktifkan monitoring

## Teknologi

- **HTML5** - Struktur aplikasi
- **CSS3** - Styling modern dengan CSS Variables, Grid, Flexbox
- **Vanilla JavaScript** - Logika aplikasi tanpa framework berat
- **WebRTC API** - Untuk PTT mic dan monitoring
- **Font Awesome** - Icon library
- **Google Fonts (Inter)** - Typography

## Struktur File

```
radio-operator-interface/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # All styles
├── js/
│   └── app.js         # Application logic
├── assets/            # Static assets (images, etc.)
└── README.md          # This file
```

## Konfigurasi

### Settings Modal
Akses melalui tombol gear di header kanan:

1. **Server Configuration**
   - Server URL: Alamat server GO-AUDIO-BROADCASTER
   - API Token: Token untuk autentikasi API
   - WebRTC Token: Token untuk koneksi WebRTC

2. **Audio Settings**
   - Audio Input Device: Pilih microphone
   - Audio Quality: High/Medium/Low

3. **Station Configuration**
   - Select Station: Pilih station jika multi-station

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` (hold) | Push-to-Talk |
| `M` | Toggle Monitor |
| `Space` (click) | Play/Pause (saat tidak PTT) |

## Integrasi dengan GO-AUDIO-BROADCASTER

### API Endpoints (Contoh)

```javascript
// Load Library
GET /api/library

// Add to Queue
POST /api/queue
{ "track_id": 123 }

// Mixer Control
PUT /api/mixer/{channel}
{ "volume": 80 }

// Breaking Audio
POST /api/breaking
{ "type": "urgent", "message": "Breaking news..." }

// WebRTC Inress (PTT)
POST /api/webrtc/ingress
{ "sdp": "offer_sdp" }

// WebRTC Egress (Monitor)
POST /api/webrtc/egress
```

### WebRTC Flow

#### PTT (Ingress)
1. User menekan tombol PTT
2. Browser meminta akses microphone
3. Buat RTCPeerConnection
4. Send audio track ke peer connection
5. Create offer dan kirim ke server
6. Server response dengan answer
7. Audio stream dikirim ke broadcaster

#### Monitor (Egress)
1. User klik Monitor button
2. Request monitoring endpoint ke server
3. Server kirim offer SDP
4. Browser create answer
5. Receive audio track dari server
6. Play audio melalui speaker

## Cara Menggunakan

### Development
1. Buka `index.html` di browser modern
2. Klik tombol **CONNECT** untuk connect ke server
3. Configure settings jika diperlukan
4. Mulai manage playlist dan broadcast

### Production
1. Deploy ke web server (nginx, Apache, dll)
2. Configure server URL di settings
3. Pastikan CORS enabled di GO-AUDIO-BROADCASTER
4. Setup SSL/HTTPS untuk WebRTC (required)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

**Note**: WebRTC requires HTTPS in production (kecuali localhost)

## Customization

### Theme Colors
Edit CSS variables di `css/style.css`:

```css
:root {
    --primary-color: #6366f1;
    --success-color: #10b981;
    --danger-color: #ef4444;
    /* ... */
}
```

### Add New Features
Extend `RadioOperator` class di `js/app.js`:

```javascript
class RadioOperator {
    // Add your custom methods here
    myNewFeature() {
        // Implementation
    }
}
```

## Troubleshooting

### WebRTC Not Working
- Pastikan HTTPS (atau localhost)
- Check browser permissions untuk microphone
- Verify WebRTC token valid

### Cannot Connect to Server
- Check server URL correct
- Verify API token
- Check CORS configuration

### Audio Not Playing
- Check browser autoplay policy
- Verify audio files format supported
- Check mixer volume levels

## License

MIT License

## Credits

Dibuat untuk digunakan dengan [GO-AUDIO-BROADCASTER](https://github.com/hrizal/GO-AUDIO-BROADCASTER)
