function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const PALETTE = [
  "bg-[#CCFF00] text-black",
  "bg-blue-500/80 text-white",
  "bg-purple-500/80 text-white",
  "bg-pink-500/80 text-white",
  "bg-orange-500/80 text-white",
  "bg-teal-500/80 text-white",
];

function colorFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  return (
    <div
      className={`grid place-items-center rounded-full font-bold ${dim} ${colorFor(name)}`}
      title={name}
    >
      {initials(name)}
    </div>
  );
}