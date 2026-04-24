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
  type Contato,
} from "../types";
import { Avatar } from "../components/Avatar";
import { StatusBadge } from "../components/StatusBadge";
import { PrimaryButton } from "../components/PrimaryButton";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

type TipoFiltro = "" | "indicacao" | "contato";

export function IndicacoesPage() {
  const {
    user,
    visibleIndicacoes,
    updateStatus,
    updateIndicacao,
    deleteIndicacao,
    contatos,
    updateContato,
    deleteContato,
  } = useApp();
  const [showFilter, setShowFilter] = useState(false);
  const [fStatus, setFStatus] = useState<StatusIndicacao | "">("");
  const [fProduto, setFProduto] = useState<Produto | "">("");
  const [fSetor, setFSetor] = useState<Setor | "">("");
  const [fTipo, setFTipo] = useState<TipoFiltro>("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<Indicacao | null>(null);
  const [editingContato, setEditingContato] = useState<Contato | null>(null);

  const isAdmin = user?.role === "admin";

  const filtered = useMemo(() => {
    return visibleIndicacoes.filter((i) => {
      if (fStatus && i.status !== fStatus) return false;
      if (fProduto && i.produto !== fProduto) return false;
      if (fSetor && i.setor !== fSetor) return false;
      return true;
    });
  }, [visibleIndicacoes, fStatus, fProduto, fSetor]);

  const filteredContatos = useMemo(() => {
    if (!isAdmin) return [];
    return contatos;
  }, [contatos, isAdmin]);

  type Row =
    | { kind: "indicacao"; data: Indicacao; sortDate: string }
    | { kind: "contato"; data: Contato; sortDate: string };

  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];
    if (fTipo !== "contato") {
      filtered.forEach((i) => list.push({ kind: "indicacao", data: i, sortDate: i.modificadoEm }));
    }
    if (isAdmin && fTipo !== "indicacao") {
      filteredContatos.forEach((c) =>
        list.push({ kind: "contato", data: c, sortDate: c.modificadoEm }),
      );
    }
    return list.sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1));
  }, [filtered, filteredContatos, isAdmin, fTipo]);

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
    setFTipo("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 font-body">
      {/* Header Editorial */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-outline-variant/10">
        <div className="space-y-2">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
            {user.role === "usuario" ? "Minhas" : "Todas"} <br />
            <span className="italic font-light text-on-surface-variant">
              {isAdmin ? "Indicações & Contatos" : "Indicações"}
            </span>
          </h1>
          <p className="text-[10px] text-outline uppercase tracking-widest font-bold">
            {rows.length} itens encontrados no banco de dados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <PrimaryButton variant="secondary" onClick={() => setShowFilter((v) => !v)} className="px-4 py-2 text-[10px] tracking-widest">
            <Filter className="h-3 w-3" /> FILTRAR
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={handleExport} className="px-4 py-2 text-[10px] tracking-widest">
            <Download className="h-3 w-3" /> EXPORTAR
          </PrimaryButton>
        </div>
      </header>

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          <TipoChip active={fTipo === ""} onClick={() => setFTipo("")} label={`Todos · ${filtered.length + filteredContatos.length}`} />
          <TipoChip
            active={fTipo === "indicacao"}
            onClick={() => setFTipo("indicacao")}
            label={`Indicações · ${filtered.length}`}
            color="primary"
          />
          <TipoChip
            active={fTipo === "contato"}
            onClick={() => setFTipo("contato")}
            label={`Contatos · ${filteredContatos.length}`}
            color="sky"
          />
        </div>
      )}

      {showFilter && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-surface-low rounded-xl animate-in slide-in-from-top-4 duration-500">
          <FilterSelect label="Status" value={fStatus} onChange={(v) => setFStatus(v as StatusIndicacao | "")} options={STATUSES} />
          <FilterSelect label="Produto" value={fProduto} onChange={(v) => setFProduto(v as Produto | "")} options={PRODUTOS} />
          <FilterSelect label="Setor" value={fSetor} onChange={(v) => setFSetor(v as Setor | "")} options={SETORES} />
          <div className="flex items-end pb-1">
            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-black uppercase tracking-widest text-primary-container hover:underline underline-offset-4"
            >
              Resetar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Table Container with Tonal Depth */}
      <div className="overflow-hidden rounded-xl bg-surface-low shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-highest/50 border-b border-outline-variant/10">
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline">Tipo</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline">Status</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline">Colaborador</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline">Lead / Empresa</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline hidden md:table-cell">Produto</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline hidden lg:table-cell">Contrato</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline">Datas</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-outline text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="text-outline-variant font-display text-lg uppercase tracking-widest italic">Nenhum registro encontrado</div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => row.kind === "indicacao" ? (() => { const i = row.data; return (
                  <tr key={i.id} className="group hover:bg-surface-high/50 transition-colors">
                    <td className="px-6 py-6">
                      <TypeTag kind="indicacao" />
                    </td>
                    <td className="px-6 py-6">
                      {canChangeStatus ? (
                        <select
                          value={i.status}
                          onChange={(e) => {
                            updateStatus(i.id, e.target.value as StatusIndicacao);
                            toast.success(`Status atualizado`);
                          }}
                          className={`cursor-pointer rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest outline-none border-0 ring-1 ring-inset ${STATUS_STYLES[i.status].bg} ${STATUS_STYLES[i.status].text} ring-current/20`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-surface-container text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge status={i.status} />
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={i.criadoPorNome} size="sm" className="ring-2 ring-primary-container/20" />
                        <span className="text-xs font-bold uppercase tracking-tight text-on-surface">{i.criadoPorNome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="text-sm font-bold uppercase tracking-tight text-white group-hover:text-primary-container transition-colors">{i.leadNome}</div>
                        <div className="text-[10px] font-medium text-outline uppercase tracking-wider">{i.empresa}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 hidden md:table-cell">
                      <span className="text-xs font-medium text-on-surface-variant">{i.produto}</span>
                    </td>
                    <td className="px-6 py-6 hidden lg:table-cell">
                      <span className="inline-block px-2 py-0.5 rounded bg-surface-highest text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">
                        {i.contrato}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-on-surface-variant">C: {fmtDate(i.criadoEm)}</div>
                        <div className="text-[10px] font-medium text-outline">M: {fmtDate(i.modificadoEm)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setOpenMenu(openMenu === i.id ? null : i.id)}
                          className="p-2 rounded-lg text-outline hover:text-white hover:bg-surface-highest transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenu === i.id && (
                          <div
                            className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl bg-surface-high border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200"
                            onMouseLeave={() => setOpenMenu(null)}
                          >
                            {canEditItem(i) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditing(i);
                                  setOpenMenu(null);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-primary-container hover:text-on-primary-container transition-colors"
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
                                    toast.success("Excluído.");
                                  }
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ); })() : (() => { const c = row.data; return (
                  <tr key={c.id} className="group hover:bg-surface-high/50 transition-colors">
                    <td className="px-6 py-6">
                      <TypeTag kind="contato" />
                    </td>
                    <td className="px-6 py-6">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sky-400">
                        Contato
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.criadoPorNome} size="sm" className="ring-2 ring-sky-500/20" />
                        <span className="text-xs font-bold uppercase tracking-tight text-on-surface">{c.criadoPorNome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="text-sm font-bold uppercase tracking-tight text-white group-hover:text-sky-400 transition-colors">{c.nome}</div>
                        <div className="text-[10px] font-medium text-outline uppercase tracking-wider">{c.nomeFantasia || c.razaoSocial || "—"}</div>
                        <div className="text-[10px] font-medium text-outline-variant">{c.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 hidden md:table-cell">
                      <span className="text-xs font-medium text-on-surface-variant">{c.cnpj || "—"}</span>
                    </td>
                    <td className="px-6 py-6 hidden lg:table-cell">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-on-surface-variant">{c.celular || c.telefoneFixo || "—"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-on-surface-variant">C: {fmtDate(c.criadoEm)}</div>
                        <div className="text-[10px] font-medium text-outline">M: {fmtDate(c.modificadoEm)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                          className="p-2 rounded-lg text-outline hover:text-white hover:bg-surface-highest transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenu === c.id && (
                          <div
                            className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl bg-surface-high border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200"
                            onMouseLeave={() => setOpenMenu(null)}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContato(c);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-primary-container hover:text-on-primary-container transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Excluir este contato?")) {
                                  deleteContato(c.id);
                                  setOpenMenu(null);
                                  toast.success("Excluído.");
                                }
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ); })())
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

      {editingContato && (
        <EditContatoModal
          contato={editingContato}
          onClose={() => setEditingContato(null)}
          onSave={(patch) => {
            updateContato(editingContato.id, patch);
            setEditingContato(null);
            toast.success("Contato atualizado.");
          }}
        />
      )}
    </div>
  );
}

