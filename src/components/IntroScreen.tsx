import { useEffect, useRef, useState } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const VIDEO_SRC = "/abertura.mp4"; // front/public/abertura.mp4
const STORAGE_KEY = "intro_seen";
const DAYS_UNTIL_RESET = 0; // 0 = nunca mais mostra
// ───────────────────────────────────────────────────────────────────────────────

function shouldShowIntro(): boolean {
  try {
    // Nunca mostra em mobile
    if (window.innerWidth <= 768) return false;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    if (DAYS_UNTIL_RESET === 0) return false;
    const { timestamp } = JSON.parse(raw);
    const diffDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    return diffDays >= DAYS_UNTIL_RESET;
  } catch {
    return true;
  }
}

function markIntroSeen() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
}

export default function IntroScreen() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"entering" | "playing" | "fading" | "gone">("entering");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    if (shouldShowIntro()) {
      hasShown.current = true;
      markIntroSeen();
      setVisible(true);
      requestAnimationFrame(() => {
        setTimeout(() => setPhase("playing"), 50);
      });
    }
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(console.error);
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => video.removeEventListener("canplay", tryPlay);
  }, [phase]);

  function dismiss() {
    if (phase === "fading" || phase === "gone") return;
    setPhase("fading");
    setTimeout(() => {
      setPhase("gone");
      setVisible(false);
    }, 800);
  }

  if (!visible) return null;

  const isExiting = phase === "fading" || phase === "gone";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "entering" ? 0 : isExiting ? 0 : 1,
        transition:
          phase === "entering"
            ? "opacity 0.4s ease"
            : isExiting
            ? "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
        pointerEvents: isExiting ? "none" : "all",
      }}
    >
      <video
        ref={videoRef}
        muted={false}
        playsInline
        preload="auto"
        onEnded={dismiss}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Vinheta nas bordas para profundidade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}