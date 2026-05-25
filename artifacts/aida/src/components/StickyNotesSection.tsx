import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const notes = [
  {
    id: 1,
    text: "Kamu itu tipe orang yang bikin ruangan jadi lebih hangat cuma dengan ada di sana",
    color: "bg-yellow-100",
    rotate: "-rotate-2",
  },
  {
    id: 2,
    text: "Cara kamu dengerin orang tuh genuine banget — orang ngerasa didengar beneran",
    color: "bg-pink-100",
    rotate: "rotate-3",
  },
  {
    id: 3,
    text: "Kamu kuat — bukan karena nggak pernah lelah, tapi karena kamu tetap jalan meskipun lelah",
    color: "bg-green-100",
    rotate: "-rotate-4",
  },
  {
    id: 4,
    text: "Ada sesuatu di cara kamu ketawa yang susah banget dilupain",
    color: "bg-blue-100",
    rotate: "rotate-1",
  },
  {
    id: 5,
    text: "Kamu punya kebaikan yang nggak pernah kamu pamer-pamerin — dan itu justru yang paling kelihatan",
    color: "bg-purple-100",
    rotate: "-rotate-3",
  },
  {
    id: 6,
    text: "Dunia ini lebih baik karena Aida ada di dalamnya",
    color: "bg-orange-100",
    rotate: "rotate-2",
  },
];

function AutoFitText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(28);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let size = 28;
    el.style.fontSize = `${size}px`;

    while (size > 11) {
      if (el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth) break;
      size -= 1;
      el.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="font-caveat text-foreground text-center leading-relaxed overflow-hidden w-full h-full flex items-center justify-center"
      style={{ fontSize: `${fontSize}px` }}
    >
      {text}
    </div>
  );
}

export default function StickyNotesSection() {
  return (
    <section className="w-full min-h-screen py-24 px-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-caveat text-5xl md:text-6xl text-primary font-bold">
          Hal-hal yang aku kagumi dari kamu 💌
        </h2>
        <p className="font-indie text-xl text-foreground/70 mt-4">
          Ditulis dengan jujur, tanpa lebay.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
        {notes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, translateY: -10, zIndex: 20 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`w-64 h-64 ${note.color} ${note.rotate} shadow-md hover:shadow-2xl relative cursor-default`}
            data-testid={`sticky-note-${note.id}`}
          >
            {/* Washi tape */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-white/50 backdrop-blur-sm washi-tape z-10" />

            {/* Text area — pt accounts for washi tape, p-5 for padding */}
            <div className="absolute inset-0 pt-7 p-5 overflow-hidden">
              <AutoFitText text={note.text} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
