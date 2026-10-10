// ============================================================
// PAHLAWAN BINTANG — multiplayer.js v20.8.2
// "Ultra Responsive Analog Sync Edition"
// ------------------------------------------------------------
// v20.8.2 CHANGES:
//   1. INPUT_THROTTLE_MS: 33 → 16  (60fps input dari guest)
//   2. STATE_THROTTLE_MS: 50 → 33  (30fps state sync dari host)
//   3. PING_INTERVAL_MS: 3000 → 2000 (deteksi disconnect lebih cepat)
//   4. Kompatibel penuh dengan game.js v20.8.2
// ============================================================

(function() {
'use strict';

const MP_CONFIG = {
  ROOM_CODE_LENGTH: 4,
  ROOM_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  ROOM_TIMEOUT_MS: 60 * 60 * 1000,
  PING_INTERVAL_MS: 2000,       // 🔥 v20.8.2: 3000 → 2000
  PING_TIMEOUT_MS: 15000,
  INPUT_THROTTLE_MS: 16,        // 🔥 v20.8.2: 33 → 16 (60fps)
  STATE_THROTTLE_MS: 33,        // 🔥 v20.8.2: 50 → 33 (30fps)
  CONNECT_TIMEOUT_MS: 25000,
  ICE_GATHERING_TIMEOUT_MS: 3000,

  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.nextcloud.com:443' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

class MultiplayerEngine {
  constructor() {
    this.role = null;
    this.isHost = false;
    this.roomCode = null;
    this.mode = 'coop';
    this.playerName = null;
    this.playerKey = null;
    this.remotePeerName = null;
    this.remotePeerKey = null;

    this.peerConnection = null;
    this.dataChannel = null;
    this.controlChannel = null;
    this.stateChannel = null;

    this.connectionState = 'idle';
    this.isConnected = false;

    this._roomRef = null;
    this._roomListener = null;
    this._signalRef = null;
    this._offerListener = null;
    this._answerListener = null;
    this._hostIceRef = null;
    this._hostIceListener = null;

    this._pingTimer = null;
    this._pingCheckTimer = null;
    this._connectTimeout = null;
    this._cleanupTimer = null;
    this._lastPingReceived = 0;
    this._lastInputSent = 0;
    this._lastStateSent = 0;

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

    console.log('🎮 [MP] MultiplayerEngine initialized (v20.8.2)');
  }

  async createRoom(mode, playerName) {
    if (typeof db === 'undefined' || !db) throw new Error('Firebase tidak siap. Cek koneksi internet.');
    this._cleanup(false);

    this.role = 'host';
    this.isHost = true;
    this.mode = mode || 'coop';
    this.playerName = playerName || 'Host';
    this.playerKey = this._makePlayerKey(this.playerName);

    const code = await this._generateUniqueRoomCode();
    this.roomCode = code;

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
    this._listenForGuest();
    this._scheduleRoomCleanup(code);
    return { roomCode: code };
  }

  async joinRoom(code, playerName) {
    if (typeof db === 'undefined' || !db) throw new Error('Firebase tidak siap. Cek koneksi internet.');
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

    const roomRef = db.ref('rooms/' + code);
    let snapshot;
    try { snapshot = await roomRef.once('value'); }
    catch(e) { throw new Error('Gagal terhubung ke server. Coba lagi.'); }

    if (!snapshot.exists()) throw new Error('Room tidak ditemukan. Cek kode.');
    const roomData = snapshot.val();

    if (Date.now() - (roomData.createdAt || 0) > MP_CONFIG.ROOM_TIMEOUT_MS) {
      await roomRef.remove().catch(() => {});
      throw new Error('Room sudah kadaluarsa.');
    }
    if (roomData.guestId) throw new Error('Room sudah penuh (2/2 pemain).');
    if (roomData.hostId === this.playerKey) throw new Error('Tidak bisa join room sendiri.');

    this.mode = roomData.mode || 'coop';
    this.remotePeerName = roomData.hostName;
    this.remotePeerKey = roomData.hostId;

    await roomRef.update({
      guestId: this.playerKey,
      guestName: this.playerName,
      status: 'connecting'
    });

    console.log('🚪 [MP] Joined room:', code, 'as', this.playerName);
    this._setState('connecting');
    this._listenForOffer(code);
    this._startConnectTimeout();

    if (this._onRoomJoined) {
      try { this._onRoomJoined({ mode: this.mode, hostName: this.remotePeerName }); } catch(e) {}
    }
    return { success: true, mode: this.mode, hostName: this.remotePeerName };
  }

  async leaveRoom() {
    const code = this.roomCode;
    const wasHost = this.isHost;

    if (this.isConnected) {
      try { this.sendMessage({ type: 'leave' }); } catch(e) {}
    }

    this._cleanup(true);

    if (code && typeof db !== 'undefined' && db) {
      try {
        const roomRef = db.ref('rooms/' + code);
        if (wasHost) {
          await roomRef.remove();
        } else {
          await roomRef.update({
            guestId: null, guestName: null,
            status: 'waiting', guestReady: false
          });
        }
        await db.ref('signaling/' + code).remove();
      } catch(e) { console.warn('⚠️ [MP] Cleanup Firebase error:', e); }
    }
    this._setState('idle');
    console.log('🚪 [MP] Left room');
  }

  async setReady(ready) {
    if (!this.roomCode || typeof db === 'undefined' || !db) return;
    const field = this.isHost ? 'hostReady' : 'guestReady';
    try { await db.ref('rooms/' + this.roomCode).update({ [field]: !!ready }); }
    catch(e) { console.warn('⚠️ [MP] setReady error:', e); }
  }

  async startGame() {
    if (!this.isHost) return;
    if (!this.roomCode || typeof db === 'undefined' || !db) return;
    const seed = Math.floor(Math.random() * 1000000);
    try {
      await db.ref('rooms/' + this.roomCode).update({
        status: 'playing', seed: seed, startedAt: Date.now()
      });
      this.sendMessage({ type: 'start', seed: seed });
    } catch(e) { console.warn('⚠️ [MP] startGame error:', e); }
  }

  // 🔥 v20.8.2 — Forward moveX (analog axis) dengan throttle 16ms
  sendInput(input) {
    if (!this.isConnected) return;
    const now = Date.now();
    if (now - this._lastInputSent < MP_CONFIG.INPUT_THROTTLE_MS) return;
    this._lastInputSent = now;

    this.sendMessage({
      type: 'input',
      left: !!input.left,
      right: !!input.right,
      moveX: (typeof input.moveX === 'number') ? input.moveX : 0,
      shoot: !!input.shoot,
      skill1: !!input.skill1,
      skill2: !!input.skill2,
      skill3: !!input.skill3,
      heroType: input.heroType || 'robot',
      spectator: !!input.spectator,
      respawn: !!input.respawn,
      pause: !!input.pause,
      resume: !!input.resume,
      t: now
    });
  }

  sendState(state) {
    if (!this.isConnected || !this.isHost) return;
    const now = Date.now();
    if (now - this._lastStateSent < MP_CONFIG.STATE_THROTTLE_MS) return;
    this._lastStateSent = now;
    this.sendMessage({ type: 'state', t: now, data: state });
  }

  sendMessage(msg) {
    if (!msg || !msg.type) return false;
    const isControl = ['hello','leave','ready','start','ping','pong',
                       'pause','resume','respawn','spectator_flag'].includes(msg.type);
    const hasControlFlag = msg.type === 'input' &&
                          (msg.pause || msg.resume || msg.respawn);

    const ch = (isControl || hasControlFlag) && this.controlChannel
      ? this.controlChannel
      : (this.stateChannel || this.dataChannel);

    if (!ch) return false;
    if (ch.readyState !== 'open') return false;
    try { ch.send(JSON.stringify(msg)); return true; }
    catch(e) { console.warn('⚠️ [MP] send error:', e); return false; }
  }

  onState(cb)       { this._onState = cb; }
  onInput(cb)       { this._onInput = cb; }
  onConnect(cb)     { this._onConnect = cb; }
  onDisconnect(cb)  { this._onDisconnect = cb; }
  onStatusChange(cb){ this._onStatusChange = cb; }
  onError(cb)       { this._onError = cb; }
  onRemoteReady(cb) { this._onRemoteReady = cb; }
  onStart(cb)       { this._onStart = cb; }
  onRoomJoined(cb)  { this._onRoomJoined = cb; }
  onRoomFull(cb)    { this._onRoomFull = cb; }

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
      } catch(e) {}
    }
    return 'R' + Date.now().toString(36).slice(-3).toUpperCase();
  }

  _scheduleRoomCleanup(code) {
    if (this._cleanupTimer) clearTimeout(this._cleanupTimer);
    this._cleanupTimer = setTimeout(() => {
      if (this.roomCode === code && this.isHost) {
        console.log('🧹 [MP] Room timeout, cleaning up...');
        this.leaveRoom();
      }
    }, MP_CONFIG.ROOM_TIMEOUT_MS);
  }

  async _roomRefSet(code, data) { await db.ref('rooms/' + code).set(data); }

  _listenForGuest() {
    const code = this.roomCode;
    this._roomRef = db.ref('rooms/' + code);
    this._roomListener = this._roomRef.on('value', async (snapshot) => {
      if (!snapshot.exists()) {
        if (this.isHost) { this._emitError('Room kadaluarsa.'); this.leaveRoom(); }
        return;
      }
      const data = snapshot.val();
      if (data.guestId && data.guestName) {
        this.remotePeerName = data.guestName;
        this.remotePeerKey = data.guestId;
        if (this._onRemoteReady) {
          try { this._onRemoteReady(!!data.guestReady); } catch(e) {}
        }
      }
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
      if (this.isConnected && !data.guestId) {
        console.log('👋 [MP] Guest left');
        if (this._onDisconnect) { try { this._onDisconnect('guest'); } catch(e) {} }
      }
      if (data.status === 'playing' && data.seed && this._onStart) {
        try { this._onStart({ seed: data.seed }); } catch(e) {}
      }
    }, (err) => {
      console.error('❌ [MP] Room listener error:', err);
      this._emitError('Koneksi ke server terputus.');
    });
  }

  _listenForOffer(code) {
    this._signalRef = db.ref('signaling/' + code + '/offer');
    this._offerListener = this._signalRef.on('value', async (snapshot) => {
      if (!snapshot.exists()) return;
      if (this.peerConnection) return;
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
    this._answerListener = db.ref('signaling/' + code + '/answer').on('value', () => {});
  }

  _waitForIceGathering(timeoutMs) {
    return new Promise((resolve) => {
      if (!this.peerConnection) return resolve();
      if (this.peerConnection.iceGatheringState === 'complete') {
        console.log('🧊 [MP] ICE already complete');
        return resolve();
      }
      const timer = setTimeout(() => {
        console.log('⏱️ [MP] ICE gathering timeout (' + timeoutMs + 'ms), continue anyway');
        cleanup(); resolve();
      }, timeoutMs);
      const checkState = () => {
        if (this.peerConnection.iceGatheringState === 'complete') {
          console.log('🧊 [MP] ICE gathering complete');
          cleanup(); resolve();
        }
      };
      const cleanup = () => {
        clearTimeout(timer);
        try { this.peerConnection.removeEventListener('icegatheringstatechange', checkState); }
        catch(e) {}
      };
      this.peerConnection.addEventListener('icegatheringstatechange', checkState);
    });
  }

  async _setupPeerConnection() {
    if (this.peerConnection) return;
    console.log('🔧 [MP] Setting up PeerConnection as', this.role);

    if (typeof RTCPeerConnection === 'undefined') {
      throw new Error('Browser tidak mendukung WebRTC.');
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: MP_CONFIG.ICE_SERVERS,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.roomCode) {
        const field = this.isHost ? 'hostIce' : 'guestIce';
        const key = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        db.ref('signaling/' + this.roomCode + '/' + field + '/' + key)
          .set(event.candidate.toJSON()).catch(() => {});
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
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const s = this.peerConnection.connectionState;
      console.log('🔗 [MP] Peer state:', s);
      if (s === 'failed' || s === 'closed') this._handlePeerClosed();
    };

    if (this.isHost) {
      this.controlChannel = this.peerConnection.createDataChannel('control', {
        ordered: true
      });
      this.stateChannel = this.peerConnection.createDataChannel('state', {
        ordered: false,
        maxRetransmits: 0
      });
      this._setupControlChannel(this.controlChannel);
      this._setupStateChannel(this.stateChannel);
    } else {
      this.peerConnection.ondatachannel = (event) => {
        const ch = event.channel;
        console.log('📡 [MP] DataChannel received:', ch.label);
        if (ch.label === 'control') this._setupControlChannel(ch);
        else if (ch.label === 'state') this._setupStateChannel(ch);
        else this._setupStateChannel(ch);
      };
    }

    this._listenForRemoteICE();
  }

  _setupControlChannel(channel) {
    this.controlChannel = channel;
    channel.onopen = () => {
      console.log('✅ [MP] Control channel OPEN');
      this._checkFullyConnected();
    };
    channel.onclose = () => {
      console.log('🚪 [MP] Control channel CLOSED');
      this._handlePeerClosed();
    };
    channel.onerror = (e) => console.error('❌ [MP] Control channel error:', e);
    channel.onmessage = (event) => {
      let msg; try { msg = JSON.parse(event.data); } catch(e) { return; }
      this._handleMessage(msg);
    };
  }

  _setupStateChannel(channel) {
    this.stateChannel = channel;
    this.dataChannel = channel;
    channel.onopen = () => {
      console.log('✅ [MP] State channel OPEN');
      this._checkFullyConnected();
    };
    channel.onclose = () => {
      console.log('🚪 [MP] State channel CLOSED');
      this._handlePeerClosed();
    };
    channel.onerror = (e) => console.error('❌ [MP] State channel error:', e);
    channel.onmessage = (event) => {
      let msg; try { msg = JSON.parse(event.data); } catch(e) { return; }
      this._handleMessage(msg);
    };
  }

  _checkFullyConnected() {
    const ctrl = this.controlChannel && this.controlChannel.readyState === 'open';
    const st = this.stateChannel && this.stateChannel.readyState === 'open';
    if (!ctrl || !st) return;
    if (this.isConnected) return;

    console.log('✅ [MP] Both channels OPEN — fully connected');
    this.isConnected = true;
    this._clearConnectTimeout();
    this._setState('connected');
    this._startPingLoop();

    this.sendMessage({
      type: 'hello',
      name: this.playerName,
      key: this.playerKey,
      mode: this.mode
    });

    if (this._onConnect) {
      try {
        this._onConnect({ role: this.role, peerName: this.remotePeerName, mode: this.mode });
      } catch(e) {}
    }
  }

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
        if (this.isHost && this._onInput) {
          try {
            this._onInput({
              left: !!msg.left,
              right: !!msg.right,
              moveX: (typeof msg.moveX === 'number') ? msg.moveX : 0,
              shoot: !!msg.shoot,
              skill1: !!msg.skill1,
              skill2: !!msg.skill2,
              skill3: !!msg.skill3,
              heroType: msg.heroType || 'robot',
              spectator: msg.spectator !== undefined ? !!msg.spectator : undefined,
              respawn: !!msg.respawn,
              pause: !!msg.pause,
              resume: !!msg.resume
            });
          } catch(e) {}
        }
        break;
      case 'state':
        if (!this.isHost && this._onState) {
          try { this._onState(msg.data); } catch(e) {}
        }
        break;
      case 'ready':
        if (this._onRemoteReady) { try { this._onRemoteReady(!!msg.value); } catch(e) {} }
        break;
      case 'start':
        if (!this.isHost && this._onStart) { try { this._onStart({ seed: msg.seed }); } catch(e) {} }
        break;
      case 'leave':
        console.log('👋 [MP] Remote player left');
        this._handlePeerClosed();
        break;
      default: break;
    }
  }

  _listenForRemoteICE() {
    const code = this.roomCode;
    if (!code) return;
    const remoteField = this.isHost ? 'guestIce' : 'hostIce';
    this._hostIceRef = db.ref('signaling/' + code + '/' + remoteField);
    this._hostIceListener = this._hostIceRef.on('value', async (snapshot) => {
      if (!snapshot.exists() || !this.peerConnection) return;
      const data = snapshot.val();
      const candidates = Object.values(data || {});
      for (const cand of candidates) {
        if (cand && typeof cand === 'object') {
          try { await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand)); }
          catch(e) {}
        }
      }
    });
  }

  async _createOffer() {
    if (!this.peerConnection) return;
    const t0 = Date.now();
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('📝 [MP] Local description set (host)');
    await this._waitForIceGathering(MP_CONFIG.ICE_GATHERING_TIMEOUT_MS);
    const localDesc = this.peerConnection.localDescription;
    await db.ref('signaling/' + this.roomCode + '/offer').set({
      type: localDesc.type, sdp: localDesc.sdp
    });
    console.log('📤 [MP] Offer sent with ICE (' + (Date.now() - t0) + 'ms)');

    this._answerListener = db.ref('signaling/' + this.roomCode + '/answer').on('value', async (snapshot) => {
      if (!snapshot.exists()) return;
      if (this.peerConnection.signalingState !== 'have-local-offer') return;
      const answer = snapshot.val();
      console.log('📨 [MP] Answer received');
      try { await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer)); }
      catch(e) { console.warn('⚠️ [MP] Set answer error:', e.message); }
    });

    this._startConnectTimeout();
  }

  async _handleOffer(offer) {
    if (!this.peerConnection) return;
    const t0 = Date.now();
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('📝 [MP] Remote description set (guest)');
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    console.log('📝 [MP] Local answer created');
    await this._waitForIceGathering(MP_CONFIG.ICE_GATHERING_TIMEOUT_MS);
    const localDesc = this.peerConnection.localDescription;
    await db.ref('signaling/' + this.roomCode + '/answer').set({
      type: localDesc.type, sdp: localDesc.sdp
    });
    console.log('📤 [MP] Answer sent with ICE (' + (Date.now() - t0) + 'ms)');
  }

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
    if (this._connectTimeout) { clearTimeout(this._connectTimeout); this._connectTimeout = null; }
  }

  _handlePeerClosed() {
    if (!this.isConnected && this.connectionState === 'idle') return;
    const wasConnected = this.isConnected;
    this.isConnected = false;
    if (wasConnected && this._onDisconnect) {
      try { this._onDisconnect('peer'); } catch(e) {}
    }
    this._setState('closed');
  }

  _cleanup(clearState) {
    this._stopPingLoop();
    this._clearConnectTimeout();
    if (this._cleanupTimer) { clearTimeout(this._cleanupTimer); this._cleanupTimer = null; }

    [this.controlChannel, this.stateChannel, this.dataChannel].forEach(ch => {
      if (!ch) return;
      try { if (ch.readyState === 'open' || ch.readyState === 'connecting') ch.close(); }
      catch(e) {}
    });
    this.controlChannel = null;
    this.stateChannel = null;
    this.dataChannel = null;

    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch(e) {}
      this.peerConnection = null;
    }

    if (typeof db !== 'undefined' && db) {
      try {
        if (this._roomRef && this._roomListener) this._roomRef.off('value', this._roomListener);
        if (this._signalRef && this._offerListener) this._signalRef.off('value', this._offerListener);
        if (this._answerListener && this.roomCode)
          db.ref('signaling/' + this.roomCode + '/answer').off('value', this._answerListener);
        if (this._hostIceRef && this._hostIceListener)
          this._hostIceRef.off('value', this._hostIceListener);
      } catch(e) {}
    }

    this._roomRef = null; this._roomListener = null;
    this._signalRef = null; this._offerListener = null;
    this._answerListener = null;
    this._hostIceRef = null; this._hostIceListener = null;

    if (clearState) {
      this.role = null;
      this.isHost = false;
      this.roomCode = null;
      this.remotePeerName = null;
      this.remotePeerKey = null;
      this.isConnected = false;
      this._lastPingReceived = 0;
      this._lastInputSent = 0;
      this._lastStateSent = 0;
    }
  }

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
    if (this._onError) { try { this._onError(msg); } catch(e) {} }
  }
}

window.MultiplayerEngine = MultiplayerEngine;
window.MP = new MultiplayerEngine();
console.log('✅ [MP] multiplayer.js loaded (v20.8.2)');
})();
