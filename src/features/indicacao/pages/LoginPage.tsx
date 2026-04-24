import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useApp } from "../AppContext";
import { PrimaryButton } from "../components/PrimaryButton";
import { Avatar } from "../components/Avatar";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  aprovador: "Aprovador",
  usuario: "Usuário",
};

export function LoginPage() {
  const { users, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleQuickLogin = (id: number) => {
    login(id);
    navigate({ to: "/app/nova" });
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      login(found.id);
      navigate({ to: "/app/nova" });
    } else {
      alert("Usuário não encontrado. Use um dos acessos rápidos.");
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
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4 selection:bg-primary-container selection:text-on-primary-container font-body overflow-y-auto">
        {/* Main Editorial Card */}
        <main className="relative w-full max-w-4xl grid lg:grid-cols-12 gap-0 overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] bg-surface/20 backdrop-blur-3xl border border-outline-variant/10 my-auto">
          
          {/* Mancha Verde / Green Glow at the division */}
          <div className="absolute top-0 right-[41.666%] w-px h-full bg-gradient-to-b from-transparent via-primary-container/40 to-transparent z-20 hidden lg:block shadow-[0_0_40px_rgba(202,253,0,0.3)]" />

          {/* Left Side: Marketing Content */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 lg:p-14 relative overflow-hidden">
            <div className="z-10 flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain shadow-[0_0_30px_rgba(202,253,0,0.2)] rounded-xl mix-blend-screen brightness-125" />
              <div className="flex flex-col">
                <span className="text-primary-container font-display text-3xl font-bold italic tracking-tighter uppercase leading-none">Net Turbo</span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-black mt-1">Programa de Indicações</span>
              </div>
            </div>

            <div className="z-10 space-y-6">
              <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-[0.95] uppercase text-white animate-in slide-in-from-left duration-700">
                Indique. Ganhe. <br />
                <span className="text-primary-container italic font-light lowercase">Faça o time crescer.</span>
              </h1>
              
              <div className="space-y-4 max-w-sm">
                <div className="space-y-1">
                  <h2 className="font-display text-xl font-bold uppercase tracking-tight text-white">Como Funciona?</h2>
                  <div className="h-[2px] w-10 bg-primary-container" />
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed font-light">
                  Para realizar uma indicação, o colaborador deverá registrar o potencial cliente através do canal oficial. E após venda e confirmação da implantação do contrato os créditos do programa serão liberados.
                </p>
                <div className="pt-2">
                  <span className="text-primary-container font-display text-lg font-bold uppercase tracking-tighter">
                    R$ 200 em créditos por venda realizada
                  </span>
                </div>
              </div>
            </div>

            <div className="z-10" />

            {/* Kinetic Texture Overlay */}
            <div className="absolute top-0 right-0 w-full h-full opacity-[0.04] pointer-events-none">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1.5px 1.5px, #cafd00 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
            </div>
          </div>

          {/* Right Side: Login Form & Quick Access */}
          <div className="lg:col-span-5 bg-surface-low p-6 lg:p-10 flex flex-col justify-center border-l border-outline-variant/10 relative">
            <header className="mb-8">
              <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight mb-2 uppercase text-white leading-none">Acesso <br />Restrito</h2>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-black mt-3">Identifique-se para continuar.</p>
            </header>

            <form onSubmit={handleEmailLogin} className="space-y-6">
              <Field
                label="Seu E-mail"
                type="email"
                value={email}
                onChange={(v) => setEmail(v)}
                placeholder="nome@empresa.com.br"
              />
              <Field
                label="Sua Senha"
                type="password"
                value={senha}
                onChange={(v) => setSenha(v)}
                placeholder="••••••••"
                showForgot
              />
              <div className="pt-2">
                <PrimaryButton type="submit" className="w-full py-5 text-[10px] tracking-[0.2em] uppercase shadow-[0_15px_30px_rgba(202,253,0,0.1)]">
                  ENTRAR NO DASHBOARD
                  <ArrowRight className="h-3 w-3" />
                </PrimaryButton>
              </div>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-outline-variant/10" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-outline font-black">Acesso Rápido</span>
              <div className="h-px flex-1 bg-outline-variant/10" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-outline-variant/5 bg-surface-high/30 px-3 py-2 text-left transition-all hover:border-primary-container/30 hover:bg-surface-high/60 hover:translate-x-1"
                >
                  <Avatar name={u.name} size="xs" className="ring-2 ring-primary-container/10 group-hover:ring-primary-container/40" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-bold text-white group-hover:text-primary-container transition-colors uppercase tracking-tight">{u.name}</div>
                    <div className="truncate text-[8px] text-outline font-black uppercase tracking-widest">{ROLE_LABEL[u.role]}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </BackgroundGradientAnimation>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  showForgot = false,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showForgot?: boolean;
}) {
  return (
    <div className="group relative">
      <div className="flex justify-between items-end mb-1">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold group-focus-within:text-primary-container transition-colors">
          {label}
        </label>
        {showForgot && (
          <a className="text-[10px] uppercase tracking-wider text-outline hover:text-primary-container transition-colors font-bold" href="#">
            Esqueceu?
          </a>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface placeholder:text-outline focus:ring-0 focus:border-primary-container transition-all text-base font-medium"
      />
    </div>
  );
}