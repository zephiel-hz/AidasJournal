import React from "react";
import IntroSection from "@/components/IntroSection";
import PolaroidSection from "@/components/PolaroidSection";
import StickyNotesSection from "@/components/StickyNotesSection";
import TimeCapsuleSection from "@/components/TimeCapsuleSection";
import MusicPlayer from "@/components/MusicPlayer";
import FloatingDoodles from "@/components/FloatingDoodles";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen font-sans selection:bg-primary/30">
      <FloatingDoodles />
      
      <main className="relative z-10 w-full flex flex-col items-center">
        <IntroSection />
        <PolaroidSection />
        <StickyNotesSection />
        <TimeCapsuleSection />
      </main>

      <MusicPlayer />
    </div>
  );
}
