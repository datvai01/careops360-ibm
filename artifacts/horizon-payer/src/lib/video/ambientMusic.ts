import { useEffect, useRef, useCallback } from "react";

// --- 120 BPM — pumping 4/4 drive ---
const BPM = 120;
const BEAT = 60 / BPM;   // 0.500s
const S8  = BEAT / 2;    // 0.250s  — arp grid
const S16 = BEAT / 4;    // 0.125s  — shaker/hihat grid
const BAR = BEAT * 4;    // 2.000s

// C → Am → F → G  (uplifting, pumping)
const PROG = [
  {
    arp: [261.63, 329.63, 392, 493.88, 523.25, 493.88, 392, 329.63],
    mel: [659.25, 0,      783.99, 659.25, 523.25, 659.25, 783.99, 0    ],
    bass: 65.41,
    pad:  [130.81, 261.63, 329.63, 392],
  },
  {
    arp: [220, 261.63, 329.63, 392, 440, 392, 329.63, 261.63],
    mel: [523.25, 0,      659.25, 523.25, 440,    523.25, 659.25, 0    ],
    bass: 110,
    pad:  [110, 220, 261.63, 329.63],
  },
  {
    arp: [174.61, 220, 261.63, 329.63, 349.23, 329.63, 261.63, 220],
    mel: [440,    0,      523.25, 440,    349.23, 440,    523.25, 0    ],
    bass: 87.31,
    pad:  [87.31, 174.61, 220, 261.63],
  },
  {
    arp: [196, 246.94, 293.66, 392, 493.88, 392, 293.66, 246.94],
    mel: [493.88, 0,      587.33, 493.88, 392,    493.88, 587.33, 659.25],
    bass: 98,
    pad:  [98, 196, 246.94, 293.66],
  },
];

// --- Synth helpers ---
function arpNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.5, t + 0.008);
  env.gain.setValueAtTime(0.5, t + S8 * 0.55);
  env.gain.linearRampToValueAtTime(0, t + S8 * 0.82);
  osc.connect(env); env.connect(dest);
  osc.start(t); osc.stop(t + S8);
}

function melNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  [-3, 3].forEach((detune) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.detune.setValueAtTime(detune, t);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.3, t + 0.018);
    env.gain.setValueAtTime(0.3, t + S8 * 1.4);
    env.gain.linearRampToValueAtTime(0, t + S8 * 2.0);
    osc.connect(env); env.connect(dest);
    osc.start(t); osc.stop(t + S8 * 2.1);
  });
}

// Punchy 4-on-the-floor bass thud
function bassNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  [1, 2].forEach((mul, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * mul, t);
    const env = ctx.createGain();
    const peak = i === 0 ? 1.0 : 0.18;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peak, t + 0.010); // snap attack
    env.gain.exponentialRampToValueAtTime(peak * 0.12, t + BEAT * 0.42);
    env.gain.linearRampToValueAtTime(0, t + BEAT * 0.80);
    osc.connect(env); env.connect(dest);
    osc.start(t); osc.stop(t + BEAT * 0.85);
  });
}

function padChord(ctx: AudioContext, dest: AudioNode, freqs: number[], t: number) {
  freqs.forEach((freq, i) => {
    [-5, 5].forEach((detune) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime(detune, t);
      const lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.setValueAtTime(900 + i * 80, t);
      lpf.Q.setValueAtTime(1.2, t);
      const env = ctx.createGain();
      const peak = (0.09 - i * 0.012) * 0.5;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(peak, t + 0.25);
      env.gain.setValueAtTime(peak, t + BAR - 0.2);
      env.gain.linearRampToValueAtTime(0, t + BAR);
      osc.connect(lpf); lpf.connect(env); env.connect(dest);
      osc.start(t); osc.stop(t + BAR + 0.05);
    });
  });
}

