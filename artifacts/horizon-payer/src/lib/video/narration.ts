import { useEffect, useRef, useState, useCallback } from "react";
import { useAmbientMusic } from "./ambientMusic";

export const NARRATION_SCRIPTS: Record<number, string> = {
  0: "Welcome to CareOps360 — a platform thoughtfully designed to bring clarity and confidence to Horizon Blue Cross Blue Shield leadership, in partnership with IBM. We're glad you're here.",
  1: "Your Executive Overview brings together the metrics that matter most — from claims and membership trends to financial performance. Everything your leadership team needs, in one easy-to-read view.",
  2: "The App Health section keeps your teams informed about system status, service reliability, and SLA health — so you always have a clear, reassuring picture of how the platform is running.",
  3: "In the Members section, you'll find a warm and detailed picture of your enrolled population — including demographic trends and coverage breakdowns — helping you stay closely connected to the people you serve.",
  4: "The Claims view gives you a thoughtful look at processing volumes, adjudication rates, and line-of-business activity — so your team can stay on top of things and resolve any delays early.",
  5: "Prior Authorization is here to support your clinical teams with a clear view of approval rates, open queues, and reviewer capacity — helping them focus their energy where it's needed most.",
  6: "The Providers section helps you nurture your network relationships by keeping an eye on credentialing timelines, contract renewals, and overall network health — all in one friendly view.",
  7: "Contact Center insights give you a caring look at how your members are being served — from call volumes and resolution rates to handle times and self-service trends.",
  8: "The Vendor Invoices section offers IBM account teams a clear, organized space to review invoice status, track approvals, and stay aligned on contract spending — without the usual back-and-forth.",
  9: "The IBM AIOps Value page helps you appreciate the impact of intelligent automation over time. You can explore cost savings and efficiency gains across flexible 7, 14, and 21-day windows.",
  10: "Your Transformation Roadmap gives you a beautiful, high-level view of your digital journey — celebrating milestones reached and looking ahead to the next chapter with confidence.",
  11: "With Ask Assistant, you can simply type a question in your own words and receive a clear, helpful answer — whether it's about claims, members, or any area of the platform. No reports needed.",
  12: "Thank you so much for taking this tour of CareOps360. This platform was built with care for the Horizon Blue Cross Blue Shield leadership team, in partnership with IBM. We hope it serves you well.",
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
    utterance.rate = 0.84;
    utterance.pitch = 0.90;
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
