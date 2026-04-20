import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Filter,
  Download,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "../AppContext";
import {
  PRODUTOS,
  SETORES,
  STATUSES,
  STATUS_STYLES,
  type Indicacao,
  type Produto,
  type Setor,
  type StatusIndicacao,
} from "../types";
import { Avatar } from "../components/Avatar";
import { StatusBadge } from "../components/StatusBadge";
import { PrimaryButton } from "../components/PrimaryButton";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function IndicacoesPage() {
  const { user, visibleIndicacoes, updateStatus, updateIndicacao, deleteIndicacao } = useApp();
  const [showFilter, setShowFilter] = useState(false);
  const [fStatus, setFStatus] = useState<StatusIndicacao | "">("");
  const [fProduto, setFProduto] = useState<Produto | "">("");
  const [fSetor, setFSetor] = useState<Setor | "">("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<Indicacao | null>(null);

  const filtered = useMemo(() => {
    return visibleIndicacoes.filter((i) => {
      if (fStatus && i.status !== fStatus) return false;
      if (fProduto && i.produto !== fProduto) return false;
      if (fSetor && i.setor !== fSetor) return false;
      return true;
    });
  }, [visibleIndicacoes, fStatus, fProduto, fSetor]);

  if (!user) return null;

  const canEditAny = user.role === "admin";
  const canChangeStatus = user.role === "admin" || user.role === "aprovador";

  const canEditItem = (i: Indicacao) =>
    user.role === "admin" || (user.role === "usuario" && i.criadoPorId === user.id);
  const canDeleteItem = (i: Indicacao) =>
    user.role === "admin" || (user.role === "usuario" && i.criadoPorId === user.id);

  const handleExport = () => {
    const rows = [
      ["Status", "Lead", "Empresa", "Email", "Telefone", "Produto", "Setor", "Contrato", "Criado por", "Criado em"].join(","),
      ...filtered.map((i) =>
        [
          i.status,
          i.leadNome,
          i.empresa,
          i.emailLead,
          i.telefone,
          i.produto,
          i.setor,
          i.contrato,
          i.criadoPorNome,
          new Date(i.criadoEm).toLocaleDateString("pt-BR"),
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `indicacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado.");
  };

  const clearFilters = () => {
    setFStatus("");
    setFProduto("");
    setFSetor("");
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {user.role === "usuario" ? "Minhas Indicações" : "Indicações"}
          </h2>
          <p className="mt-1 text-sm text-[#AAAAAA]">
            {filtered.length} item(ns) {fStatus || fProduto || fSetor ? "filtrado(s)" : "no total"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PrimaryButton variant="secondary" onClick={() => setShowFilter((v) => !v)}>
            <Filter className="h-4 w-4" /> FILTRAR
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" /> EXPORTAR
          </PrimaryButton>
        </div>
      </header>

      {showFilter && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <FilterSelect label="Status" value={fStatus} onChange={(v) => setFStatus(v as StatusIndicacao | "")} options={STATUSES} />
          <FilterSelect label="Produto" value={fProduto} onChange={(v) => setFProduto(v as Produto | "")} options={PRODUTOS} />
          <FilterSelect label="Setor" value={fSetor} onChange={(v) => setFSetor(v as Setor | "")} options={SETORES} />
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-[#AAAAAA] underline hover:text-white"
          >
            Limpar
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#141414] text-left text-[10px] uppercase tracking-wider text-[#888888]">
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Criado por</th>
                <th className="px-4 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Produto</th>
                <th className="px-4 py-3 font-semibold">Setor</th>
                <th className="px-4 py-3 font-semibold">Contrato</th>
                <th className="px-4 py-3 font-semibold">Criado</th>
                <th className="px-4 py-3 font-semibold">Modificado</th>
                <th className="px-4 py-3 font-semibold">Por</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-[#666666]">
                    Nenhuma indicação encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i.id} className="border-b border-[#2a2a2a] transition-colors hover:bg-[#141414]">
                    <td className="px-4 py-4">
                      {canChangeStatus ? (
                        <select
                          value={i.status}
                          onChange={(e) => {
                            updateStatus(i.id, e.target.value as StatusIndicacao);
                            toast.success(`Status atualizado para "${e.target.value}"`);
                          }}
                          className={`cursor-pointer rounded-full border px-2 py-1 text-xs font-medium outline-none ${STATUS_STYLES[i.status].bg} ${STATUS_STYLES[i.status].text} ${STATUS_STYLES[i.status].border}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-[#1a1a1a] text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge status={i.status} />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={i.criadoPorNome} size="sm" />
                        <span className="text-white">{i.criadoPorNome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{i.leadNome}</div>
                      <div className="text-xs text-[#AAAAAA]">{i.empresa}</div>
                      <div className="mt-0.5 text-[11px] text-[#666666]">
                        {i.emailLead} • {i.telefone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#DDDDDD]">{i.produto}</td>
                    <td className="px-4 py-4 text-[#DDDDDD]">{i.setor}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-[#2a2a2a] px-2 py-0.5 text-[11px] font-semibold text-white">
                        {i.contrato}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-[#AAAAAA]">{fmtDate(i.criadoEm)}</td>
                    <td className="px-4 py-4 text-xs text-[#AAAAAA]">{fmtDate(i.modificadoEm)}</td>
                    <td className="px-4 py-4 text-xs text-[#AAAAAA]">{i.modificadoPorNome}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setOpenMenu(openMenu === i.id ? null : i.id)}
                          className="rounded-md p-1.5 text-[#AAAAAA] hover:bg-[#2a2a2a] hover:text-white"
                          aria-label="Ações"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenu === i.id && (
                          <div
                            className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] shadow-xl"
                            onMouseLeave={() => setOpenMenu(null)}
                          >
                            {canEditItem(i) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditing(i);
                                  setOpenMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white hover:bg-[#2a2a2a]"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Editar
                              </button>
                            )}
                            {canDeleteItem(i) && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Excluir esta indicação?")) {
                                    deleteIndicacao(i.id);
                                    setOpenMenu(null);
                                    toast.success("Indicação excluída.");
                                  }
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-[#2a2a2a]"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Excluir
                              </button>
                            )}
                            {!canEditItem(i) && !canDeleteItem(i) && !canChangeStatus && (
                              <div className="px-3 py-2 text-xs text-[#666666]">
                                Sem ações disponíveis
                              </div>
                            )}
                            {!canEditItem(i) && !canDeleteItem(i) && canChangeStatus && (
                              <div className="px-3 py-2 text-xs text-[#666666]">
                                Use a coluna Status para alterar.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && canEditAny && (
        <EditModal
          indicacao={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateIndicacao(editing.id, patch);
            setEditing(null);
            toast.success("Indicação atualizada.");
          }}
        />
      )}

      {editing && !canEditAny && (
        <EditModal
          indicacao={editing}
          restricted
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateIndicacao(editing.id, patch);
            setEditing(null);
            toast.success("Indicação atualizada.");
          }}
        />
      )}
    </div>
  );
}

function FilterSelect({
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
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-[#CCFF00]"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function EditModal({
  indicacao,
  onClose,
  onSave,
  restricted = false,
}: {
  indicacao: Indicacao;
  onClose: () => void;
  onSave: (patch: Partial<Indicacao>) => void;
  restricted?: boolean;
}) {
  const [form, setForm] = useState({
    leadNome: indicacao.leadNome,
    empresa: indicacao.empresa,
    telefone: indicacao.telefone,
    emailLead: indicacao.emailLead,
    produto: indicacao.produto,
    observacao: indicacao.observacao,
  });
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Editar Indicação</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#AAAAAA] hover:bg-[#2a2a2a] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {restricted && (
          <p className="mt-2 text-xs text-[#AAAAAA]">
            Você só pode editar suas próprias indicações.
          </p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ModalField label="Lead" value={form.leadNome} onChange={(v) => setForm({ ...form, leadNome: v })} />
          <ModalField label="Empresa" value={form.empresa} onChange={(v) => setForm({ ...form, empresa: v })} />
          <ModalField label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
          <ModalField label="Email" value={form.emailLead} onChange={(v) => setForm({ ...form, emailLead: v })} />
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-[#AAAAAA]">Produto</span>
            <select
              value={form.produto}
              onChange={(e) => setForm({ ...form, produto: e.target.value as Produto })}
              className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#CCFF00]"
            >
              {PRODUTOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-[#AAAAAA]">Observação</span>
            <textarea
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#2a2a2a] bg-[#111111] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#CCFF00]"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <PrimaryButton variant="secondary" onClick={onClose}>
            Cancelar
          </PrimaryButton>
          <PrimaryButton onClick={() => onSave(form)}>Salvar</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#AAAAAA]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#CCFF00]"
      />
    </label>
  );
}