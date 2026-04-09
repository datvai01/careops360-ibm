import { useState, useCallback, useRef, type RefObject } from "react";

export type RecordingState = "idle" | "requesting" | "recording" | "encoding";

const TOTAL_DURATION_MS = 169000;

export function useVideoRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [progress, setProgress] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback((stream: MediaStream, animFrameId: { id: number }) => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameId.id);
    stream.getTracks().forEach((t) => t.stop());
  }, []);

  const startRecording = useCallback(
    async (containerRef: RefObject<HTMLDivElement>, onResetAnimation: () => void) => {
      if (recordingState !== "idle") return;
      setRecordingState("requesting");
      setProgress(0);

      let stream: MediaStream;
      try {
        stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { displaySurface: "browser", frameRate: 30 },
          audio: false,
          preferCurrentTab: true,
        } as any);
      } catch {
        setRecordingState("idle");
        return;
      }

      onResetAnimation();
      setRecordingState("recording");

      const rect = containerRef.current!.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      const ctx = canvas.getContext("2d")!;

      const captureVideo = document.createElement("video");
      captureVideo.srcObject = stream;
      captureVideo.muted = true;

      const animFrameId = { id: 0 };

      captureVideo.addEventListener("loadedmetadata", () => {
        const scaleX = captureVideo.videoWidth / window.innerWidth;
        const scaleY = captureVideo.videoHeight / window.innerHeight;
        const freshRect = containerRef.current!.getBoundingClientRect();

        const draw = () => {
          ctx.drawImage(
            captureVideo,
            freshRect.left * scaleX,
            freshRect.top * scaleY,
            freshRect.width * scaleX,
            freshRect.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
          );
          animFrameId.id = requestAnimationFrame(draw);
        };
        animFrameId.id = requestAnimationFrame(draw);
      });

      await captureVideo.play();

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const outputStream = canvas.captureStream(30);
      const recorder = new MediaRecorder(outputStream, { mimeType });
      recorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        stopAll(stream, animFrameId);
        setRecordingState("encoding");
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "CareOps360-Walkthrough.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setRecordingState("idle");
        setProgress(0);
      };

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (recorder.state === "recording") recorder.stop();
      });

      recorder.start(1000);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min((elapsed / TOTAL_DURATION_MS) * 100, 100);
        setProgress(pct);
        if (elapsed >= TOTAL_DURATION_MS && recorder.state === "recording") {
          clearInterval(timerRef.current!);
          recorder.stop();
        }
      }, 500);
    },
    [recordingState, stopAll]
  );

  const cancelRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingState("idle");
    setProgress(0);
  }, []);

  return { recordingState, progress, startRecording, cancelRecording };
}
