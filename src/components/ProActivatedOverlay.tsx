"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { X } from "lucide-react";

const STAR_COUNT = 16;
const RING_COUNT = 3;

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const rad = (angle * Math.PI) / 180;
    const distance = 80 + Math.random() * 60;
    return {
      tx: Math.cos(rad) * distance,
      ty: Math.sin(rad) * distance,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.3,
      duration: 0.6 + Math.random() * 0.4,
      isOdd: i % 2 === 1,
    };
  });
}

function generateSparkles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 80,
    left: 10 + Math.random() * 80,
    delay: Math.random() * 2.5,
    size: 2 + Math.random() * 4,
  }));
}

interface ProActivatedOverlayProps {
  show: boolean;
  onComplete: () => void;
}

export default function ProActivatedOverlay({ show, onComplete }: ProActivatedOverlayProps) {
  const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden");

  const stars = useMemo(() => generateStars(STAR_COUNT), []);
  const sparkles = useMemo(() => generateSparkles(10), []);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (show && phase === "hidden") {
      setPhase("entering");
      timersRef.current = [
        setTimeout(() => setPhase("visible"), 600),
        setTimeout(() => setPhase("exiting"), 4000),
        setTimeout(() => {
          setPhase("hidden");
          onComplete();
        }, 4800),
      ];
      return clearTimers;
    }
  }, [show, phase, onComplete]);

  if (phase === "hidden") return null;

  const isExiting = phase === "exiting";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        animation: isExiting
          ? "pro-overlay-fadeout 0.8s ease-in forwards"
          : "pro-overlay-fadein 0.3s ease-out forwards",
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: s.size,
              height: s.size,
              top: "50%",
              left: "50%",
              marginTop: -s.size / 2,
              marginLeft: -s.size / 2,
              background: "#818cf8",
              borderRadius: s.isOdd ? 0 : "50%",
              clipPath: s.isOdd
                ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                : undefined,
              ["--tx" as string]: `${s.tx}px`,
              ["--ty" as string]: `${s.ty}px`,
              animation: `pro-star-burst ${s.duration}s ease-out ${s.delay}s forwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: 80,
              height: 80,
              top: "50%",
              left: "50%",
              borderColor: `rgba(79, 70, 229, ${0.4 - i * 0.1})`,
              animation: `pro-ring-expand 1.2s ease-out ${0.1 + i * 0.2}s forwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 flex flex-col items-center px-8 py-10 rounded-3xl max-w-sm mx-4"
        style={{
          background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 30%, #c7d2fe 70%, #a5b4fc 100%)",
          border: "2px solid rgba(79, 70, 229, 0.3)",
          animation: "pro-glow-pulse 2s ease-in-out infinite 0.5s",
        }}
      >
        <button
          onClick={() => {
            clearTimers();
            setPhase("exiting");
            setTimeout(() => {
              setPhase("hidden");
              onComplete();
            }, 800);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full z-20 transition-colors cursor-pointer hover:bg-primary/10"
          style={{ color: "#3730a3" }}
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "pro-shimmer 3s ease-in-out infinite 0.8s",
          }}
        />

        <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
          {sparkles.map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full"
              style={{
                width: s.size,
                height: s.size,
                top: `${s.top}%`,
                left: `${s.left}%`,
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
                animation: `pro-sparkle 2s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        <div
          className="relative mb-4"
          style={{
            animation: "pro-crown-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both",
          }}
        >
          <div style={{ animation: "pro-crown-float 3s ease-in-out infinite 1s" }}>
            <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 44L14 18L24 32L32 12L40 32L50 18L56 44H8Z"
                fill="url(#proCrownGrad)"
                stroke="#3730a3"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <rect x="8" y="44" width="48" height="8" rx="2" fill="url(#proCrownBand)" stroke="#3730a3" strokeWidth="1.5" />
              <circle cx="14" cy="18" r="3" fill="#6366f1" stroke="#3730a3" strokeWidth="1" />
              <circle cx="32" cy="12" r="3.5" fill="#6366f1" stroke="#3730a3" strokeWidth="1" />
              <circle cx="50" cy="18" r="3" fill="#6366f1" stroke="#3730a3" strokeWidth="1" />
              <circle cx="24" cy="30" r="2" fill="#a5b4fc" />
              <circle cx="40" cy="30" r="2" fill="#a5b4fc" />
              <circle cx="20" cy="47" r="1.5" fill="#a5b4fc" />
              <circle cx="32" cy="47" r="1.5" fill="#a5b4fc" />
              <circle cx="44" cy="47" r="1.5" fill="#a5b4fc" />
              <defs>
                <linearGradient id="proCrownGrad" x1="8" y1="12" x2="56" y2="44">
                  <stop stopColor="#818cf8" />
                  <stop offset="0.5" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="proCrownBand" x1="8" y1="44" x2="56" y2="52">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div
          className="text-center relative z-10"
          style={{ animation: "pro-text-enter 0.5s ease-out 0.4s both" }}
        >
          <h2
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: "#3730a3", textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
          >
            Pro üyeliğiniz aktif edildi!
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#4338ca" }}>
            Sınırsız özetleme, karşılaştırma ve diğer Pro özelliklerinin keyfini çıkarın.
          </p>
        </div>
      </div>
    </div>
  );
}
