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
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0a0a]">
      {/* Esquerda: headline + social proof */}
      <div className="relative hidden lg:block overflow-hidden">
        <BackgroundGradientAnimation
          containerClassName="absolute inset-0"
          className="h-full w-full"
          interactive={true}
        />
        <div className="relative z-20 flex flex-col justify-between h-full p-12">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#CCFF00] text-black font-black">
              NT
            </div>
            <div className="text-white">
              <div className="font-bold">Net Turbo</div>
              <div className="text-[11px] uppercase tracking-widest text-[#CCFF00]">
                Programa de Indicações
              </div>
            </div>
          </div>

          <div className="max-w-lg">
            <h1 className="text-5xl font-black leading-tight text-white">
              Indique. <span className="text-[#CCFF00]">Ganhe.</span>
              <br />
              Faça o time crescer.
            </h1>
            <p className="mt-6 text-lg text-[#AAAAAA]">
              Cada cliente indicado que assina contrato gera R$ 200 de crédito
              para você. Acompanhe suas indicações, suas conversões e suas
              recompensas em um só lugar.
            </p>
          </div>

          <p className="text-xs text-[#666666]">
            © {new Date().getFullYear()} Net Turbo • Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Direita: formulário */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#CCFF00] text-black font-black">
              NT
            </div>
            <div className="text-[11px] uppercase tracking-widest text-[#CCFF00]">
              Programa de Indicações
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white">Bem-vindo de volta</h2>
          <p className="mt-2 text-sm text-[#AAAAAA]">
            Entre com seu e-mail Net Turbo para acessar o programa.
          </p>

          <form onSubmit={handleEmailLogin} className="mt-8 space-y-4">
            <Field
              label="E-mail Net Turbo"
              type="email"
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="seu.nome@netturbo.com.br"
            />
            <Field
              label="Senha"
              type="password"
              value={senha}
              onChange={(v) => setSenha(v)}
              placeholder="••••••••"
            />
            <PrimaryButton type="submit" className="w-full py-3">
              Entrar <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#2a2a2a]" />
            <span className="text-[10px] uppercase tracking-widest text-[#666666]">
              Acesso rápido para teste
            </span>
            <div className="h-px flex-1 bg-[#2a2a2a]" />
          </div>

          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.id)}
                className="group flex w-full items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3 text-left transition-colors hover:border-[#CCFF00]/50 hover:bg-[#1f1f1f]"
              >
                <Avatar name={u.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{u.name}</div>
                  <div className="truncate text-[11px] text-[#AAAAAA]">{u.email}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-[#CCFF00]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#CCFF00]">
                    {ROLE_LABEL[u.role]}
                  </span>
                  <span className="text-[10px] text-[#666666]">{u.contrato} • {u.setor}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#AAAAAA]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-3.5 py-2.5 text-sm text-white placeholder:text-[#555555] outline-none transition-colors focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]"
      />
    </label>
  );
}