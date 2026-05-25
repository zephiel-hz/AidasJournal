import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X } from "lucide-react";
import { useLocation } from "wouter";

export default function LetterSection() {
  const [isOpen, setIsOpen]           = useState(false);
  const [showPS, setShowPS]           = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [, setLocation]               = useLocation();
  const openTimeRef                   = useRef<number | null>(null);

  // Reveal P.S. 7 seconds after the letter is opened
  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = window.setTimeout(() => setShowPS(true), 7000);
    } else {
      if (openTimeRef.current) clearTimeout(openTimeRef.current);
      setShowPS(false);
    }
    return () => { if (openTimeRef.current) clearTimeout(openTimeRef.current); };
  }, [isOpen]);

  const handleSecretClick = () => {
    setTransitioning(true);
    setTimeout(() => setLocation("/dreamy"), 1200);
  };

  return (
    <>
      {/* Full-screen fade-to-dark transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: "radial-gradient(circle at center, #1a0030 0%, #000000 100%)" }}
          >
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontFamily: "'Caveat', cursive", fontSize: "2rem", color: "rgba(255,200,240,0.8)" }}
            >
              ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="w-full min-h-screen py-24 px-6 flex flex-col items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 z-10"
        >
          <h2 className="font-caveat text-5xl md:text-6xl text-primary font-bold">Ada Surat Buat Kamu 💌</h2>
          <p className="font-indie text-xl text-foreground/70 mt-4">Buka kalau udah siap ya.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
              className="flex flex-col items-center z-10"
            >
              <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                data-testid="btn-buka-surat"
                className="group relative w-80 h-52 cursor-pointer"
              >
                <div className="absolute inset-0 bg-card rounded-lg shadow-xl border border-card-border overflow-hidden flex items-end justify-center pb-6">
                  <div className="absolute top-0 left-0 right-0 h-0 border-l-[160px] border-r-[160px] border-t-[104px] border-l-transparent border-r-transparent border-t-primary/20 transition-all group-hover:border-t-primary/30" />
                  <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[104px] border-r-[160px] border-b-primary/10 border-r-transparent" />
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[104px] border-l-[160px] border-b-primary/10 border-l-transparent" />
                  <div className="relative z-10 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-md group-hover:bg-primary/30 transition-colors">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                </div>
              </motion.button>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 font-indie text-lg text-foreground/60">
                Klik amplop untuk membuka surat
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="max-w-2xl w-full bg-[#fdfbf7] p-8 md:p-12 rounded-sm shadow-2xl relative z-10"
              data-testid="letter-content"
            >
              <div className="absolute -top-4 right-12 w-24 h-8 bg-primary/30 washi-tape rotate-6" />
              <div className="absolute -top-3 left-16 w-20 h-7 bg-secondary/60 washi-tape -rotate-3" />

              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 text-foreground/30 hover:text-foreground/60 transition-colors"
                data-testid="btn-tutup-surat"
              >
                <X size={20} />
              </button>

              <h3 className="font-caveat text-4xl text-foreground mb-8">Untuk Aida,</h3>
              <div className="font-caveat text-2xl text-foreground/90 space-y-5 leading-relaxed">
                <p>
                  Aku nulis ini bukan karena ada momen spesial, bukan karena ulang tahun, atau karena ada yang nyuruh.
                  Aku nulis ini karena aku ngerasa kamu perlu tau — dan aku belum pernah bilang langsung dengan cukup jelas.
                </p>
                <p>
                  Kamu itu orang yang luar biasa, Aida. Bukan luar biasa versi dramatis atau berlebihan — tapi luar biasa
                  yang genuine. Yang kerasa pas kamu dengerin seseorang sampai selesai. Yang kerasa pas kamu jujur
                  meskipun itu nggak mudah. Yang kerasa pas kamu tetap jadi diri sendiri di situasi yang kebanyakan
                  orang udah pura-pura jadi orang lain.
                </p>
                <p>
                  Aku kagum sama cara kamu tumbuh. Cara kamu ngambil pelajaran dari hal-hal yang nggak mudah.
                  Cara kamu tetap lembut meskipun dunia nggak selalu baik ke kamu.
                  Itu bukan hal kecil — itu justru hal yang paling susah dipertahanin.
                </p>
                <p>
                  Jadi kalau kamu lagi baca ini dan lagi ngerasa nggak cukup — aku mau kamu tau: kamu lebih dari cukup.
                  Kamu udah, selalu, dan akan terus jadi versi terbaik dari dirimu sendiri, bahkan di hari-hari yang
                  ngerasa paling berat sekalipun.
                </p>
                <p className="pt-4">
                  Bangga banget kenal kamu. <br />
                  — dari seseorang yang genuinely kagum sama kamu.
                </p>
              </div>

              {/* Hidden P.S. — only appears after 7 seconds */}
              <AnimatePresence>
                {showPS && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="mt-8 pt-6 border-t border-foreground/10"
                  >
                    <p className="font-caveat text-lg text-foreground/40 italic leading-relaxed">
                      p.s. — eh, aku nyembunyiin sesuatu buat kamu. sesuatu yang nggak bisa aku tulisin di sini.
                    </p>
                    <motion.button
                      onClick={handleSecretClick}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      whileHover={{ scale: 1.4 }}
                      data-testid="btn-secret-dreamy"
                      className="mt-3 text-3xl cursor-pointer block"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(200,80,255,0.6)) drop-shadow(0 0 20px rgba(255,100,200,0.4))",
                        animation: "ps-glow 2.5s ease-in-out infinite",
                      }}
                    >
                      ✨
                    </motion.button>
                    <style>{`
                      @keyframes ps-glow {
                        0%, 100% { filter: drop-shadow(0 0 6px rgba(200,80,255,0.5)) drop-shadow(0 0 14px rgba(255,100,200,0.3)); transform: scale(1); }
                        50%       { filter: drop-shadow(0 0 14px rgba(200,80,255,0.9)) drop-shadow(0 0 28px rgba(255,100,200,0.6)); transform: scale(1.15); }
                      }
                    `}</style>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
