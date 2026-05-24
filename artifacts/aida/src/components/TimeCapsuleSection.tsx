import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

export default function TimeCapsuleSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const targetDate = new Date("2027-05-24T00:00:00").getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full min-h-screen py-24 px-6 flex flex-col items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 z-10"
      >
        <h2 className="font-caveat text-5xl md:text-6xl text-primary font-bold">Surat Untuk Aida 💌</h2>
        <p className="font-indie text-xl text-foreground/70 mt-4">
          Dibuka pas waktunya tiba.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            className="flex flex-col items-center z-10"
          >
            <div className="relative w-80 h-52 bg-card rounded-md shadow-lg border border-card-border overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 w-0 h-0 border-l-[160px] border-r-[160px] border-t-[100px] border-l-transparent border-r-transparent border-t-card-border/40 opacity-50" />
              <Lock className="w-12 h-12 text-primary opacity-80" />
            </div>

            <div className="mt-8 text-center bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20">
              <p className="font-indie text-xl text-foreground mb-4">
                Surat ini baru bisa dibuka tanggal 24 Mei 2027...
              </p>
              <div className="flex gap-4 justify-center font-caveat text-3xl text-primary font-bold">
                <div className="flex flex-col items-center">
                  <span>{timeLeft.days}</span>
                  <span className="text-sm font-sans font-normal text-muted-foreground">hari</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.hours}</span>
                  <span className="text-sm font-sans font-normal text-muted-foreground">jam</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.minutes}</span>
                  <span className="text-sm font-sans font-normal text-muted-foreground">menit</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.seconds}</span>
                  <span className="text-sm font-sans font-normal text-muted-foreground">detik</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="mt-8 text-sm font-indie text-muted-foreground hover:text-primary transition-colors underline"
              data-testid="btn-preview-letter"
            >
              (Demo: Lihat Preview)
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl bg-[#fdfbf7] p-8 md:p-12 rounded-sm shadow-2xl relative z-10"
            data-testid="letter-content"
          >
            <div className="absolute top-[-15px] right-10 w-24 h-8 bg-primary/30 washi-tape rotate-6" />
            <Unlock className="absolute top-8 right-8 w-8 h-8 text-primary/30" />

            <h3 className="font-caveat text-4xl text-foreground mb-6">Untuk Aida,</h3>
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
              <p className="mt-8">
                Bangga banget kenal kamu. <br />
                — dari seseorang yang genuinely kagum sama kamu.
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-10 font-indie text-muted-foreground hover:text-primary transition-colors"
              data-testid="btn-tutup-surat"
            >
              ← Tutup Surat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
