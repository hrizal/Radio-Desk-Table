# Radio Operator Interface

Web-based interface for radio operators to play and manage songs broadcasted on streaming radio, leveraging features from [GO-AUDIO-BROADCASTER](https://github.com/hrizal/GO-AUDIO-BROADCASTER).

## Main Features

### 1. Music Library (Left Panel)
- **Local Song Library**: Display all available songs on the server
- **Search & Filter**: Search by title/artist, filter by genre
- **Upload Songs**: Drag & drop or browse audio files to upload
- **Multi-select**: Select multiple songs at once to add to playlist

### 2. Player Controls & Mixer (Center Panel)
- **Now Playing**: Current song information with progress bar
- **Player Controls**: Play/Pause, Stop, Previous, Next, Repeat
- **4-Channel Mixer**: 
  - Music Volume
  - Microphone Volume
  - Effects Volume
  - Master Volume
- **Breaking Audio**: Trigger breaking news/alert with automatic ducking
- **Stream Information**: Bitrate, listeners, uptime, station name

### 3. Playlist (Right Panel)
- **Queue Management**: Songs to be played in order
- **Playlist Actions**: Clear, Shuffle, Save
- **Drag to Reorder**: (coming soon) Reorder playlist
- **Real-time Stats**: Song count and total duration

### 4. Push-to-Talk (PTT) Mic
- **WebRTC Ingress**: Live broadcasting using microphone via WebRTC
- **Hold-to-Talk**: Press and hold button (or spacebar) to talk
- **Mic Gain Control**: Adjust microphone sensitivity
- **Visual Feedback**: Microphone on/off status indicator

### 5. Broadcast Monitor
- **WebRTC Egress**: Zero-latency broadcast monitoring via WebRTC
- **Monitor Volume**: Separate monitoring volume control
- **Toggle On/Off**: Enable/disable monitoring

## Technology Stack

- **HTML5** - Application structure
- **CSS3** - Modern styling with CSS Variables, Grid, Flexbox
- **Vanilla JavaScript** - Application logic without heavy frameworks
- **WebRTC API** - For PTT mic and monitoring
- **Font Awesome** - Icon library
- **Google Fonts (Inter)** - Typography

## File Structure

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

## Configuration

### Settings Modal
Access via gear button in top-right header:

1. **Server Configuration**
   - Server URL: GO-AUDIO-BROADCASTER server address
   - API Token: Authentication token for API
   - WebRTC Token: Token for WebRTC connection

2. **Audio Settings**
   - Audio Input Device: Select microphone
   - Audio Quality: High/Medium/Low

3. **Station Configuration**
   - Select Station: Choose station if multi-station setup

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` (hold) | Push-to-Talk |
| `M` | Toggle Monitor |
| `Space` (click) | Play/Pause (when not PTT) |

## GO-AUDIO-BROADCASTER Integration

### API Endpoints (Examples)

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

// WebRTC Ingress (PTT)
POST /api/webrtc/ingress
{ "sdp": "offer_sdp" }

// WebRTC Egress (Monitor)
POST /api/webrtc/egress
```

### WebRTC Flow

#### PTT (Ingress)
1. User presses PTT button
2. Browser requests microphone access
3. Create RTCPeerConnection
4. Send audio track to peer connection
5. Create offer and send to server
6. Server responds with answer
7. Audio stream sent to broadcaster

#### Monitor (Egress)
1. User clicks Monitor button
2. Request monitoring endpoint to server
3. Server sends offer SDP
4. Browser creates answer
5. Receive audio track from server
6. Play audio through speaker

## Usage Guide

### Development
1. Open `index.html` in a modern browser
2. Click **CONNECT** button to connect to server
3. Configure settings if needed
4. Start managing playlist and broadcasting

### Production
1. Deploy to web server (nginx, Apache, etc.)
2. Configure server URL in settings
3. Ensure CORS is enabled on GO-AUDIO-BROADCASTER
4. Setup SSL/HTTPS for WebRTC (required)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

**Note**: WebRTC requires HTTPS in production (except localhost)

## Customization

### Theme Colors
Edit CSS variables in `css/style.css`:

```css
:root {
    --primary-color: #6366f1;
    --success-color: #10b981;
    --danger-color: #ef4444;
    /* ... */
}
```

### Add New Features
Extend `RadioOperator` class in `js/app.js`:

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
- Ensure HTTPS (or localhost)
- Check browser permissions for microphone
- Verify WebRTC token is valid

### Cannot Connect to Server
- Check server URL is correct
- Verify API token
- Check CORS configuration

### Audio Not Playing
- Check browser autoplay policy
- Verify audio file formats are supported
- Check mixer volume levels

## License

MIT License

## Credits

Created for use with [GO-AUDIO-BROADCASTER](https://github.com/hrizal/GO-AUDIO-BROADCASTER)
