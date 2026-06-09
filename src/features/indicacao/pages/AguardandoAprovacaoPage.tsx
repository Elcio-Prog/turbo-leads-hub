import { useNavigate } from "@tanstack/react-router";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { useApp } from "../AppContext";
import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export function AguardandoAprovacaoPage() {
  const { logout, refreshData } = useApp();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await refreshData();
    } finally {
      setChecking(false);
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
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 font-body overflow-y-auto">
        <main className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface/20 p-8 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] backdrop-blur-3xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.15)] border border-amber-500/20">
              <Clock className="h-10 w-10 animate-pulse" />
            </div>
            
            <span className="text-[10px] font-black tracking-[0.3em] text-primary-container uppercase">
              Net Turbo — Programa de Indicações
            </span>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tighter uppercase leading-none text-white pt-2">
              Aguardando <br />
              <span className="italic font-light text-amber-400">Aprovação</span>
            </h1>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Identificamos que seu cadastro foi criado usando <strong className="text-white">CPF</strong> ou <strong className="text-white">RA</strong>.
            </p>
            <p className="text-xs text-outline leading-relaxed">
              Para garantir a segurança da plataforma, o seu acesso precisa ser liberado por um <strong className="text-on-surface-variant">Aprovador</strong> ou <strong className="text-on-surface-variant">Administrador</strong>. Assim que for aprovado, você será direcionado para a tela de configuração do perfil.
            </p>
          </div>

          <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton
              type="button"
              disabled={checking}
              onClick={handleCheckStatus}
              className="w-full sm:w-auto px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-bold shadow-[0_15px_30px_rgba(202,253,0,0.1)]"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Verificando..." : "Atualizar Status"}
            </PrimaryButton>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-transparent px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-outline transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </div>
        </main>
      </div>
    </BackgroundGradientAnimation>
  );
}
