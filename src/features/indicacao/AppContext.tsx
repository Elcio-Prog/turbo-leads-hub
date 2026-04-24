import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Indicacao,
  StatusIndicacao,
  User,
  Contato,
} from "./types";
import { LIMITE_CLT_MES, VALOR_RECOMPENSA } from "./types";

export const MOCK_USERS: User[] = [
  { id: 1, name: "Ana Lima", email: "ana.lima@netturbo.com.br", role: "admin", contrato: "CLT", setor: "TI" },
  { id: 2, name: "Bruno Costa", email: "bruno.costa@netturbo.com.br", role: "aprovador", contrato: "PJ", setor: "COMERCIAL" },
  { id: 3, name: "Carla Souza", email: "carla.souza@netturbo.com.br", role: "usuario", contrato: "CLT", setor: "FINANCEIRO" },
  { id: 4, name: "Diego Ramos", email: "diego.ramos@netturbo.com.br", role: "usuario_ra", contrato: "CLT", setor: "COMERCIAL" },
];

const now = () => new Date().toISOString();
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const SEED_INDICACOES: Indicacao[] = [
  {
    id: "ind-001",
    status: "Contrato assinado",
    leadNome: "Ricardo Mendes",
    empresa: "Vento Sul Logística",
    telefone: "+55 (11) 98877-1122",
    emailLead: "ricardo@ventosul.com.br",
    produto: "Conectividade",
    emailIndicador: "carla.souza@netturbo.com.br",
    setor: "FINANCEIRO",
    funcao: "Analista Financeiro",
    contrato: "CLT",
    observacao: "Cliente já era contato antigo.",
    criadoPorId: 3,
    criadoPorNome: "Carla Souza",
    criadoEm: daysAgo(40),
    modificadoEm: daysAgo(5),
    modificadoPorNome: "Bruno Costa",
    recompensaPaga: false,
  },
  {
    id: "ind-002",
    status: "Qualificado",
    leadNome: "Patrícia Alves",
    empresa: "Clínica Bem Estar",
    telefone: "+55 (21) 99988-3344",
    emailLead: "patricia@bemestar.com.br",
    produto: "Wifi",
    emailIndicador: "carla.souza@netturbo.com.br",
    setor: "FINANCEIRO",
    funcao: "Analista Financeiro",
    contrato: "CLT",
    observacao: "Pediu retorno em 7 dias.",
    criadoPorId: 3,
    criadoPorNome: "Carla Souza",
    criadoEm: daysAgo(12),
    modificadoEm: daysAgo(3),
    modificadoPorNome: "Bruno Costa",
  },
  {
    id: "ind-003",
    status: "Reunião agendada",
    leadNome: "Marcos Tavares",
    empresa: "Indústria Norte",
    telefone: "+55 (31) 98765-4321",
    emailLead: "marcos@indnorte.com.br",
    produto: "Firewall",
    emailIndicador: "ana.lima@netturbo.com.br",
    setor: "TI",
    funcao: "Gerente de TI",
    contrato: "CLT",
    observacao: "Reunião remota dia 22.",
    criadoPorId: 1,
    criadoPorNome: "Ana Lima",
    criadoEm: daysAgo(8),
    modificadoEm: daysAgo(2),
    modificadoPorNome: "Bruno Costa",
  },
  {
    id: "ind-004",
    status: "Proposta em análise",
    leadNome: "Júlia Ramos",
    empresa: "EduMais",
    telefone: "+55 (11) 91234-5566",
    emailLead: "julia@edumais.com.br",
    produto: "Switch",
    emailIndicador: "ana.lima@netturbo.com.br",
    setor: "TI",
    funcao: "Gerente de TI",
    contrato: "CLT",
    observacao: "Enviada proposta inicial.",
    criadoPorId: 1,
    criadoPorNome: "Ana Lima",
    criadoEm: daysAgo(20),
    modificadoEm: daysAgo(1),
    modificadoPorNome: "Ana Lima",
  },
  {
    id: "ind-005",
    status: "Venda perdida",
    leadNome: "Henrique Sá",
    empresa: "Sá & Filhos",
    telefone: "+55 (51) 99999-7777",
    emailLead: "henrique@safilhos.com.br",
    produto: "VOZ",
    emailIndicador: "carla.souza@netturbo.com.br",
    setor: "FINANCEIRO",
    funcao: "Analista Financeiro",
    contrato: "CLT",
    observacao: "Optou por concorrente.",
    criadoPorId: 3,
    criadoPorNome: "Carla Souza",
    criadoEm: daysAgo(60),
    modificadoEm: daysAgo(30),
    modificadoPorNome: "Bruno Costa",
  },
  {
    id: "ind-006",
    status: "Indicado",
    leadNome: "Tatiana Borges",
    empresa: "TB Cosméticos",
    telefone: "+55 (11) 98888-1234",
    emailLead: "tatiana@tbcosmeticos.com.br",
    produto: "Backup",
    emailIndicador: "ana.lima@netturbo.com.br",
    setor: "TI",
    funcao: "Gerente de TI",
    contrato: "CLT",
    observacao: "",
    criadoPorId: 1,
    criadoPorNome: "Ana Lima",
    criadoEm: daysAgo(2),
    modificadoEm: daysAgo(2),
    modificadoPorNome: "Ana Lima",
  },
  {
    id: "ind-007",
    status: "Contrato assinado",
    leadNome: "Fernando Lopes",
    empresa: "Lopes Construtora",
    telefone: "+55 (47) 98123-4455",
    emailLead: "fernando@lopesconst.com.br",
    produto: "Conectividade",
    emailIndicador: "ana.lima@netturbo.com.br",
    setor: "TI",
    funcao: "Gerente de TI",
    contrato: "CLT",
    observacao: "Contrato fechado em 12 meses.",
    criadoPorId: 1,
    criadoPorNome: "Ana Lima",
    criadoEm: daysAgo(75),
    modificadoEm: daysAgo(20),
    modificadoPorNome: "Bruno Costa",
    recompensaPaga: true,
  },
];

