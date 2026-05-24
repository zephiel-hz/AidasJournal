import { motion } from "framer-motion";

const notes = [
  { id: 1, text: "Cara kamu ketawa tuh bikin aku ikut ketawa juga", color: "bg-yellow-100", rotate: "-rotate-2" },
  { id: 2, text: "Kamu selalu tau cara bikin hari aku jadi lebih baik", color: "bg-pink-100", rotate: "rotate-3" },
  { id: 3, text: "Gaya ngambek kamu yang kadang lucu banget", color: "bg-green-100", rotate: "-rotate-4" },
  { id: 4, text: "Hal receh yang sering kita bahas berdua", color: "bg-blue-100", rotate: "rotate-1" },
  { id: 5, text: "Perhatian-perhatian kecil yang selalu kamu kasih", color: "bg-purple-100", rotate: "-rotate-3" }
];

export default function StickyNotesSection() {
  return (
    <section className="w-full min-h-screen py-24 px-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-caveat text-5xl md:text-6xl text-primary font-bold">Hal-hal kecil tentang kamu 💌</h2>
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
            className={`w-64 h-64 p-6 ${note.color} ${note.rotate} shadow-md hover:shadow-2xl flex items-center justify-center relative cursor-default`}
            data-testid={`sticky-note-${note.id}`}
          >
            {/* Pin or tape */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-white/50 backdrop-blur-sm washi-tape" />
            <p className="font-caveat text-3xl text-foreground text-center leading-relaxed">
              {note.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
