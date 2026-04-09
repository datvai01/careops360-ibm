import { useEffect, useRef, useCallback } from "react";

// 120 BPM — tight 4/4 with real sidechain pump
const BPM  = 120;
const BEAT = 60 / BPM;   // 0.500 s
const S8   = BEAT / 2;   // 0.250 s  (8th-note grid for arp)
const S16  = BEAT / 4;   // 0.125 s  (16th-note grid for shakers)
const BAR  = BEAT * 4;   // 2.000 s

// C → Am → F → G  — classic uplifting progression
const PROG = [
  {
    arp:  [261.63, 392,    523.25, 392,    329.63, 493.88, 659.25, 493.88],
    mel:  [783.99, 0,      1046.5, 0,      783.99, 880,    1046.5, 0     ],
    bass: 65.41,
    pad:  [130.81, 261.63, 329.63, 392],
  },
  {
    arp:  [220,    329.63, 440,    329.63, 261.63, 392,    523.25, 392   ],
    mel:  [659.25, 0,      880,    0,      659.25, 783.99, 880,    0     ],
    bass: 110,
    pad:  [110,    220,    261.63, 329.63],
  },
  {
    arp:  [174.61, 261.63, 349.23, 261.63, 220,    329.63, 440,    329.63],
    mel:  [523.25, 0,      698.46, 0,      523.25, 659.25, 698.46, 0    ],
    bass: 87.31,
    pad:  [87.31,  174.61, 220,    261.63],
  },
  {
    arp:  [196,    293.66, 392,    293.66, 246.94, 392,    493.88, 392   ],
    mel:  [587.33, 0,      783.99, 0,      587.33, 659.25, 783.99, 880  ],
    bass: 98,
    pad:  [98,     196,    246.94, 293.66],
  },
];

// Soft-clip curve for harmonic richness
function makeClipper(ctx: AudioContext): WaveShaperNode {
  const n = 512;
  const curve = new Float32Array(n);
  const k = 80;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  const ws = ctx.createWaveShaper();
  ws.curve = curve;
  ws.oversample = "2x";
  return ws;
}

// Bright sawtooth arp note — the engine of the track
function arpNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, t);

  const clip = makeClipper(ctx);

  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.setValueAtTime(4200, t);
  lpf.frequency.linearRampToValueAtTime(1800, t + S8 * 0.8);
  lpf.Q.setValueAtTime(2.2, t);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.55, t + 0.006);
  env.gain.setValueAtTime(0.55, t + S8 * 0.52);
  env.gain.linearRampToValueAtTime(0, t + S8 * 0.85);

  osc.connect(clip); clip.connect(lpf); lpf.connect(env); env.connect(dest);
  osc.start(t); osc.stop(t + S8);
}

// Bright shimmer melody — twin sines an octave up
function melNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  [-2, 2].forEach((d) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.detune.setValueAtTime(d, t);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.32, t + 0.015);
    env.gain.setValueAtTime(0.32, t + S8 * 1.3);
    env.gain.linearRampToValueAtTime(0, t + S8 * 2.0);
    osc.connect(env); env.connect(dest);
    osc.start(t); osc.stop(t + S8 * 2.1);
  });
}

// Snappy punchy bass — 4 on the floor
function bassNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  // Pitch envelope: start higher, fall to root (punchy thump)
  osc.frequency.setValueAtTime(freq * 2.2, t);
  osc.frequency.exponentialRampToValueAtTime(freq, t + 0.035);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(1.1, t + 0.010);
  env.gain.exponentialRampToValueAtTime(0.08, t + BEAT * 0.40);
  env.gain.linearRampToValueAtTime(0, t + BEAT * 0.72);
  osc.connect(env); env.connect(dest);
  osc.start(t); osc.stop(t + BEAT * 0.75);
}

// Warm detuned-saw pad
function padChord(ctx: AudioContext, dest: AudioNode, freqs: number[], t: number) {
  freqs.forEach((freq, i) => {
    [-7, 7].forEach((d) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime(d, t);
      const lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.setValueAtTime(1800 + i * 120, t);
      lpf.Q.setValueAtTime(1.0, t);
      const env = ctx.createGain();
      const peak = (0.10 - i * 0.014) * 0.5;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(peak, t + 0.3);
      env.gain.setValueAtTime(peak, t + BAR - 0.25);
      env.gain.linearRampToValueAtTime(0, t + BAR);
      osc.connect(lpf); lpf.connect(env); env.connect(dest);
      osc.start(t); osc.stop(t + BAR + 0.05);
    });
  });
}

