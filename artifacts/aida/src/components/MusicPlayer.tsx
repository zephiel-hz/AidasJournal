import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SONGS } from "@/songs";

interface Props { autoPlay?: boolean; }

export default function MusicPlayer({ autoPlay = false }: Props) {
  const noSongs = SONGS.length === 0;

  // Start on a random song every page load
  const [currentIdx, setCurrentIdx] = useState<number>(() =>
    noSongs ? 0 : Math.floor(Math.random() * SONGS.length)
  );
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isOpen,    setIsOpen]      = useState(false);
  const [isMuted,   setIsMuted]     = useState(false);
  const [volume,    setVolume]      = useState(70);
  const [loadError, setLoadError]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  // Refs so event handlers always see the latest value without stale closures
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef  = useRef(false);   // should we play when audio is ready?
  const volumeRef       = useRef(volume);
  const isMutedRef      = useRef(isMuted);

  useEffect(() => { volumeRef.current  = volume;  }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

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

    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("error",          onError, { once: true });
    audio.addEventListener("ended",          onEnded, { once: true });
    audio.load();

    return () => {
      cancelled = true;
      audio.pause();
      audio.src = "";
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error",          onError);
      audio.removeEventListener("ended",          onEnded);
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
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white/85 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-2xl w-72"
          >
            {noSongs ? (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <AlertCircle className="text-primary/60" size={28} />
                <p className="font-indie text-sm text-foreground/70 leading-snug">
                  Belum ada lagu.{" "}
                  Upload MP3 ke <code className="text-xs bg-black/5 px-1 rounded">public/music/</code>{" "}
                  lalu daftarkan di <code className="text-xs bg-black/5 px-1 rounded">src/songs.ts</code>
                </p>
              </div>
            ) : (
              <>
                {/* Disc + title row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-md flex-shrink-0 ${isPlaying ? "animate-spin-slow" : ""}`}>
                    <div className="w-4 h-4 rounded-full bg-primary/90 border-2 border-white shadow" />
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <div className="overflow-hidden whitespace-nowrap">
                      <motion.p
                        key={currentIdx}
                        initial={{ x: "100%" }}
                        animate={{ x: isPlaying ? "-100%" : "0%" }}
                        transition={isPlaying
                          ? { duration: 8, repeat: Infinity, ease: "linear", repeatDelay: 1 }
                          : { duration: 0 }
                        }
                        className="font-indie text-base font-bold text-foreground inline-block"
                      >
                        {song?.title}&nbsp;&nbsp;✦&nbsp;&nbsp;{song?.title}
                      </motion.p>
                    </div>
                    <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">{song?.artist}</p>
                    {loadError && (
                      <p className="font-sans text-[10px] text-red-400 mt-0.5 truncate">
                        File tidak ditemukan: /music/{song?.file}
                      </p>
                    )}
                    {isLoading && !loadError && (
                      <p className="font-sans text-[10px] text-foreground/40 mt-0.5">memuat…</p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrev}
                    disabled={SONGS.length <= 1}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground disabled:opacity-30"
                  >
                    <SkipBack size={18} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    disabled={loadError}
                    className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform hover:scale-105 shadow-md disabled:opacity-40"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={SONGS.length <= 1}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground disabled:opacity-30"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="text-foreground/70 hover:text-foreground flex-shrink-0"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range" min="0" max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = +e.target.value;
                      setVolume(v);
                      if (isMuted && v > 0) setIsMuted(false);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
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
        onClick={() => setIsOpen((o) => !o)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center relative"
      >
        <Music className={isPlaying ? "animate-pulse" : ""} />
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute -top-2 -left-2 text-primary text-xs animate-float opacity-70">♪</span>
            <span className="absolute -top-4 right-0 text-primary text-[10px] animate-float opacity-50" style={{ animationDelay: "1s" }}>♫</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
