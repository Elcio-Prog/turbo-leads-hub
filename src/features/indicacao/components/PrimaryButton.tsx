import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "secondary";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[#CCFF00] text-black hover:bg-[#b8e600] active:bg-[#a3cc00] disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-[#1a1a1a] text-white border border-[#2a2a2a] hover:bg-[#222222]",
  ghost: "bg-transparent text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
};

export function PrimaryButton({
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${VARIANTS[variant]} ${className}`}
    />
  );
}