import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useApp } from "../AppContext";
import {
  PRODUTOS,
  SETORES,
  type Contrato,
  type Produto,
  type Setor,
  LIMITE_CLT_MES,
  META_TRIMESTRAL,
  VALOR_RECOMPENSA,
} from "../types";
import { PrimaryButton } from "../components/PrimaryButton";

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  let out = "+55 ";
  if (digits.length > 2) out += `(${digits.slice(2, 4)}`;
  if (digits.length >= 4) out += `) `;
  if (digits.length >= 4) out += digits.slice(4, 9);
  if (digits.length >= 9) out += `-${digits.slice(9, 13)}`;
  return out.trim();
}

export function NovaIndicacaoPage() {
  const { user, createIndicacao, countCltThisMonth, creditoAtual, indicacoes } = useApp();
  const [form, setForm] = useState({
    leadNome: "",
    empresa: "",
    telefone: "",
    emailLead: "",
    produto: "Conectividade" as Produto,
    emailIndicador: user?.email ?? "",
    setor: (user?.setor ?? "TI") as Setor,
    funcao: "",
    contrato: (user?.contrato ?? "CLT") as Contrato,
    observacao: "",
  });

  if (!user) return null;

  const cltCount = countCltThisMonth(user.id);
  const cltBlocked = user.role === "usuario" && form.contrato === "CLT" && cltCount >= LIMITE_CLT_MES;

  const credito = creditoAtual(user.id);
  // Meta trimestral: indicações criadas pelo usuário no trimestre atual
  const trimAtual = (() => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    return indicacoes.filter(
      (i) => i.criadoPorId === user.id && new Date(i.criadoEm) >= start,
    ).length;
  })();
  const progresso = Math.min(100, Math.round((trimAtual / META_TRIMESTRAL) * 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leadNome.trim() || !form.empresa.trim() || !form.emailLead.trim()) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    const result = createIndicacao(form);
    if (!result.ok) {
      toast.error(result.error || "Erro ao criar indicação.");
      return;
    }
    toast.success("Indicação criada com sucesso!", {
      description: `Lead ${form.leadNome} salvo com status “Indicado”.`,
    });
    setForm({
      ...form,
      leadNome: "",
      empresa: "",
      telefone: "",
      emailLead: "",
      observacao: "",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 lg:p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Nova Indicação</h2>
            <p className="mt-1 text-sm text-[#AAAAAA]">
              Cadastre um lead e acompanhe sua jornada até o contrato.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1 rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/10 px-3 py-1 text-[11px] font-semibold text-[#CCFF00]">
            <Sparkles className="h-3 w-3" /> R$ {VALOR_RECOMPENSA} por contrato
          </div>
        </div>

        {cltBlocked && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            Você atingiu o limite de {LIMITE_CLT_MES} indicações para este mês.
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            label="Nome do Lead *"
            value={form.leadNome}
            onChange={(v) => setForm({ ...form, leadNome: v })}
          />
          <Input
            label="Nome da Empresa *"
            value={form.empresa}
            onChange={(v) => setForm({ ...form, empresa: v })}
          />
          <Input
            label="Telefone do Lead"
            value={form.telefone}
            onChange={(v) => setForm({ ...form, telefone: maskPhone(v) })}
            placeholder="+55 (XX) XXXXX-XXXX"
          />
          <Input
            label="Email do Lead *"
            type="email"
            value={form.emailLead}
            onChange={(v) => setForm({ ...form, emailLead: v })}
          />
          <Select
            label="Produto de Interesse"
            value={form.produto}
            onChange={(v) => setForm({ ...form, produto: v as Produto })}
            options={PRODUTOS}
          />
          <Input
            label="Seu Email Net Turbo"
            type="email"
            value={form.emailIndicador}
            onChange={(v) => setForm({ ...form, emailIndicador: v })}
          />
          <Select
            label="Seu Setor"
            value={form.setor}
            onChange={(v) => setForm({ ...form, setor: v as Setor })}
            options={SETORES}
          />
          <Input
            label="Sua Função"
            value={form.funcao}
            onChange={(v) => setForm({ ...form, funcao: v })}
            placeholder="Opcional"
          />
          <Select
            label="Tipo de Contrato"
            value={form.contrato}
            onChange={(v) => setForm({ ...form, contrato: v as Contrato })}
            options={["CLT", "PJ"]}
          />
          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[#AAAAAA]">
                Observação
              </span>
              <textarea
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                rows={4}
                className="w-full resize-none rounded-lg border border-[#2a2a2a] bg-[#111111] px-3.5 py-2.5 text-sm text-white placeholder:text-[#555555] outline-none transition-colors focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]"
                placeholder="Conte um pouco sobre o lead, contexto, urgência..."
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <PrimaryButton type="submit" disabled={cltBlocked} className="px-6 py-3">
            Enviar Indicação
          </PrimaryButton>
        </div>
      </form>

      {/* Painel lateral */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#141414] p-6">
          <div className="text-xs uppercase tracking-widest text-[#AAAAAA]">
            Crédito Atual
          </div>
          <div className="mt-2 text-4xl font-black text-[#CCFF00]">
            R$ {credito.toLocaleString("pt-BR")}
          </div>
          <p className="mt-1 text-xs text-[#666666]">
            Acumulado de contratos assinados.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-[#AAAAAA]">
              Meta Trimestral
            </div>
            <div className="text-xs font-semibold text-white">
              {trimAtual}/{META_TRIMESTRAL}
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
            <div
              className="h-full rounded-full bg-[#CCFF00] transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#AAAAAA]">
            Próximo bônus ao atingir {META_TRIMESTRAL} indicações no trimestre.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <div className="text-sm font-bold text-white">Diretrizes do programa</div>
          <ul className="mt-3 space-y-2 text-xs text-[#AAAAAA]">
            {[
              `R$ ${VALOR_RECOMPENSA} por contrato implantado e confirmado.`,
              `Colaboradores CLT: até ${LIMITE_CLT_MES} indicações por mês.`,
              "Lead deve ser novo (sem proposta ativa).",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#CCFF00]" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {user.role === "usuario" && user.contrato === "CLT" && (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-xs text-[#AAAAAA]">
            Indicações neste mês:{" "}
            <span className="font-bold text-white">
              {cltCount}/{LIMITE_CLT_MES}
            </span>
          </div>
        )}
      </aside>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
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

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#AAAAAA]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}