const SEED_CONTATOS: Contato[] = [
  {
    id: "cont-001",
    nome: "Roberto Silveira",
    email: "roberto@transportadoraalfa.com.br",
    cnpj: "12.345.678/0001-90",
    razaoSocial: "Transportadora Alfa LTDA",
    nomeFantasia: "Alfa Logística",
    telefoneFixo: "+55 (11) 3344-5566",
    celular: "+55 (11) 99887-7766",
    criadoPorId: 4,
    criadoPorNome: "Diego Ramos",
    criadoEm: daysAgo(15),
    modificadoEm: daysAgo(4),
    modificadoPorNome: "Diego Ramos",
  },
  {
    id: "cont-002",
    nome: "Mariana Cardoso",
    email: "mariana@verdecampoagro.com.br",
    cnpj: "23.456.789/0001-12",
    razaoSocial: "Verde Campo Agronegócios S.A.",
    nomeFantasia: "Verde Campo",
    telefoneFixo: "+55 (62) 3211-4400",
    celular: "+55 (62) 98123-4567",
    criadoPorId: 4,
    criadoPorNome: "Diego Ramos",
    criadoEm: daysAgo(10),
    modificadoEm: daysAgo(2),
    modificadoPorNome: "Diego Ramos",
  },
  {
    id: "cont-003",
    nome: "Eduardo Pacheco",
    email: "eduardo@pachecoadvogados.com.br",
    cnpj: "34.567.890/0001-34",
    razaoSocial: "Pacheco Advogados Associados",
    nomeFantasia: "Pacheco & Associados",
    telefoneFixo: "+55 (21) 2233-9988",
    celular: "+55 (21) 99765-4321",
    criadoPorId: 4,
    criadoPorNome: "Diego Ramos",
    criadoEm: daysAgo(7),
    modificadoEm: daysAgo(7),
    modificadoPorNome: "Diego Ramos",
  },
  {
    id: "cont-004",
    nome: "Beatriz Nogueira",
    email: "beatriz@clinicasaudeplena.com.br",
    cnpj: "45.678.901/0001-56",
    razaoSocial: "Clínica Saúde Plena LTDA",
    nomeFantasia: "Saúde Plena",
    telefoneFixo: "+55 (41) 3055-2200",
    celular: "+55 (41) 98444-1122",
    criadoPorId: 4,
    criadoPorNome: "Diego Ramos",
    criadoEm: daysAgo(5),
    modificadoEm: daysAgo(1),
    modificadoPorNome: "Diego Ramos",
  },
  {
    id: "cont-005",
    nome: "Felipe Andrade",
    email: "felipe@metalurgicasul.com.br",
    cnpj: "56.789.012/0001-78",
    razaoSocial: "Metalúrgica Sul Brasil LTDA",
    nomeFantasia: "MetalSul",
    telefoneFixo: "+55 (51) 3666-7788",
    celular: "+55 (51) 99222-3344",
    criadoPorId: 4,
    criadoPorNome: "Diego Ramos",
    criadoEm: daysAgo(3),
    modificadoEm: daysAgo(3),
    modificadoPorNome: "Diego Ramos",
  },
  {
    id: "cont-006",
    nome: "Larissa Monteiro",
    email: "larissa@boutiqueencanto.com.br",
    cnpj: "67.890.123/0001-90",
    razaoSocial: "Encanto Comércio de Roupas LTDA",
    nomeFantasia: "Boutique Encanto",
    telefoneFixo: "+55 (11) 4002-8922",
    celular: "+55 (11) 97654-3210",
    criadoPorId: 4,
    criadoPorNome: "Diego Ramos",
    criadoEm: daysAgo(1),
    modificadoEm: daysAgo(1),
    modificadoPorNome: "Diego Ramos",
  },
];

