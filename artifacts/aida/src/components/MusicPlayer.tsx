import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SONGS } from "@/songs";

interface Props { autoPlay?: boolean; }

export default function MusicPlayer({ autoPlay = false }: Props) {
  const [isOpen, setIsOpen]         = useState(false);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMuted, setIsMuted]       = useState(false);
  const [volume, setVolume]         = useState(70);
  const [loadError, setLoadError]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const pendingPlay  = useRef(false); // play once audio is ready

  const noSongs = SONGS.length === 0;
  const song    = SONGS[currentIdx] ?? null;

  // Build URL — files live in public/music/
  const srcUrl = song ? `/music/${song.file}` : null;

  // Create / swap the Audio element whenever the track changes
  useEffect(() => {
    if (!srcUrl) return;

    // Destroy previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    const audio        = new Audio(srcUrl);
    audio.preload      = "auto";
    audio.volume       = isMuted ? 0 : volume / 100;
    audioRef.current   = audio;

    setLoadError(false);
    setIsLoading(true);

    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      if (pendingPlay.current) {
        audio.play().catch(() => setIsPlaying(false));
      }
    }, { once: true });

    audio.addEventListener("error", () => {
      setIsLoading(false);
      setLoadError(true);
      setIsPlaying(false);
      pendingPlay.current = false;
    }, { once: true });

    audio.addEventListener("ended", () => {
      // Auto-advance to next song
      setCurrentIdx((p) => (p + 1) % SONGS.length);
    }, { once: true });

    audio.load();

    return () => {
      audio.pause();
      audio.src = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, srcUrl]);

  // Sync volume / mute to audio element whenever they change
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // ── play / pause helpers ─────────────────────────────────
  const doPlay = useCallback(() => {
    if (!audioRef.current || noSongs) return;
    pendingPlay.current = true;
    if (!isLoading) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(true); // optimistic; actual play fires in canplaythrough
    }
  }, [isLoading, noSongs]);

  const doPause = useCallback(() => {
    pendingPlay.current = false;
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const handlePlayPause = () => { isPlaying ? doPause() : doPlay(); };
  const handleNext      = () => setCurrentIdx((p) => (p + 1) % SONGS.length);
  const handlePrev      = () => setCurrentIdx((p) => (p - 1 + SONGS.length) % SONGS.length);

  // ── autoplay on mount ────────────────────────────────────
  // Try immediately; if browser blocks, retry on first user interaction.
  useEffect(() => {
    if (!autoPlay || noSongs) return;

    setIsOpen(true);

    const tryAutoPlay = () => {
      pendingPlay.current = true;
      if (!audioRef.current) return;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          document.removeEventListener("click",      tryAutoPlay);
          document.removeEventListener("touchstart", tryAutoPlay);
        })
        .catch(() => {
          // Suspended — will play on first user interaction
          document.addEventListener("click",      tryAutoPlay, { once: true, capture: true });
          document.addEventListener("touchstart", tryAutoPlay, { once: true, capture: true });
        });
    };

    // Short delay so React finishes mounting + audio element is ready
    const t = setTimeout(tryAutoPlay, 200);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click",      tryAutoPlay);
      document.removeEventListener("touchstart", tryAutoPlay);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, noSongs]);

  // ── render ───────────────────────────────────────────────
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
              /* ── empty state ── */
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <AlertCircle className="text-primary/60" size={28} />
                <p className="font-indie text-sm text-foreground/70 leading-snug">
                  Belum ada lagu. <br />
                  Tambah MP3 ke <code className="text-xs bg-black/5 px-1 rounded">public/music/</code><br />
                  lalu daftarkan di <code className="text-xs bg-black/5 px-1 rounded">src/songs.ts</code>
                </p>
              </div>
            ) : (
              <>
                {/* Record + title */}
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
                        transition={isPlaying ? { duration: 8, repeat: Infinity, ease: "linear", repeatDelay: 1 } : { duration: 0 }}
                        className="font-indie text-base font-bold text-foreground inline-block"
                      >
                        {song?.title}&nbsp;&nbsp;✦&nbsp;&nbsp;{song?.title}
                      </motion.p>
                    </div>
                    <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">{song?.artist}</p>
                    {loadError && (
                      <p className="font-sans text-[10px] text-red-400 mt-0.5 truncate">
                        File tidak ditemukan
                      </p>
                    )}
                    {isLoading && !loadError && (
                      <p className="font-sans text-[10px] text-foreground/40 mt-0.5">memuat…</p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrev} className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground" disabled={SONGS.length <= 1}>
                    <SkipBack size={18} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform hover:scale-105 shadow-md disabled:opacity-40"
                    disabled={loadError}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <button onClick={handleNext} className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground" disabled={SONGS.length <= 1}>
                    <SkipForward size={18} />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMuted((m) => !m)} className="text-foreground/70 hover:text-foreground flex-shrink-0">
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range" min="0" max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => { const v = +e.target.value; setVolume(v); if (isMuted && v > 0) setIsMuted(false); }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
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
