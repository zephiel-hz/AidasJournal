import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SONGS } from "@/songs";

const THEMES = {
  light: {
    panel:   "rgba(255,255,255,0.88)",
    border:  "rgba(255,255,255,0.65)",
    shadow:  "0 20px 60px rgba(0,0,0,0.12)",
    title:   "rgba(30,10,30,0.92)",
    artist:  "rgba(120,90,120,0.72)",
    time:    "rgba(120,90,120,0.52)",
    ctrl:    "rgba(40,20,40,0.82)",
    mute:    "rgba(80,50,80,0.70)",
    playBg:  "#f472b6",
    accent:  "#f472b6",
    fabBg:   "#f472b6",
  },
  dark: {
    panel:   "rgba(8,0,22,0.84)",
    border:  "rgba(180,70,255,0.32)",
    shadow:  "0 0 28px rgba(150,40,255,0.22), 0 8px 32px rgba(0,0,0,0.55)",
    title:   "rgba(255,215,250,0.95)",
    artist:  "rgba(210,160,248,0.72)",
    time:    "rgba(190,130,242,0.55)",
    ctrl:    "rgba(232,195,255,0.82)",
    mute:    "rgba(200,155,242,0.65)",
    playBg:  "#a855f7",
    accent:  "#c084fc",
    fabBg:   "#9333ea",
  },
} as const;

type Variant = keyof typeof THEMES;

interface Props { autoPlay?: boolean; variant?: Variant; }

