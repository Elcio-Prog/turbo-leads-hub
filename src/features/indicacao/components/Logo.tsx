export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/logo.png" 
        alt="Net Turbo Logo" 
        className="h-10 w-10 object-contain shadow-[0_0_20px_rgba(202,253,0,0.2)] rounded-lg mix-blend-screen brightness-125"
      />
      <div className="leading-none">
        <div className="text-lg font-bold text-white tracking-tighter italic font-display uppercase">Net Turbo</div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-primary-container font-black font-display">
          Programa de Indicações
        </div>
      </div>
    </div>
  );
}