import { memo } from "react";

const FloatingDoodles = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Hand-drawn style hearts, stars, squiggles scattered randomly */}
      
      {/* Heart 1 */}
      <svg className="absolute top-[10%] left-[5%] text-primary/40 animate-float w-8 h-8" style={{ animationDelay: '0s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>

      {/* Star 1 */}
      <svg className="absolute top-[20%] right-[10%] text-secondary/60 animate-float w-10 h-10" style={{ animationDelay: '1s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>

      {/* Heart 2 */}
      <svg className="absolute top-[60%] left-[15%] text-accent/50 animate-float w-6 h-6" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>

      {/* Star 2 */}
      <svg className="absolute bottom-[20%] right-[15%] text-primary/30 animate-float w-12 h-12" style={{ animationDelay: '3s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
      
      {/* Squiggle */}
      <svg className="absolute top-[40%] right-[5%] text-secondary/40 animate-float w-16 h-16" style={{ animationDelay: '1.5s' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M10,50 Q25,20 50,50 T90,50" />
      </svg>

      {/* Dot cluster */}
      <div className="absolute top-[80%] left-[8%] animate-float" style={{ animationDelay: '2.5s' }}>
        <div className="w-2 h-2 rounded-full bg-primary/40 mb-2 ml-4"></div>
        <div className="w-2 h-2 rounded-full bg-accent/40 mb-2"></div>
        <div className="w-2 h-2 rounded-full bg-secondary/40 ml-6"></div>
      </div>
    </div>
  );
});

FloatingDoodles.displayName = "FloatingDoodles";
export default FloatingDoodles;
