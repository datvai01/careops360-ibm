import { useEffect, useRef, useState, useCallback } from "react";
import { useAmbientMusic } from "./ambientMusic";

export const NARRATION_SCRIPTS: Record<number, string> = {
  0:  "CareOps360. The command center built for Horizon Blue Cross Blue Shield leadership — powered by IBM. Let's go.",
  1:  "Executive Overview. Live KPIs across claims, membership, and financials. Everything leadership needs — right now, in one view.",
  2:  "App Health. System status, SLA compliance, incident severity — your entire platform, always in sight.",
  3:  "Members. Enrollment trends, demographics, population mix. Know your membership. Know your mission.",
  4:  "Claims. High-volume processing, auto-adjudication rates, backlog by line — zero guesswork, full clarity.",
  5:  "Prior Authorization. Approval rates, open queues, reviewer capacity — clinical priorities, crystal clear.",
  6:  "Providers. Network health, credentialing pipelines, contract renewals — every relationship, fully on track.",
  7:  "Contact Center. Call volumes, resolution rates, handle time — member experience, measured and mastered.",
  8:  "Vendor Invoices. Invoice status, payment approvals, contract spend — IBM account teams, fully aligned.",
  9:  "IBM AIOps Value. Real cost savings. Real incident reduction. Proven ROI across 7, 14, and 21-day windows.",
  10: "Transformation Roadmap. From initiative to delivery — your digital journey, charted and moving fast.",
  11: "Ask Assistant. Plain language. Instant answers. Claims, members, operations — no reports, no waiting.",
  12: "CareOps360. Horizon Blue Cross Blue Shield. IBM. Executive clarity — delivered.",
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

  useAmbientMusic(narrationOn);

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
    utterance.rate = 1.12;
    utterance.pitch = 1.18;
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
