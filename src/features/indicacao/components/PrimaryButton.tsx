import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "secondary";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary-container text-on-primary-container font-headline font-bold hover:shadow-[0_0_30px_rgba(202,253,0,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-surface-container text-white border border-outline-variant/20 hover:bg-surface-high",
  ghost: "bg-transparent text-on-surface-variant hover:text-white hover:underline decoration-primary-container decoration-2 underline-offset-4",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export function PrimaryButton({
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm transition-all duration-200 ${VARIANTS[variant]} ${className}`}
    />
  );
}