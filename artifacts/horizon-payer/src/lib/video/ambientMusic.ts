import { useEffect, useRef, useCallback } from "react";

export function useAmbientMusic(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopMusic = useCallback(() => {
    if (!ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    masterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      oscNodesRef.current.forEach((n) => {
        try { n.stop(); } catch {}
        try { n.disconnect(); } catch {}
      });
      oscNodesRef.current = [];
    }, 4000);
  }, []);

  const startMusic = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    oscNodesRef.current.forEach((n) => { try { n.stop(); } catch {} });
    oscNodesRef.current = [];

    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.052, now + 5);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.setValueAtTime(100, now);
    hpf.Q.setValueAtTime(0.5, now);
    hpf.connect(masterGain);

    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(2200, now);
    lpf.Q.setValueAtTime(0.7, now);
    lpf.connect(hpf);

    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.48, now);
    const feedbackGain = ctx.createGain();
    feedbackGain.gain.setValueAtTime(0.18, now);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    const delayWetGain = ctx.createGain();
    delayWetGain.gain.setValueAtTime(0.12, now);
    delay.connect(delayWetGain);
    delayWetGain.connect(lpf);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.065, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.035, now);
    lfo.connect(lfoGain);
    lfo.start(now);
    oscNodesRef.current.push(lfo);

    // F major sustained pad: F2 C3 F3 A3 C4 F4
    // Very warm, neutral, corporate/ambient feel
    const voices: { freq: number; gain: number; detune: number }[] = [
      { freq: 87.31,  gain: 0.40, detune:  0  },
      { freq: 87.31,  gain: 0.20, detune: -5  },
      { freq: 130.81, gain: 0.32, detune:  3  },
      { freq: 130.81, gain: 0.16, detune: -3  },
      { freq: 174.61, gain: 0.26, detune:  2  },
      { freq: 174.61, gain: 0.13, detune: -2  },
      { freq: 220.00, gain: 0.22, detune:  4  },
      { freq: 220.00, gain: 0.11, detune: -4  },
      { freq: 261.63, gain: 0.18, detune:  3  },
      { freq: 261.63, gain: 0.09, detune: -3  },
      { freq: 349.23, gain: 0.12, detune:  5  },
      { freq: 349.23, gain: 0.06, detune: -5  },
    ];

    voices.forEach(({ freq, gain: baseGain, detune }) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(baseGain, now);
      lfoGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(lpf);
      oscGain.connect(delay);

      osc.start(now);
      oscNodesRef.current.push(osc);
    });
  }, []);

  useEffect(() => {
    if (enabled) {
      startMusic();
    } else {
      stopMusic();
    }
    return () => {
      if (enabled) stopMusic();
    };
  }, [enabled, startMusic, stopMusic]);
}
