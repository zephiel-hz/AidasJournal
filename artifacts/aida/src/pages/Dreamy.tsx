import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import MusicPlayer from "@/components/MusicPlayer";

// Photos to show in the bubble stream — upload as /dreamy-1.jpg … /dreamy-14.jpg
const DREAMY_PHOTOS = [
  "/dreamy-1.jpg",
  "/dreamy-2.jpg",
  "/dreamy-3.jpg",
  "/dreamy-4.jpg",
  "/dreamy-5.jpg",
  "/dreamy-6.jpg",
  "/dreamy-7.jpg",
  "/dreamy-8.jpg",
  "/dreamy-9.jpg",
  "/dreamy-10.jpg",
  "/dreamy-11.jpg",
  "/dreamy-12.jpg",
  "/dreamy-13.jpg",
  "/dreamy-14.jpg",
];

function useAvailablePhotos(paths: string[]) {
  const [available, setAvailable] = useState<string[]>([]);
  useEffect(() => {
    Promise.all(
      paths.map(
        (src) =>
          new Promise<string | null>((resolve) => {
            const img = new Image();
            img.onload  = () => resolve(src);
            img.onerror = () => resolve(null);
            img.src = src;
          })
      )
    ).then((results) => setAvailable(results.filter(Boolean) as string[]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return available;
}

const MESSAGES = [
  "lucu deh", "kangen", "semangat ya ✨", "🥺❤️", "💖💖💖",
  "moodbooster bgt", "kepikiran terus", "stay terus 🥰", "✨💕",
  "favoritku", "💌", "jangan ngilang ya", "💗", "kamu pasti bisa",
  "haii cantikk", "jangan nyerah ya", "🌸", "cakep as always", "💫",
  "cantik bgt", "gemes bgt", "🫶", "MBG (My Bojo Gueh)", "manis",
  "gemes 🌙", "⭐", "halo manis", "💝", "kamu hebat",
  "hehe", "🌺", "seneng deh", "💜", "cantik parah",
  "malu banget -//-", "lucu", "💓", "bikin salting", "keren",
  "jangan asing", "jangan ngilang dong", "pengen ketemu", "🌙✨",
  "paling nyaman", "asik orangnya", "pengen ngobrol terus", "manisnya 🌸",
  "semangat ya ✨", "good luck hari ini!", "proud of u", "jangan lupa senyum",
  "😝😝😝",
];

const IMAGE_GRADIENTS = [
  "linear-gradient(135deg, #0a0828 0%, #1a0540 40%, #0d1b4b 70%, #060e2a 100%)",
  "linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #be185d 100%)",
  "linear-gradient(160deg, #0f172a 0%, #1e3a5f 40%, #d97706 70%, #1e1b4b 100%)",
  "linear-gradient(135deg, #450a0a 0%, #991b1b 30%, #fca5a5 60%, #fee2e2 100%)",
  "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #a7f3d0 80%, #ecfdf5 100%)",
  "linear-gradient(160deg, #1e1b4b 0%, #4c1d95 40%, #7c3aed 70%, #c4b5fd 100%)",
];

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface Bubble {
  id: number; left: number; width: number;
  duration: number; delay: number;
  swayX: number; swayDuration: number;
  content: string | null; gradient: string | null;
  isImage: boolean; blurAmount: number; opacity: number;
}

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (o: number) => sr(i * 17 + o);
    const isImage = r(0) < 0.10 && i % 9 === 0;
    return {
      id: i,
      left: r(1) * 90,
      width: isImage ? 110 + r(2) * 80 : 76 + r(3) * 120,
      duration: 13 + r(4) * 13,
      // Positive staggered delay: each bubble enters one by one from bottom
      delay: 0.3 + i * 0.32,
      swayX: (r(6) - 0.5) * 55,
      swayDuration: 4 + r(7) * 5,
      content: isImage ? null : MESSAGES[Math.floor(r(8) * MESSAGES.length)],
      gradient: isImage ? IMAGE_GRADIENTS[Math.floor(r(9) * IMAGE_GRADIENTS.length)] : null,
      isImage,
      blurAmount: r(10) < 0.2 ? 1 + r(11) * 2 : 0,
      opacity: 0.55 + r(12) * 0.45,
    };
  });
}

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: sr(i * 3 + 99) * 100, top: sr(i * 7 + 13) * 100,
    size: sr(i * 5 + 42) < 0.7 ? 1 : sr(i * 5 + 42) < 0.92 ? 1.5 : 2,
    delay: sr(i * 11 + 77) * 4,
    duration: 2 + sr(i * 13 + 55) * 3,
  }));
}

