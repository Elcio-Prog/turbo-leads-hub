import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PrimaryButton } from "@/features/indicacao/components/PrimaryButton";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Supabase places tokens in the URL hash on recovery; the client picks them up automatically.
    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
      }
      setReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true);
      setReady(true);
    });

    return () => sub.data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("Não foi possível redefinir sua senha. O link pode ter expirado.");
        return;
      }
      toast.success("Senha redefinida com sucesso! Faça login novamente.");
      await supabase.auth.signOut();
      navigate({ to: "/" });
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundGradientAnimation
      containerClassName="h-screen w-full"
      firstColor="14, 14, 14"
      secondColor="10, 10, 10"
      thirdColor="18, 18, 18"
      fourthColor="12, 12, 12"
      fifthColor="15, 15, 15"
      pointerColor="202, 253, 0"
    >
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4 font-body">
        <main className="relative w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-low p-8 shadow-[0_24px_64px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
          <header className="mb-7">
            <h1 className="mb-2 font-display text-xl font-bold uppercase leading-none tracking-tight text-white lg:text-2xl">
              Redefinir senha
            </h1>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Defina uma nova senha de acesso.
            </p>
          </header>

          {!ready ? (
            <p className="text-sm text-on-surface-variant">Validando link...</p>
          ) : !hasSession ? (
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant">
                Link inválido ou expirado. Solicite um novo link de redefinição na tela de login.
              </p>
              <PrimaryButton
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="w-full py-4 text-[9px] tracking-[0.22em] uppercase"
              >
                Voltar para login
                <ArrowRight className="h-3 w-3" />
              </PrimaryButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField
                label="Nova senha"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  setError("");
                }}
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
              />
              <PasswordField
                label="Confirmar nova senha"
                value={confirm}
                onChange={(v) => {
                  setConfirm(v);
                  setError("");
                }}
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
              />

              {error && <p className="text-xs font-bold text-destructive">{error}</p>}

              <div className="pt-2">
                <PrimaryButton
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 text-[9px] tracking-[0.22em] uppercase shadow-[0_15px_30px_rgba(202,253,0,0.1)]"
                >
                  {isSubmitting ? "SALVANDO..." : "REDEFINIR SENHA"}
                  <ArrowRight className="h-3 w-3" />
                </PrimaryButton>
              </div>
            </form>
          )}
        </main>
      </div>
    </BackgroundGradientAnimation>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group relative">
      <label className="block mb-1 text-[9px] uppercase tracking-[0.2em] text-on-surface-variant font-bold group-focus-within:text-primary-container transition-colors">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2.5 px-0 pr-10 text-sm font-medium text-on-surface placeholder:text-outline focus:ring-0 focus:outline-none focus:border-primary-container transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-outline transition-colors hover:text-primary-container"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}