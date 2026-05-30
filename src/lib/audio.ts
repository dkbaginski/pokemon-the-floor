// Advanced Audio Manager with Retro 8-Bit Web Audio Synthesizer Fallback and HTML5 Audio Hybrid Loader
// Design focus: Ergonomic, lightweight, zero external dependencies, persistent player preferences.

export type BGMType = "intro" | "board" | "duel" | "none";
export type SFXType = "click" | "correct" | "wrong" | "win" | "lose" | "capture" | "start";

class AudioManager {
  private ctx: AudioContext | null = null;
  private currentBGM: BGMType = "none";
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private isSfxMuted: boolean = false;
  private musicVolume: number = 0.5; // range 0 to 1
  private sfxVolume: number = 0.6;   // range 0 to 1
  private silenceDuelMusic: boolean = false;

  // Native HTML5 Audio Elements for custom MP3/Flac tracks
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxSources: Record<SFXType, string> = {
    click: "/audio/click.mp3",
    correct: "/audio/correct.mp3",
    wrong: "/audio/wrong.mp3",
    win: "/audio/win.mp3",
    lose: "/audio/lose.mp3",
    capture: "/audio/capture.mp3",
    start: "/audio/start.mp3",
  };
  private bgmSources: Record<Exclude<BGMType, "none">, string> = {
    intro: "/audio/start_bgm.mp3",
    board: "/audio/board_bgm.mp3",
    duel: "/audio/duel_bgm.mp3",
  };

  // State of custom assets verified to exist on the server
  private verifiedAssets: Record<string, boolean> = {};

  // Procedural BGM step-sequencer intervals
  private seqInterval: number | null = null;
  private seqStep: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      // Load saved preferences
      this.isMuted = localStorage.getItem("pokemon_audio_muted") === "true";
      this.isMusicMuted = localStorage.getItem("pokemon_audio_music_muted") === "true";
      this.isSfxMuted = localStorage.getItem("pokemon_audio_sfx_muted") === "true";
      this.musicVolume = parseFloat(localStorage.getItem("pokemon_audio_music_vol") ?? "0.4");
      this.sfxVolume = parseFloat(localStorage.getItem("pokemon_audio_sfx_vol") ?? "0.5");
      this.silenceDuelMusic = localStorage.getItem("pokemon_audio_silence_duels") === "true";

      // Warm up verified assets cache by pre-checking if custom files are readable
      this.precheckAssets();
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Pre-fetch check to see if custom audio files exist
  private async precheckAssets() {
    const assets = [
      ...Object.values(this.bgmSources),
      ...Object.values(this.sfxSources),
    ];
    for (const src of assets) {
      try {
        const res = await fetch(src, { method: "HEAD" });
        this.verifiedAssets[src] = res.ok;
      } catch {
        this.verifiedAssets[src] = false;
      }
    }
  }

