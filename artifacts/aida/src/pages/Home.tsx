import IntroSection from "@/components/IntroSection";
import FloatingDoodles from "@/components/FloatingDoodles";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen font-sans selection:bg-primary/30">
      <FloatingDoodles />
      <main className="relative z-10 w-full flex flex-col items-center">
        <IntroSection />
      </main>
    </div>
  );
}
