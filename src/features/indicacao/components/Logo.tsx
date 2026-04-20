export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#CCFF00] text-black font-black text-sm">
        NT
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-white">Net Turbo</div>
        <div className="text-[10px] uppercase tracking-widest text-[#CCFF00]">
          Indicações
        </div>
      </div>
    </div>
  );
}