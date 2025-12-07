// Sound effects using Web Audio API - no external files needed
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Dramatic reveal sound
  playReveal() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  // Ominous mafia reveal
  playMafiaReveal() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    // Low ominous tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.8);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    // High accent
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.6);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.6);
  }

  // Pleasant civilian reveal
  playCivilianReveal() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5 + i * 0.05);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + 0.5 + i * 0.05);
    });
  }

  // Button click
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }

  // Timer tick
  playTick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
  }

  // Timer alarm
  playAlarm() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(880, ctx.currentTime + i * 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15 + i * 0.2);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + 0.15 + i * 0.2);
    }
  }

  // Game start fanfare
  playGameStart() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + i * 0.1);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + 0.3 + i * 0.1);
    });
  }

  // Night phase ambient
  private ambientNode: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private dayAmbientNode: OscillatorNode | null = null;
  private dayAmbientGain: GainNode | null = null;

  playNightSound() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    // Eerie low drone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  }

  // Continuous night ambient loop
  startNightAmbient() {
    if (!this.enabled) return;
    this.stopAmbient();
    
    const ctx = this.getContext();
    
    // Create a dark, mysterious drone
    this.ambientNode = ctx.createOscillator();
    this.ambientGain = ctx.createGain();
    
    this.ambientNode.connect(this.ambientGain);
    this.ambientGain.connect(ctx.destination);
    
    this.ambientNode.type = "sine";
    this.ambientNode.frequency.setValueAtTime(55, ctx.currentTime); // Low A
    this.ambientGain.gain.setValueAtTime(0.03, ctx.currentTime);
    
    // Add subtle LFO for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientNode.frequency);
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    lfoGain.gain.setValueAtTime(10, ctx.currentTime);
    lfo.start();
    
    this.ambientNode.start();
  }

  // Continuous day ambient loop
  startDayAmbient() {
    if (!this.enabled) return;
    this.stopAmbient();
    
    const ctx = this.getContext();
    
    // Brighter, warmer ambient tone
    this.dayAmbientNode = ctx.createOscillator();
    this.dayAmbientGain = ctx.createGain();
    
    this.dayAmbientNode.connect(this.dayAmbientGain);
    this.dayAmbientGain.connect(ctx.destination);
    
    this.dayAmbientNode.type = "triangle";
    this.dayAmbientNode.frequency.setValueAtTime(220, ctx.currentTime); // A3
    this.dayAmbientGain.gain.setValueAtTime(0.015, ctx.currentTime);
    
    this.dayAmbientNode.start();
  }

  stopAmbient() {
    try {
      if (this.ambientNode) {
        this.ambientNode.stop();
        this.ambientNode = null;
      }
      if (this.ambientGain) {
        this.ambientGain = null;
      }
      if (this.dayAmbientNode) {
        this.dayAmbientNode.stop();
        this.dayAmbientNode = null;
      }
      if (this.dayAmbientGain) {
        this.dayAmbientGain = null;
      }
    } catch (e) {
      // Ignore errors from already stopped nodes
    }
  }

  // Voting tension sound
  playVotingAmbient() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }
}

export const soundManager = new SoundManager();
