/**
 * Radio Operator Interface
 * Interface untuk radio operator memainkan dan mengatur lagu di radio streaming
 * Menggunakan fitur dari GO-AUDIO-BROADCASTER
 */

class RadioOperator {
    constructor() {
        // Configuration
        this.config = {
            serverUrl: localStorage.getItem('serverUrl') || 'http://localhost:8080',
            apiToken: localStorage.getItem('apiToken') || '',
            webrtcToken: localStorage.getItem('webrtcToken') || '',
            audioQuality: localStorage.getItem('audioQuality') || 'medium',
            stationId: localStorage.getItem('stationId') || ''
        };

        // State
        this.isConnected = false;
        this.library = [];
        this.playlist = [];
        this.selectedSongs = new Set();
        this.currentTrack = null;
        this.isPlaying = false;
        this.isPTTActive = false;
        this.isMonitoring = false;
        this.audioContext = null;
        this.micStream = null;
        this.monitorStream = null;
        this.webrtcPeer = null;

        // Initialize
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.checkWebRTCSupport();
        this.updateConnectionStatus();
        
        // Load demo data if not connected
        this.loadDemoData();
    }

    bindEvents() {
        // Connection
        document.getElementById('connectBtn').addEventListener('click', () => this.toggleConnection());
        
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.closeSettingsModal());
        
