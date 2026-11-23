// Gentle Web Audio API romantic soundtrack generator for built-in background music
// Plays warm felt-piano chords or ambient pads so background music works immediately
// without external dependencies, and supports custom MP3 playback & voice ducking.

type PresetType = 'piano' | 'ambient';

const CHORDS_PIANO: number[][] = [
  [174.61, 220.0, 261.63, 329.63, 392.0], // Fmaj9
  [146.83, 220.0, 261.63, 329.63, 349.23], // Dm9
  [116.54, 174.61, 220.0, 293.66, 349.23], // Bbmaj7
  [130.81, 196.0, 261.63, 329.63, 440.0], // C6
];

const CHORDS_AMBIENT: number[][] = [
  [164.81, 246.94, 329.63, 415.3], // Emaj7
  [138.59, 207.65, 277.18, 329.63], // C#m7
  [110.0, 164.81, 220.0, 277.18], // Amaj7
  [123.47, 185.0, 246.94, 311.13], // Badd4
];

export class AmbientSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private timerId: number | null = null;
  private step = 0;
  private isPlaying = false;
  private preset: PresetType = 'piano';
  private baseVolume = 0.45;
  private duckMultiplier = 1;

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.baseVolume * this.duckMultiplier;

      // Soft warm stereo-feel delay
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.value = 0.38;
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.value = 0.34;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1850;

      this.delayNode.connect(filter);
      filter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      filter.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(preset: PresetType) {
    this.preset = preset;
    this.ensureContext();
    if (this.isPlaying) {
      this.stop();
      this.ensureContext();
    }
    this.isPlaying = true;
    this.step = 0;
    this.scheduleNext();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public setVolume(vol: number) {
    this.baseVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.baseVolume * this.duckMultiplier,
        this.ctx.currentTime,
        0.12
      );
    }
  }

  public setDucked(ducked: boolean) {
    this.duckMultiplier = ducked ? 0.22 : 1;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.baseVolume * this.duckMultiplier,
        this.ctx.currentTime,
        0.2
      );
    }
  }

  private playNote(freq: number, duration: number, type: OscillatorType, peakGain: number) {
    if (!this.ctx || !this.masterGain || !this.delayNode) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const toneFilter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Subtle warm chorus detune
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.002, now);

    toneFilter.type = 'lowpass';
    toneFilter.frequency.setValueAtTime(this.preset === 'piano' ? 1400 : 950, now);

    const attack = this.preset === 'piano' ? 0.045 : 0.75;
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(toneFilter);
    osc2.connect(toneFilter);
    toneFilter.connect(noteGain);
    noteGain.connect(this.masterGain);
    noteGain.connect(this.delayNode);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  private scheduleNext() {
    if (!this.isPlaying) return;

    const chords = this.preset === 'piano' ? CHORDS_PIANO : CHORDS_AMBIENT;
    if (this.preset === 'piano') {
      const chordIndex = Math.floor(this.step / 8) % chords.length;
      const chord = chords[chordIndex];
      const noteIndex = this.step % chord.length;
      const freq = chord[noteIndex];

      // Bass root at start of measure
      if (this.step % 8 === 0) {
        this.playNote(chord[0] / 2, 4.2, 'sine', 0.16);
      }
      this.playNote(freq, 2.4, 'triangle', 0.11);

      this.step += 1;
      this.timerId = window.setTimeout(() => this.scheduleNext(), 560);
    } else {
      const chordIndex = this.step % chords.length;
      const chord = chords[chordIndex];
      chord.forEach((freq, i) => {
        window.setTimeout(() => {
          if (this.isPlaying) {
            this.playNote(freq, 4.8, 'sine', 0.07);
          }
        }, i * 160);
      });
      this.step += 1;
      this.timerId = window.setTimeout(() => this.scheduleNext(), 4200);
    }
  }
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