// Crisp offbeat shaker
function shaker(ctx: AudioContext, dest: AudioNode, t: number, gain: number) {
  const len = Math.ceil(ctx.sampleRate * 0.032);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.setValueAtTime(9500, t);
  const env = ctx.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.028);
  src.connect(hpf); hpf.connect(env); env.connect(dest);
  src.start(t); src.stop(t + 0.032);
}

// --- Hook state ---
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

    while (s.nextBarTime < now + 0.20) {
      const t = s.nextBarTime;
      const chord = PROG[s.barIndex % 4];

      // Pad (whole bar)
      padChord(ctx, padBus, chord.pad, t);

      // Sidechain pump: duck pad on every beat and bounce back
      for (let b = 0; b < 4; b++) {
        const bt = t + b * BEAT;
        padBus.gain.setValueAtTime(0.55, bt);
        padBus.gain.linearRampToValueAtTime(0.06, bt + 0.012);
        padBus.gain.linearRampToValueAtTime(0.55, bt + BEAT * 0.75);
      }

      // 4-on-the-floor bass
      for (let b = 0; b < 4; b++) {
        bassNote(ctx, bassBus, chord.bass, t + b * BEAT);
      }

      // Arpeggio (8th notes — 8 notes/bar)
      chord.arp.forEach((freq, n) => arpNote(ctx, arpBus, freq, t + n * S8));

      // Melody (8th notes, sparse)
      chord.mel.forEach((freq, n) => {
        if (freq > 0) melNote(ctx, melBus, freq, t + n * S8);
      });

      // Shakers on every 16th note (skip beat 1 of bar for punch clarity)
      for (let n = 0; n < 16; n++) {
        const isBeat = n % 4 === 0;
        const isOffbeat = n % 2 === 1;
        const g = isBeat ? 0 : isOffbeat ? 0.14 : 0.06;
        if (g > 0) shaker(ctx, shakerBus, t + n * S16, g);
      }

      s.nextBarTime += BAR;
      s.barIndex++;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (stateRef.current) {
        const { ctx, masterGain, schedulerId } = stateRef.current;
        clearInterval(schedulerId);
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
        const old = stateRef.current;
        stateRef.current = null;
        setTimeout(() => { try { old.ctx.close(); } catch {} }, 2500);
      }
      return;
    }

    if (stateRef.current) {
      clearInterval(stateRef.current.schedulerId);
      try { stateRef.current.ctx.close(); } catch {}
      stateRef.current = null;
    }

    const ctx = new AudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-18, ctx.currentTime);
    comp.knee.setValueAtTime(6, ctx.currentTime);
    comp.ratio.setValueAtTime(6, ctx.currentTime);
    comp.attack.setValueAtTime(0.002, ctx.currentTime);
    comp.release.setValueAtTime(0.15, ctx.currentTime);
    comp.connect(masterGain);

    const arpBus = ctx.createGain();
    arpBus.gain.setValueAtTime(0.72, ctx.currentTime);
    arpBus.connect(comp);

    const melBus = ctx.createGain();
    melBus.gain.setValueAtTime(0.55, ctx.currentTime);
    melBus.connect(comp);

    const bassBus = ctx.createGain();
    bassBus.gain.setValueAtTime(0.52, ctx.currentTime);
    bassBus.connect(comp);

    const padBus = ctx.createGain();
    padBus.gain.setValueAtTime(0.55, ctx.currentTime);
    padBus.connect(comp);

    const shakerBus = ctx.createGain();
    shakerBus.gain.setValueAtTime(0.6, ctx.currentTime);
    shakerBus.connect(comp);

    stateRef.current = {
      ctx, masterGain, arpBus, melBus, bassBus, padBus, shakerBus,
      schedulerId: setInterval(() => scheduleBar(), 35),
      nextBarTime: ctx.currentTime + 0.04,
      barIndex: 0,
    };

    scheduleBar();

    return () => {
      if (stateRef.current) clearInterval(stateRef.current.schedulerId);
    };
  }, [enabled, scheduleBar]);
}