const STORAGE_AUTH = "ni:auth";
const STORAGE_DATA = "ni:indicacoes";
const STORAGE_CONTATOS = "ni:contatos";

interface AppContextValue {
  user: User | null;
  users: User[];
  login: (userId: number) => void;
  logout: () => void;
  indicacoes: Indicacao[];
  visibleIndicacoes: Indicacao[];
  createIndicacao: (
    data: Omit<Indicacao, "id" | "status" | "criadoEm" | "modificadoEm" | "criadoPorId" | "criadoPorNome" | "modificadoPorNome">,
  ) => { ok: boolean; error?: string };
  updateIndicacao: (id: string, patch: Partial<Indicacao>) => void;
  updateStatus: (id: string, status: StatusIndicacao) => void;
  deleteIndicacao: (id: string) => void;
  countCltThisMonth: (userId: number) => number;
  creditoAtual: (userId: number) => number;
  contatos: Contato[];
  visibleContatos: Contato[];
  createContato: (
    data: Omit<Contato, "id" | "criadoEm" | "modificadoEm" | "criadoPorId" | "criadoPorNome" | "modificadoPorNome">,
  ) => { ok: boolean; error?: string };
  updateContato: (id: string, patch: Partial<Contato>) => void;
  deleteContato: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>(SEED_INDICACOES);
  const [contatos, setContatos] = useState<Contato[]>(SEED_CONTATOS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedUserId = loadJSON<number | null>(STORAGE_AUTH, null);
    if (savedUserId) {
      const found = MOCK_USERS.find((u) => u.id === savedUserId) || null;
      setUser(found);
    }
    const savedData = loadJSON<Indicacao[] | null>(STORAGE_DATA, null);
    if (savedData && Array.isArray(savedData) && savedData.length > 0) {
      setIndicacoes(savedData);
    }
    const savedContatos = loadJSON<Contato[] | null>(STORAGE_CONTATOS, null);
    if (savedContatos && Array.isArray(savedContatos) && savedContatos.length > 0) {
      setContatos(savedContatos);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_DATA, indicacoes);
  }, [indicacoes, hydrated]);

  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_CONTATOS, contatos);
  }, [contatos, hydrated]);

  const login = useCallback((userId: number) => {
    const found = MOCK_USERS.find((u) => u.id === userId);
    if (!found) return;
    setUser(found);
    saveJSON(STORAGE_AUTH, userId);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_AUTH);
  }, []);

  const countCltThisMonth = useCallback(
    (userId: number) => {
      const now = new Date();
      const m = now.getMonth();
      const y = now.getFullYear();
      return indicacoes.filter((i) => {
        if (i.criadoPorId !== userId) return false;
        const d = new Date(i.criadoEm);
        return d.getMonth() === m && d.getFullYear() === y;
      }).length;
    },
    [indicacoes],
  );

  const creditoAtual = useCallback(
    (userId: number) =>
      indicacoes.filter((i) => i.criadoPorId === userId && i.status === "Contrato assinado").length *
      VALOR_RECOMPENSA,
    [indicacoes],
  );

  const createIndicacao: AppContextValue["createIndicacao"] = useCallback(
    (data) => {
      if (!user) return { ok: false, error: "Não autenticado" };
      if (user.contrato === "CLT" && user.role === "usuario") {
        const count = countCltThisMonth(user.id);
        if (count >= LIMITE_CLT_MES) {
          return {
            ok: false,
            error: `Você atingiu o limite de ${LIMITE_CLT_MES} indicações para este mês.`,
          };
        }
      }
      const stamp = now();
      const nova: Indicacao = {
        ...data,
        id: `ind-${Date.now()}`,
        status: "Indicado",
        criadoPorId: user.id,
        criadoPorNome: user.name,
        criadoEm: stamp,
        modificadoEm: stamp,
        modificadoPorNome: user.name,
      };
      setIndicacoes((prev) => [nova, ...prev]);
      return { ok: true };
    },
    [user, countCltThisMonth],
  );

  const updateIndicacao: AppContextValue["updateIndicacao"] = useCallback(
    (id, patch) => {
      if (!user) return;
      setIndicacoes((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, ...patch, modificadoEm: now(), modificadoPorNome: user.name }
            : i,
        ),
      );
    },
    [user],
  );

  const updateStatus = useCallback(
    (id: string, status: StatusIndicacao) => updateIndicacao(id, { status }),
    [updateIndicacao],
  );

  const deleteIndicacao = useCallback((id: string) => {
    setIndicacoes((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const visibleIndicacoes = useMemo(() => {
    if (!user) return [];
    if (user.role === "usuario") return indicacoes.filter((i) => i.criadoPorId === user.id);
    return indicacoes;
  }, [indicacoes, user]);

  const createContato: AppContextValue["createContato"] = useCallback(
    (data) => {
      if (!user) return { ok: false, error: "Não autenticado" };
      const stamp = now();
      const novo: Contato = {
        ...data,
        id: `cont-${Date.now()}`,
        criadoPorId: user.id,
        criadoPorNome: user.name,
        criadoEm: stamp,
        modificadoEm: stamp,
        modificadoPorNome: user.name,
      };
      setContatos((prev) => [novo, ...prev]);
      return { ok: true };
    },
    [user],
  );

  const updateContato: AppContextValue["updateContato"] = useCallback(
    (id, patch) => {
      if (!user) return;
      setContatos((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...patch, modificadoEm: now(), modificadoPorNome: user.name }
            : c,
        ),
      );
    },
    [user],
  );

  const deleteContato = useCallback((id: string) => {
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const visibleContatos = useMemo(() => {
    if (!user) return [];
    if (user.role === "usuario_ra") return contatos.filter((c) => c.criadoPorId === user.id);
    return contatos;
  }, [contatos, user]);

  const value: AppContextValue = {
    user,
    users: MOCK_USERS,
    login,
    logout,
    indicacoes,
    visibleIndicacoes,
    createIndicacao,
    updateIndicacao,
    updateStatus,
    deleteIndicacao,
    countCltThisMonth,
    creditoAtual,
    contatos,
    visibleContatos,
    createContato,
    updateContato,
    deleteContato,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}