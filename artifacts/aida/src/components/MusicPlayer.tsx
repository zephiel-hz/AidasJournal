import { useState, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const playlist = [
  { title: "Satu", artist: "Sufian Suhaimi" },
  { title: "Rehat", artist: "Kunto Aji" },
  { title: "Masa Muda", artist: "Ran" },
  { title: "Yang Terdalam", artist: "Project Pop" }
];

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);

  const song = playlist[currentIdx];

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % playlist.length);
  const handlePrev = () => setCurrentIdx((prev) => (prev - 1 + playlist.length) % playlist.length);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-xl w-72"
          >
            {/* Spinning Record */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full bg-black flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <div className="w-4 h-4 rounded-full bg-primary/80 border-2 border-white" />
              </div>
              <div className="overflow-hidden flex-1 relative h-12 flex flex-col justify-center">
                <div className="whitespace-nowrap overflow-hidden relative w-full h-5">
                   {/* Poor man's marquee for now */}
                   <p className="font-indie text-lg font-bold text-foreground inline-block">
                     {song.title}
                   </p>
                </div>
                <p className="font-sans text-xs text-muted-foreground truncate">{song.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrev} className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground">
                <SkipBack size={18} />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform hover:scale-105 shadow-md"
                data-testid="btn-play-pause"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-black/5 rounded-full transition-colors text-foreground">
                <SkipForward size={18} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-foreground/70 hover:text-foreground">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input 
                type="range" 
                min="0" max="100" 
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center float-right relative group"
        data-testid="btn-toggle-player"
      >
        {isPlaying ? (
          <Music className="animate-pulse" />
        ) : (
          <Music />
        )}
        
        {/* Decorative mini notes floating when playing */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute -top-2 -left-2 text-primary text-xs animate-float opacity-70">♪</span>
            <span className="absolute -top-4 right-0 text-primary text-[10px] animate-float opacity-50" style={{ animationDelay: '1s' }}>♫</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
