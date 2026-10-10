/**
 * Synthesizes emergency alert tones directly using the browser's Web Audio API
 * 100% offline, zero external audio asset dependencies!
 */

class SoundAlertService {
  private audioCtx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Tactical radar ping sound
   */
  public playTacticalPing() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio autoplay may be prevented before user interaction
    }
  }

  /**
   * High-priority Safe Zone entry sound (double ascending melodic chirp)
   */
  public playSafeZoneAlert() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = now + idx * 0.1;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch (e) {}
  }

  /**
   * Emergency SOS beacon alarm (Morse code: . . . - - - . . .)
   */
  public playSosAlarm() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // 3 short (0.08s), 3 long (0.24s), 3 short (0.08s)
      const dot = 0.08;
      const dash = 0.22;
      const gap = 0.06;

      let t = now;
      const tones: number[] = [dot, dot, dot, dash, dash, dash, dot, dot, dot];

      tones.forEach((duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 920;

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.setValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration);

        t += duration + gap;
      });
    } catch (e) {}
  }

  private continuousInterval: any = null;

  public playStatusChime() {
    this.playTacticalPing();
  }

  public playSosChime() {
    this.playSosAlarm();
  }

  public startContinuousAlarm() {
    this.playSosAlarm();
    if (this.continuousInterval) clearInterval(this.continuousInterval);
    this.continuousInterval = setInterval(() => {
      this.playSosAlarm();
    }, 1800);
  }

  public stopContinuousAlarm() {
    if (this.continuousInterval) {
      clearInterval(this.continuousInterval);
      this.continuousInterval = null;
    }
  }
}

export const soundAlert = new SoundAlertService();
