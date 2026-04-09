import { useEffect, useRef, useCallback } from "react";

// ---  Musical constants ---
const BPM = 94;
const BEAT = 60 / BPM;       // ~0.638s
const S8  = BEAT / 2;        // 8th note
const S16 = BEAT / 4;        // 16th note
const BAR = BEAT * 4;        // one bar

// --- 4-bar chord progression: Cmaj → Am → Fmaj → G (uplifting corporate) ---
const PROG = [
  {
    // C major — bright, hopeful
    arp:  [261.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63],
    mel:  [659.25, 0,      523.25, 0,      783.99, 0,      659.25, 0],
    bass: 65.41,
    pad:  [130.81, 261.63, 329.63, 392.00],
  },
  {
    // A minor — warmth
    arp:  [220.00, 261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63],
    mel:  [523.25, 0,      440.00, 0,      659.25, 0,      523.25, 0],
    bass: 110.00,
    pad:  [110.00, 220.00, 261.63, 329.63],
  },
  {
    // F major — depth, openness
    arp:  [174.61, 220.00, 261.63, 329.63, 349.23, 329.63, 261.63, 220.00],
    mel:  [440.00, 0,      349.23, 0,      523.25, 0,      440.00, 0],
    bass: 87.31,
    pad:  [87.31,  174.61, 220.00, 261.63],
  },
  {
    // G major — energy, forward motion
    arp:  [196.00, 246.94, 293.66, 392.00, 493.88, 392.00, 293.66, 246.94],
    mel:  [493.88, 0,      392.00, 0,      587.33, 0,      493.88, 523.25],
    bass: 98.00,
    pad:  [98.00,  196.00, 246.94, 293.66],
  },
];

// --- Audio helpers ---
function arpNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.42, t + 0.010);
  env.gain.setValueAtTime(0.42, t + S8 * 0.65);
  env.gain.linearRampToValueAtTime(0, t + S8 * 0.88);
  osc.connect(env); env.connect(dest);
  osc.start(t); osc.stop(t + S8);
}

function melNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  // Slightly detuned twin sines for shimmer
  [0, 4].forEach((detune) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.detune.setValueAtTime(detune, t);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.28, t + 0.025);
    env.gain.setValueAtTime(0.28, t + S8 * 1.6);
    env.gain.linearRampToValueAtTime(0, t + S8 * 2.2);
    osc.connect(env); env.connect(dest);
    osc.start(t); osc.stop(t + S8 * 2.5);
  });
}

function bassNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  // Sine fundamental + weak octave-up for body
  [1, 2].forEach((mul, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * mul, t);
    const env = ctx.createGain();
    const peak = i === 0 ? 0.9 : 0.18;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peak, t + 0.018);
    env.gain.exponentialRampToValueAtTime(peak * 0.3, t + BEAT * 0.55);
    env.gain.linearRampToValueAtTime(0, t + BEAT * 1.75);
    osc.connect(env); env.connect(dest);
    osc.start(t); osc.stop(t + BEAT * 1.8);
  });
}

function padChord(ctx: AudioContext, dest: AudioNode, freqs: number[], t: number) {
  freqs.forEach((freq, i) => {
    // Two detuned saws per voice for warmth
    [-4, 4].forEach((detune) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime(detune, t);
      const lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.setValueAtTime(700 + i * 90, t);
      lpf.Q.setValueAtTime(0.8, t);
      const env = ctx.createGain();
      const peakV = (0.08 - i * 0.012) * 0.5; // halved per detuned copy
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(peakV, t + 0.4);
      env.gain.setValueAtTime(peakV, t + BAR - 0.35);
      env.gain.linearRampToValueAtTime(0, t + BAR);
      osc.connect(lpf); lpf.connect(env); env.connect(dest);
      osc.start(t); osc.stop(t + BAR + 0.05);
    });
  });
}