export default function Dreamy() {
  const [, setLocation] = useLocation();
  const modalOverlayRef = useRef<HTMLDivElement | null>(null);
  const bubbles = useMemo(() => generateBubbles(72), []);
  const stars   = useMemo(() => generateStars(120), []);
  const availablePhotos = useAvailablePhotos(DREAMY_PHOTOS);

  // Pick evenly-spaced bubble indices to carry real photos
  const photoBubbleIndices = useMemo(() => {
    const total = bubbles.length;
    const count = Math.min(availablePhotos.length, 14);
    if (count === 0) return new Map<number, string>();
    const step = Math.floor(total / (count + 1));
    const map = new Map<number, string>();
    for (let i = 0; i < count; i++) {
      map.set(step * (i + 1), availablePhotos[i]);
    }
    return map;
  }, [availablePhotos, bubbles.length]);

  const [selected, setSelected] = useState<null | { id: number; type: "photo" | "chat"; src?: string; content?: string }>(null);
  // Modal visible state for smooth transitions (mount stays while animating)
  const [modalVisible, setModalVisible] = useState(false);
  // Bounding rect of the clicked bubble/photo to animate from
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const animatedRef = useRef<HTMLDivElement | null>(null);
  const modalImageRef = useRef<HTMLImageElement | null>(null);

  function openModal(payload: { id: number; type: "photo" | "chat"; src?: string; content?: string }, rect?: DOMRect | null) {
    // validate rect — some transforms/animations can yield 0/NaN sizes
    let safeRect = rect ?? null;
    if (safeRect) {
      if (!isFinite(safeRect.width) || !isFinite(safeRect.height) || safeRect.width <= 0 || safeRect.height <= 0) {
        console.warn("[Dreamy] openModal: invalid origin rect, ignoring", rect);
        safeRect = null;
      }
    }
    setOriginRect(safeRect);
    setSelected(payload);
    // small delay to allow mount before transition
    setTimeout(() => setModalVisible(true), 12);
  }

  useEffect(() => {
    if (selected) console.log("[Dreamy] openModal ->", selected, { originRect, modalVisible });
  }, [selected, originRect, modalVisible]);

  function closeModal() {
    setModalVisible(false);
    // wait for transition to finish before unmount
    setTimeout(() => {
      setSelected(null);
      setOriginRect(null);
    }, 260);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!modalVisible) return;
    console.log('[Dreamy] modalVisible=true, originRect=', originRect);
    if (animatedRef.current) {
      try {
        const rect = animatedRef.current.getBoundingClientRect();
        console.log('[Dreamy] animated wrapper rect=', rect);
        console.log('[Dreamy] animated computed transform=', getComputedStyle(animatedRef.current).transform);
        console.log('[Dreamy] animated zIndex=', getComputedStyle(animatedRef.current).zIndex);
      } catch (err) {
        console.warn('[Dreamy] animated ref inspect failed', err);
      }
    }
    if (modalImageRef.current) {
      console.log('[Dreamy] modal image element present, complete=', modalImageRef.current.complete, 'naturalWidth=', modalImageRef.current.naturalWidth, 'naturalHeight=', modalImageRef.current.naturalHeight);
    } else {
      console.log('[Dreamy] modal image element NOT present');
    }
  }, [modalVisible]);

  return (
    <>
      <style>{`
        @keyframes dreamy-rise {
          0%   { transform: translateY(0px); opacity: 0; }
          7%   { opacity: 1; }
          88%  { opacity: 0.85; }
          100% { transform: translateY(calc(-110vh - 260px)); opacity: 0; }
        }
        @keyframes dreamy-sway {
          0%   { transform: translateX(0px); }
          30%  { transform: translateX(var(--sway)); }
          70%  { transform: translateX(calc(var(--sway) * -0.55)); }
          100% { transform: translateX(0px); }
        }
        @keyframes dreamy-star {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.5); }
        }
        @keyframes dreamy-glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%       { opacity: 0.26; transform: scale(1.07); }
        }
        @keyframes dreamy-heart {
          0%   { transform: translateY(0) rotate(-5deg); opacity: 0; }
          15%  { opacity: 0.35; }
          85%  { opacity: 0.15; }
          100% { transform: translateY(-50px) rotate(10deg); opacity: 0; }
        }
      `}</style>

      <div
        className="fixed inset-0 overflow-hidden"
        style={{ background: "linear-gradient(160deg,#000000 0%,#07001a 25%,#100028 55%,#0a001f 80%,#000000 100%)" }}
      >
        {/* Glow blobs */}
        {[
          { w: "58vw", t: "-14vw", r: "-8vw",  b: undefined, l: undefined, color: "rgba(170,40,255,0.18)", d: "7s",  dl: "0s"  },
          { w: "68vw", t: undefined, r: undefined, b: "-18vw", l: "-12vw", color: "rgba(255,40,180,0.15)", d: "9s",  dl: "-3s" },
          { w: "38vw", t: "28%",  r: undefined, b: undefined, l: "28%",   color: "rgba(100,0,255,0.10)",  d: "11s", dl: "-5s" },
          { w: "28vw", t: "8%",   r: undefined, b: undefined, l: "15%",   color: "rgba(255,100,200,0.12)",d: "6s",  dl: "-1s" },
        ].map((blob, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              width: blob.w, height: blob.w,
              top: blob.t, right: blob.r, bottom: blob.b, left: blob.l,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 68%)`,
              animation: `dreamy-glow ${blob.d} ease-in-out infinite`,
              animationDelay: blob.dl,
            }}
          />
        ))}

        {/* Stars */}
        {stars.map((s) => (
          <div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: `${s.left}%`, top: `${s.top}%`,
              width: `${s.size}px`, height: `${s.size}px`,
              animation: `dreamy-star ${s.duration}s ease-in-out infinite`,
              animationDelay: `${-s.delay}s`,
            }}
          />
        ))}

        {/* Floating hearts */}
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="absolute pointer-events-none select-none text-pink-400"
            style={{
              left: `${sr(i * 23 + 5) * 90}%`, bottom: `${sr(i * 31 + 7) * 80}%`,
              fontSize: `${10 + sr(i * 19 + 3) * 14}px`, opacity: 0.25,
              animation: `dreamy-heart ${5 + sr(i * 41 + 9) * 6}s ease-in-out infinite`,
              animationDelay: `${-sr(i * 53 + 11) * 8}s`,
            }}
          >♡</div>
        ))}

        {/* Moon */}
        <div className="absolute pointer-events-none"
          style={{
            top: "7%", right: "7%", width: "44px", height: "44px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, rgba(255,240,200,0.9), rgba(220,180,255,0.4))",
            boxShadow: "0 0 28px rgba(255,220,180,0.3), 0 0 55px rgba(200,150,255,0.15)",
            opacity: 0.65,
            animation: "dreamy-glow 8s ease-in-out infinite",
          }}
        />

        {/* Chat Bubbles — staggered positive delay so they rise one by one */}
        {bubbles.map((b) => {
          const realPhoto = photoBubbleIndices.get(b.id);
          // Only show a photo square when there's an actual uploaded photo.
          // Gradient-only isImage slots are skipped (rendered as nothing).
          const showPhoto = !!realPhoto;
          const photoSize = 140;

          // Skip isImage slots that have no real photo — nothing to show
          if (b.isImage && !realPhoto) return null;
          if (selected?.id === b.id) return null;

          return (
            <div key={b.id} className="absolute"
              style={{
                left: `${b.left}%`, bottom: "-220px",
                animation: `dreamy-rise ${b.duration}s linear ${b.delay}s infinite`,
                animationFillMode: "backwards",
                filter: showPhoto ? undefined : b.blurAmount > 0 ? `blur(${b.blurAmount}px)` : undefined,
                opacity: b.opacity,
                zIndex: showPhoto ? 3 : b.blurAmount > 0 ? 1 : 2,
              }}
            >
                <div style={{ ['--sway' as any]: `${b.swayX}px`, animation: `dreamy-sway ${b.swayDuration}s ease-in-out infinite` } as any}>
                {showPhoto ? (
                  <div style={{
                    width: `${photoSize}px`, height: `${photoSize}px`,
                    borderRadius: "16px",
                    background: realPhoto ? "transparent" : b.gradient!,
                    border: "2px solid rgba(255,150,220,0.35)",
                    boxShadow: "0 0 20px rgba(200,80,255,0.28),0 0 40px rgba(255,50,180,0.12),inset 0 0 18px rgba(255,255,255,0.04)",
                    overflow: "hidden", position: "relative",
                    cursor: "pointer",
                  }}>
                    {realPhoto ? (
                      <img
                        src={realPhoto}
                        draggable={false}
                        onClick={(e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          openModal({ id: b.id, type: "photo", src: realPhoto }, rect);
                        }}
                      />
                    ) : (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "radial-gradient(circle at 70% 20%,rgba(255,255,255,0.14) 1px,transparent 1px),radial-gradient(circle at 20% 70%,rgba(255,255,255,0.09) 1px,transparent 1px)",
                        backgroundSize: "28px 28px",
                      }} />
                    )}
                    {/* Soft glow overlay on photos */}
                    {realPhoto && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(135deg,rgba(200,80,255,0.08) 0%,transparent 60%,rgba(255,50,180,0.06) 100%)",
                        pointerEvents: "none",
                      }} />
                    )}
                  </div>
                ) : (
                  <div
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    openModal({ id: b.id, type: "chat", content: b.content ?? undefined }, rect);
                  }}
                  style={{
                    padding: `${10 + (b.width > 160 ? 5 : 0)}px ${13 + (b.width > 160 ? 5 : 0)}px`,
                    borderRadius: "22px 22px 22px 6px",
                    background: "rgba(38,0,78,0.38)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(200,100,255,0.22)",
                    boxShadow: "0 0 14px rgba(180,60,255,0.18),0 0 28px rgba(255,40,180,0.07),inset 0 1px 0 rgba(255,255,255,0.07)",
                    maxWidth: `${b.width}px`,
                    cursor: "pointer",
                  }}>
                    <span style={{
                      color: "rgba(255,218,243,0.94)",
                      fontFamily: "'Caveat', cursive",
                      fontSize: `${14 + (b.width > 150 ? 4 : 0)}px`,
                      fontWeight: 500, letterSpacing: "0.02em",
                      textShadow: "0 0 10px rgba(255,100,220,0.55)",
                    }}>
                      {b.content}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Modal / Lightbox */}
        {selected && (
          <div
            ref={modalOverlayRef}
            onClick={(e) => { if (e.target === modalOverlayRef.current) closeModal(); }}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: modalVisible ? "rgba(6,6,12,0.6)" : "rgba(6,6,12,0.0)",
              backdropFilter: modalVisible ? "blur(8px)" : "blur(0px)",
              zIndex: 120,
              padding: "28px",
              transition: "background 220ms ease, backdrop-filter 220ms ease, opacity 200ms ease",
              opacity: modalVisible ? 1 : 0,
              pointerEvents: modalVisible ? "auto" : "none",
            }}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "96vw",
                maxHeight: "94vh",
                transition: "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 200ms ease",
                willChange: "transform, opacity",
                opacity: modalVisible ? 1 : 0,
                transformOrigin: "center center",
              }}
            >
              {/* Animated wrapper: translate from originRect center to viewport center while scaling */}
              <div
                ref={animatedRef}
                style={(function() {
                  // If originRect is not provided, center the modal normally
                  if (!originRect) {
                    const defaultW = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 900) : 700;
                    return {
                      position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                      width: `${Math.round(defaultW)}px`, height: 'auto',
                      transition: 'left 260ms ease, top 260ms ease, width 260ms ease, height 260ms ease, opacity 200ms ease',
                      borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', zIndex: 500,
                    };
                  }

                  // Compute origin center and target sizes based on image natural size
                  const ox = originRect.left + originRect.width / 2;
                  const oy = originRect.top + originRect.height / 2;
                  const naturalW = modalImageRef.current?.naturalWidth ?? originRect.width;
                  const naturalH = modalImageRef.current?.naturalHeight ?? originRect.height;
                  const vw = typeof window !== 'undefined' ? window.innerWidth : naturalW;
                  const vh = typeof window !== 'undefined' ? window.innerHeight : naturalH;
                  const maxW = Math.floor(vw * 0.9);
                  const maxH = Math.floor(vh * 0.86);
                  const scale = Math.min(1, maxW / naturalW, maxH / naturalH);
                  const targetW = Math.max(160, Math.round(naturalW * scale));
                  const targetH = Math.max(120, Math.round(naturalH * scale));

                  // compute translate delta from viewport center to origin center
                  const tx = Math.round(vw / 2);
                  const ty = Math.round(vh / 2);
                  const dx = Math.round(ox - tx);
                  const dy = Math.round(oy - ty);

                  // compute initial scale relative to target to simulate bubble size
                  const initialScale = Math.max(0.12, Math.min(1, originRect.width / targetW));
                  const from = `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(${initialScale})`;
                  const to = `translate(-50%,-50%) translate(0px, 0px) scale(1)`;

                  // If showing a chat (text) modal, allow automatic width/height
                  // so the text won't be constrained by min/max widths or box clipping.
                  if (selected?.type === "chat") {
                    return {
                      position: 'fixed', left: '50%', top: '50%',
                      width: 'auto', height: 'auto',
                      transform: modalVisible ? to : from,
                      transition: 'transform 300ms cubic-bezier(.2,.9,.2,1), opacity 200ms ease',
                      borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', overflow: 'visible', zIndex: 500,
                    };
                  }

                  // keep wrapper at target size at all times to avoid collapsed bounding boxes
                  return {
                    position: 'fixed', left: '50%', top: '50%',
                    width: `${Math.round(targetW)}px`, height: `${Math.round(targetH)}px`,
                    transform: modalVisible ? to : from,
                    transition: 'transform 300ms cubic-bezier(.2,.9,.2,1), opacity 200ms ease',
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', zIndex: 500,
                  };
                })()}
              >
              <button
                onClick={() => closeModal()}
                aria-label="close"
                style={{
                  position: "absolute", right: -6, top: -6, zIndex: 130,
                  background: "rgba(0,0,0,0.4)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: 999, padding: "6px 8px",
                  cursor: "pointer",
                }}
              >✕</button>

                {selected.type === "photo" ? (
                  <img
                    ref={modalImageRef}
                    src={selected.src}
                    alt=""
                    onLoad={() => console.log('[Dreamy] modal image loaded', modalImageRef.current?.naturalWidth, modalImageRef.current?.naturalHeight)}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", boxShadow: "0 10px 40px rgba(0,0,0,0.6)", background: "rgba(255,255,255,0.02)" }}
                  />
                ) : (
                  <div style={{
                    padding: modalVisible ? "13px 16px" : "10px 13px", borderRadius: 18,
                    background: "rgba(38,0,78,0.38)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(200,100,255,0.22)",
                    boxShadow: "0 0 14px rgba(180,60,255,0.18),0 0 28px rgba(255,40,180,0.07),inset 0 1px 0 rgba(255,255,255,0.07)",
                    color: "#ffdff6",
                    fontFamily: "'Caveat', cursive", fontSize: modalVisible ? 23 : 20, lineHeight: 1.35,
                    whiteSpace: "nowrap", overflowX: "auto",
                  }}>{selected.content}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Back — very subtle */}
        <button
          onClick={() => setLocation("/jurnal")}
          data-testid="btn-back-jurnal"
          style={{
            position: "fixed", bottom: "24px", left: "24px", zIndex: 50,
            background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,150,220,0.18)", borderRadius: "100px",
            padding: "7px 16px", color: "rgba(255,200,240,0.4)",
            fontFamily: "'Indie Flower', cursive", fontSize: "13px",
            cursor: "pointer", transition: "all 0.3s",
          }}
          onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "rgba(255,200,240,0.85)"; b.style.background = "rgba(255,255,255,0.09)"; }}
          onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "rgba(255,200,240,0.4)"; b.style.background = "rgba(255,255,255,0.04)"; }}
        >
          ← kembali
        </button>
      </div>
    </>
  );
}
