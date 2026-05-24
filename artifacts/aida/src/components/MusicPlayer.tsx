import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const playlist = [
  {
    title: "Satu",
    artist: "Sufian Suhaimi",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Rehat",
    artist: "Kunto Aji",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Masa Muda",
    artist: "Ran",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    title: "Yang Terdalam",
    artist: "Project Pop",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(() => Math.floor(Math.random() * playlist.length));
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef = useRef(false);

  const song = playlist[currentIdx];

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      setCurrentIdx((prev) => (prev + 1) % playlist.length);
    });

    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        audio.play().catch(() => {});
      }
    });

    audio.addEventListener("waiting", () => setIsLoading(true));
    audio.addEventListener("playing", () => setIsLoading(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Sync volume and mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Load new track when currentIdx changes, auto-play if already playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = isPlaying;
    audio.pause();
    audio.src = playlist[currentIdx].url;
    audio.load();
    if (wasPlaying) {
      pendingPlayRef.current = true;
      setIsLoading(true);
    }
  }, [currentIdx]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      pendingPlayRef.current = false;
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === window.location.href) {
        audio.src = playlist[currentIdx].url;
        audio.load();
      }
      setIsLoading(true);
      pendingPlayRef.current = true;
      setIsPlaying(true);
      // Try playing; if not ready yet, canplaythrough will handle it
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            pendingPlayRef.current = false;
            setIsLoading(false);
          })
          .catch(() => {
            // Not ready yet — canplaythrough handler will fire
          });
      }
    }
  }, [isPlaying, currentIdx]);

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % playlist.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const handleMuteToggle = () => setIsMuted((m) => !m);

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
            {/* Record + title */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-md flex-shrink-0 ${
                  isPlaying && !isLoading ? "animate-spin-slow" : ""
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-primary/90 border-2 border-white shadow" />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="overflow-hidden whitespace-nowrap">
                  <motion.p
                    key={currentIdx}
                    initial={{ x: "100%" }}
                    animate={{ x: isPlaying ? "-100%" : "0%" }}
                    transition={
                      isPlaying
                        ? { duration: 8, repeat: Infinity, ease: "linear" }
                        : { duration: 0 }
                    }
                    className="font-indie text-base font-bold text-foreground inline-block"
                  >
                    {song.title}&nbsp;&nbsp;&nbsp;{isPlaying ? `✦ ${song.title}` : ""}
                  </motion.p>
                </div>
                <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrev}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground"
                data-testid="btn-prev"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform hover:scale-105 shadow-md relative"
                data-testid="btn-play-pause"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                ) : isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} className="ml-0.5" />
                )}
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground"
                data-testid="btn-next"
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="text-foreground/70 hover:text-foreground flex-shrink-0"
                data-testid="btn-mute"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                data-testid="slider-volume"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen((o) => !o)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center relative"
        data-testid="btn-toggle-player"
      >
        <Music className={isPlaying ? "animate-pulse" : ""} />
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute -top-2 -left-2 text-primary text-xs animate-float opacity-70">♪</span>
            <span
              className="absolute -top-4 right-0 text-primary text-[10px] animate-float opacity-50"
              style={{ animationDelay: "1s" }}
            >
              ♫
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
