import { useEffect, useRef, useState, useCallback } from "react";

export const NARRATION_SCRIPTS: Record<number, string> = {
  0: "Welcome to CareOps360 — the executive operations portal built for Horizon Blue Cross Blue Shield, in partnership with IBM.",
  1: "The Executive Overview delivers real-time KPIs across your entire operation. Monitor claims volume, membership trends, and financial performance — all in one unified view.",
  2: "App Health gives your teams instant visibility into system status, incident severity, and SLA compliance across all platform services.",
  3: "The Members dashboard tracks enrollment KPIs, demographic breakdowns, and population mix — helping leadership monitor member trends in real time.",
  4: "The Claims dashboard surfaces processing volume, auto-adjudication rates, and line-of-business backlog — enabling faster resolution and fewer delays.",
  5: "Prior Authorization tracking shows approval rates, backlog queues, and reviewer workload — so your clinical teams can prioritize effectively.",
  6: "The Providers dashboard monitors network status, credentialing pipelines, and contract renewals — keeping your provider relationships on track.",
  7: "Contact Center analytics surface call volume trends, first-call resolution rates, IVR deflection, and average handle time.",
  8: "The Vendor Invoices section gives IBM account teams a dedicated view of invoice status, payment approvals, and contract spend.",
  9: "IBM AIOps Value quantifies the impact of automation — tracking cost savings, incident reduction, and efficiency gains across 7, 14, and 21-day windows.",
  10: "The Transformation Roadmap charts your digital journey — from initiative planning through delivery milestones and value realization.",
  11: "Ask Assistant lets leadership query the platform in plain language. Get instant answers on claims trends, member metrics, or operational status — no reports needed.",
  12: "CareOps360. Delivering executive clarity for Horizon Blue Cross Blue Shield — in partnership with IBM.",
};

function pickFemaleUSVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    "Microsoft Jenny Online (Natural) - English (United States)",
    "Microsoft Aria Online (Natural) - English (United States)",
    "Google US English",
    "Samantha",
    "Microsoft Zira Desktop - English (United States)",
    "Karen",
    "Moira",
  ];
  for (const name of preferred) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  const usFemaleFallback = voices.find(
    (v) => v.lang.startsWith("en-US") && /female|woman|girl/i.test(v.name)
  );
  if (usFemaleFallback) return usFemaleFallback;
  return voices.find((v) => v.lang.startsWith("en-US")) ?? null;
}

export function useNarration(currentScene: number) {
  const [narrationOn, setNarrationOn] = useState(false);
  const enabledRef = useRef(false);
  const voiceReadyRef = useRef(false);

  useEffect(() => {
    const load = () => { voiceReadyRef.current = true; };
    if (window.speechSynthesis.getVoices().length > 0) {
      voiceReadyRef.current = true;
    }
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const speak = useCallback((sceneIndex: number) => {
    if (!enabledRef.current) return;
    window.speechSynthesis.cancel();
    const text = NARRATION_SCRIPTS[sceneIndex];
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickFemaleUSVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (enabledRef.current) {
      speak(currentScene);
    }
  }, [currentScene, speak]);

  const toggleNarration = useCallback(() => {
    setNarrationOn((prev) => {
      const next = !prev;
      enabledRef.current = next;
      if (next) {
        speak(currentScene);
      } else {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, [currentScene, speak]);

  return { narrationOn, toggleNarration };
}