// Subtle rhythmic shaker (high-passed noise bursts on offbeats)
function shaker(ctx: AudioContext, dest: AudioNode, t: number) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.04), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.setValueAtTime(9000, t);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.09, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.038);
  src.connect(hpf); hpf.connect(env); env.connect(dest);
  src.start(t); src.stop(t + 0.04);
}

// --- Main hook ---
interface MusicState {
  ctx: AudioContext;
  masterGain: GainNode;
  arpBus: GainNode;
  melBus: GainNode;
  bassBus: GainNode;
  padBus: GainNode;
  shakerBus: GainNode;
  schedulerId: ReturnType<typeof setInterval>;
  nextBarTime: number;
  barIndex: number;
}

export function useAmbientMusic(enabled: boolean) {
  const stateRef = useRef<MusicState | null>(null);

  const scheduleBar = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const { ctx, arpBus, melBus, bassBus, padBus, shakerBus } = s;
    const now = ctx.currentTime;

    while (s.nextBarTime < now + 0.18) {
      const t = s.nextBarTime;
      const chord = PROG[s.barIndex % 4];

      padChord(ctx, padBus, chord.pad, t);

      chord.arp.forEach((freq, n) => {
        arpNote(ctx, arpBus, freq, t + n * S8);
      });

      chord.mel.forEach((freq, n) => {
        if (freq > 0) melNote(ctx, melBus, freq, t + n * S8);
      });

      // Bass on beats 1 & 3
      bassNote(ctx, bassBus, chord.bass, t);
      bassNote(ctx, bassBus, chord.bass, t + BEAT * 2);

      // Shakers on every 8th note offbeat (2nd 8th of each beat)
      for (let b = 0; b < 4; b++) {
        shaker(ctx, shakerBus, t + b * BEAT + S8);
      }

      // Extra shaker accent on beat 3 downbeat for groove
      shaker(ctx, shakerBus, t + BEAT * 2);

      s.nextBarTime += BAR;
      s.barIndex++;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (stateRef.current) {
        const { ctx, masterGain, schedulerId } = stateRef.current;
        clearInterval(schedulerId);
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.45);
        const s = stateRef.current;
        stateRef.current = null;
        setTimeout(() => { try { s.ctx.close(); } catch {} }, 3000);
      }
      return;
    }

    // Clean up previous context
    if (stateRef.current) {
      clearInterval(stateRef.current.schedulerId);
      try { stateRef.current.ctx.close(); } catch {}
      stateRef.current = null;
    }

    const ctx = new AudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.095, ctx.currentTime + 2.5);
    masterGain.connect(ctx.destination);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-22, ctx.currentTime);
    comp.knee.setValueAtTime(8, ctx.currentTime);
    comp.ratio.setValueAtTime(5, ctx.currentTime);
    comp.attack.setValueAtTime(0.003, ctx.currentTime);
    comp.release.setValueAtTime(0.22, ctx.currentTime);
    comp.connect(masterGain);

    const arpBus = ctx.createGain();
    arpBus.gain.setValueAtTime(0.68, ctx.currentTime);
    arpBus.connect(comp);

    const melBus = ctx.createGain();
    melBus.gain.setValueAtTime(0.5, ctx.currentTime);
    melBus.connect(comp);

    const bassBus = ctx.createGain();
    bassBus.gain.setValueAtTime(0.42, ctx.currentTime);
    bassBus.connect(comp);

    const padBus = ctx.createGain();
    padBus.gain.setValueAtTime(0.32, ctx.currentTime);
    padBus.connect(comp);

    const shakerBus = ctx.createGain();
    shakerBus.gain.setValueAtTime(0.55, ctx.currentTime);
    shakerBus.connect(comp);

    stateRef.current = {
      ctx, masterGain, arpBus, melBus, bassBus, padBus, shakerBus,
      schedulerId: setInterval(() => scheduleBar(), 40),
      nextBarTime: ctx.currentTime + 0.05,
      barIndex: 0,
    };

    scheduleBar();

    return () => {
      if (stateRef.current) {
        clearInterval(stateRef.current.schedulerId);
      }
    };
  }, [enabled, scheduleBar]);
}