function TypeTag({ kind }: { kind: "indicacao" | "contato" }) {
  if (kind === "indicacao") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-primary-container/30 bg-primary-container/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-primary-container">
        Indicação
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-sky-400">
      Contato
    </span>
  );
}

function TipoChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: "primary" | "sky";
}) {
  const activeRing =
    color === "sky"
      ? "ring-sky-400 bg-sky-500/20 text-sky-300"
      : color === "primary"
        ? "ring-primary-container bg-primary-container/20 text-primary-container"
        : "ring-white bg-white/10 text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ring-1 ring-inset ${
        active ? activeRing : "ring-outline-variant/20 bg-surface-low text-outline hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function EditContatoModal({
  contato,
  onClose,
  onSave,
}: {
  contato: Contato;
  onClose: () => void;
  onSave: (patch: Partial<Contato>) => void;
}) {
  const [form, setForm] = useState({
    nome: contato.nome,
    email: contato.email,
    cnpj: contato.cnpj,
    razaoSocial: contato.razaoSocial,
    nomeFantasia: contato.nomeFantasia,
    telefoneFixo: contato.telefoneFixo,
    celular: contato.celular,
  });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Editar Contato</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#AAAAAA] hover:bg-[#2a2a2a] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ModalField label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
          <ModalField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <ModalField label="CNPJ" value={form.cnpj} onChange={(v) => setForm({ ...form, cnpj: v })} />
          <ModalField label="Telefone Fixo" value={form.telefoneFixo} onChange={(v) => setForm({ ...form, telefoneFixo: v })} />
          <ModalField label="Celular" value={form.celular} onChange={(v) => setForm({ ...form, celular: v })} />
          <ModalField label="Razão Social" value={form.razaoSocial} onChange={(v) => setForm({ ...form, razaoSocial: v })} />
          <ModalField label="Nome Fantasia" value={form.nomeFantasia} onChange={(v) => setForm({ ...form, nomeFantasia: v })} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <PrimaryButton variant="secondary" onClick={onClose}>Cancelar</PrimaryButton>
          <PrimaryButton onClick={() => onSave(form)}>Salvar</PrimaryButton>
        </div>
      </div>
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