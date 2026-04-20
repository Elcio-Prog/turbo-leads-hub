export type Role = "admin" | "aprovador" | "usuario";
export type Contrato = "CLT" | "PJ";

export type Setor =
  | "GT"
  | "BACK OFFICE"
  | "COMERCIAL"
  | "COMPRAS"
  | "FINANCEIRO"
  | "IMPLANTAÇÃO"
  | "LOGÍSTICA"
  | "MANUTENÇÃO"
  | "MARKETING"
  | "NOC"
  | "NT TECH"
  | "O&M"
  | "PROCESSO E QUALIDADE"
  | "PROJETOS"
  | "TI";

export type Produto =
  | "Conectividade"
  | "Wifi"
  | "Firewall"
  | "Switch"
  | "Backup"
  | "VOZ";

export type StatusIndicacao =
  | "Indicado"
  | "Qualificado"
  | "Desqualificado"
  | "Reunião agendada"
  | "Reunião realizada"
  | "Proposta em análise"
  | "Contrato assinado"
  | "Venda perdida";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  contrato: Contrato;
  setor: Setor;
}

export interface Indicacao {
  id: string;
  status: StatusIndicacao;
  leadNome: string;
  empresa: string;
  telefone: string;
  emailLead: string;
  produto: Produto;
  emailIndicador: string;
  setor: Setor;
  funcao: string;
  contrato: Contrato;
  observacao: string;
  criadoPorId: number;
  criadoPorNome: string;
  criadoEm: string;
  modificadoEm: string;
  modificadoPorNome: string;
  recompensaPaga?: boolean;
}

export const SETORES: Setor[] = [
  "GT",
  "BACK OFFICE",
  "COMERCIAL",
  "COMPRAS",
  "FINANCEIRO",
  "IMPLANTAÇÃO",
  "LOGÍSTICA",
  "MANUTENÇÃO",
  "MARKETING",
  "NOC",
  "NT TECH",
  "O&M",
  "PROCESSO E QUALIDADE",
  "PROJETOS",
  "TI",
];

export const PRODUTOS: Produto[] = [
  "Conectividade",
  "Wifi",
  "Firewall",
  "Switch",
  "Backup",
  "VOZ",
];

export const STATUSES: StatusIndicacao[] = [
  "Indicado",
  "Qualificado",
  "Desqualificado",
  "Reunião agendada",
  "Reunião realizada",
  "Proposta em análise",
  "Contrato assinado",
  "Venda perdida",
];

export const STATUS_STYLES: Record<StatusIndicacao, { dot: string; bg: string; text: string; border: string }> = {
  Indicado: { dot: "bg-yellow-400", bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/30" },
  Qualificado: { dot: "bg-blue-400", bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/30" },
  Desqualificado: { dot: "bg-red-500", bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/30" },
  "Reunião agendada": { dot: "bg-orange-400", bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/30" },
  "Reunião realizada": { dot: "bg-purple-400", bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/30" },
  "Proposta em análise": { dot: "bg-amber-700", bg: "bg-amber-900/20", text: "text-amber-300", border: "border-amber-700/40" },
  "Contrato assinado": { dot: "bg-[#CCFF00]", bg: "bg-[#CCFF00]/10", text: "text-[#CCFF00]", border: "border-[#CCFF00]/40" },
  "Venda perdida": { dot: "bg-zinc-500", bg: "bg-zinc-500/10", text: "text-zinc-300", border: "border-zinc-500/40" },
};

export const VALOR_RECOMPENSA = 200;
export const META_TRIMESTRAL = 10;
export const LIMITE_CLT_MES = 2;