import PolaroidSection from "@/components/PolaroidSection";
import StickyNotesSection from "@/components/StickyNotesSection";
import LetterSection from "@/components/LetterSection";
import MusicPlayer from "@/components/MusicPlayer";
import FloatingDoodles from "@/components/FloatingDoodles";

export default function Jurnal() {
  return (
    <div className="relative w-full min-h-screen font-sans selection:bg-primary/30">
      <FloatingDoodles />
      <main className="relative z-10 w-full flex flex-col items-center">
        <PolaroidSection />
        <StickyNotesSection />
        <LetterSection />
      </main>
      <MusicPlayer autoPlay />
    </div>
  );
}
