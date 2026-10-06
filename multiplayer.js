// ============================================================
// PAHLAWAN BINTANG — multiplayer.js v17.12
// WebRTC P2P Engine untuk Co-op & PvP
// Signaling via Firebase, DataChannel untuk game data
// ============================================================

(function() {
'use strict';

// ============================================================
// KONFIGURASI
// ============================================================
const MP_CONFIG = {
  ROOM_CODE_LENGTH: 4,
  ROOM_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // tanpa I/O/0/1
  ROOM_TIMEOUT_MS: 60 * 60 * 1000,      // 1 jam
  PING_INTERVAL_MS: 3000,
  PING_TIMEOUT_MS: 15000,
  INPUT_THROTTLE_MS: 33,                 // ~30 Hz
  STATE_THROTTLE_MS: 50,                 // ~20 Hz
  CONNECT_TIMEOUT_MS: 20000,             // 20 detik timeout koneksi
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

// ============================================================
// MULTIPLAYER ENGINE
// ============================================================
class MultiplayerEngine {
  constructor() {
    // State
    this.role = null;                 // 'host' | 'guest' | null
    this.roomCode = null;
    this.mode = 'coop';               // 'coop' | 'pvp'
    this.playerName = null;
    this.playerKey = null;
    this.remotePeerName = null;
    this.remotePeerKey = null;

    // WebRTC
    this.peerConnection = null;
    this.dataChannel = null;

    // Status
    this.connectionState = 'idle';    // idle | creating | waiting | connecting | connected | error | closed
    this.isConnected = false;

    // Listeners & timers
    this._roomRef = null;
    this._roomListener = null;
    this._signalRef = null;
    this._offerListener = null;
    this._answerListener = null;
    this._hostIceRef = null;
    this._guestIceRef = null;
    this._hostIceListener = null;
    this._guestIceListener = null;

    this._pingTimer = null;
    this._pingCheckTimer = null;
    this._connectTimeout = null;
    this._lastPingReceived = 0;
    this._lastInputSent = 0;
    this._lastStateSent = 0;

    // Callbacks
    this._onState = null;
    this._onInput = null;
    this._onConnect = null;
    this._onDisconnect = null;
    this._onStatusChange = null;
    this._onError = null;
    this._onRemoteReady = null;
    this._onStart = null;
    this._onRoomJoined = null;
    this._onRoomFull = null;

    console.log('🎮 [MP] MultiplayerEngine initialized');
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Buat room baru (host)
   * @param {string} mode - 'coop' atau 'pvp'
   * @param {string} playerName - nama host
   * @returns {Promise<{roomCode: string}>}
   */
  async createRoom(mode, playerName) {
    if (typeof db === 'undefined' || !db) {
      throw new Error('Firebase tidak siap. Cek koneksi internet.');
    }

    this._cleanup(false);

    this.role = 'host';
    this.isHost = true;
    this.mode = mode || 'coop';
    this.playerName = playerName || 'Host';
    this.playerKey = this._makePlayerKey(this.playerName);

    // Generate kode room unik
    const code = await this._generateUniqueRoomCode();
    this.roomCode = code;

    // Simpan ke Firebase
    const roomData = {
      hostId: this.playerKey,
      hostName: this.playerName,
      guestId: null,
      guestName: null,
      mode: this.mode,
      status: 'waiting',
      createdAt: Date.now(),
      hostReady: false,
      guestReady: false
    };

    await this._roomRefSet(code, roomData);
    console.log('🏠 [MP] Room created:', code, '| Mode:', this.mode);

    this._setState('waiting');

    // Listen untuk guest join
    this._listenForGuest();

    // Auto-cleanup: hapus room setelah timeout
    this._scheduleRoomCleanup(code);

    return { roomCode: code };
  }

  /**
   * Join room existing (guest)
   * @param {string} code - kode room 4 huruf
   * @param {string} playerName - nama guest
   * @returns {Promise<{success: boolean, mode: string, hostName: string}>}
   */
  async joinRoom(code, playerName) {
    if (typeof db === 'undefined' || !db) {
      throw new Error('Firebase tidak siap. Cek koneksi internet.');
    }

    code = (code || '').toUpperCase().trim();
    if (code.length !== MP_CONFIG.ROOM_CODE_LENGTH) {
      throw new Error('Kode room harus ' + MP_CONFIG.ROOM_CODE_LENGTH + ' huruf');
    }

    this._cleanup(false);

    this.role = 'guest';
    this.isHost = false;
    this.roomCode = code;
    this.playerName = playerName || 'Guest';
    this.playerKey = this._makePlayerKey(this.playerName);

    // Cek apakah room ada
    const roomRef = db.ref('rooms/' + code);
    let snapshot;
    try {
      snapshot = await roomRef.once('value');
    } catch(e) {
      throw new Error('Gagal terhubung ke server. Coba lagi.');
    }

    if (!snapshot.exists()) {
      throw new Error('Room tidak ditemukan. Cek kode.');
    }

    const roomData = snapshot.val();

    // Cek apakah room sudah expired (> 1 jam)
    if (Date.now() - (roomData.createdAt || 0) > MP_CONFIG.ROOM_TIMEOUT_MS) {
      await roomRef.remove().catch(() => {});
      throw new Error('Room sudah kadaluarsa.');
    }

    // Cek apakah sudah ada guest
    if (roomData.guestId) {
      throw new Error('Room sudah penuh (2/2 pemain).');
    }

    // Cek apakah host = guest (tidak bisa join sendiri)
    if (roomData.hostId === this.playerKey) {
      throw new Error('Tidak bisa join room sendiri.');
    }

    this.mode = roomData.mode || 'coop';
    this.remotePeerName = roomData.hostName;
    this.remotePeerKey = roomData.hostId;

    // Update room dengan info guest
    await roomRef.update({
      guestId: this.playerKey,
      guestName: this.playerName,
      status: 'connecting'
    });

    console.log('🚪 [MP] Joined room:', code, 'as', this.playerName);
    this._setState('connecting');

    // Listen untuk offer dari host
    this._listenForOffer(code);

    // Timeout jika tidak connect
    this._startConnectTimeout();

    if (this._onRoomJoined) {
      try { this._onRoomJoined({ mode: this.mode, hostName: this.remotePeerName }); } catch(e) {}
    }

    return { success: true, mode: this.mode, hostName: this.remotePeerName };
  }

  /**
   * Keluar dari room dan bersihkan resource
   */
  async leaveRoom() {
    const code = this.roomCode;
    const wasHost = this.isHost;

    // Kirim pesan leave ke peer
    if (this.isConnected) {
      try { this.sendMessage({ type: 'leave' }); } catch(e) {}
    }

    this._cleanup(true);

    // Bersihkan Firebase
    if (code && typeof db !== 'undefined' && db) {
      try {
        const roomRef = db.ref('rooms/' + code);
        if (wasHost) {
          // Host hapus seluruh room
          await roomRef.remove();
        } else {
          // Guest hapus guest info
          await roomRef.update({
            guestId: null,
            guestName: null,
            status: 'waiting',
            guestReady: false
          });
        }
        await db.ref('signaling/' + code).remove();
      } catch(e) {
        console.warn('⚠️ [MP] Cleanup Firebase error:', e);
      }
    }

    this._setState('idle');
    console.log('🚪 [MP] Left room');
  }

  /**
   * Toggle ready status
   */
  async setReady(ready) {
    if (!this.roomCode || typeof db === 'undefined' || !db) return;
    const field = this.isHost ? 'hostReady' : 'guestReady';
    try {
      await db.ref('rooms/' + this.roomCode).update({ [field]: !!ready });
    } catch(e) {
      console.warn('⚠️ [MP] setReady error:', e);
    }
  }

  /**
   * Host: mulai game
   */
  async startGame() {
    if (!this.isHost) return;
    if (!this.roomCode || typeof db === 'undefined' || !db) return;

    const seed = Math.floor(Math.random() * 1000000);
    try {
      await db.ref('rooms/' + this.roomCode).update({
        status: 'playing',
        seed: seed,
        startedAt: Date.now()
      });
      // Kirim start signal langsung via DataChannel
      this.sendMessage({ type: 'start', seed: seed });
    } catch(e) {
      console.warn('⚠️ [MP] startGame error:', e);
    }
  }

  /**
   * Kirim input (dari guest ke host, atau host local tidak perlu)
   */
  sendInput(input) {
    if (!this.isConnected) return;
    const now = Date.now();
    if (now - this._lastInputSent < MP_CONFIG.INPUT_THROTTLE_MS) return;
    this._lastInputSent = now;

    this.sendMessage({
      type: 'input',
      left: !!input.left,
      right: !!input.right,
      shoot: !!input.shoot,
      skill1: !!input.skill1,
      skill2: !!input.skill2,
      t: now
    });
  }

  /**
   * Host: kirim state game ke guest
   */
  sendState(state) {
    if (!this.isConnected || !this.isHost) return;
    const now = Date.now();
    if (now - this._lastStateSent < MP_CONFIG.STATE_THROTTLE_MS) return;
    this._lastStateSent = now;

    this.sendMessage({
      type: 'state',
      t: now,
      data: state
    });
  }

  /**
   * Kirim pesan custom
   */
  sendMessage(msg) {
    if (!this.dataChannel) return false;
    if (this.dataChannel.readyState !== 'open') return false;
    try {
      this.dataChannel.send(JSON.stringify(msg));
      return true;
    } catch(e) {
      console.warn('⚠️ [MP] send error:', e);
      return false;
    }
  }

  // ============================================================
  // CALLBACKS
  // ============================================================
  onState(cb) { this._onState = cb; }
  onInput(cb) { this._onInput = cb; }
  onConnect(cb) { this._onConnect = cb; }
  onDisconnect(cb) { this._onDisconnect = cb; }
  onStatusChange(cb) { this._onStatusChange = cb; }
  onError(cb) { this._onError = cb; }
  onRemoteReady(cb) { this._onRemoteReady = cb; }
  onStart(cb) { this._onStart = cb; }
  onRoomJoined(cb) { this._onRoomJoined = cb; }
  onRoomFull(cb) { this._onRoomFull = cb; }

  // ============================================================
  // PRIVATE — ROOM MANAGEMENT
  // ============================================================

  _makePlayerKey(name) {
    return 'p_' + (name || 'player').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) +
           '_' + Math.random().toString(36).slice(2, 6);
  }

  _generateRoomCode() {
    let code = '';
    for (let i = 0; i < MP_CONFIG.ROOM_CODE_LENGTH; i++) {
      code += MP_CONFIG.ROOM_CODE_CHARS[Math.floor(Math.random() * MP_CONFIG.ROOM_CODE_CHARS.length)];
    }
    return code;
  }

  async _generateUniqueRoomCode() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = this._generateRoomCode();
      try {
        const snap = await db.ref('rooms/' + code).once('value');
        if (!snap.exists()) return code;
      } catch(e) {
        // Kalau error, coba generate lagi
      }
    }
    // Fallback: pakai timestamp
    return 'R' + Date.now().toString(36).slice(-3).toUpperCase();
  }

  _scheduleRoomCleanup(code) {
    // Cleanup otomatis di sisi client kalau ada yang tinggalkan room terbuka
    setTimeout(() => {
      if (this.roomCode === code && this.isHost) {
        console.log('🧹 [MP] Room timeout, cleaning up...');
        this.leaveRoom();
      }
    }, MP_CONFIG.ROOM_TIMEOUT_MS);
  }

  // ============================================================
  // PRIVATE — SIGNALING (Firebase)
  // ============================================================

  async _roomRefSet(code, data) {
    await db.ref('rooms/' + code).set(data);
  }

  /**
   * HOST: listen kalau ada guest yang join
   */
  _listenForGuest() {
    const code = this.roomCode;
    this._roomRef = db.ref('rooms/' + code);

    this._roomListener = this._roomRef.on('value', async (snapshot) => {
      if (!snapshot.exists()) {
        // Room dihapus (expired)
        if (this.isHost) {
          this._emitError('Room kadaluarsa.');
          this.leaveRoom();
        }
        return;
      }
      const data = snapshot.val();

      // Update remote peer info
      if (data.guestId && data.guestName) {
        this.remotePeerName = data.guestName;
        this.remotePeerKey = data.guestId;

        // Trigger remote ready changes
        if (this._onRemoteReady) {
          try { this._onRemoteReady(!!data.guestReady); } catch(e) {}
        }
      }

      // Guest baru join → mulai WebRTC handshake
      if (data.guestId && data.status === 'connecting' && !this.peerConnection) {
        console.log('👥 [MP] Guest joined:', data.guestName);
        this._setState('connecting');
        try {
          await this._setupPeerConnection();
          await this._createOffer();
        } catch(e) {
          console.error('❌ [MP] WebRTC setup error (host):', e);
          this._emitError('Gagal memulai koneksi: ' + e.message);
          this._setState('error');
        }
      }

      // Kalau guest keluar (guestId null) setelah connected
      if (this.isConnected && !data.guestId) {
        console.log('👋 [MP] Guest left');
        if (this._onDisconnect) {
          try { this._onDisconnect('guest'); } catch(e) {}
        }
      }

      // Game start signal dari room
      if (data.status === 'playing' && data.seed && this._onStart) {
        try { this._onStart({ seed: data.seed }); } catch(e) {}
      }
    }, (err) => {
      console.error('❌ [MP] Room listener error:', err);
      this._emitError('Koneksi ke server terputus.');
    });
  }

  /**
   * GUEST: listen untuk offer dari host
   */
  _listenForOffer(code) {
    this._offerListener = db.ref('signaling/' + code + '/offer').on('value', async (snapshot) => {
      if (!snapshot.exists()) return;
      if (this.peerConnection) return; // sudah diproses

      const offer = snapshot.val();
      console.log('📨 [MP] Received offer from host');
      try {
        await this._setupPeerConnection();
        await this._handleOffer(offer);
      } catch(e) {
        console.error('❌ [MP] WebRTC answer error (guest):', e);
        this._emitError('Gagal menjawab koneksi: ' + e.message);
        this._setState('error');
      }
    });

    // Listen answer juga (untuk safety)
    this._answerListener = db.ref('signaling/' + code + '/answer').on('value', () => {});
  }

  /**
   * HOST: setup WebRTC peer connection + data channel
   */
  async _setupPeerConnection() {
    if (this.peerConnection) return;

    console.log('🔧 [MP] Setting up PeerConnection as', this.role);
    this.peerConnection = new RTCPeerConnection({
      iceServers: MP_CONFIG.ICE_SERVERS,
      iceCandidatePoolSize: 10
    });

    // Connection state handlers
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.roomCode) {
        const field = this.isHost ? 'hostIce' : 'guestIce';
        const key = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        db.ref('signaling/' + this.roomCode + '/' + field + '/' + key)
          .set(event.candidate.toJSON())
          .catch(() => {});
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const s = this.peerConnection.iceConnectionState;
      console.log('🧊 [MP] ICE state:', s);
      if (s === 'failed') {
        this._emitError('Koneksi gagal. Coba lagi.');
        this._setState('error');
      } else if (s === 'disconnected') {
        this._emitError('Koneksi terputus.');
        this._setState('connecting');
      } else if (s === 'connected' || s === 'completed') {
        // Koneksi OK, tunggu datachannel open
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const s = this.peerConnection.connectionState;
      console.log('🔗 [MP] Peer state:', s);
      if (s === 'failed' || s === 'closed') {
        this._handlePeerClosed();
      }
    };

    // HOST: create DataChannel
    if (this.isHost) {
      this._setupDataChannel(this.peerConnection.createDataChannel('game', {
        ordered: false,
        maxRetransmits: 0
      }));
    } else {
      // GUEST: terima data channel dari host
      this.peerConnection.ondatachannel = (event) => {
        console.log('📡 [MP] DataChannel received from host');
        this._setupDataChannel(event.channel);
      };
    }

    // Listen untuk remote ICE candidates
    this._listenForRemoteICE();
  }

  /**
   * Setup data channel handlers
   */
  _setupDataChannel(channel) {
    this.dataChannel = channel;

    channel.onopen = () => {
      console.log('✅ [MP] DataChannel OPEN');
      this.isConnected = true;
      this._clearConnectTimeout();
      this._setState('connected');
      this._startPingLoop();

      // Kirim hello
      this.sendMessage({
        type: 'hello',
        name: this.playerName,
        key: this.playerKey,
        mode: this.mode
      });

      // Notify UI
      if (this._onConnect) {
        try {
          this._onConnect({
            role: this.role,
            peerName: this.remotePeerName,
            mode: this.mode
          });
        } catch(e) {}
      }
    };

    channel.onclose = () => {
      console.log('🚪 [MP] DataChannel CLOSED');
      this._handlePeerClosed();
    };

    channel.onerror = (e) => {
      console.error('❌ [MP] DataChannel error:', e);
    };

    channel.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch(e) { return; }
      this._handleMessage(msg);
    };
  }

  /**
   * Handle incoming messages
   */
  _handleMessage(msg) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'hello':
        console.log('👋 [MP] Hello from', msg.name);
        this.remotePeerName = msg.name;
        this.remotePeerKey = msg.key;
        break;

      case 'ping':
        this._lastPingReceived = Date.now();
        this.sendMessage({ type: 'pong' });
        break;

      case 'pong':
        this._lastPingReceived = Date.now();
        break;

      case 'input':
        // Host: terima input dari guest
        if (this.isHost && this._onInput) {
          try { this._onInput({
            left: !!msg.left,
            right: !!msg.right,
            shoot: !!msg.shoot,
            skill1: !!msg.skill1,
            skill2: !!msg.skill2
          }); } catch(e) {}
        }
        break;

      case 'state':
        // Guest: terima state dari host
        if (!this.isHost && this._onState) {
          try { this._onState(msg.data); } catch(e) {}
        }
        break;

      case 'ready':
        // Remote player ready status
        if (this._onRemoteReady) {
          try { this._onRemoteReady(!!msg.value); } catch(e) {}
        }
        break;

      case 'start':
        // Guest: host mulai game
        if (!this.isHost && this._onStart) {
          try { this._onStart({ seed: msg.seed }); } catch(e) {}
        }
        break;

      case 'leave':
        console.log('👋 [MP] Remote player left');
        this._handlePeerClosed();
        break;

      default:
        // Custom message — bisa diperluas nanti
        break;
    }
  }

  /**
   * Listen remote ICE candidates
   */
  _listenForRemoteICE() {
    const code = this.roomCode;
    if (!code) return;

    const remoteField = this.isHost ? 'guestIce' : 'hostIce';
    this._hostIceRef = db.ref('signaling/' + code + '/' + remoteField);

    this._hostIceListener = this._hostIceRef.on('child_added', async (snapshot) => {
      if (!this.peerConnection) return;
      const candidate = snapshot.val();
      if (!candidate) return;
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch(e) {
        console.warn('⚠️ [MP] Add ICE candidate error:', e.message);
      }
    });
  }

  /**
   * HOST: create and send offer
   */
  async _createOffer() {
    if (!this.peerConnection) return;

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    await db.ref('signaling/' + this.roomCode + '/offer').set({
      type: offer.type,
      sdp: offer.sdp
    });
    console.log('📤 [MP] Offer sent');

    // Listen untuk answer dari guest
    this._answerListener = db.ref('signaling/' + this.roomCode + '/answer').on('value', async (snapshot) => {
      if (!snapshot.exists()) return;
      if (this.peerConnection.signalingState !== 'have-local-offer') return;

      const answer = snapshot.val();
      console.log('📨 [MP] Answer received');
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch(e) {
        console.warn('⚠️ [MP] Set answer error:', e.message);
      }
    });

    this._startConnectTimeout();
  }

  /**
   * GUEST: handle offer and send answer
   */
  async _handleOffer(offer) {
    if (!this.peerConnection) return;

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    await db.ref('signaling/' + this.roomCode + '/answer').set({
      type: answer.type,
      sdp: answer.sdp
    });
    console.log('📤 [MP] Answer sent');
  }

  // ============================================================
  // PRIVATE — PING / KEEPALIVE
  // ============================================================

  _startPingLoop() {
    this._lastPingReceived = Date.now();

    this._pingTimer = setInterval(() => {
      if (!this.isConnected) return;
      this.sendMessage({ type: 'ping' });
    }, MP_CONFIG.PING_INTERVAL_MS);

    this._pingCheckTimer = setInterval(() => {
      if (!this.isConnected) return;
      if (Date.now() - this._lastPingReceived > MP_CONFIG.PING_TIMEOUT_MS) {
        console.warn('⏱️ [MP] Ping timeout');
        this._handlePeerClosed();
      }
    }, 5000);
  }

  _stopPingLoop() {
    if (this._pingTimer) { clearInterval(this._pingTimer); this._pingTimer = null; }
    if (this._pingCheckTimer) { clearInterval(this._pingCheckTimer); this._pingCheckTimer = null; }
  }

  // ============================================================
  // PRIVATE — CONNECTION TIMEOUT
  // ============================================================

  _startConnectTimeout() {
    this._clearConnectTimeout();
    this._connectTimeout = setTimeout(() => {
      if (!this.isConnected && this.connectionState !== 'error') {
        console.warn('⏱️ [MP] Connection timeout');
        this._emitError('Koneksi timeout. Coba lagi.');
        this._setState('error');
      }
    }, MP_CONFIG.CONNECT_TIMEOUT_MS);
  }

  _clearConnectTimeout() {
    if (this._connectTimeout) {
      clearTimeout(this._connectTimeout);
      this._connectTimeout = null;
    }
  }

  // ============================================================
  // PRIVATE — CLEANUP
  // ============================================================

  _handlePeerClosed() {
    if (!this.isConnected && this.connectionState === 'idle') return;

    const wasConnected = this.isConnected;
    this.isConnected = false;

    if (wasConnected && this._onDisconnect) {
      try { this._onDisconnect('peer'); } catch(e) {}
    }
    this._setState('closed');
  }

  /**
   * Bersihkan semua resource
   * @param {boolean} keepFirebaseListeners - true kalau leaveRoom(), false kalau restart
   */
  _cleanup(keepFirebaseListeners) {
    // Stop timers
    this._stopPingLoop();
    this._clearConnectTimeout();

    // Close data channel
    if (this.dataChannel) {
      try {
        if (this.dataChannel.readyState === 'open') {
          this.dataChannel.close();
        }
      } catch(e) {}
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch(e) {}
      this.peerConnection = null;
    }

    // Remove Firebase listeners
    if (typeof db !== 'undefined' && db) {
      try {
        if (this._roomRef && this._roomListener) {
          this._roomRef.off('value', this._roomListener);
        }
        if (this._signalRef && this._offerListener) {
          this._signalRef.off('value', this._offerListener);
        }
        if (this._answerListener && this.roomCode) {
          db.ref('signaling/' + this.roomCode + '/answer').off('value', this._answerListener);
        }
        if (this._hostIceRef && this._hostIceListener) {
          this._hostIceRef.off('child_added', this._hostIceListener);
        }
      } catch(e) {}
    }

    // Reset references
    this._roomRef = null;
    this._roomListener = null;
    this._signalRef = null;
    this._offerListener = null;
    this._answerListener = null;
    this._hostIceRef = null;
    this._hostIceListener = null;
    this._guestIceRef = null;
    this._guestIceListener = null;

    if (!keepFirebaseListeners) {
      // Reset state ringan (untuk createRoom/joinRoom baru)
    } else {
      // Reset penuh (untuk leaveRoom)
      this.role = null;
      this.roomCode = null;
      this.remotePeerName = null;
      this.remotePeerKey = null;
      this.isConnected = false;
    }
  }

  // ============================================================
  // PRIVATE — UTIL
  // ============================================================

  _setState(newState) {
    if (this.connectionState === newState) return;
    this.connectionState = newState;
    console.log('🔄 [MP] State:', newState);
    if (this._onStatusChange) {
      try { this._onStatusChange(newState); } catch(e) {}
    }
  }

  _emitError(msg) {
    console.error('⚠️ [MP]', msg);
    if (this._onError) {
      try { this._onError(msg); } catch(e) {}
    }
  }
}

// ============================================================
// EXPORT
// ============================================================
window.MultiplayerEngine = MultiplayerEngine;
window.MP = new MultiplayerEngine();

console.log('✅ [MP] multiplayer.js loaded');

})();
