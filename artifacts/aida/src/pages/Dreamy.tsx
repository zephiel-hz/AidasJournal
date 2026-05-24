import { useMemo, useRef } from "react";
import { useLocation } from "wouter";

const MESSAGES = [
  "love u", "miss u", "good night ✨", "🥺❤️", "💖💖💖",
  "you're everything", "thinking of you", "forever 🌙", "✨💕",
  "my favorite person", "💌", "stay", "💗", "dream of me",
  "hi hi hi", "u up?", "🌸", "always", "💫",
  "so pretty", "adore u", "🫶", "precious", "baby",
  "cute 🌙", "⭐", "hello love", "💝", "dreaming",
  "hehe", "🌺", "yours", "💜", "ethereal",
  "softly", "glow", "💓", "shimmer", "moonlight",
  "✦", "forever & ever", "close to you", "🌙✨",
  "safe here", "gentle", "warmth", "tender 🌸",
];

const IMAGE_GRADIENTS = [
  "linear-gradient(135deg, #0a0828 0%, #1a0540 40%, #0d1b4b 70%, #060e2a 100%)",
  "linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #be185d 100%)",
  "linear-gradient(160deg, #0f172a 0%, #1e3a5f 40%, #d97706 70%, #1e1b4b 100%)",
  "linear-gradient(135deg, #450a0a 0%, #991b1b 30%, #fca5a5 60%, #fee2e2 100%)",
  "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #a7f3d0 80%, #ecfdf5 100%)",
  "linear-gradient(160deg, #1e1b4b 0%, #4c1d95 40%, #7c3aed 70%, #c4b5fd 100%)",
  "linear-gradient(135deg, #0c0a09 0%, #292524 40%, #d6d3d1 70%, #fef3c7 100%)",
];

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface Bubble {
  id: number;
  left: number;
  width: number;
  duration: number;
  delay: number;
  swayX: number;
  swayDuration: number;
  content: string | null;
  gradient: string | null;
  isImage: boolean;
  blurAmount: number;
  opacity: number;
}

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (offset: number) => seededRand(i * 17 + offset);
    const isImage = r(0) < 0.12 && i % 8 === 0;
    return {
      id: i,
      left: r(1) * 92,
      width: isImage ? 110 + r(2) * 90 : 80 + r(3) * 130,
      duration: 12 + r(4) * 14,
      delay: -(r(5) * 35),
      swayX: (r(6) - 0.5) * 60,
      swayDuration: 4 + r(7) * 5,
      content: isImage ? null : MESSAGES[Math.floor(r(8) * MESSAGES.length)],
      gradient: isImage ? IMAGE_GRADIENTS[Math.floor(r(9) * IMAGE_GRADIENTS.length)] : null,
      isImage,
      blurAmount: r(10) < 0.25 ? 1 + r(11) * 2 : 0,
      opacity: 0.55 + r(12) * 0.45,
    };
  });
}

const STAR_COUNT = 120;

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seededRand(i * 3 + 99) * 100,
    top: seededRand(i * 7 + 13) * 100,
    size: seededRand(i * 5 + 42) < 0.7 ? 1 : seededRand(i * 5 + 42) < 0.9 ? 1.5 : 2,
    delay: seededRand(i * 11 + 77) * 4,
    duration: 2 + seededRand(i * 13 + 55) * 3,
  }));
}

