import { useState } from "react";
import { motion } from "framer-motion";

const cards = [
  {
    id: 1,
    front: "Cara kamu hadir 🌸",
    back: "Ada yang beda pas kamu ada di ruangan. Bukan berisik, bukan heboh — tapi somehow semua jadi lebih hidup. Itu bukan kebetulan, itu ya memang kamu.",
    gradient: "from-pink-300 to-rose-200",
    rotate: "-rotate-3",
  },
  {
    id: 2,
    front: "Cara kamu mikir ✨",
    back: "Kamu punya cara pandang yang nggak biasa — thoughtful, jujur, dan nggak pernah setengah-setengah. Ngobrol sama kamu itu selalu ninggalin sesuatu yang bikin aku mikir lebih dalam.",
    gradient: "from-amber-200 to-orange-300",
    rotate: "rotate-2",
  },
  {
    id: 3,
    front: "Cara kamu jadi diri sendiri 💛",
    back: "Kamu nggak pura-pura jadi siapapun. Dan itu hal yang paling langka — dan paling indah — yang aku tau dari kamu.",
    gradient: "from-teal-200 to-emerald-200",
    rotate: "-rotate-1",
  },
];

export default function PolaroidSection() {
  return (
    <section id="polaroid-section" className="w-full min-h-screen py-24 px-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="font-caveat text-5xl md:text-6xl text-primary font-bold">Yang bikin kamu, kamu 📸</h2>
        <p className="font-indie text-xl text-foreground/70 mt-4 max-w-lg mx-auto">
          Klik kartunya ya — ada yang pengen aku bilang.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto w-full">
        {cards.map((card, idx) => (
          <PolaroidCard key={card.id} card={card} index={idx} />
        ))}
      </div>
    </section>
  );
}

function PolaroidCard({ card, index }: { card: (typeof cards)[0]; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`perspective-1000 w-full aspect-[3/4] cursor-pointer ${card.rotate} hover:z-10`}
      onClick={() => setIsFlipped(!isFlipped)}
      data-testid={`polaroid-${card.id}`}
    >
      <motion.div
        className="w-full h-full relative transform-style-3d transition-transform duration-700 ease-in-out"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white p-4 pb-16 rounded-sm shadow-xl flex flex-col border border-gray-100">
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-md shadow-sm washi-tape rotate-2 z-10" />
          <div className={`flex-grow w-full bg-gradient-to-br ${card.gradient} rounded-sm shadow-inner`} />
          <div className="absolute bottom-4 left-0 w-full text-center px-4">
            <p className="font-indie text-2xl text-foreground">{card.front}</p>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#fdfbf7] p-6 rounded-sm shadow-xl flex items-center justify-center border border-gray-200">
          <p className="font-caveat text-3xl text-foreground text-center leading-relaxed">
            {card.back}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