  // Updates & persists user configurations
  public setMute(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem("pokemon_audio_muted", String(muted));
    this.applyVolume();
    if (muted) {
      this.stopProceduralBGM();
    } else if (this.currentBGM !== "none") {
      // Re-trigger music on unmute
      this.playBGM(this.currentBGM, true);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    localStorage.setItem("pokemon_audio_music_muted", String(muted));
    this.applyVolume();
    if (muted) {
      this.stopProceduralBGM();
    } else if (this.currentBGM !== "none") {
      this.playBGM(this.currentBGM, true);
    }
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public setSfxMuted(muted: boolean) {
    this.isSfxMuted = muted;
    localStorage.setItem("pokemon_audio_sfx_muted", String(muted));
  }

  public getSfxMuted(): boolean {
    return this.isSfxMuted;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem("pokemon_audio_music_vol", String(this.musicVolume));
    this.applyVolume();
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem("pokemon_audio_sfx_vol", String(this.sfxVolume));
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSilenceDuelMusic(val: boolean) {
    this.silenceDuelMusic = val;
    localStorage.setItem("pokemon_audio_silence_duels", String(val));
    if (this.currentBGM === "duel") {
      this.playBGM("none", true);
      this.playBGM("duel", true);
    }
  }

  public getSilenceDuelMusic(): boolean {
    return this.silenceDuelMusic;
  }

  private applyVolume() {
    if (this.bgmAudio) {
      this.bgmAudio.muted = this.isMuted || this.isMusicMuted;
      this.bgmAudio.volume = this.musicVolume;
    }
  }

  // Plays a specific sound effect (with immediate procedural synth backup)
  public playSFX(type: SFXType) {
    if (this.isMuted || this.isSfxMuted) return;
    this.initCtx();

    // 1. Attempt HTML5 Audio Playback if custom file exists
    const customPath = this.sfxSources[type];
    if (this.verifiedAssets[customPath]) {
      try {
        const audio = new Audio(customPath);
        audio.volume = this.sfxVolume;
        audio.play().catch(() => {
          // Fall back silently to procedural synth
          this.playProceduralSFX(type);
        });
        return;
      } catch {
        // Fall back to synth on error
      }
    }

    // 2. Play Retro 8-bit Synth sound
    this.playProceduralSFX(type);
  }

  // Web Audio Synthesizer for high-fidelity 8-bit arcade retro sounds
  private playProceduralSFX(type: SFXType) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const createOscGain = (oscType: OscillatorType, startFreq: number, duration: number, volumeFactor: number = 1.0) => {
      if (!this.ctx) return null;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = oscType;
      osc.frequency.setValueAtTime(startFreq, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.15 * volumeFactor, now);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      return { osc, gain };
    };

    switch (type) {
      case "click": {
        // High, crispy retro chirp
        const nodes = createOscGain("sine", 850, 0.06, 1.2);
        if (nodes) {
          nodes.osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
          nodes.osc.start(now);
          nodes.osc.stop(now + 0.07);
        }
        break;
      }
      case "start": {
        // Sweep up to adventure
        const nodes = createOscGain("triangle", 220, 0.35, 1.4);
        if (nodes) {
          nodes.osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
          nodes.osc.start(now);
          nodes.osc.stop(now + 0.35);
        }
        break;
      }
      case "correct": {
        // Classic Pokemon 2-tone pleasant interval (C5 to G5 chime)
        const nodes1 = createOscGain("square", 523.25, 0.08, 0.6); // C5
        if (nodes1) {
          nodes1.osc.start(now);
          nodes1.osc.stop(now + 0.08);
        }
        setTimeout(() => {
          if (!this.ctx || this.isMuted) return;
          const nodes2 = createOscGain("square", 783.99, 0.18, 0.7); // G5
          if (nodes2) {
            nodes2.osc.start(this.ctx.currentTime);
            nodes2.osc.stop(this.ctx.currentTime + 0.18);
          }
        }, 80);
        break;
      }
      case "wrong": {
        // Buzzy buzzer descending slide
        const nodes = createOscGain("sawtooth", 160, 0.28, 0.9);
        if (nodes) {
          nodes.osc.frequency.linearRampToValueAtTime(90, now + 0.25);
          nodes.osc.start(now);
          nodes.osc.stop(now + 0.28);
        }
        break;
      }
      case "capture": {
        // Legendary pokeball capture wiggle roll!
        // Repetitive wobbles followed by a sharp click
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

            gain.gain.setValueAtTime(this.sfxVolume * 0.1, t);
            gain.gain.linearRampToValueAtTime(1e-3, t + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.09);
          }, i * 180);
        }
        setTimeout(() => {
          if (!this.ctx || this.isMuted) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1100, t);
          gain.gain.setValueAtTime(this.sfxVolume * 0.2, t);
          gain.gain.linearRampToValueAtTime(1e-3, t + 0.15);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        }, 600);
        break;
      }
      case "win": {
        // Hero's major scale fanfare!
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C4, E4, G4, C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const t = this.ctx.currentTime;
            const dur = idx === notes.length - 1 ? 0.4 : 0.08;
            const type = idx === notes.length - 1 ? "square" : "triangle";
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(this.sfxVolume * 0.12, t);
            gain.gain.linearRampToValueAtTime(1e-3, t + dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + dur);
          }, idx * 75);
        });
        break;
      }
      case "lose": {
        // Melancholic descending chiptune run
        const notes = [440.0, 415.3, 392.0, 349.23, 293.66, 220.0]; // Descending chromatic / minor
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const t = this.ctx.currentTime;
            const dur = idx === notes.length - 1 ? 0.5 : 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(this.sfxVolume * 0.1, t);
            gain.gain.linearRampToValueAtTime(1e-3, t + dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + dur);
          }, idx * 110);
        });
        break;
      }
    }
  }

  // Play Background Soundtrack (handles MP3 streaming vs retro-synth generation)
  public playBGM(type: BGMType, forceRestart: boolean = false) {
    if (this.currentBGM === type && !forceRestart) return;

    this.stopProceduralBGM();
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio = null;
      } catch {
        // Clear audio pointer
      }
    }

    this.currentBGM = type;
    if (type === "none" || this.isMuted || this.isMusicMuted) return;

    if (type === "duel" && this.silenceDuelMusic) {
      // Respect user's setting to keep duels silent to avoid interfering with pronunciation
      return;
    }

    this.initCtx();

    // 1. If custom MP3 exists, stream it loop-enabled
    const customMusicPath = this.bgmSources[type];
    if (this.verifiedAssets[customMusicPath]) {
      try {
        this.bgmAudio = new Audio(customMusicPath);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.musicVolume;
        this.bgmAudio.muted = this.isMuted || this.isMusicMuted;
        this.bgmAudio.play().catch(() => {
          // Fall back silently to retro procedural synthesizer
          this.playProceduralBGM(type);
        });
        return;
      } catch {
        // Fallback to procedural synth on error
      }
    }

    // 2. Otherwise play synthetic procedural 8-bit loops
    this.playProceduralBGM(type);
  }

  // Stops any background music
  public stopBGM() {
    this.currentBGM = "none";
    this.stopProceduralBGM();
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio = null;
      } catch {
        // Silent
      }
    }
  }

  // Web Audio Procedural Sequencer for infinite 8-bit BGM loops! Keep code clean & non-blocking.
  private playProceduralBGM(type: BGMType) {
    if (this.isMuted || this.isMusicMuted || !this.ctx) return;
    this.stopProceduralBGM();

    this.seqStep = 0;

    // Define retro loops!
    // Happy simple ascending arpeggios for Intro
    const introNotes = [261.63, 311.13, 392.0, 466.16, 311.13, 392.0, 466.16, 523.25]; // C minor 7 ascending
    // Relaxed wandering melody for the Board map
    const boardNotes = [329.63, 392.0, 440.0, 493.88, 440.0, 493.88, 523.25, 493.88]; // E minor / G major
    // High-energy fast duel arpeggio
    const duelNotes = [220.0, 220.0, 261.63, 220.0, 293.66, 220.0, 329.63, 392.0, 440.0, 440.0, 392.0, 392.0, 349.23, 293.66, 261.63, 246.94]; // Fast synth minor theme

    const bpm = type === "duel" ? 135 : type === "board" ? 95 : 110;
    const stepDuration = 60 / bpm / (type === "duel" ? 2 : 1); // 16th notes for duel, 8th for rest

    const scheduleNextStep = () => {
      if (this.isMuted || this.isMusicMuted || !this.ctx || this.currentBGM !== type) return;

      const t = this.ctx.currentTime;
      let freq = 0;

      if (type === "intro") {
        freq = introNotes[this.seqStep % introNotes.length];
      } else if (type === "board") {
        freq = boardNotes[this.seqStep % boardNotes.length];
      } else if (type === "duel") {
        freq = duelNotes[this.seqStep % duelNotes.length];
      }

      // Schedule playing the retro chiptune note!
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Authentic retro square waves for music (triangle for low board base, square/saw for high-tempo duel)
        osc.type = type === "board" ? "triangle" : type === "duel" ? "sawtooth" : "square";
        osc.frequency.setValueAtTime(freq, t);

        const activeVolume = this.musicVolume * 0.035; // keep background music soft & non-intrusive
        gain.gain.setValueAtTime(activeVolume, t);
        // Soft touch release envelope
        gain.gain.exponentialRampToValueAtTime(1e-4, t + stepDuration * 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + stepDuration * 0.95);
      }

      this.seqStep++;
    };

    // Run the scheduler loop
    this.seqInterval = window.setInterval(scheduleNextStep, stepDuration * 1000);
  }

  private stopProceduralBGM() {
    if (this.seqInterval) {
      clearInterval(this.seqInterval);
      this.seqInterval = null;
    }
  }

  public getCurrentBGM(): BGMType {
    return this.currentBGM;
  }
}

// Global hook/singleton exporter for easy state propagation
export const audio = new AudioManager();