// Crisp 16th-note shakers
function shaker(ctx: AudioContext, dest: AudioNode, t: number, gain: number) {
  const len = Math.ceil(ctx.sampleRate * 0.028);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.setValueAtTime(10000, t);
  const env = ctx.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.024);
  src.connect(hpf); hpf.connect(env); env.connect(dest);
  src.start(t); src.stop(t + 0.028);
}

interface MusicState {
  ctx: AudioContext;
  masterGain: GainNode;
  arpBus: GainNode;
  melBus: GainNode;
  bassBus: GainNode;
  pumpBus: GainNode; // sidechain target — everything except bass
  schedulerId: ReturnType<typeof setInterval>;
  nextBarTime: number;
  barIndex: number;
}

export function useAmbientMusic(enabled: boolean) {
  const stateRef = useRef<MusicState | null>(null);

  const scheduleBar = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const { ctx, arpBus, melBus, bassBus, pumpBus } = s;
    const now = ctx.currentTime;

    while (s.nextBarTime < now + 0.22) {
      const t = s.nextBarTime;
      const chord = PROG[s.barIndex % 4];

      // --- Pad (whole bar, into pumpBus) ---
      padChord(ctx, pumpBus, chord.pad, t);

      // --- 4-on-the-floor bass (direct to comp, NOT pumped) ---
      for (let b = 0; b < 4; b++) {
        bassNote(ctx, bassBus, chord.bass, t + b * BEAT);
      }

      // --- Sidechain pump: duck pumpBus on every bass hit ---
      // Instant snap down, exponential rise — the "pumping" effect
      for (let b = 0; b < 4; b++) {
        const bt = t + b * BEAT;
        pumpBus.gain.setValueAtTime(1.0, bt);
        pumpBus.gain.setValueAtTime(0.06, bt + 0.003); // instant duck
        pumpBus.gain.setTargetAtTime(1.0, bt + 0.003, 0.08); // exponential recovery
      }

      // --- Arp (into pumpBus) ---
      chord.arp.forEach((freq, n) => arpNote(ctx, pumpBus, freq, t + n * S8));

      // --- Melody (into melBus → pumpBus) ---
      chord.mel.forEach((freq, n) => {
        if (freq > 0) melNote(ctx, melBus, freq, t + n * S8);
      });

      // --- 16th-note shakers (into pumpBus) ---
      for (let n = 0; n < 16; n++) {
        const isBeat = n % 4 === 0;
        if (isBeat) continue; // beat 1 left silent (punch clarity)
        const g = n % 2 === 1 ? 0.18 : 0.07; // offbeats stronger
        shaker(ctx, pumpBus, t + n * S16, g);
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
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
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
    masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2);
    masterGain.connect(ctx.destination);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-16, ctx.currentTime);
    comp.knee.setValueAtTime(5, ctx.currentTime);
    comp.ratio.setValueAtTime(5, ctx.currentTime);
    comp.attack.setValueAtTime(0.002, ctx.currentTime);
    comp.release.setValueAtTime(0.12, ctx.currentTime);
    comp.connect(masterGain);

    // Bass goes direct (not pumped)
    const bassBus = ctx.createGain();
    bassBus.gain.setValueAtTime(0.58, ctx.currentTime);
    bassBus.connect(comp);

    // Everything else goes through the pump bus
    const pumpBus = ctx.createGain();
    pumpBus.gain.setValueAtTime(1.0, ctx.currentTime);
    pumpBus.connect(comp);

    // Arp sub-bus into pumpBus
    const arpBus = ctx.createGain();
    arpBus.gain.setValueAtTime(0.7, ctx.currentTime);
    arpBus.connect(pumpBus);

    // Melody sub-bus into pumpBus
    const melBus = ctx.createGain();
    melBus.gain.setValueAtTime(0.5, ctx.currentTime);
    melBus.connect(pumpBus);

    stateRef.current = {
      ctx, masterGain, arpBus, melBus, bassBus, pumpBus,
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
