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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-body">
      {/* Header Editorial */}
      <header className="relative py-6 border-b border-outline-variant/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-none">
              Nova <br />
              <span className="italic font-light text-on-surface-variant">Indicação</span>
            </h1>
          </div>
          <div className="max-w-xs text-right hidden md:block">
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Expanda nossa rede conectando novos parceiros ao ecossistema Net Turbo. Precisão em cada detalhe.
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Main Form Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {cltBlocked && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-bold uppercase tracking-widest">
              Limite mensal atingido ({LIMITE_CLT_MES} indicações).
            </div>
          )}

          {/* Section 01: Identificação */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-outline-variant/30 italic">01</span>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest">Identificação do Lead</h2>
              <div className="h-px flex-1 bg-outline-variant/10" />
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
              <EditorialField
                label="Nome do Lead *"
                value={form.leadNome}
                onChange={(v) => setForm({ ...form, leadNome: v })}
                placeholder="Ex: Carlos Oliveira"
              />
              <EditorialField
                label="Empresa *"
                value={form.empresa}
                onChange={(v) => setForm({ ...form, empresa: v })}
                placeholder="Ex: Tech Solutions"
              />
              <EditorialField
                label="Telefone"
                value={form.telefone}
                onChange={(v) => setForm({ ...form, telefone: maskPhone(v) })}
                placeholder="+55 (XX) XXXXX-XXXX"
              />
              <EditorialField
                label="Email *"
                type="email"
                value={form.emailLead}
                onChange={(v) => setForm({ ...form, emailLead: v })}
                placeholder="contato@empresa.com"
              />
            </div>
          </section>

          {/* Section 02: Seus Dados */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-outline-variant/30 italic">02</span>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest">Dados do Indicador</h2>
              <div className="h-px flex-1 bg-outline-variant/10" />
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
              <EditorialField
                label="Seu Email"
                value={form.emailIndicador}
                onChange={(v) => setForm({ ...form, emailIndicador: v })}
              />
              <EditorialField
                label="Sua Função"
                value={form.funcao}
                onChange={(v) => setForm({ ...form, funcao: v })}
                placeholder="Cargo atual"
              />
              <EditorialSelect
                label="Seu Setor"
                value={form.setor}
                onChange={(v) => setForm({ ...form, setor: v as Setor })}
                options={SETORES}
              />
              <EditorialSelect
                label="Produto de Interesse"
                value={form.produto}
                onChange={(v) => setForm({ ...form, produto: v as Produto })}
                options={PRODUTOS}
              />
              <EditorialSelect
                label="Tipo de Contrato"
                value={form.contrato}
                onChange={(v) => setForm({ ...form, contrato: v as Contrato })}
                options={["CLT", "PJ"]}
              />
            </div>
          </section>

          {/* Section 03: Notas */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-outline-variant/30 italic">03</span>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest">Notas Adicionais</h2>
              <div className="h-px flex-1 bg-outline-variant/10" />
            </div>

            <EditorialTextarea
              label="Observações e Contexto"
              value={form.observacao}
              onChange={(v) => setForm({ ...form, observacao: v })}
              placeholder="Descreva detalhes que possam ajudar na abordagem comercial..."
            />
          </section>

          <footer className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-medium text-on-surface-variant">
              <div className="h-2 w-2 rounded-full bg-primary-container animate-pulse" />
              R$ {VALOR_RECOMPENSA} por contrato implantado
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <PrimaryButton type="submit" disabled={cltBlocked} className="px-8 py-4 text-xs tracking-[0.2em] uppercase">
                Confirmar Registro
              </PrimaryButton>
            </div>
          </footer>
        </form>

        {/* Sidebar Info - Tonal Depth Layer */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-surface-low rounded-xl p-6 space-y-6">
            <div>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-4">
                Sua Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] uppercase font-bold text-outline">Meta Trimestral</span>
                    <span className="text-xs font-bold text-white">{trimAtual}/{META_TRIMESTRAL}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-highest rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-container transition-all duration-1000 ease-out"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-end border-b border-outline-variant/10 pb-3">
                  <span className="text-[10px] uppercase font-bold text-outline">Crédito Atual</span>
                  <span className="text-base font-display font-bold text-primary-container">R$ {credito.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-outline mb-3">
                Diretrizes
              </h3>
              <ul className="space-y-2">
                {[
                  `Limite: ${LIMITE_CLT_MES}/mês (CLT)`,
                  "Apenas novos CNPJs",
                  "Crédito após implantação"
                ].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-[10px] font-medium text-on-surface-variant">
                    <CheckCircle2 className="h-3 w-3 text-primary-container" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-primary-container text-on-primary-container rounded-xl p-6 relative overflow-hidden group">
             <div className="relative z-10 space-y-3">
               <h4 className="font-display text-xl font-bold italic leading-tight uppercase text-on-primary-container">Precisa de Ajuda?</h4>
               <p className="text-[11px] font-medium leading-relaxed opacity-80">
                 Dúvidas sobre o regulamento ou como preencher?
               </p>
               <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-on-primary-container/30 hover:border-on-primary-container transition-all">
                 Ver Regulamento
               </button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditorialField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="group space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-outline font-black group-focus-within:text-primary-container transition-colors">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline-variant/50 focus:ring-0 focus:border-primary-container transition-all text-sm font-medium"
      />
    </div>
  );
}

function EditorialSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="group space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-outline font-black group-focus-within:text-primary-container transition-colors">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface focus:ring-0 focus:border-primary-container transition-all text-sm font-medium appearance-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-surface-container text-on-surface">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function EditorialTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="group space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-outline font-black group-focus-within:text-primary-container transition-colors">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-surface-low rounded-lg border border-outline-variant/10 p-4 text-on-surface placeholder:text-outline-variant/50 focus:ring-1 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all text-sm font-medium resize-none"
      />
    </div>
  );
}