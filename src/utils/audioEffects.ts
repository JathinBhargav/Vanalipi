import { InteractiveSoundType } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playInteractiveSound(type: InteractiveSoundType) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'chirp': {
        // High-frequency bird chirp sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2800, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.16);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);

        // Second double chirp note
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1600, now + 0.14);
        osc2.frequency.exponentialRampToValueAtTime(3200, now + 0.22);
        osc2.frequency.exponentialRampToValueAtTime(2000, now + 0.32);

        gain2.gain.setValueAtTime(0, now + 0.14);
        gain2.gain.linearRampToValueAtTime(0.3, now + 0.18);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now + 0.14);
        osc2.stop(now + 0.38);
        break;
      }

      case 'wiggle': {
        // Playful flower wiggle wobble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // LFO for vibrato wobble
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        lfo.frequency.setValueAtTime(16, now); // 16 Hz rapid wiggle
        lfoGain.gain.setValueAtTime(60, now);

        lfo.connect(osc.frequency);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.linearRampToValueAtTime(560, now + 0.15);
        osc.frequency.linearRampToValueAtTime(380, now + 0.35);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.4);
        osc.stop(now + 0.4);
        break;
      }

      case 'twinkle': {
        // Magical chime cascade (C6, E6, G6, B6, C7)
        const notes = [1046.5, 1318.51, 1567.98, 1975.53, 2093.0];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.055;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);

          gain.gain.setValueAtTime(0, noteStart);
          gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteStart);
          osc.stop(noteStart + 0.35);
        });
        break;
      }

      case 'boing': {
        // Cartoon spring bounce
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.32);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }

      case 'giggle': {
        // Cheerful baby giggle notes
        const gigglePitches = [480, 560, 640, 520, 600, 720];
        gigglePitches.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.06;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);
          osc.frequency.linearRampToValueAtTime(freq + 40, noteStart + 0.04);

          gain.gain.setValueAtTime(0.16, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteStart);
          osc.stop(noteStart + 0.08);
        });
        break;
      }

      case 'splash': {
        // Bubbly water droplet pops
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.09);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case 'flutter': {
        // Soft wings flutter
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const flapTime = now + i * 0.07;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, flapTime);
          osc.frequency.exponentialRampToValueAtTime(320, flapTime + 0.04);

          gain.gain.setValueAtTime(0.12, flapTime);
          gain.gain.exponentialRampToValueAtTime(0.001, flapTime + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(flapTime);
          osc.stop(flapTime + 0.06);
        }
        break;
      }

      case 'roar': {
        // Cute baby dragon squeaky roar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }

      case 'purr': {
        // Gentle warm rhythmic purr
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        lfo.frequency.setValueAtTime(24, now);
        lfoGain.gain.setValueAtTime(0.1, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        lfo.connect(gain.gain);
        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.6);
        osc.stop(now + 0.6);
        break;
      }

      case 'chime':
      default: {
        // Resonant golden bell chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
    }
  } catch (err) {
    console.warn('Audio effects error:', err);
  }
}

/**
 * Generates a realistic physical comic book page turn sound:
 * Combines paper friction whoosh, bandpass noise flutter, and gentle page landing snap.
 */
export function playComicPageTurnSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. White noise buffer for paper scrape & whoosh
    const bufferSize = Math.floor(ctx.sampleRate * 0.42); // 420ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Filter noise to sound like paper texture
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.18);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.4);
    filter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.08);
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.22);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.42);

    // 2. Low-frequency paper snap / landing thud
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();

    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(130, now + 0.22);
    snapOsc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

    snapGain.gain.setValueAtTime(0, now);
    snapGain.gain.setValueAtTime(0, now + 0.22);
    snapGain.gain.linearRampToValueAtTime(0.16, now + 0.25);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);

    snapOsc.start(now + 0.22);
    snapOsc.stop(now + 0.4);
  } catch (err) {
    console.warn('Comic page turn sound error:', err);
  }
}