        // Player controls
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopPlayback());
        document.getElementById('prevBtn').addEventListener('click', () => this.playPrevious());
        document.getElementById('nextBtn').addEventListener('click', () => this.playNext());
        document.getElementById('repeatBtn').addEventListener('click', () => this.toggleRepeat());
        
        // Library
        document.getElementById('refreshLibraryBtn').addEventListener('click', () => this.loadLibrary());
        document.getElementById('uploadBtn').addEventListener('click', () => this.openUploadModal());
        document.getElementById('librarySearch').addEventListener('input', (e) => this.filterLibrary(e.target.value));
        document.getElementById('addToPlaylistBtn').addEventListener('click', () => this.addSelectedToPlaylist());
        
        // Playlist
        document.getElementById('clearPlaylistBtn').addEventListener('click', () => this.clearPlaylist());
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shufflePlaylist());
        document.getElementById('savePlaylistBtn').addEventListener('click', () => this.savePlaylist());
        
        // Mixer
        document.getElementById('musicVolume').addEventListener('input', (e) => this.updateMixer('music', e.target.value));
        document.getElementById('micVolume').addEventListener('input', (e) => this.updateMixer('mic', e.target.value));
        document.getElementById('effectsVolume').addEventListener('input', (e) => this.updateMixer('effects', e.target.value));
        document.getElementById('masterVolume').addEventListener('input', (e) => this.updateMixer('master', e.target.value));
        
        // Breaking audio
        document.getElementById('breakingBtn').addEventListener('click', () => this.toggleBreakingOptions());
        document.getElementById('triggerBreaking').addEventListener('click', () => this.triggerBreakingAudio());
        
        // PTT & Monitor
        document.getElementById('pttBtn').addEventListener('mousedown', () => this.startPTT());
        document.getElementById('pttBtn').addEventListener('mouseup', () => this.stopPTT());
        document.getElementById('pttBtn').addEventListener('mouseleave', () => this.stopPTT());
        document.getElementById('monitorBtn').addEventListener('click', () => this.toggleMonitor());
        
        // Upload modal
        document.getElementById('closeUploadModal').addEventListener('click', () => this.closeUploadModal());
        document.getElementById('browseFilesBtn').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop for upload
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleDropUpload(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    loadSettings() {
        document.getElementById('serverUrl').value = this.config.serverUrl;
        document.getElementById('apiToken').value = this.config.apiToken;
        document.getElementById('webrtcToken').value = this.config.webrtcToken;
        document.getElementById('audioQuality').value = this.config.audioQuality;
    }

    openSettingsModal() {
        document.getElementById('settingsModal').classList.add('active');
        this.populateAudioDevices();
        this.loadStationConfig();
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettings() {
        this.config.serverUrl = document.getElementById('serverUrl').value;
        this.config.apiToken = document.getElementById('apiToken').value;
        this.config.webrtcToken = document.getElementById('webrtcToken').value;
        this.config.audioQuality = document.getElementById('audioQuality').value;
        
        localStorage.setItem('serverUrl', this.config.serverUrl);
        localStorage.setItem('apiToken', this.config.apiToken);
        localStorage.setItem('webrtcToken', this.config.webrtcToken);
        localStorage.setItem('audioQuality', this.config.audioQuality);
        
        this.showNotification('Settings saved successfully', 'success');
        this.closeSettingsModal();
        this.updateConnectionStatus();
    }

    async populateAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            const select = document.getElementById('audioDevice');
            
            select.innerHTML = '<option value="">Default</option>';
            audioDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Microphone ${select.options.length}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error enumerating audio devices:', error);
        }
    }

    async loadStationConfig() {
        try {
            // This would fetch from API in production
            const stations = [
                { id: 'station1', name: 'Main Station' },
                { id: 'station2', name: 'Alternative Station' }
            ];
            
            const select = document.getElementById('stationSelect');
            select.innerHTML = '<option value="">Auto-detect</option>';
            stations.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading station config:', error);
        }
    }

    checkWebRTCSupport() {
        const webrtcStatus = document.getElementById('webrtcStatus');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            webrtcStatus.textContent = 'WebRTC: Not Supported';
            webrtcStatus.style.color = '#ef4444';
            return false;
        }
        
        webrtcStatus.textContent = 'WebRTC: Ready';
        webrtcStatus.style.color = '#10b981';
        return true;
    }

    async toggleConnection() {
        const connectBtn = document.getElementById('connectBtn');
        const serverStatus = document.getElementById('serverStatus');
        const streamStatus = document.getElementById('streamStatus');
        
        if (!this.isConnected) {
            // Connect
            try {
                connectBtn.disabled = true;
                connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CONNECTING...';
                
                // Simulate connection (in production, this would call the API)
                await this.simulateConnection();
                
                this.isConnected = true;
                connectBtn.innerHTML = '<i class="fas fa-plug"></i> CONNECTED';
                connectBtn.classList.add('btn-success');
                serverStatus.textContent = 'Server: Connected';
                serverStatus.style.color = '#10b981';
                
                streamStatus.classList.add('connected');
                streamStatus.querySelector('.status-text').textContent = 'Connected';
                
                this.showNotification('Connected to server successfully', 'success');
                this.loadLibrary();
                this.startStreamInfoUpdates();
            } catch (error) {
                console.error('Connection error:', error);
                this.showNotification('Failed to connect to server', 'error');
                connectBtn.disabled = false;
                connectBtn.innerHTML = '<i class="fas fa-plug"></i> CONNECT';
            }
        } else {
            // Disconnect
            this.isConnected = false;
            connectBtn.innerHTML = '<i class="fas fa-plug"></i> CONNECT';
            connectBtn.classList.remove('btn-success');
            serverStatus.textContent = 'Server: Disconnected';
            serverStatus.style.color = '#94a3b8';
            
            streamStatus.classList.remove('connected');
            streamStatus.querySelector('.status-text').textContent = 'Disconnected';
            
            if (this.isPTTActive) this.stopPTT();
            if (this.isMonitoring) this.toggleMonitor();
            
            this.showNotification('Disconnected from server', 'info');
        }
    }

    simulateConnection() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    updateConnectionStatus() {
        const streamStatus = document.getElementById('streamStatus');
        const serverStatus = document.getElementById('serverStatus');
        
        if (this.isConnected) {
            streamStatus.classList.add('connected');
            streamStatus.querySelector('.status-text').textContent = 'Connected';
            serverStatus.textContent = 'Server: Connected';
            serverStatus.style.color = '#10b981';
        } else {
            streamStatus.classList.remove('connected');
            streamStatus.querySelector('.status-text').textContent = 'Disconnected';
            serverStatus.textContent = 'Server: Disconnected';
            serverStatus.style.color = '#94a3b8';
        }
    }

    loadDemoData() {
        // Demo library data
        this.library = [
            { id: 1, title: 'Summer Vibes', artist: 'DJ Cool', duration: 245, genre: 'Pop', cover: null },
            { id: 2, title: 'Night Drive', artist: 'Synthwave Master', duration: 312, genre: 'Electronic', cover: null },
            { id: 3, title: 'Morning Coffee', artist: 'Jazz Ensemble', duration: 198, genre: 'Jazz', cover: null },
            { id: 4, title: 'Rock Anthem', artist: 'The Rockers', duration: 267, genre: 'Rock', cover: null },
            { id: 5, title: 'Chill Beats', artist: 'Lo-Fi Producer', duration: 189, genre: 'Lo-Fi', cover: null },
            { id: 6, title: 'Dance Floor', artist: 'EDM King', duration: 234, genre: 'EDM', cover: null },
            { id: 7, title: 'Acoustic Session', artist: 'Folk Singer', duration: 276, genre: 'Folk', cover: null },
            { id: 8, title: 'Hip Hop Groove', artist: 'MC Flow', duration: 221, genre: 'Hip Hop', cover: null }
        ];
        
        this.renderLibrary(this.library);
        this.updateLibraryStats();
    }

    async loadLibrary() {
        const libraryList = document.getElementById('libraryList');
        const loading = document.getElementById('libraryLoading');
        
        libraryList.innerHTML = '';
        loading.style.display = 'flex';
        
        try {
            // In production, fetch from API
            // const response = await fetch(`${this.config.serverUrl}/api/library`, {
            //     headers: { 'Authorization': `Bearer ${this.config.apiToken}` }
            // });
            // this.library = await response.json();
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            loading.style.display = 'none';
            this.renderLibrary(this.library);
            this.updateLibraryStats();
            this.populateFilters();
        } catch (error) {
            console.error('Error loading library:', error);
            loading.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Error loading library</p>';
        }
    }

    renderLibrary(songs) {
        const libraryList = document.getElementById('libraryList');
        libraryList.innerHTML = '';
        
        if (songs.length === 0) {
            libraryList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>No songs found</p>
                </div>
            `;
            return;
        }
        
        songs.forEach(song => {
            const item = this.createLibraryItem(song);
            libraryList.appendChild(item);
        });
    }

    createLibraryItem(song) {
        const div = document.createElement('div');
        div.className = 'library-item';
        div.dataset.id = song.id;
        
        div.innerHTML = `
            <div class="album-art-small">
                <i class="fas fa-music"></i>
            </div>
            <div class="library-item-info">
                <div class="library-item-title">${song.title}</div>
                <div class="library-item-artist">${song.artist}</div>
            </div>
            <div class="library-item-duration">${this.formatDuration(song.duration)}</div>
        `;
        
        div.addEventListener('click', () => this.selectSong(song.id));
        div.addEventListener('dblclick', () => this.addToPlaylistAndPlay(song));
        
        return div;
    }

    selectSong(songId) {
        if (this.selectedSongs.has(songId)) {
            this.selectedSongs.delete(songId);
        } else {
            this.selectedSongs.add(songId);
        }
        
        // Update UI
        document.querySelectorAll('.library-item').forEach(item => {
            if (parseInt(item.dataset.id) === songId) {
                item.classList.toggle('selected');
            }
        });
    }

    populateFilters() {
        const genres = [...new Set(this.library.map(song => song.genre))];
        const artists = [...new Set(this.library.map(song => song.artist))];
        
        const genreFilter = document.getElementById('genreFilter');
        const artistFilter = document.getElementById('artistFilter');
        
        // Keep first option and add rest
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        artistFilter.innerHTML = '<option value="">All Artists</option>';
        
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
        
        artists.forEach(artist => {
            const option = document.createElement('option');
            option.value = artist;
            option.textContent = artist;
            artistFilter.appendChild(option);
        });
    }

    filterLibrary(query) {
        const filtered = this.library.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        );
        this.renderLibrary(filtered);
    }

    updateLibraryStats() {
        document.getElementById('totalSongs').textContent = `${this.library.length} songs`;
        const totalDuration = this.library.reduce((sum, song) => sum + song.duration, 0);
        document.getElementById('totalDuration').textContent = this.formatDuration(totalDuration);
    }

    addSelectedToPlaylist() {
        this.selectedSongs.forEach(songId => {
            const song = this.library.find(s => s.id === songId);
            if (song && !this.playlist.find(p => p.id === songId)) {
                this.playlist.push(song);
            }
        });
        
        this.selectedSongs.clear();
        this.renderPlaylist();
        this.updatePlaylistStats();
        this.showNotification(`${this.playlist.length} song(s) added to playlist`, 'success');
    }

    addToPlaylistAndPlay(song) {
        if (!this.playlist.find(p => p.id === song.id)) {
            this.playlist.push(song);
            this.renderPlaylist();
            this.updatePlaylistStats();
        }
        this.playTrack(song);
    }

    renderPlaylist() {
        const playlistList = document.getElementById('playlistList');
        const emptyState = document.getElementById('playlistEmpty');
        
        if (this.playlist.length === 0) {
            emptyState.style.display = 'flex';
            playlistList.innerHTML = '';
            playlistList.appendChild(emptyState);
            return;
        }
        
        emptyState.style.display = 'none';
        playlistList.innerHTML = '';
        
        this.playlist.forEach((song, index) => {
            const item = this.createPlaylistItem(song, index);
            playlistList.appendChild(item);
        });
    }

    createPlaylistItem(song, index) {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        div.dataset.index = index;
        
        div.innerHTML = `
            <div class="album-art-small">
                <i class="fas fa-music"></i>
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
            <div class="playlist-item-duration">${this.formatDuration(song.duration)}</div>
            <div class="playlist-item-actions">
                <button onclick="radioOperator.playFromPlaylist(${index})" title="Play">
                    <i class="fas fa-play"></i>
                </button>
                <button onclick="radioOperator.removeFromPlaylist(${index})" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    playFromPlaylist(index) {
        const song = this.playlist[index];
        if (song) {
            this.playTrack(song);
        }
    }

    removeFromPlaylist(index) {
        this.playlist.splice(index, 1);
        this.renderPlaylist();
        this.updatePlaylistStats();
    }

    clearPlaylist() {
        if (confirm('Are you sure you want to clear the playlist?')) {
            this.playlist = [];
            this.renderPlaylist();
            this.updatePlaylistStats();
            this.showNotification('Playlist cleared', 'info');
        }
    }

    shufflePlaylist() {
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
        this.renderPlaylist();
        this.showNotification('Playlist shuffled', 'info');
    }

    savePlaylist() {
        const playlistData = JSON.stringify(this.playlist);
        localStorage.setItem('savedPlaylist', playlistData);
        this.showNotification('Playlist saved', 'success');
        
        // In production, save to server
        // fetch(`${this.config.serverUrl}/api/playlist`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${this.config.apiToken}`
        //     },
        //     body: playlistData
        // });
    }

    updatePlaylistStats() {
        document.getElementById('playlistCount').textContent = `${this.playlist.length} songs`;
        const totalDuration = this.playlist.reduce((sum, song) => sum + song.duration, 0);
        document.getElementById('playlistDuration').textContent = this.formatDuration(totalDuration);
    }

    playTrack(song) {
        this.currentTrack = song;
        this.isPlaying = true;
        
        // Update UI
        document.getElementById('currentTrackTitle').textContent = song.title;
        document.getElementById('currentTrackArtist').textContent = song.artist;
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        // Reset progress
        document.getElementById('trackProgress').style.width = '0%';
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('totalTime').textContent = this.formatDuration(song.duration);
        
        // Simulate playback progress
        this.simulatePlayback(song.duration);
        
        // Push to streamer queue (in production)
        this.pushToStreamer(song);
        
        this.showNotification(`Now playing: ${song.title}`, 'info');
    }

    simulatePlayback(duration) {
        let currentTime = 0;
        const interval = setInterval(() => {
            if (!this.isPlaying || !this.currentTrack) {
                clearInterval(interval);
                return;
            }
            
            currentTime++;
            const progress = (currentTime / duration) * 100;
            document.getElementById('trackProgress').style.width = `${progress}%`;
            document.getElementById('currentTime').textContent = this.formatDuration(currentTime);
            
            if (currentTime >= duration) {
                this.playNext();
                clearInterval(interval);
            }
        }, 1000);
    }

    togglePlayPause() {
        if (!this.currentTrack) {
            if (this.playlist.length > 0) {
                this.playTrack(this.playlist[0]);
            }
            return;
        }
        
        this.isPlaying = !this.isPlaying;
        document.getElementById('playPauseBtn').innerHTML = this.isPlaying 
            ? '<i class="fas fa-pause"></i>' 
            : '<i class="fas fa-play"></i>';
    }

    stopPlayback() {
        this.isPlaying = false;
        this.currentTrack = null;
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('trackProgress').style.width = '0%';
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('currentTrackTitle').textContent = 'No Track Playing';
        document.getElementById('currentTrackArtist').textContent = '-';
    }

    playPrevious() {
        if (!this.currentTrack) return;
        
        const currentIndex = this.playlist.findIndex(s => s.id === this.currentTrack.id);
        if (currentIndex > 0) {
            this.playTrack(this.playlist[currentIndex - 1]);
        }
    }

    playNext() {
        if (!this.currentTrack) {
            if (this.playlist.length > 0) {
                this.playTrack(this.playlist[0]);
            }
            return;
        }
        
        const currentIndex = this.playlist.findIndex(s => s.id === this.currentTrack.id);
        if (currentIndex < this.playlist.length - 1) {
            this.playTrack(this.playlist[currentIndex + 1]);
        } else {
            this.stopPlayback();
        }
    }

    toggleRepeat() {
        const btn = document.getElementById('repeatBtn');
        btn.classList.toggle('active');
        this.showNotification('Repeat toggled', 'info');
    }

    pushToStreamer(song) {
        // In production, push to GO-AUDIO-BROADCASTER queue
        console.log('Pushing to streamer:', song);
        
        // Example API call:
        // fetch(`${this.config.serverUrl}/api/queue`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${this.config.apiToken}`
        //     },
        //     body: JSON.stringify({ track_id: song.id })
        // });
    }

    updateMixer(channel, value) {
        document.getElementById(`${channel}VolumeValue`).textContent = `${value}%`;
        
        // In production, send to mixer API
        console.log(`Mixer ${channel}: ${value}%`);
        
        // fetch(`${this.config.serverUrl}/api/mixer/${channel}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${this.config.apiToken}`
        //     },
        //     body: JSON.stringify({ volume: parseInt(value) })
        // });
    }

    toggleBreakingOptions() {
        const options = document.getElementById('breakingOptions');
        options.style.display = options.style.display === 'none' ? 'flex' : 'none';
    }

    triggerBreakingAudio() {
        const soundType = document.getElementById('breakingSound').value;
        const message = document.getElementById('breakingMessage').value;
        
        console.log('Triggering breaking audio:', { soundType, message });
        
        // In production, trigger breaking audio via API
        // fetch(`${this.config.serverUrl}/api/breaking`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${this.config.apiToken}`
        //     },
        //     body: JSON.stringify({ type: soundType, message })
        // });
        
        this.showNotification('Breaking audio triggered!', 'warning');
        this.toggleBreakingOptions();
    }

    async startPTT() {
        if (this.isPTTActive) return;
        
        try {
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            
            this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.isPTTActive = true;
            
            // Update UI
            const pttBtn = document.getElementById('pttBtn');
            const pttStatus = document.getElementById('pttStatus');
            
            pttBtn.classList.add('active');
            pttBtn.innerHTML = '<i class="fas fa-microphone"></i><span>TRANSMITTING...</span>';
            pttStatus.classList.add('active');
            pttStatus.querySelector('.ptt-text').textContent = 'Mic On Air';
            
            // Send audio to WebRTC ingress (GO-AUDIO-BROADCASTER)
            this.sendMicToWebRTC(this.micStream);
            
            this.showNotification('Microphone active - Press space or release button to stop', 'success');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showNotification('Failed to access microphone', 'error');
        }
    }

    stopPTT() {
        if (!this.isPTTActive) return;
        
        this.isPTTActive = false;
        
        // Stop mic stream
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        
        // Update UI
        const pttBtn = document.getElementById('pttBtn');
        const pttStatus = document.getElementById('pttStatus');
        
        pttBtn.classList.remove('active');
        pttBtn.innerHTML = '<i class="fas fa-microphone"></i><span>PUSH TO TALK</span>';
        pttStatus.classList.remove('active');
        pttStatus.querySelector('.ptt-text').textContent = 'Mic Off';
        
        // Stop WebRTC transmission
        this.stopWebRTCTransmission();
    }

    async sendMicToWebRTC(stream) {
        // In production, establish WebRTC connection to GO-AUDIO-BROADCASTER ingress
        console.log('Sending mic to WebRTC');
        
        // Example WebRTC setup:
        // const peerConnection = new RTCPeerConnection(this.getRTCIceServers());
        // stream.getTracks().forEach(track => {
        //     peerConnection.addTrack(track, stream);
        // });
        // 
        // const offer = await peerConnection.createOffer();
        // await peerConnection.setLocalDescription(offer);
        // 
        // Send offer to server and get answer
        // const response = await fetch(`${this.config.serverUrl}/api/webrtc/ingress`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${this.config.webrtcToken}`
        //     },
        //     body: JSON.stringify({ sdp: offer.sdp })
        // });
        // const answer = await response.json();
        // await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    stopWebRTCTransmission() {
        if (this.webrtcPeer) {
            this.webrtcPeer.close();
            this.webrtcPeer = null;
        }
    }

    async toggleMonitor() {
        if (this.isMonitoring) {
            this.stopMonitor();
        } else {
            await this.startMonitor();
        }
    }

    async startMonitor() {
        try {
            // In production, connect to WebRTC egress for monitoring
            console.log('Starting monitor');
            
            this.isMonitoring = true;
            
            // Update UI
            const monitorBtn = document.getElementById('monitorBtn');
            const monitorStatus = document.getElementById('monitorStatus');
            
            monitorBtn.classList.add('active');
            monitorBtn.innerHTML = '<i class="fas fa-headphones"></i><span>MONITORING...</span>';
            monitorStatus.classList.add('active');
            monitorStatus.querySelector('.monitor-text').textContent = 'Monitor On';
            
            // Example WebRTC monitoring setup:
            // const peerConnection = new RTCPeerConnection(this.getRTCIceServers());
            // peerConnection.ontrack = (event) => {
            //     const audioElement = new Audio();
            //     audioElement.srcObject = event.streams[0];
            //     audioElement.volume = document.getElementById('monitorVolume').value / 100;
            //     audioElement.play();
            //     this.monitorStream = audioElement;
            // };
            // 
            // Connect to monitoring endpoint
            // const response = await fetch(`${this.config.serverUrl}/api/webrtc/egress`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${this.config.webrtcToken}`
            //     }
            // });
            // const offer = await response.json();
            // await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            // const answer = await peerConnection.createAnswer();
            // await peerConnection.setLocalDescription(answer);
            
            this.showNotification('Monitoring started', 'info');
        } catch (error) {
            console.error('Error starting monitor:', error);
            this.showNotification('Failed to start monitoring', 'error');
        }
    }

    stopMonitor() {
        this.isMonitoring = false;
        
        if (this.monitorStream) {
            this.monitorStream.pause();
            this.monitorStream = null;
        }
        
        // Update UI
        const monitorBtn = document.getElementById('monitorBtn');
        const monitorStatus = document.getElementById('monitorStatus');
        
        monitorBtn.classList.remove('active');
        monitorBtn.innerHTML = '<i class="fas fa-headphones"></i><span>MONITOR</span>';
        monitorStatus.classList.remove('active');
        monitorStatus.querySelector('.monitor-text').textContent = 'Monitor Off';
        
        this.showNotification('Monitoring stopped', 'info');
    }

    getRTCIceServers() {
        return {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
                // Add TURN servers if needed
            ]
        };
    }

    openUploadModal() {
        document.getElementById('uploadModal').classList.add('active');
    }

    closeUploadModal() {
        document.getElementById('uploadModal').classList.remove('active');
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadList').innerHTML = '';
    }

    handleFileUpload(event) {
        const files = event.target.files;
        this.uploadFiles(files);
    }

    handleDropUpload(event) {
        const files = event.dataTransfer.files;
        this.uploadFiles(files);
    }

    uploadFiles(files) {
        const uploadList = document.getElementById('uploadList');
        const uploadProgress = document.getElementById('uploadProgress');
        
        uploadProgress.style.display = 'block';
        uploadList.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('audio/')) return;
            
            const uploadItem = document.createElement('div');
            uploadItem.className = 'upload-item';
            uploadItem.innerHTML = `
                <div class="upload-item-icon">
                    <i class="fas fa-file-audio"></i>
                </div>
                <div class="upload-item-info">
                    <div class="upload-item-name">${file.name}</div>
                    <div class="upload-item-status">Pending...</div>
                </div>
            `;
            uploadList.appendChild(uploadItem);
            
            this.uploadSingleFile(file, uploadItem.querySelector('.upload-item-status'));
        });
    }

    uploadSingleFile(file, statusElement) {
        // In production, upload to server
        // const formData = new FormData();
        // formData.append('file', file);
        // 
        // fetch(`${this.config.serverUrl}/api/upload`, {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${this.config.apiToken}`
        //     },
        //     body: formData
        // })
        // .then(response => response.json())
        // .then(data => {
        //     statusElement.textContent = 'Uploaded successfully';
        //     statusElement.style.color = '#10b981';
        //     this.loadLibrary();
        // })
        // .catch(error => {
        //     statusElement.textContent = 'Upload failed';
        //     statusElement.style.color = '#ef4444';
        // });
        
        // Simulate upload
        setTimeout(() => {
            statusElement.textContent = 'Uploaded successfully';
            statusElement.style.color = '#10b981';
            this.library.push({
                id: Date.now(),
                title: file.name.replace(/\.[^/.]+$/, ''),
                artist: 'Unknown Artist',
                duration: Math.floor(Math.random() * 300) + 120,
                genre: 'Unknown',
                cover: null
            });
            this.renderLibrary(this.library);
            this.updateLibraryStats();
        }, 2000);
    }

    startStreamInfoUpdates() {
        // Simulate stream info updates
        setInterval(() => {
            document.getElementById('streamListeners').textContent = Math.floor(Math.random() * 1000);
            document.getElementById('streamUptime').textContent = this.formatDuration(Math.floor(Date.now() / 1000));
        }, 5000);
    }

    handleKeyboardShortcuts(e) {
        // Space for PTT
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (e.type === 'keydown') {
                this.startPTT();
            }
        }
        
        // M for monitor
        if (e.code === 'KeyM' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.toggleMonitor();
        }
        
        // Space for play/pause when not using PTT
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && !e.shiftKey) {
            // Only if not using PTT
        }
    }

    formatDuration(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        // Simple notification (could be enhanced with a proper notification library)
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app
const radioOperator = new RadioOperator();

// Add CSS animations for toast notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
