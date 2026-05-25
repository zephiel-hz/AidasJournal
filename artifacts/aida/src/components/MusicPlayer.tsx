import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// C major pentatonic scale across 2.5 octaves
const NOTES = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.26];

interface Song {
  title: string;
  artist: string;
  pattern: number[];
  tempo: number;
  bassFreq: number;
}

const SONGS: Song[] = [
  { title: "Satu", artist: "Sufian Suhaimi",        pattern: [5,7,8,9,8,7,9,8,7,5,7,5,3,5], tempo: 0.44, bassFreq: 65.41  },
  { title: "Rehat", artist: "Kunto Aji",             pattern: [9,8,7,5,3,5,7,8,9,8,7,9,8,7], tempo: 0.52, bassFreq: 73.42  },
  { title: "Masa Muda", artist: "Ran",               pattern: [5,7,9,11,9,8,7,5,7,9,8,7,5,3], tempo: 0.38, bassFreq: 55.00 },
  { title: "Yang Terdalam", artist: "Project Pop",   pattern: [8,7,5,3,5,7,8,9,8,7,5,7,5,3], tempo: 0.50, bassFreq: 49.00  },
];

interface Props { autoPlay?: boolean; }

export default function MusicPlayer({ autoPlay = false }: Props) {
  const [isOpen, setIsOpen]         = useState(autoPlay);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentIdx, setCurrentIdx] = useState(() => Math.floor(Math.random() * SONGS.length));
  const [isMuted, setIsMuted]       = useState(false);
  const [volume, setVolume]         = useState(70);

  // Audio engine refs — never trigger re-renders
  const ctxRef          = useRef<AudioContext | null>(null);
  const masterGainRef   = useRef<GainNode | null>(null);
  const bassGainRef     = useRef<GainNode | null>(null);
  const schedulerRef    = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const noteIdxRef      = useRef(0);
  const currentIdxRef   = useRef(currentIdx);
  const isPlayingRef    = useRef(false);
  const volumeRef       = useRef(volume / 100);
  const isMutedRef      = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { currentIdxRef.current = currentIdx; noteIdxRef.current = 0; }, [currentIdx]);
  useEffect(() => { volumeRef.current = volume / 100; syncVolume(); }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; syncVolume(); }, [isMuted]);

  const syncVolume = useCallback(() => {
    if (!masterGainRef.current) return;
    const target = isMutedRef.current ? 0 : volumeRef.current * 0.4;
    masterGainRef.current.gain.setTargetAtTime(target, ctxRef.current!.currentTime, 0.05);
  }, []);

  const scheduleNote = useCallback((freq: number, time: number, tempo: number) => {
    if (!ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(masterGainRef.current);
    osc.type = "sine";
    osc.frequency.value = freq;
    const dur = tempo * 0.72;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(1, time + 0.04);
    env.gain.setValueAtTime(1, time + dur - 0.05);
    env.gain.linearRampToValueAtTime(0, time + dur);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }, []);

  const scheduleBass = useCallback((freq: number, time: number, dur: number) => {
    if (!ctxRef.current || !bassGainRef.current) return;
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(bassGainRef.current);
    osc.type = "triangle";
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.6, time + 0.08);
    env.gain.setValueAtTime(0.6, time + dur - 0.1);
    env.gain.linearRampToValueAtTime(0, time + dur);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }, []);

  const tick = useCallback(() => {
    if (!ctxRef.current || !isPlayingRef.current) return;
    const ctx = ctxRef.current;
    const song = SONGS[currentIdxRef.current];
    const pattern = song.pattern;
    const LOOKAHEAD = 0.25;

    while (nextNoteTimeRef.current < ctx.currentTime + LOOKAHEAD) {
      const idx = noteIdxRef.current % pattern.length;
      const noteFreq = NOTES[pattern[idx]];
      scheduleNote(noteFreq, nextNoteTimeRef.current, song.tempo);

      // Bass note every 4 melody notes
      if (idx % 4 === 0) {
        scheduleBass(song.bassFreq, nextNoteTimeRef.current, song.tempo * 3.8);
      }

      nextNoteTimeRef.current += song.tempo;
      noteIdxRef.current++;
    }
    schedulerRef.current = window.setTimeout(tick, 25);
  }, [scheduleNote, scheduleBass]);

  const getOrCreateCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = isMutedRef.current ? 0 : volumeRef.current * 0.4;
      master.connect(ctx.destination);

      const bass = ctx.createGain();
      bass.gain.value = 0.25;
      bass.connect(master);

      ctxRef.current   = ctx;
      masterGainRef.current = master;
      bassGainRef.current   = bass;
    }
    return ctxRef.current;
  }, []);

  const startPlaying = useCallback(() => {
    const ctx = getOrCreateCtx();
    ctx.resume().then(() => {
      isPlayingRef.current   = true;
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      setIsPlaying(true);
      tick();
    });
  }, [getOrCreateCtx, tick]);

  const stopPlaying = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (schedulerRef.current !== null) {
      clearTimeout(schedulerRef.current);
      schedulerRef.current = null;
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlayingRef.current) stopPlaying(); else startPlaying();
  }, [startPlaying, stopPlaying]);

  const handleNext = useCallback(() => {
    setCurrentIdx((p) => (p + 1) % SONGS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIdx((p) => (p - 1 + SONGS.length) % SONGS.length);
  }, []);

  // Autoplay: attempt immediately; browser may require gesture so add fallback listener
  useEffect(() => {
    if (!autoPlay) return;
    const tryPlay = () => {
      startPlaying();
      document.removeEventListener("click",      tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
    // Short delay to let page settle, then try
    const t = setTimeout(() => {
      const ctx = getOrCreateCtx();
      if (ctx.state === "running") {
        startPlaying();
      } else {
        // Suspended — will play on first user interaction
        document.addEventListener("click",      tryPlay, { once: true });
        document.addEventListener("touchstart", tryPlay, { once: true });
      }
    }, 400);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click",      tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      stopPlaying();
      ctxRef.current?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const song = SONGS[currentIdx];

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
                    {song.title}&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;{song.title}
                  </motion.p>
                </div>
                <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrev} className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground" data-testid="btn-prev">
                <SkipBack size={18} />
              </button>
              <button onClick={handlePlayPause} className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform hover:scale-105 shadow-md" data-testid="btn-play-pause">
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground" data-testid="btn-next">
                <SkipForward size={18} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted((m) => !m)} className="text-foreground/70 hover:text-foreground flex-shrink-0" data-testid="btn-mute">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range" min="0" max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => { const v = parseInt(e.target.value); setVolume(v); if (isMuted && v > 0) setIsMuted(false); }}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                data-testid="slider-volume"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen((o) => !o)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center relative"
        data-testid="btn-toggle-player"
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
