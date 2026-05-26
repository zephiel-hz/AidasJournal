import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const cards = [
  {
    id: 1,
    front: "Cara kamu hadir 🌸",
    back: "Ada yang beda tiap kali nama kamu muncul di layar HP dan laptopku. Bukan karena kamu heboh atau gimana, tapi somehow obrolan sama kamu selalu bikin hari-hariku jadi jauh lebih hidup.",
    photo: "/polaroid-1.jpg",
    gradient: "from-pink-300 to-rose-200",
    rotate: "-rotate-3",
  },
  {
    id: 2,
    front: "Cara kamu berpikir ✨",
    back: "Kamu punya cara pandang yang nggak biasa — thoughtful, jujur, dan nggak pernah setengah-setengah. Ngobrol sama kamu itu selalu ninggalin sesuatu yang bikin aku mikir lebih dalam.",
    photo: "/polaroid-2.jpg",
    gradient: "from-amber-200 to-orange-300",
    rotate: "rotate-2",
  },
  {
    id: 3,
    front: "Cara kamu jadi diri sendiri 💛",
    back: "Kamu nggak pura-pura jadi siapapun. Dan itu hal yang paling langka — dan paling indah — yang aku tau dari kamu.",
    photo: "/polaroid-3.jpg",
    gradient: "from-teal-200 to-emerald-200",
    rotate: "-rotate-1",
  },
];

interface AutoFitTextProps {
  text: string;
  maxSize?: number;
  minSize?: number;
  className?: string;
}

function AutoFitText({ text, maxSize = 28, minSize = 11, className = "" }: AutoFitTextProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    let size = maxSize;
    inner.style.fontSize = `${size}px`;

    while (size > minSize) {
      if (inner.offsetHeight <= outer.clientHeight && inner.scrollWidth <= outer.clientWidth) break;
      size -= 1;
      inner.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [text, maxSize, minSize]);

  return (
    <div ref={outerRef} className="w-full h-full overflow-hidden flex items-center justify-center">
      <p
        ref={innerRef}
        className={className}
        style={{ fontSize: `${fontSize}px`, maxWidth: "100%" }}
      >
        {text}
      </p>
    </div>
  );
}

function PhotoOrGradient({ photo, gradient }: { photo: string; gradient: string }) {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload  = () => { setHasPhoto(true);  setTried(true); };
    img.onerror = () => { setHasPhoto(false); setTried(true); };
    img.src = photo;
  }, [photo]);

  if (!tried) return <div className={`flex-grow w-full bg-gradient-to-br ${gradient} rounded-sm shadow-inner`} />;

  if (hasPhoto) {
    return (
      <div className="flex-grow w-full rounded-sm shadow-inner overflow-hidden">
        <img
          src={photo}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return <div className={`flex-grow w-full bg-gradient-to-br ${gradient} rounded-sm shadow-inner`} />;
}

export default function PolaroidSection() {
  return (
    <section id="polaroid-section" className="w-full min-h-screen py-24 px-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="font-caveat text-5xl md:text-6xl text-primary font-bold">Semua hal kecil yang bikin kamu jadi 'kamu'. 📸</h2>
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
          <PhotoOrGradient photo={card.photo} gradient={card.gradient} />
          {/* Front label */}
          <div className="absolute bottom-3 left-0 w-full px-4" style={{ height: "48px" }}>
            <AutoFitText
              text={card.front}
              maxSize={22}
              minSize={11}
              className="font-indie text-foreground text-center leading-tight"
            />
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#fdfbf7] p-6 rounded-sm shadow-xl flex items-center justify-center border border-gray-200">
          <div className="w-full h-full">
            <AutoFitText
              text={card.back}
              maxSize={26}
              minSize={11}
              className="font-caveat text-foreground text-center leading-relaxed"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