export default function MusicPlayer({ autoPlay = false, variant = "light" }: Props) {
  const t = THEMES[variant];
  const tx = { duration: 0.55, ease: "easeInOut" } as const;
  const noSongs = SONGS.length === 0;

  // Start on a random song every page load
  const [currentIdx, setCurrentIdx] = useState<number>(() =>
    noSongs ? 0 : Math.floor(Math.random() * SONGS.length)
  );
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isOpen,    setIsOpen]      = useState(false);
  const [isMuted,   setIsMuted]     = useState(() => {
    try { return localStorage.getItem("mp_muted") === "1"; } catch { return false; }
  });
  const [volume,    setVolume]      = useState(() => {
    try { 
      const stored = localStorage.getItem("mp_volume");
      if (stored === null) return 50; // tidak ada nilai di localStorage
      const v = Number(stored);
      return (v >= 0 && v <= 100) ? v : 50;
    } catch { 
      return 50;
    }
  });
  const [loadError, setLoadError]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [isSeeking,   setIsSeeking]   = useState(false);
  const [seekValue,   setSeekValue]   = useState(0);

  // Refs so event handlers always see the latest value without stale closures
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef  = useRef(false);   // should we play when audio is ready?
  const volumeRef       = useRef(volume);
  const isMutedRef      = useRef(isMuted);
  const isSeekingRef    = useRef(false);

  useEffect(() => { volumeRef.current  = volume;  try { localStorage.setItem("mp_volume", String(volume)); } catch {} }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; try { localStorage.setItem("mp_muted",  isMuted ? "1" : "0"); } catch {} }, [isMuted]);

  // ── build audio element per track ───────────────────────
  useEffect(() => {
    if (noSongs) return;

    // "cancelled" token prevents stale handlers from updating state
    // after cleanup (e.g. error fired by src="" on the old element)
    let cancelled = false;

    // Tear down previous element first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const song  = SONGS[currentIdx];
    const audio = new Audio(`/music/${song.file}`);
    audio.preload = "auto";
    audio.volume  = isMutedRef.current ? 0 : volumeRef.current / 100;
    audioRef.current = audio;

    setLoadError(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setSeekValue(0);

    const onReady = () => {
      if (cancelled) return;
      setIsLoading(false);
      if (pendingPlayRef.current) {
        audio.play().catch(() => { if (!cancelled) setIsPlaying(false); });
      }
    };

    const onError = () => {
      if (cancelled) return;
      setIsLoading(false);
      setLoadError(true);
      setIsPlaying(false);
      pendingPlayRef.current = false;
    };

    const onEnded = () => {
      if (cancelled) return;
      setCurrentIdx((p) => (p + 1) % SONGS.length);
    };

    const onTimeUpdate = () => {
      if (cancelled || isSeekingRef.current) return;
      setCurrentTime(audio.currentTime);
    };

    const onMetadata = () => {
      if (cancelled) return;
      setDuration(audio.duration);
    };

    audio.addEventListener("canplaythrough",  onReady,      { once: true });
    audio.addEventListener("error",           onError,      { once: true });
    audio.addEventListener("ended",           onEnded,      { once: true });
    audio.addEventListener("timeupdate",      onTimeUpdate);
    audio.addEventListener("loadedmetadata",  onMetadata);
    audio.load();

    return () => {
      cancelled = true;
      audio.pause();
      audio.src = "";
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error",          onError);
      audio.removeEventListener("ended",          onEnded);
      audio.removeEventListener("timeupdate",     onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onMetadata);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, noSongs]);

  // ── sync volume / mute live ──────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // ── helpers ──────────────────────────────────────────────
  const doPlay = useCallback(() => {
    pendingPlayRef.current = true;
    setIsPlaying(true);
    if (!audioRef.current || isLoading) return; // will play in onReady
    audioRef.current.play().catch(() => setIsPlaying(false));
  }, [isLoading]);

  const doPause = useCallback(() => {
    pendingPlayRef.current = false;
    setIsPlaying(false);
    audioRef.current?.pause();
  }, []);

  const handlePlayPause = () => { isPlaying ? doPause() : doPlay(); };
  const handleNext      = () => setCurrentIdx((p) => (p + 1) % SONGS.length);
  const handlePrev      = () => setCurrentIdx((p) => (p - 1 + SONGS.length) % SONGS.length);

  const handleSeekStart = (v: number) => {
    isSeekingRef.current = true;
    setIsSeeking(true);
    setSeekValue(v);
  };
  const handleSeekMove  = (v: number) => { setSeekValue(v); };
  const handleSeekEnd   = (v: number) => {
    if (audioRef.current) audioRef.current.currentTime = v;
    setCurrentTime(v);
    setSeekValue(v);
    isSeekingRef.current = false;
    setIsSeeking(false);
  };

  const fmt = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const displayTime = isSeeking ? seekValue : currentTime;

  // ── autoplay on mount ────────────────────────────────────
  useEffect(() => {
    if (!autoPlay || noSongs) return;

    setIsOpen(true);

    const tryPlay = () => {
      if (!audioRef.current) return;
      pendingPlayRef.current = true;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          document.removeEventListener("click",      tryPlay, true);
          document.removeEventListener("touchstart", tryPlay, true);
        })
        .catch(() => {
          // Browser blocked — wait for user gesture
          document.addEventListener("click",      tryPlay, { once: true, capture: true });
          document.addEventListener("touchstart", tryPlay, { once: true, capture: true });
        });
    };

    const t = setTimeout(tryPlay, 250);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click",      tryPlay, true);
      document.removeEventListener("touchstart", tryPlay, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, noSongs]);

  // ── render ───────────────────────────────────────────────
  const song = noSongs ? null : SONGS[currentIdx];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{
              opacity: 1, y: 0, scale: 1,
              background: t.panel,
              borderColor: t.border,
              boxShadow: t.shadow,
            }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ ...tx, opacity: { duration: 0.2 }, y: { duration: 0.2 }, scale: { duration: 0.2 } }}
            className="absolute bottom-full right-0 mb-4 backdrop-blur-xl border p-4 rounded-2xl w-72"
            style={{ background: t.panel, borderColor: t.border, boxShadow: t.shadow }}
          >
            {noSongs ? (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <AlertCircle size={28} style={{ color: t.accent }} />
                <p className="font-indie text-sm leading-snug" style={{ color: t.artist }}>
                  Belum ada lagu.{" "}
                  Upload MP3 ke{" "}
                  <code className="text-xs px-1 rounded" style={{ background: "rgba(128,128,128,0.12)" }}>
                    public/music/
                  </code>{" "}
                  lalu daftarkan di{" "}
                  <code className="text-xs px-1 rounded" style={{ background: "rgba(128,128,128,0.12)" }}>
                    src/songs.ts
                  </code>
                </p>
              </div>
            ) : (
              <>
                {/* Disc + title row */}
                <div className="flex items-center gap-4 mb-3">
                  <motion.div
                    animate={{
                      background: variant === "dark"
                        ? "linear-gradient(135deg,#2d0060,#1a003a)"
                        : "linear-gradient(135deg,#374151,#111827)",
                      boxShadow: variant === "dark"
                        ? `0 0 14px ${t.accent}55`
                        : "0 2px 8px rgba(0,0,0,0.25)",
                    }}
                    transition={tx}
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isPlaying ? "animate-spin-slow" : ""}`}
                  >
                    <motion.div
                      animate={{ background: t.accent }}
                      transition={tx}
                      className="w-4 h-4 rounded-full border-2 border-white shadow"
                    />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.p
                      animate={{ color: t.title }}
                      transition={tx}
                      className="font-indie text-base font-bold truncate"
                    >
                      {song?.title}
                    </motion.p>
                    <motion.p
                      animate={{ color: t.artist }}
                      transition={tx}
                      className="font-sans text-xs truncate mt-0.5"
                    >
                      {song?.artist}
                    </motion.p>
                    {loadError && (
                      <p className="font-sans text-[10px] text-red-400 mt-0.5 truncate">
                        File tidak ditemukan: /music/{song?.file}
                      </p>
                    )}
                    {isLoading && !loadError && (
                      <motion.p
                        animate={{ color: t.time }}
                        transition={tx}
                        className="font-sans text-[10px] mt-0.5"
                      >
                        memuat…
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Seek slider */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    step="0.5"
                    value={displayTime}
                    disabled={!duration || loadError}
                    onMouseDown={(e) => handleSeekStart(+(e.target as HTMLInputElement).value)}
                    onTouchStart={(e) => handleSeekStart(+(e.target as HTMLInputElement).value)}
                    onChange={(e) => handleSeekMove(+e.target.value)}
                    onMouseUp={(e) => handleSeekEnd(+(e.target as HTMLInputElement).value)}
                    onTouchEnd={(e) => handleSeekEnd(+(e.target as HTMLInputElement).value)}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-default"
                    style={{
                      accentColor: t.accent,
                      background: `linear-gradient(to right, ${t.accent} ${duration ? (displayTime/duration)*100 : 0}%, ${t.border} 0%)`,
                      transition: "background 0.1s",
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <motion.span animate={{ color: t.time }} transition={tx} className="font-sans text-[10px]">
                      {fmt(displayTime)}
                    </motion.span>
                    <motion.span animate={{ color: t.time }} transition={tx} className="font-sans text-[10px]">
                      {fmt(duration)}
                    </motion.span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-3">
                  <motion.button
                    onClick={handlePrev}
                    disabled={SONGS.length <= 1}
                    animate={{ color: t.ctrl }}
                    transition={tx}
                    className="p-2 rounded-full transition-opacity disabled:opacity-30"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  >
                    <SkipBack size={18} />
                  </motion.button>

                  <motion.button
                    onClick={handlePlayPause}
                    disabled={loadError}
                    animate={{ background: t.playBg }}
                    transition={tx}
                    className="p-3 text-white rounded-full shadow-md disabled:opacity-40"
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                    style={{ background: t.playBg }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </motion.button>

                  <motion.button
                    onClick={handleNext}
                    disabled={SONGS.length <= 1}
                    animate={{ color: t.ctrl }}
                    transition={tx}
                    className="p-2 rounded-full transition-opacity disabled:opacity-30"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  >
                    <SkipForward size={18} />
                  </motion.button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setIsMuted((m) => !m)}
                    animate={{ color: t.mute }}
                    transition={tx}
                    className="flex-shrink-0"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </motion.button>
                  <input
                    type="range" min="0" max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = +e.target.value;
                      setVolume(v);
                      if (isMuted && v > 0) setIsMuted(false);
                    }}
                    className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
                    style={{
                      accentColor: t.accent,
                      background: `linear-gradient(to right, ${t.accent} 0%, ${t.accent} ${isMuted ? 0 : volume}%, rgba(128,128,128,0.25) ${isMuted ? 0 : volume}%, rgba(128,128,128,0.25) 100%)`,
                    }}
                  />
                  <motion.span
                    animate={{ color: t.time }}
                    transition={tx}
                    className="flex-shrink-0 text-[11px] tabular-nums w-7 text-right"
                  >
                    {isMuted ? 0 : volume}%
                  </motion.span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          background: t.fabBg,
          boxShadow: variant === "dark"
            ? `0 0 18px ${t.fabBg}80, 0 4px 16px rgba(0,0,0,0.4)`
            : `0 4px 20px ${t.fabBg}50`,
        }}
        transition={tx}
        onClick={() => setIsOpen((o) => !o)}
        className="w-14 h-14 text-white rounded-full flex items-center justify-center relative"
        style={{ background: t.fabBg }}
      >
        <Music className={isPlaying ? "animate-pulse" : ""} />
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.span
              animate={{ color: t.accent }}
              transition={tx}
              className="absolute -top-2 -left-2 text-xs animate-float opacity-70"
            >♪</motion.span>
            <motion.span
              animate={{ color: t.accent }}
              transition={tx}
              className="absolute -top-4 right-0 text-[10px] animate-float opacity-50"
              style={{ animationDelay: "1s" }}
            >♫</motion.span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