export default function Dreamy() {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const bubbles = useMemo(() => generateBubbles(72), []);
  const stars = useMemo(() => generateStars(STAR_COUNT), []);

  return (
    <>
      <style>{`
        @keyframes bubble-rise {
          0%   { transform: translateY(0px); opacity: 0; }
          6%   { opacity: 1; }
          88%  { opacity: 0.8; }
          100% { transform: translateY(calc(-110vh - 300px)); opacity: 0; }
        }
        @keyframes bubble-sway {
          0%   { transform: translateX(0px); }
          25%  { transform: translateX(var(--sway)); }
          75%  { transform: translateX(calc(var(--sway) * -0.6)); }
          100% { transform: translateX(0px); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.4); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(1.08); }
        }
        @keyframes particle-float {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-60px) translateX(20px); opacity: 0; }
        }
        @keyframes heart-drift {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          15%  { opacity: 0.4; }
          85%  { opacity: 0.2; }
          100% { transform: translateY(-40px) rotate(15deg); opacity: 0; }
        }
      `}</style>

      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #000000 0%, #07001a 25%, #100028 50%, #0a001f 75%, #000000 100%)",
        }}
      >
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute rounded-full"
            style={{
              width: "60vw", height: "60vw",
              top: "-15vw", right: "-10vw",
              background: "radial-gradient(circle, rgba(180,40,255,0.18) 0%, rgba(120,0,200,0.08) 50%, transparent 70%)",
              animation: "glow-pulse 7s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "70vw", height: "70vw",
              bottom: "-20vw", left: "-15vw",
              background: "radial-gradient(circle, rgba(255,40,180,0.15) 0%, rgba(200,0,120,0.06) 50%, transparent 70%)",
              animation: "glow-pulse 9s ease-in-out infinite",
              animationDelay: "-3s",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "40vw", height: "40vw",
              top: "30%", left: "30%",
              background: "radial-gradient(circle, rgba(100,0,255,0.1) 0%, rgba(60,0,180,0.04) 50%, transparent 70%)",
              animation: "glow-pulse 11s ease-in-out infinite",
              animationDelay: "-5s",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "30vw", height: "30vw",
              top: "10%", left: "20%",
              background: "radial-gradient(circle, rgba(255,100,200,0.12) 0%, transparent 65%)",
              animation: "glow-pulse 6s ease-in-out infinite",
              animationDelay: "-1s",
            }}
          />
        </div>

        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animation: `star-twinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${-star.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Floating hearts */}
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute pointer-events-none select-none text-pink-400"
            style={{
              left: `${seededRand(i * 23 + 5) * 90}%`,
              bottom: `${seededRand(i * 31 + 7) * 80}%`,
              fontSize: `${10 + seededRand(i * 19 + 3) * 14}px`,
              opacity: 0.25,
              animation: `heart-drift ${5 + seededRand(i * 41 + 9) * 6}s ease-in-out infinite`,
              animationDelay: `${-seededRand(i * 53 + 11) * 8}s`,
            }}
          >
            ♡
          </div>
        ))}

        {/* Floating particles */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${seededRand(i * 37 + 15) * 100}%`,
              bottom: `${seededRand(i * 43 + 21) * 80}%`,
              width: `${2 + seededRand(i * 47 + 17) * 3}px`,
              height: `${2 + seededRand(i * 47 + 17) * 3}px`,
              background: i % 3 === 0
                ? "rgba(255,100,200,0.7)"
                : i % 3 === 1
                ? "rgba(160,80,255,0.7)"
                : "rgba(255,255,255,0.5)",
              animation: `particle-float ${4 + seededRand(i * 53 + 23) * 6}s ease-in-out infinite`,
              animationDelay: `${-seededRand(i * 61 + 27) * 8}s`,
            }}
          />
        ))}

        {/* Chat Bubbles */}
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute pointer-events-none"
            style={{
              left: `${bubble.left}%`,
              bottom: "-220px",
              animation: `bubble-rise ${bubble.duration}s linear infinite`,
              animationDelay: `${bubble.delay}s`,
              filter: bubble.blurAmount > 0 ? `blur(${bubble.blurAmount}px)` : undefined,
              opacity: bubble.opacity,
              zIndex: bubble.blurAmount > 0 ? 1 : 2,
            }}
          >
            <div
              style={{
                "--sway": `${bubble.swayX}px`,
                animation: `bubble-sway ${bubble.swayDuration}s ease-in-out infinite`,
                animationDelay: `${-(bubble.delay % bubble.swayDuration)}s`,
              } as React.CSSProperties}
            >
              {bubble.isImage ? (
                /* Image bubble */
                <div
                  style={{
                    width: `${bubble.width}px`,
                    height: `${bubble.width * 0.85}px`,
                    borderRadius: "20px",
                    background: bubble.gradient!,
                    border: "1px solid rgba(255,150,220,0.3)",
                    boxShadow: "0 0 20px rgba(200,80,255,0.25), 0 0 40px rgba(255,50,180,0.1), inset 0 0 20px rgba(255,255,255,0.04)",
                    backdropFilter: "blur(2px)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Subtle star dots overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle at 20% 70%, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }} />
                </div>
              ) : (
                /* Text bubble */
                <div
                  style={{
                    padding: `${10 + (bubble.width > 160 ? 6 : 0)}px ${14 + (bubble.width > 160 ? 6 : 0)}px`,
                    borderRadius: "22px 22px 22px 6px",
                    background: "rgba(40, 0, 80, 0.35)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(200,100,255,0.25)",
                    boxShadow: "0 0 16px rgba(180,60,255,0.2), 0 0 32px rgba(255,40,180,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
                    maxWidth: `${bubble.width}px`,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{
                    color: "rgba(255,220,245,0.95)",
                    fontFamily: "'Caveat', cursive",
                    fontSize: `${14 + (bubble.width > 150 ? 4 : 0)}px`,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    textShadow: "0 0 12px rgba(255,100,220,0.6)",
                  }}>
                    {bubble.content}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Moon */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "8%", right: "8%",
            width: "48px", height: "48px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, rgba(255,240,200,0.9), rgba(220,180,255,0.4))",
            boxShadow: "0 0 30px rgba(255,220,180,0.3), 0 0 60px rgba(200,150,255,0.15)",
            opacity: 0.7,
            animation: "glow-pulse 8s ease-in-out infinite",
          }}
        />

        {/* Back button — very subtle */}
        <button
          onClick={() => setLocation("/jurnal")}
          data-testid="btn-back-jurnal"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 50,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,150,220,0.2)",
            borderRadius: "100px",
            padding: "8px 18px",
            color: "rgba(255,200,240,0.5)",
            fontFamily: "'Indie Flower', cursive",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,200,240,0.9)";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,200,240,0.5)";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
          }}
        >
          ← kembali
        </button>
      </div>
    </>
  );
}
