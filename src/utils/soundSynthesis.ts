/**
 * Local Web Audio API Sound Synthesizer
 * 100% offline, zero external audio asset dependency.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientType: string | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a pleasant dual-harmonic chime for timer/countdown completion
   */
  public playCompletionChime(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Master gain with smooth exponential decay
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      masterGain.connect(ctx.destination);

      // Primary oscillator (D5 - 587.33 Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.8);
      osc1.connect(masterGain);

      // Harmonizing oscillator (A5 - 880.00 Hz)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, now);
      osc2.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (err) {
      console.warn('[SoundSynthesizer] Unable to play chime:', err);
    }
  }

  /**
   * Plays gentle click/tick feedback
   */
  public playClick(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (err) {
      // Ignore click error
    }
  }

  /**
   * Starts ambient background noise (Rain, White Noise, Deep Brown Noise)
   */
  public startAmbientNoise(type: 'rain' | 'white' | 'brown', volume = 0.15): void {
    try {
      this.stopAmbientNoise();

      const ctx = this.getAudioContext();
      const bufferSize = ctx.sampleRate * 2; // 2 seconds looping buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          // Brown noise (integrated white noise - warm, deep rumble)
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else if (type === 'rain') {
          // Rain simulation: Pink/filtered noise with soft random drops
          lastOut = (lastOut + 0.08 * white) / 1.08;
          const drop = Math.random() > 0.99 ? (Math.random() - 0.5) * 0.4 : 0;
          data[i] = lastOut * 2.0 + drop;
        } else {
          // White noise
          data[i] = white * 0.3;
        }
      }

      this.ambientSource = ctx.createBufferSource();
      this.ambientSource.buffer = buffer;
      this.ambientSource.loop = true;

      // Filter to soften the noise
      const filter = ctx.createBiquadFilter();
      if (type === 'brown') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
      } else if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, ctx.currentTime);
      }

      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(volume, ctx.currentTime);

      this.ambientSource.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(ctx.destination);

      this.ambientSource.start();
      this.currentAmbientType = type;
    } catch (err) {
      console.warn('[SoundSynthesizer] Unable to start ambient noise:', err);
    }
  }

  /**
   * Sets volume of currently playing ambient noise
   */
  public setAmbientVolume(volume: number): void {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  /**
   * Stops currently playing ambient noise
   */
  public stopAmbientNoise(): void {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch (e) {
        // already stopped
      }
      this.ambientSource = null;
      this.currentAmbientType = null;
    }
  }

  public getCurrentAmbientType(): string | null {
    return this.currentAmbientType;
  }
}

export const soundSynthesizer = new SoundSynthesizer();
