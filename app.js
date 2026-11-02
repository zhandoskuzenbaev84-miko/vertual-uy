/**
 * Toshkent City 360° Virtual Tour
 * First-Person Walking Simulator & Interactive 360° Real Estate Showcase
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Procedural Audio Synthesizer (Web Audio API - 0 external audio files)
  // -------------------------------------------------------------------------
  class SoundManager {
    constructor() {
      this.enabled = true;
      this.footstepsEnabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
    }

    // Footstep Sound Generator: Heel impact (sub-bass) + sole texture (filtered noise)
    playFootstep(surface = 'wood', isSprint = false) {
      if (!this.enabled || !this.footstepsEnabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;

        // 1. Bass impact (body weight hitting floor)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        const startFreq = surface === 'tile' ? 145 : 105;
        const endFreq = 35;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.07);

        const baseGain = isSprint ? 0.20 : 0.13;
        oscGain.gain.setValueAtTime(baseGain, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);

        // 2. High-frequency sole friction / texture
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = surface === 'tile' ? 'bandpass' : 'lowpass';
        filter.frequency.setValueAtTime(surface === 'tile' ? 2400 : 850, now);
        filter.Q.setValueAtTime(surface === 'tile' ? 2.5 : 1.2, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(isSprint ? 0.11 : 0.07, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
      } catch (e) {
        // silent audio fail
      }
    }

    // Doorway air whoosh when passing between rooms
    playDoorWhoosh() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * (i / bufferSize));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.4);
        filter.Q.setValueAtTime(2.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
      } catch (e) {
        // silent fail
      }
    }

    // Gentle wall bump sound when hitting barrier
    playWallBump() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {
        // silent fail
      }
    }

    // Room transition chime
    playTransition() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.5);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {
        console.warn('Audio playback error', e);
      }
    }

    // Button click tone
    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {
        console.warn('Audio click error', e);
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    toggleFootsteps() {
      this.footstepsEnabled = !this.footstepsEnabled;
      return this.footstepsEnabled;
    }
  }

  const sound = new SoundManager();

  // -------------------------------------------------------------------------
  // 2. Room Configuration & Interconnected Doorway Topology
  // -------------------------------------------------------------------------
  const isFileProtocol = window.location.protocol === 'file:';
  const panoUrls = {
    'living-room': isFileProtocol
      ? 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/anniversary_lounge.jpg'
      : 'assets/images/living-room.jpg',
    'kitchen': isFileProtocol
      ? 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kiara_interior.jpg'
      : 'assets/images/kitchen.jpg',
    'bedroom': isFileProtocol
      ? 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/hotel_room.jpg'
      : 'assets/images/bedroom.jpg',
    'bathroom': isFileProtocol
      ? 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/bathroom.jpg'
      : 'assets/images/bathroom.jpg'
  };

  const roomData = {
    'living-room': {
      title: 'Mehmonxona',
      area: '38 m²',
      panorama: panoUrls['living-room'],
      initialPitch: 0,
      initialYaw: 0,
      surface: 'wood',
      mapPos: { x: 145, y: 105 },
      doors: [
        {
          targetScene: 'kitchen',
          yaw: 110,
          pitch: -4,
          footstepPitch: -22,
          footstepYaw: 110,
          text: '👉 Oshxonaga o‘tish',
          spawnYaw: 45,
          doorName: 'Oshxona eshigi'
        },
        {
          targetScene: 'bedroom',
          yaw: -85,
          pitch: -2,
          footstepPitch: -20,
          footstepYaw: -85,
          text: '👉 Yotoqxonaga o‘tish',
          spawnYaw: 0,
          doorName: 'Yotoqxona eshigi'
        },
        {
          targetScene: 'bathroom',
          yaw: -140,
          pitch: -5,
          footstepPitch: -23,
          footstepYaw: -140,
          text: '👉 Vanna xonasiga o‘tish',
          spawnYaw: 0,
          doorName: 'Vanna eshigi'
        }
      ],
      hotSpots: [
        {
          type: 'info',
          pitch: 2,
          yaw: 10,
          badge: 'Ko‘ngilochar zona',
          title: 'Smart TV & Soundbar',
          desc: '75 dyuymli 4K OLED televizor va Dolby Atmos 5.1 uy kinoteatri akustik tizimi.'
        },
        {
          type: 'info',
          pitch: -18,
          yaw: -20,
          badge: 'Mebel',
          title: 'Italiya divani',
          desc: 'Tabiiy matodan tikilgan, qulay transformatsiya mexanizmiga ega zamonaviy divan.'
        },
        {
          type: 'info',
          pitch: 5,
          yaw: 65,
          badge: 'Manzara',
          title: 'Panoramali deraza',
          desc: 'Toshkent City bog‘i va favvoralari manzarasi ochiladigan energiya tejamkor derazalar.'
        }
      ]
    },

    'kitchen': {
      title: 'Oshxona',
      area: '24 m²',
      panorama: panoUrls['kitchen'],
      initialPitch: 0,
      initialYaw: 0,
      surface: 'tile',
      mapPos: { x: 375, y: 105 },
      doors: [
        {
          targetScene: 'living-room',
          yaw: -135,
          pitch: -3,
          footstepPitch: -22,
          footstepYaw: -135,
          text: '👉 Mehmonxonaga qaytish',
          spawnYaw: 110,
          doorName: 'Mehmonxona eshigi'
        },
        {
          targetScene: 'bedroom',
          yaw: 45,
          pitch: -2,
          footstepPitch: -20,
          footstepYaw: 45,
          text: '👉 Yotoqxonaga o‘tish',
          spawnYaw: -45,
          doorName: 'Yotoqxona eshigi'
        }
      ],
      hotSpots: [
        {
          type: 'info',
          pitch: -8,
          yaw: 110,
          badge: 'Maishiy texnika',
          title: 'Bosch Oshxona Garnituri',
          desc: 'Induksion pishirish paneli, elektr duxovka va shovqinsiz idish yuvish mashinasi.'
        },
        {
          type: 'info',
          pitch: -20,
          yaw: -30,
          badge: 'Dizayn',
          title: 'Kvarsit Orolcha Stoli',
          desc: 'Tabiiy toshdan ishlangan keng bar orolchasi va qulay bar kursilari.'
        },
        {
          type: 'info',
          pitch: -4,
          yaw: 165,
          badge: 'Jihoz',
          title: 'No-Frost Sovutgich',
          desc: 'Ikki eshikli katta sig‘imli va tejamkor inverter sovutgich.'
        }
      ]
    },

    'bedroom': {
      title: 'Yotoqxona',
      area: '32 m²',
      panorama: panoUrls['bedroom'],
      initialPitch: 0,
      initialYaw: 0,
      surface: 'wood',
      mapPos: { x: 180, y: 275 },
      doors: [
        {
          targetScene: 'living-room',
          yaw: 140,
          pitch: -4,
          footstepPitch: -22,
          footstepYaw: 140,
          text: '👉 Mehmonxonaga qaytish',
          spawnYaw: -85,
          doorName: 'Mehmonxona eshigi'
        },
        {
          targetScene: 'bathroom',
          yaw: -50,
          pitch: -3,
          footstepPitch: -20,
          footstepYaw: -50,
          text: '👉 Vanna xonasiga o‘tish',
          spawnYaw: 60,
          doorName: 'Vanna eshigi'
        }
      ],
      hotSpots: [
        {
          type: 'info',
          pitch: -15,
          yaw: 20,
          badge: 'Qulaylik',
          title: 'King-Size Ortopedik To‘shak',
          desc: 'Ergonomik yumshoq boshcha, ko‘p qatlamli anatomik matras va atlas ko‘rpa-yostiqlar.'
        },
        {
          type: 'info',
          pitch: 0,
          yaw: -110,
          badge: 'Saqlash',
          title: 'Keng Garderob Shkafi',
          desc: 'Sensorli LED yoritishga ega bo‘lgan ichki bo‘limlar va qorong‘ilatilgan oynali eshiklar.'
        },
        {
          type: 'info',
          pitch: -12,
          yaw: 85,
          badge: 'Ish burchagi',
          title: 'Ish Stoli & Kreslo',
          desc: 'Noutbukda qulay ishlash uchun mo‘ljallangan sokin yorug‘likdagi ish burchagi.'
        }
      ]
    },

    'bathroom': {
      title: 'Vanna xonasi',
      area: '16 m²',
      panorama: panoUrls['bathroom'],
      initialPitch: 0,
      initialYaw: 0,
      surface: 'tile',
      mapPos: { x: 360, y: 295 },
      doors: [
        {
          targetScene: 'living-room',
          yaw: -120,
          pitch: -5,
          footstepPitch: -22,
          footstepYaw: -120,
          text: '👉 Mehmonxonaga qaytish',
          spawnYaw: -140,
          doorName: 'Mehmonxona eshigi'
        },
        {
          targetScene: 'bedroom',
          yaw: 60,
          pitch: -5,
          footstepPitch: -20,
          footstepYaw: 60,
          text: '👉 Yotoqxonaga o‘tish',
          spawnYaw: -50,
          doorName: 'Yotoqxona eshigi'
        }
      ],
      hotSpots: [
        {
          type: 'info',
          pitch: -10,
          yaw: 115,
          badge: 'Santexnika',
          title: 'Grohe Dush & Vanna',
          desc: 'Termostatli tropik dush va gidromassaj funksiyasiga ega qulay akril vanna.'
        },
        {
          type: 'info',
          pitch: 2,
          yaw: 0,
          badge: 'Smart Texnologiya',
          title: 'Aqlli LED Oyna',
          desc: 'Sensorli yorug‘lik darajasini o‘zgartirish, soat va bug‘lanishga qarshi qizdirish.'
        },
        {
          type: 'info',
          pitch: -35,
          yaw: -15,
          badge: 'Isitish',
          title: 'Pol Isitish Tizimi',
          desc: 'Raqamli termostat orqali boshqariladigan mustaqil elektr pol isitish.'
        }
      ]
    }
  };

  // Convert room configuration into Pannellum scene structure
  function buildPannellumScenes() {
    const scenes = {};

    Object.keys(roomData).forEach(sceneKey => {
      const room = roomData[sceneKey];
      const pnlHotspots = [];

      // 1. Navigation Portals
      if (room.doors) {
        room.doors.forEach(door => {
          pnlHotspots.push({
            pitch: door.pitch,
            yaw: door.yaw,
            createTooltipFunc: createPortalHotspotElement,
            createTooltipArgs: {
              text: door.text,
              targetScene: door.targetScene,
              door: door
            }
          });

          // Floor Footprint Marker (interactive step-to-door spot)
          pnlHotspots.push({
            pitch: door.footstepPitch,
            yaw: door.footstepYaw,
            createTooltipFunc: createFootstepHotspotElement,
            createTooltipArgs: {
              targetScene: door.targetScene,
              title: door.doorName,
              door: door
            }
          });
        });
      }

      // 2. Info Hotspots
      if (room.hotSpots) {
        room.hotSpots.forEach(hs => {
          pnlHotspots.push({
            pitch: hs.pitch,
            yaw: hs.yaw,
            createTooltipFunc: createInfoHotspotElement,
            createTooltipArgs: {
              badge: hs.badge,
              title: hs.title,
              desc: hs.desc
            }
          });
        });
      }

      scenes[sceneKey] = {
        title: room.title,
        type: 'equirectangular',
        panorama: room.panorama,
        pitch: room.initialPitch,
        yaw: room.initialYaw,
        hfov: 105,
        minHfov: 50,
        maxHfov: 125,
        autoLoad: true,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        hotSpots: pnlHotspots
      };
    });

    return scenes;
  }

  // Custom portal hotspot element
  function createPortalHotspotElement(hotSpotDiv, args) {
    hotSpotDiv.classList.add('custom-hotspot-portal');
    hotSpotDiv.innerHTML = `
      <div class="portal-pulse-icon">➜</div>
      <div class="portal-label">${args.text}</div>
    `;

    hotSpotDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerWalkThrough(args.door);
    });
  }

  // Custom floor footprint marker element
  function createFootstepHotspotElement(hotSpotDiv, args) {
    hotSpotDiv.classList.add('custom-hotspot-footstep');
    hotSpotDiv.innerHTML = `
      <div class="footstep-pulse-ring">👣</div>
      <div class="footstep-label">${args.title || 'Qadam bosish'}</div>
    `;

    hotSpotDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerWalkThrough(args.door);
    });
  }

  // Custom info hotspot element
  function createInfoHotspotElement(hotSpotDiv, args) {
    hotSpotDiv.classList.add('custom-hotspot-info');
    hotSpotDiv.innerHTML = `
      <div class="info-pulse-icon">i</div>
    `;

    hotSpotDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      showHotspotModal(args.badge, args.title, args.desc);
    });
  }

  // Helper angle calculations
  function normalizeAngle(deg) {
    return ((((deg + 180) % 360) + 360) % 360) - 180;
  }

  function angleDiff(a, b) {
    return ((((a - b + 540) % 360) + 360) % 360) - 180;
  }

  // -------------------------------------------------------------------------
  // 3. First-Person Walking, Physics & Head-Bobbing Engine
  // -------------------------------------------------------------------------
  const panoramaEl = document.getElementById('panorama');
  const fpsCrosshair = document.getElementById('fpsCrosshair');
  const crosshairTooltip = document.getElementById('crosshairTooltip');
  const doorApproachHud = document.getElementById('doorApproachHud');
  const doorHudName = document.getElementById('doorHudName');
  const doorProgressBar = document.getElementById('doorProgressBar');
  const btnDoorHudWalk = document.getElementById('btnDoorHudWalk');
  const wallWarningHud = document.getElementById('wallWarningHud');
  const wallArrowHint = document.getElementById('wallArrowHint');
  const walkSpeedLines = document.getElementById('walkSpeedLines');
  const walkFlash = document.getElementById('walkFlash');
  const compassStrip = document.getElementById('compassStrip');
  const compassTitle = document.getElementById('compassTitle');
  const playerAvatar = document.getElementById('playerAvatar');
  const playerVisionCone = document.getElementById('playerVisionCone');

  // Input states
  const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ShiftLeft: false,
    ShiftRight: false
  };

  const virtualHold = {
    forward: false,
    backward: false,
    left: false,
    right: false
  };

  let isSprinting = false;
  let isPointerLocked = false;
  let isTransitioning = false;
  let isAutoWalking = false;

  // Head bobbing physics
  let walkCycle = 0;
  let lastSineSign = 1;
  let currentBobX = 0;
  let currentBobY = 0;
  let currentBobTilt = 0;
  let currentWalkPush = 0;

  // Door proximity tracking
  let activeFacingDoor = null;
  let doorApproachProgress = 0;
  let wallTimer = 0;
  let lastTimestamp = performance.now();

  // Initialize Compass Tape ticks
  function initCompassStrip() {
    if (!compassStrip) return;
    const ticks = [
      { deg: 0, text: 'N', isMajor: true },
      { deg: 45, text: 'NE', isMajor: false },
      { deg: 90, text: 'E', isMajor: true },
      { deg: 135, text: 'SE', isMajor: false },
      { deg: 180, text: 'S', isMajor: true },
      { deg: 225, text: 'SW', isMajor: false },
      { deg: 270, text: 'W', isMajor: true },
      { deg: 315, text: 'NW', isMajor: false },
      { deg: 360, text: 'N', isMajor: true },
      { deg: 405, text: 'NE', isMajor: false },
      { deg: 450, text: 'E', isMajor: true }
    ];

    compassStrip.innerHTML = ticks.map(t => `
      <span class="compass-tick ${t.isMajor ? 'cardinal' : ''}">
        <span>${t.text}</span>
        <span style="font-size: 8px; opacity: 0.65;">${t.deg % 360}°</span>
      </span>
    `).join('');
  }

  initCompassStrip();

  // Update Compass strip offset & title
  function updateCompassRibbon(yaw) {
    const norm = ((-yaw % 360) + 360) % 360;
    if (compassStrip) {
      const offset = (norm / 360) * 440;
      compassStrip.style.transform = `translateX(-${offset.toFixed(1)}px)`;
    }
    if (compassTitle) {
      const heading = Math.round(norm);
      let cardinal = 'Shimol (N)';
      if (heading >= 22.5 && heading < 67.5) cardinal = 'Shimoli-Sharq (NE)';
      else if (heading >= 67.5 && heading < 112.5) cardinal = 'Sharq (E)';
      else if (heading >= 112.5 && heading < 157.5) cardinal = 'Janubi-Sharq (SE)';
      else if (heading >= 157.5 && heading < 202.5) cardinal = 'Janub (S)';
      else if (heading >= 202.5 && heading < 247.5) cardinal = 'Janubi-G‘arb (SW)';
      else if (heading >= 247.5 && heading < 292.5) cardinal = 'G‘arb (W)';
      else if (heading >= 292.5 && heading < 337.5) cardinal = 'Shimoli-G‘arb (NW)';

      const currentRoomTitle = roomData[currentSceneId]?.title || '';
      compassTitle.textContent = `${heading}° • ${cardinal} • ${currentRoomTitle.toUpperCase()}`;
    }
  }

  // Update Minimap rotating Vision Cone
  function updateMinimapVisionCone(yaw) {
    if (playerVisionCone) {
      playerVisionCone.setAttribute('transform', `rotate(${yaw})`);
    }
  }

  // Animate Minimap player avatar position
  function moveMinimapAvatar(sceneId) {
    const room = roomData[sceneId];
    if (room && room.mapPos && playerAvatar) {
      playerAvatar.style.transform = `translate(${room.mapPos.x}px, ${room.mapPos.y}px)`;
    }
  }

  // Walk-through Room Transition Sequence
  function triggerWalkThrough(door) {
    if (!door || isTransitioning) return;
    isTransitioning = true;
    isAutoWalking = false;

    sound.playDoorWhoosh();
    const destSurface = roomData[door.targetScene]?.surface || 'tile';
    sound.playFootstep(destSurface, true);

    walkFlash?.classList.add('flash');
    walkSpeedLines?.classList.add('active');

    setTimeout(() => {
      const spawnYaw = door.spawnYaw !== undefined ? door.spawnYaw : 0;
      switchScene(door.targetScene, spawnYaw);

      setTimeout(() => {
        sound.playFootstep(destSurface, false);
        walkFlash?.classList.remove('flash');
        walkSpeedLines?.classList.remove('active');
        doorApproachProgress = 0;
        currentWalkPush = 0;
        isTransitioning = false;
        showToast(`🚪 ${roomData[door.targetScene]?.title}ga kirdingiz!`);
      }, 350);
    }, 280);
  }

  // Click on Door HUD Walk Button
  btnDoorHudWalk?.addEventListener('click', () => {
    if (activeFacingDoor) {
      triggerWalkThrough(activeFacingDoor);
    }
  });

  // -------------------------------------------------------------------------
  // 4. Main Animation & Physics Loop (60 FPS Game Engine)
  // -------------------------------------------------------------------------
  function updatePhysicsLoop(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    if (viewer && !isTransitioning) {
      const isForward = keys.KeyW || keys.ArrowUp || virtualHold.forward || isAutoWalking;
      const isBackward = keys.KeyS || keys.ArrowDown || virtualHold.backward;
      const isTurnLeft = keys.KeyA || keys.ArrowLeft || virtualHold.left;
      const isTurnRight = keys.KeyD || keys.ArrowRight || virtualHold.right;
      const sprintActive = isSprinting || keys.ShiftLeft || keys.ShiftRight;

      // 1. Turning Left / Right via Keys
      if (isTurnLeft || isTurnRight) {
        const turnSpeed = sprintActive ? 115 : 85;
        const dir = isTurnLeft ? -1 : 1;
        const currentYaw = viewer.getYaw();
        viewer.setYaw(currentYaw + dir * turnSpeed * dt, false);
      }

      // 2. Walking Forward or Backward with Head-Bobbing
      const isWalking = isForward || isBackward;
      if (isWalking) {
        const walkFreq = sprintActive ? 14.0 : 9.0;
        const walkDir = isForward ? 1 : -0.7;
        walkCycle += dt * walkFreq;

        // Realistic footstep detection at bottom peak of walking stride
        const sineVal = Math.sin(walkCycle);
        if (lastSineSign > 0 && sineVal <= 0) {
          const surface = roomData[currentSceneId]?.surface || 'wood';
          sound.playFootstep(surface, sprintActive);
        }
        lastSineSign = sineVal;

        const bobAmpY = (sprintActive ? 8.5 : 5.0) * Math.abs(walkDir);
        const bobAmpX = (sprintActive ? 4.0 : 2.2) * walkDir;
        const bobAmpTilt = (sprintActive ? 0.75 : 0.45) * walkDir;

        const targetBobY = Math.sin(walkCycle) * bobAmpY;
        const targetBobX = Math.cos(walkCycle * 0.5) * bobAmpX;
        const targetBobTilt = Math.sin(walkCycle * 0.5) * bobAmpTilt;

        currentBobX += (targetBobX - currentBobX) * 0.25;
        currentBobY += (targetBobY - currentBobY) * 0.25;
        currentBobTilt += (targetBobTilt - currentBobTilt) * 0.25;

        fpsCrosshair?.classList.add('walking');
        if (sprintActive) walkSpeedLines?.classList.add('active');
        else walkSpeedLines?.classList.remove('active');
      } else {
        // Smoothly decay bobbing to rest
        currentBobX *= 0.82;
        currentBobY *= 0.82;
        currentBobTilt *= 0.82;
        fpsCrosshair?.classList.remove('walking');
        walkSpeedLines?.classList.remove('active');
      }

      // 3. Proximity & Door Detection Logic
      const currentYaw = normalizeAngle(viewer.getYaw());
      const currentRoom = roomData[currentSceneId];
      let facingDoor = null;
      let minDiff = 999;

      if (currentRoom?.doors) {
        for (const door of currentRoom.doors) {
          const diff = Math.abs(angleDiff(currentYaw, door.yaw));
          if (diff < 28 && diff < minDiff) {
            minDiff = diff;
            facingDoor = door;
          }
        }
      }

      activeFacingDoor = facingDoor;

      if (facingDoor) {
        wallTimer = 0;
        wallWarningHud?.classList.add('hidden');
        fpsCrosshair?.classList.add('hover-door');
        doorApproachHud?.classList.remove('hidden');

        if (doorHudName) {
          doorHudName.textContent = facingDoor.doorName || `${roomData[facingDoor.targetScene]?.title} eshigi`;
        }
        if (crosshairTooltip) {
          crosshairTooltip.querySelector('.crosshair-tip-text').textContent = facingDoor.doorName || 'Eshik';
        }

        if (isForward) {
          const approachSpeed = sprintActive ? 0.95 : 0.65;
          doorApproachProgress = Math.min(1.0, doorApproachProgress + dt * approachSpeed);
          currentWalkPush = doorApproachProgress;

          if (doorProgressBar) {
            doorProgressBar.style.width = `${Math.round(doorApproachProgress * 100)}%`;
          }

          if (doorApproachProgress >= 1.0) {
            triggerWalkThrough(facingDoor);
          }
        } else {
          doorApproachProgress = Math.max(0, doorApproachProgress - dt * 0.8);
          currentWalkPush = doorApproachProgress * 0.4;
          if (doorProgressBar) {
            doorProgressBar.style.width = `${Math.round(doorApproachProgress * 100)}%`;
          }
        }
      } else {
        fpsCrosshair?.classList.remove('hover-door');
        doorApproachHud?.classList.add('hidden');
        doorApproachProgress = Math.max(0, doorApproachProgress - dt * 1.5);
        currentWalkPush = doorApproachProgress * 0.3;
        if (doorProgressBar) doorProgressBar.style.width = '0%';

        // Wall collision warning when walking into blank wall
        if (isForward) {
          wallTimer += dt;
          if (wallTimer > 1.2) {
            wallWarningHud?.classList.remove('hidden');
            if (currentRoom?.doors && currentRoom.doors.length > 0) {
              const firstDoor = currentRoom.doors[0];
              const diff = angleDiff(currentYaw, firstDoor.yaw);
              if (wallArrowHint) {
                wallArrowHint.textContent = diff > 0 ? '↶ Chapga buriling' : '↷ O‘ngga buriling';
              }
            }
          }
        } else {
          wallTimer = 0;
          wallWarningHud?.classList.add('hidden');
        }
      }

      // 4. Apply 3D CSS Head-Bobbing Transform
      if (panoramaEl) {
        panoramaEl.style.transform = `translate3d(${currentBobX.toFixed(2)}px, ${currentBobY.toFixed(2)}px, 0) rotate(${currentBobTilt.toFixed(2)}deg) scale(${(1.03 + currentWalkPush * 0.08).toFixed(3)})`;
      }

      // 5. Update Compass Tape & Minimap Vision Cone
      updateCompassRibbon(viewer.getYaw());
      updateMinimapVisionCone(viewer.getYaw());
    }

    requestAnimationFrame(updatePhysicsLoop);
  }

  // -------------------------------------------------------------------------
  // 5. Pointer Lock (FPS Mouse Look Mode)
  // -------------------------------------------------------------------------
  const btnFpsMode = document.getElementById('btnFpsMode');
  const btnToggleFpsLock = document.getElementById('btnToggleFpsLock');

  function togglePointerLock() {
    sound.playClick();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    } else {
      document.body.requestPointerLock().catch(err => {
        console.warn('Pointer lock request error:', err);
      });
    }
  }

  btnFpsMode?.addEventListener('click', togglePointerLock);
  btnToggleFpsLock?.addEventListener('click', togglePointerLock);

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = !!document.pointerLockElement;
    if (isPointerLocked) {
      btnFpsMode?.classList.add('active');
      btnToggleFpsLock?.classList.add('active');
      showToast('🎮 FPS Rejimi Faol! Chiqish uchun ESC bosing');
    } else {
      btnFpsMode?.classList.remove('active');
      btnToggleFpsLock?.classList.remove('active');
      showToast('FPS rejimidan chiqildi');
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isPointerLocked && viewer) {
      const sensitivity = 0.12;
      const dx = e.movementX;
      const dy = e.movementY;
      const currentYaw = viewer.getYaw();
      const currentPitch = viewer.getPitch();

      viewer.setYaw(currentYaw + dx * sensitivity, false);
      viewer.setPitch(Math.max(-85, Math.min(85, currentPitch - dy * sensitivity)), false);
    }
  });

  // Clicking in Pointer Lock mode
  document.addEventListener('click', (e) => {
    if (isPointerLocked && activeFacingDoor) {
      triggerWalkThrough(activeFacingDoor);
    }
  });

  // -------------------------------------------------------------------------
  // 6. On-Screen Virtual WASD Control Pad
  // -------------------------------------------------------------------------
  const keyW = document.getElementById('keyW');
  const keyA = document.getElementById('keyA');
  const keyS = document.getElementById('keyS');
  const keyD = document.getElementById('keyD');
  const btnToggleSprint = document.getElementById('btnToggleSprint');
  const sprintLabel = document.getElementById('sprintLabel');
  const btnToggleFootsteps = document.getElementById('btnToggleFootsteps');
  const stepAudioLabel = document.getElementById('stepAudioLabel');
  const btnToggleWasdHud = document.getElementById('btnToggleWasdHud');
  const wasdHud = document.getElementById('wasdHud');

  function bindVirtualKey(btn, holdProperty) {
    if (!btn) return;
    const startHold = (e) => {
      e.preventDefault();
      virtualHold[holdProperty] = true;
      btn.classList.add('active');
    };
    const endHold = (e) => {
      e.preventDefault();
      virtualHold[holdProperty] = false;
      btn.classList.remove('active');
    };

    btn.addEventListener('mousedown', startHold);
    btn.addEventListener('mouseup', endHold);
    btn.addEventListener('mouseleave', endHold);
    btn.addEventListener('touchstart', startHold, { passive: false });
    btn.addEventListener('touchend', endHold, { passive: false });
  }

  bindVirtualKey(keyW, 'forward');
  bindVirtualKey(keyS, 'backward');
  bindVirtualKey(keyA, 'left');
  bindVirtualKey(keyD, 'right');

  // Toggle Sprint (Shift)
  btnToggleSprint?.addEventListener('click', () => {
    sound.playClick();
    isSprinting = !isSprinting;
    btnToggleSprint.classList.toggle('active', isSprinting);
    if (sprintLabel) {
      sprintLabel.textContent = isSprinting ? 'Shift: Yugurish (ON)' : 'Shift: Yugurish';
    }
    showToast(isSprinting ? '🏃 Yugurish rejimi yoqildi' : '🚶 Odatdagi yurish rejimi');
  });

  // Toggle Footstep Audio
  btnToggleFootsteps?.addEventListener('click', () => {
    const isNowOn = sound.toggleFootsteps();
    btnToggleFootsteps.classList.toggle('active', isNowOn);
    if (stepAudioLabel) {
      stepAudioLabel.textContent = isNowOn ? 'Qadam: Yoqiq' : 'Qadam: O‘chiq';
    }
    showToast(isNowOn ? '👣 Qadam ovozi yoqildi' : '👣 Qadam ovozi o‘chirildi');
  });

  // Toggle WASD HUD visibility
  btnToggleWasdHud?.addEventListener('click', () => {
    sound.playClick();
    wasdHud?.classList.toggle('collapsed');
  });

  // -------------------------------------------------------------------------
  // 7. Viewer Initialization
  // -------------------------------------------------------------------------
  let viewer = null;
  let currentSceneId = 'living-room';
  let isAutoRotating = false;

  try {
    viewer = pannellum.viewer('panorama', {
      default: {
        firstScene: 'living-room',
        sceneFadeDuration: 750,
        compass: false,
        autoLoad: true
      },
      scenes: buildPannellumScenes()
    });

    viewer.on('load', () => {
      syncUI(currentSceneId);
    });

    viewer.on('scenechange', (sceneId) => {
      currentSceneId = sceneId;
      syncUI(sceneId);
    });
  } catch (err) {
    console.error('Failed to initialize Pannellum viewer:', err);
  }

  // Switch scene with animation & UI update
  function switchScene(sceneId, targetYaw) {
    if (!viewer || !roomData[sceneId]) return;
    currentSceneId = sceneId;
    const initialYaw = targetYaw !== undefined ? targetYaw : (roomData[sceneId].initialYaw || 0);
    viewer.loadScene(sceneId, 0, initialYaw);
    syncUI(sceneId);
  }

  // Sync all UI components with the current scene
  function syncUI(sceneId) {
    const room = roomData[sceneId];
    if (!room) return;

    // 1. Current room name badge
    const badgeName = document.getElementById('currentRoomName');
    if (badgeName) {
      badgeName.textContent = `${room.title} (${room.area})`;
    }

    // 2. Carousel active card highlight
    document.querySelectorAll('.room-card').forEach(card => {
      if (card.getAttribute('data-scene') === sceneId) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        card.classList.remove('active');
      }
    });

    // 3. Minimap pin highlight & Avatar position move
    highlightMinimap(sceneId);
    moveMinimapAvatar(sceneId);
  }

  // -------------------------------------------------------------------------
  // 8. Minimap / Floor Plan Logic
  // -------------------------------------------------------------------------
  const minimapWidget = document.getElementById('minimapWidget');
  const btnFloorplan = document.getElementById('btnFloorplan');
  const btnCloseMinimap = document.getElementById('btnCloseMinimap');

  btnFloorplan?.addEventListener('click', () => {
    sound.playClick();
    minimapWidget.classList.toggle('collapsed');
    btnFloorplan.classList.toggle('active');
  });

  btnCloseMinimap?.addEventListener('click', () => {
    sound.playClick();
    minimapWidget.classList.add('collapsed');
    btnFloorplan.classList.remove('active');
  });

  function setupFloorplanSVG() {
    const pinMap = {
      'pin-living-room': 'living-room',
      'pin-kitchen': 'kitchen',
      'pin-bedroom': 'bedroom',
      'pin-bathroom': 'bathroom'
    };

    Object.keys(pinMap).forEach(pinId => {
      const pinEl = document.getElementById(pinId);
      if (pinEl) {
        pinEl.style.cursor = 'pointer';
        pinEl.addEventListener('click', () => {
          sound.playTransition();
          switchScene(pinMap[pinId]);
          showToast(`Qavat rejasidan o‘tildi: ${roomData[pinMap[pinId]].title}`);
        });
      }
    });

    highlightMinimap(currentSceneId);
    moveMinimapAvatar(currentSceneId);
  }

  setupFloorplanSVG();

  function highlightMinimap(sceneId) {
    const pinIds = ['pin-living-room', 'pin-kitchen', 'pin-bedroom', 'pin-bathroom'];
    const targetPinId = `pin-${sceneId}`;

    pinIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === targetPinId) {
          el.style.filter = 'drop-shadow(0 0 10px #38bdf8)';
          const pulseCircle = el.querySelector('.pin-pulse');
          if (pulseCircle) pulseCircle.style.display = 'block';
        } else {
          el.style.filter = 'none';
          const pulseCircle = el.querySelector('.pin-pulse');
          if (pulseCircle) pulseCircle.style.display = 'none';
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 9. Bottom Room Carousel Interaction
  // -------------------------------------------------------------------------
  document.querySelectorAll('.room-card').forEach(card => {
    card.addEventListener('click', () => {
      const sceneId = card.getAttribute('data-scene');
      if (sceneId && sceneId !== currentSceneId) {
        sound.playTransition();
        switchScene(sceneId);
        showToast(`Xonaga o‘tildi: ${roomData[sceneId].title}`);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 10. Property Info Modal Logic
  // -------------------------------------------------------------------------
  const modalInfo = document.getElementById('modalInfo');
  const btnInfo = document.getElementById('btnInfo');
  const btnCloseInfo = document.getElementById('btnCloseInfo');

  function openInfoModal() {
    sound.playClick();
    modalInfo?.classList.add('active');
  }

  function closeInfoModal() {
    sound.playClick();
    modalInfo?.classList.remove('active');
  }

  btnInfo?.addEventListener('click', openInfoModal);
  btnCloseInfo?.addEventListener('click', closeInfoModal);
  modalInfo?.addEventListener('click', (e) => {
    if (e.target === modalInfo) closeInfoModal();
  });

  // -------------------------------------------------------------------------
  // 11. Hotspot Detail Pop-up Modal
  // -------------------------------------------------------------------------
  const hotspotModal = document.getElementById('hotspotModal');
  const hotspotBadge = document.getElementById('hotspotBadge');
  const hotspotTitle = document.getElementById('hotspotTitle');
  const hotspotDesc = document.getElementById('hotspotDesc');
  const btnCloseHotspotModal = document.getElementById('btnCloseHotspotModal');

  function showHotspotModal(badge, title, desc) {
    if (hotspotBadge) hotspotBadge.textContent = badge || 'Tafsilot';
    if (hotspotTitle) hotspotTitle.textContent = title;
    if (hotspotDesc) hotspotDesc.textContent = desc;
    hotspotModal?.classList.add('active');
  }

  function hideHotspotModal() {
    hotspotModal?.classList.remove('active');
  }

  btnCloseHotspotModal?.addEventListener('click', () => {
    sound.playClick();
    hideHotspotModal();
  });

  // -------------------------------------------------------------------------
  // 12. Auto-Rotation Toggle
  // -------------------------------------------------------------------------
  const btnAutoRotate = document.getElementById('btnAutoRotate');

  function toggleAutoRotate() {
    sound.playClick();
    if (!viewer) return;
    if (isAutoRotating) {
      viewer.stopAutoRotate();
      isAutoRotating = false;
      btnAutoRotate?.classList.remove('active');
      showToast('Avtomatik aylanish to‘xtatildi');
    } else {
      viewer.startAutoRotate(-2);
      isAutoRotating = true;
      btnAutoRotate?.classList.add('active');
      showToast('Avtomatik aylanish faollashtirildi');
    }
  }

  btnAutoRotate?.addEventListener('click', toggleAutoRotate);

  // -------------------------------------------------------------------------
  // 13. Audio Mute/Unmute Toggle
  // -------------------------------------------------------------------------
  const btnAudio = document.getElementById('btnAudio');
  const audioIconOn = document.getElementById('audioIconOn');
  const audioIconOff = document.getElementById('audioIconOff');

  btnAudio?.addEventListener('click', () => {
    const isNowEnabled = sound.toggle();
    if (isNowEnabled) {
      audioIconOn?.classList.remove('hidden');
      audioIconOff?.classList.add('hidden');
      sound.playClick();
      showToast('Ovoz yoqildi 🔔');
    } else {
      audioIconOn?.classList.add('hidden');
      audioIconOff?.classList.remove('hidden');
      showToast('Ovoz o‘chirildi 🔕');
    }
  });

  // -------------------------------------------------------------------------
  // 14. Fullscreen Handler
  // -------------------------------------------------------------------------
  const btnFullscreen = document.getElementById('btnFullscreen');

  btnFullscreen?.addEventListener('click', () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // -------------------------------------------------------------------------
  // 15. Zoom & Reset View Controls
  // -------------------------------------------------------------------------
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnResetView = document.getElementById('btnResetView');
  const btnHelp = document.getElementById('btnHelp');

  btnZoomIn?.addEventListener('click', () => {
    if (!viewer) return;
    sound.playClick();
    viewer.setHfov(viewer.getHfov() - 15);
  });

  btnZoomOut?.addEventListener('click', () => {
    if (!viewer) return;
    sound.playClick();
    viewer.setHfov(viewer.getHfov() + 15);
  });

  btnResetView?.addEventListener('click', () => {
    if (!viewer) return;
    sound.playClick();
    viewer.setPitch(0);
    viewer.setYaw(0);
    viewer.setHfov(105);
    showToast('Ko‘rinish tiklandi 🎯');
  });

  // -------------------------------------------------------------------------
  // 16. Welcome Tutorial Overlay
  // -------------------------------------------------------------------------
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const btnStartTour = document.getElementById('btnStartTour');

  btnStartTour?.addEventListener('click', () => {
    sound.playClick();
    welcomeOverlay?.classList.add('hidden');
  });

  btnHelp?.addEventListener('click', () => {
    sound.playClick();
    welcomeOverlay?.classList.remove('hidden');
  });

  // -------------------------------------------------------------------------
  // 17. Toast Notification System
  // -------------------------------------------------------------------------
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastMessage) return;
    toastMessage.textContent = msg;
    toastMessage.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage.classList.remove('show');
    }, 2400);
  }

  // -------------------------------------------------------------------------
  // 18. Keyboard Controls & Shortcuts (W, A, S, D, Shift, C, 1-4, etc.)
  // -------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    // Escape closes modals or exits pointer lock
    if (e.key === 'Escape') {
      if (modalInfo?.classList.contains('active')) closeInfoModal();
      if (hotspotModal?.classList.contains('active')) hideHotspotModal();
      if (!welcomeOverlay?.classList.contains('hidden')) welcomeOverlay?.classList.add('hidden');
      return;
    }

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Movement Keys (WASD + Arrows)
    const code = e.code || '';
    const key = e.key.toLowerCase();

    if (code === 'KeyW' || key === 'w') {
      keys.KeyW = true;
      keyW?.classList.add('active');
    }
    if (code === 'KeyA' || key === 'a') {
      keys.KeyA = true;
      keyA?.classList.add('active');
    }
    if (code === 'KeyS' || key === 's') {
      keys.KeyS = true;
      keyS?.classList.add('active');
    }
    if (code === 'KeyD' || key === 'd') {
      keys.KeyD = true;
      keyD?.classList.add('active');
    }

    if (e.key === 'ArrowUp') {
      keys.ArrowUp = true;
      keyW?.classList.add('active');
    }
    if (e.key === 'ArrowDown') {
      keys.ArrowDown = true;
      keyS?.classList.add('active');
    }
    if (e.key === 'ArrowLeft') {
      keys.ArrowLeft = true;
      keyA?.classList.add('active');
    }
    if (e.key === 'ArrowRight') {
      keys.ArrowRight = true;
      keyD?.classList.add('active');
    }

    if (e.key === 'Shift') {
      keys.ShiftLeft = true;
      isSprinting = true;
      btnToggleSprint?.classList.add('active');
    }

    // FPS Pointer Lock Shortcut
    if (code === 'KeyC' || key === 'c') {
      e.preventDefault();
      togglePointerLock();
    }

    // Numerical Room Switch Shortcuts
    switch (e.key) {
      case '1':
        sound.playTransition();
        switchScene('living-room');
        break;
      case '2':
        sound.playTransition();
        switchScene('kitchen');
        break;
      case '3':
        sound.playTransition();
        switchScene('bedroom');
        break;
      case '4':
        sound.playTransition();
        switchScene('bathroom');
        break;
      case ' ':
        e.preventDefault();
        toggleAutoRotate();
        break;
      case 'f':
      case 'F':
        btnFullscreen?.click();
        break;
      case 'm':
      case 'M':
        btnFloorplan?.click();
        break;
      case 'i':
      case 'I':
        modalInfo?.classList.contains('active') ? closeInfoModal() : openInfoModal();
        break;
      case '?':
        welcomeOverlay?.classList.toggle('hidden');
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    const code = e.code || '';
    const key = e.key.toLowerCase();

    if (code === 'KeyW' || key === 'w') {
      keys.KeyW = false;
      keyW?.classList.remove('active');
    }
    if (code === 'KeyA' || key === 'a') {
      keys.KeyA = false;
      keyA?.classList.remove('active');
    }
    if (code === 'KeyS' || key === 's') {
      keys.KeyS = false;
      keyS?.classList.remove('active');
    }
    if (code === 'KeyD' || key === 'd') {
      keys.KeyD = false;
      keyD?.classList.remove('active');
    }

    if (e.key === 'ArrowUp') {
      keys.ArrowUp = false;
      keyW?.classList.remove('active');
    }
    if (e.key === 'ArrowDown') {
      keys.ArrowDown = false;
      keyS?.classList.remove('active');
    }
    if (e.key === 'ArrowLeft') {
      keys.ArrowLeft = false;
      keyA?.classList.remove('active');
    }
    if (e.key === 'ArrowRight') {
      keys.ArrowRight = false;
      keyD?.classList.remove('active');
    }

    if (e.key === 'Shift') {
      keys.ShiftLeft = false;
      isSprinting = false;
      btnToggleSprint?.classList.remove('active');
    }
  });

  // Start the 60FPS physics and walking animation loop
  requestAnimationFrame(updatePhysicsLoop);
});
