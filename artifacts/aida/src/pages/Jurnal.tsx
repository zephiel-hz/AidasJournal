import { useLocation } from "wouter";
import PolaroidSection from "@/components/PolaroidSection";
import StickyNotesSection from "@/components/StickyNotesSection";
import LetterSection from "@/components/LetterSection";
import MusicPlayer from "@/components/MusicPlayer";
import FloatingDoodles from "@/components/FloatingDoodles";

export default function Jurnal() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative w-full min-h-screen font-sans selection:bg-primary/30">
      <FloatingDoodles />
      <main className="relative z-10 w-full flex flex-col items-center">
        <PolaroidSection />
        <StickyNotesSection />
        <LetterSection />

        {/* Subtle dreamy page link */}
        <div className="py-16 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setLocation("/dreamy")}
            className="font-indie text-lg text-foreground/50 hover:text-primary transition-colors flex items-center gap-2"
            data-testid="btn-dreamy-link"
          >
            <span className="text-2xl">✨</span>
            masuk ke duniaku
            <span className="text-2xl">✨</span>
          </button>
        </div>
      </main>
      <MusicPlayer autoPlay />
    </div>
  );
}
