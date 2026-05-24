import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function IntroSection() {
  const [text, setText] = useState("");
  const [, setLocation] = useLocation();
  const fullText = "Hai, Aida...";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-10 left-10 w-32 h-8 bg-secondary washi-tape -rotate-12 opacity-80" />
      <div className="absolute bottom-20 right-10 w-40 h-10 bg-primary/40 washi-tape rotate-6 opacity-80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl bg-card/60 backdrop-blur-sm p-12 rounded-xl shadow-sm border border-card-border relative"
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-accent/60 washi-tape -rotate-2" />

        <h1 className="font-caveat text-6xl md:text-8xl text-primary font-bold mb-6 min-h-[1.5em]">
          {text}
          <span className="animate-pulse text-foreground/50">|</span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: text.length >= fullText.length ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-indie text-2xl md:text-3xl text-foreground/80 mb-10"
        >
          Aku mau ngomongin sesuatu tentang kamu — sesuatu yang kayaknya udah lama banget pengen aku tulis.
        </motion.p>

        <motion.button
          onClick={() => setLocation("/jurnal")}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: text.length >= fullText.length ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="bg-secondary text-secondary-foreground font-caveat text-3xl px-8 py-3 rounded-md shadow-md border-2 border-dashed border-secondary-foreground/20 hover:bg-secondary/90 transition-colors"
          data-testid="btn-buka-jurnal"
        >
          Buka Jurnalnya ✨
        </motion.button>
      </motion.div>
    </section>
  );
}
