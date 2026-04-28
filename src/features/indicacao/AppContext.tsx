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
  Contrato,
  Setor,
  Role,
  Produto,
} from "./types";
import { LIMITE_CLT_MES, VALOR_RECOMPENSA } from "./types";
import { authEmailForIdentifier } from "./authIdentifiers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegisterUserInput {
  identifier: string;
  password: string;
  authUserId?: string;
  name?: string;
  cpf?: string;
  funcao?: string;
  contrato?: Contrato;
  setor?: Setor;
}

interface UpdateProfileInput {
  name: string;
  loginId: string;
  cpf: string;
  funcao: string;
  setor: Setor;
  contrato: Contrato;
}

interface AppContextValue {
  user: User | null;
  users: User[];
  login: (userId: string) => void;
  registerUser: (data: RegisterUserInput) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (data: UpdateProfileInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  indicacoes: Indicacao[];
  visibleIndicacoes: Indicacao[];
  createIndicacao: (
    data: Omit<Indicacao, "id" | "status" | "criadoEm" | "modificadoEm" | "criadoPorId" | "criadoPorNome" | "modificadoPorNome">,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateIndicacao: (id: string, patch: Partial<Indicacao>) => void;
  updateStatus: (id: string, status: StatusIndicacao) => void;
  deleteIndicacao: (id: string) => void;
  countCltThisMonth: (userId: string) => number;
  creditoAtual: (userId: string) => number;
  contatos: Contato[];
  visibleContatos: Contato[];
  createContato: (
    data: Omit<Contato, "id" | "criadoEm" | "modificadoEm" | "criadoPorId" | "criadoPorNome" | "modificadoPorNome">,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateContato: (id: string, patch: Partial<Contato>) => void;
  deleteContato: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);

  useEffect(() => {
    const init = async () => {
      // 1. Load users (profiles)
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      
      let activeUsers: User[] = [];
      if (profiles && profiles.length > 0) {
        activeUsers = profiles.map(p => ({
          id: p.user_id,
          authUserId: p.user_id,
          name: p.name,
          email: p.email,
          loginId: p.login_identifier || p.email,
          cpf: p.cpf || undefined,
          funcao: p.funcao || "",
          role: (roles?.find(r => r.user_id === p.user_id)?.role as Role) || "usuario",
          contrato: p.contrato as Contrato,
          setor: p.setor as Setor,
          onboardingCompleted: p.onboarding_completed ?? false,
        }));
      }
      setUsers(activeUsers);

      // 2. Load indicacoes
      const { data: dbIndicacoes } = await supabase.from("indicacoes").select("*");
      if (dbIndicacoes && dbIndicacoes.length > 0) {
        setIndicacoes(dbIndicacoes.map(i => ({
          id: i.id,
          status: i.status as StatusIndicacao,
          leadNome: i.lead_nome,
          empresa: i.empresa,
          telefone: i.telefone,
          emailLead: i.email_lead,
          produto: i.produto as Produto,
          emailIndicador: i.email_indicador,
          setor: i.setor as Setor,
          funcao: i.funcao,
          contrato: i.contrato as Contrato,
          observacao: i.observacao,
          criadoPorId: i.criado_por_id,
          criadoPorNome: i.criado_por_nome,
          criadoEm: i.created_at,
          modificadoEm: i.updated_at,
          modificadoPorNome: i.modificado_por_nome,
          recompensaPaga: i.recompensa_paga,
        })));
      }

      // 3. Load contatos
      const { data: dbContatos } = await supabase.from("contatos").select("*");
      if (dbContatos && dbContatos.length > 0) {
        setContatos(dbContatos.map(c => ({
          id: c.id,
          nome: c.nome,
          email: c.email,
          cnpj: c.cnpj,
          razaoSocial: c.razao_social,
          nomeFantasia: c.nome_fantasia,
          telefoneFixo: c.telefone_fixo,
          celular: c.celular,
          criadoPorId: c.criado_por_id,
          criadoPorNome: c.criado_por_nome,
          criadoEm: c.created_at,
          modificadoEm: c.updated_at,
          modificadoPorNome: c.modificado_por_nome,
        })));
      }

      // 4. Hydrate Auth using Supabase Session as source of truth
      const { data: { session } } = await supabase.auth.getSession();
      
      let currentUser: User | null = null;
      if (session) {
        // Find in already loaded profiles
        currentUser = activeUsers.find(u => u.id === session.user.id) || null;
        
        // If not found (maybe RLS issue or delay), try to fetch specifically
        if (!currentUser) {
          const { data: specificProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
            
          if (specificProfile) {
            currentUser = {
              id: specificProfile.user_id,
              authUserId: specificProfile.user_id,
              name: specificProfile.name,
              email: specificProfile.email,
              loginId: specificProfile.login_identifier || specificProfile.email,
              cpf: specificProfile.cpf || undefined,
              funcao: specificProfile.funcao || "",
              role: "usuario", // Fallback role if we couldn't load it
              contrato: specificProfile.contrato as Contrato,
              setor: specificProfile.setor as Setor,
              onboardingCompleted: specificProfile.onboarding_completed ?? false,
            };
            setUsers(prev => [...prev, currentUser!]);
          }
        }
      }

      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);

      }
      
    };

    init();

    // Listen for auth changes (login/logout from other tabs or token expiration)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);

      } else if (session && event === 'SIGNED_IN') {
        // If they just signed in, we might need to reload their profile
        const { data: p } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single();
        if (p) {
          const newUser: User = {
            id: p.user_id,
            authUserId: p.user_id,
            name: p.name,
            email: p.email,
            loginId: p.login_identifier || p.email,
            cpf: p.cpf || undefined,
            funcao: p.funcao || "",
            role: "usuario",
            contrato: p.contrato as Contrato,
            setor: p.setor as Setor,
            onboardingCompleted: p.onboarding_completed ?? false,
          };
          setUser(newUser);
          setUsers(prev => {
            const exists = prev.find(u => u.id === newUser.id);
            if (exists) return prev.map(u => u.id === newUser.id ? newUser : u);
            return [...prev, newUser];
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback((userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (!found) return;
    setUser(found);
  }, [users]);

  const registerUser: AppContextValue["registerUser"] = useCallback(async (data) => {
    const identifier = data.identifier.trim();
    const normalized = identifier.toLowerCase();
    if (!identifier) return { ok: false, error: "Informe e-mail, RA ou CPF." };
    if (data.password.trim().length < 6) return { ok: false, error: "A senha deve ter pelo menos 6 caracteres." };
    if (users.some((u) => u.email.toLowerCase() === normalized || u.loginId?.toLowerCase() === normalized)) {
      return { ok: false, error: "Este cadastro já existe." };
    }

    const nextUser: User = {
      id: data.authUserId || `local-${Date.now()}`,
      authUserId: data.authUserId,
      name: data.name?.trim() || (identifier.includes("@") ? identifier.split("@")[0] : `Usuário ${identifier}`),
      email: authEmailForIdentifier(identifier),
      loginId: identifier,
      cpf: data.cpf?.trim(),
      funcao: data.funcao?.trim() || "",
      role: "usuario",
      contrato: data.contrato ?? "CLT",
      setor: data.setor ?? "COMERCIAL",
    };

    setUsers((prev) => [nextUser, ...prev]);
    setUser(nextUser);
    if (data.authUserId) {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: data.authUserId,
          name: nextUser.name,
          email: nextUser.email,
          login_identifier: nextUser.loginId,
          cpf: nextUser.cpf || null,
          funcao: nextUser.funcao || "",
          contrato: nextUser.contrato,
          setor: nextUser.setor,
          onboarding_completed: false,
        },
        { onConflict: "user_id" },
      );

      if (error) return { ok: false, error: `Erro ao salvar perfil no banco de dados: ${error.message}` };
    }

    return { ok: true };
  }, [users]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return { ok: false, error: "Usuário não autenticado." };

    const updatedUser: User = { 
      ...user, 
      ...updates, 
      onboardingCompleted: true 
    };

    if (supabase) {
      const payload = {
        user_id: user.id,
        name: updatedUser.name,
        email: updatedUser.email,
        login_identifier: updatedUser.loginId || updatedUser.email,
        cpf: updatedUser.cpf || null,
        funcao: updatedUser.funcao || "",
        setor: updatedUser.setor,
        contrato: updatedUser.contrato,
        onboarding_completed: true,
      };
      
      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: 'user_id' });
      if (error) return { ok: false, error: `Erro no banco de dados: ${error.message}` };
    }

    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setUser(updatedUser);
    return { ok: true };
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_AUTH);
      supabase.auth.signOut();
    }
  }, []);

  const countCltThisMonth = useCallback(
    (userId: string) => {
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
    (userId: string) =>
      indicacoes.filter((i) => i.criadoPorId === userId && i.status === "Contrato assinado").length *
      VALOR_RECOMPENSA,
    [indicacoes],
  );

  const createIndicacao: AppContextValue["createIndicacao"] = useCallback(
    async (data) => {
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
      const novaId = crypto.randomUUID();
      
      const nova: Indicacao = {
        ...data,
        id: novaId,
        status: "Indicado",
        criadoPorId: user.id,
        criadoPorNome: user.name,
        criadoEm: stamp,
        modificadoEm: stamp,
        modificadoPorNome: user.name,
      };

      if (user.authUserId) {
        const { error } = await supabase.from("indicacoes").insert({
          id: novaId,
          lead_nome: data.leadNome,
          empresa: data.empresa,
          telefone: data.telefone,
          email_lead: data.emailLead,
          produto: data.produto,
          email_indicador: data.emailIndicador,
          setor: data.setor,
          funcao: data.funcao,
          contrato: data.contrato,
          observacao: data.observacao,
          criado_por_id: user.authUserId,
          criado_por_nome: user.name,
          modificado_por_nome: user.name,
          status: "Indicado",
        });

        if (error) return { ok: false, error: "Erro ao salvar no banco de dados Supabase." };
      }

      setIndicacoes((prev) => [nova, ...prev]);
      return { ok: true };
    },
    [user, countCltThisMonth],
  );

  const updateIndicacao: AppContextValue["updateIndicacao"] = useCallback(
    async (id, patch) => {
      if (!user) return;
      
      if (user.authUserId) {
        const payload: any = {};
        if (patch.status) payload.status = patch.status;
        if (patch.leadNome) payload.lead_nome = patch.leadNome;
        if (patch.empresa) payload.empresa = patch.empresa;
        if (patch.telefone) payload.telefone = patch.telefone;
        if (patch.emailLead) payload.email_lead = patch.emailLead;
        if (patch.produto) payload.produto = patch.produto;
        if (patch.observacao) payload.observacao = patch.observacao;
        
        payload.modificado_por_nome = user.name;
        payload.updated_at = now();

        const { error } = await supabase.from("indicacoes").update(payload).eq("id", id);
        if (error) {
          toast.error("Erro ao atualizar no banco de dados.");
          return;
        }
      }

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

  const deleteIndicacao = useCallback(async (id: string) => {
    const { error } = await supabase.from("indicacoes").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir do banco de dados.");
      return;
    }
    setIndicacoes((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const visibleIndicacoes = useMemo(() => {
    if (!user) return [];
    if (user.role === "usuario") return indicacoes.filter((i) => i.criadoPorId === user.id);
    return indicacoes;
  }, [indicacoes, user]);

  const createContato: AppContextValue["createContato"] = useCallback(
    async (data) => {
      if (!user) return { ok: false, error: "Não autenticado" };
      const stamp = now();
      const novoId = crypto.randomUUID();
      
      const novo: Contato = {
        ...data,
        id: novoId,
        criadoPorId: user.id,
        criadoPorNome: user.name,
        criadoEm: stamp,
        modificadoEm: stamp,
        modificadoPorNome: user.name,
      };

      if (user.authUserId) {
        const { error } = await supabase.from("contatos").insert({
          id: novoId,
          nome: data.nome,
          email: data.email,
          cnpj: data.cnpj,
          razao_social: data.razaoSocial,
          nome_fantasia: data.nomeFantasia,
          telefone_fixo: data.telefoneFixo,
          celular: data.celular,
          criado_por_id: user.authUserId,
          criado_por_nome: user.name,
          modificado_por_nome: user.name,
        });

        if (error) return { ok: false, error: "Erro ao salvar contato no Supabase." };
      }

      setContatos((prev) => [novo, ...prev]);
      return { ok: true };
    },
    [user],
  );

  const updateContato: AppContextValue["updateContato"] = useCallback(
    async (id, patch) => {
      if (!user) return;
      
      if (user.authUserId) {
        const payload: any = {};
        if (patch.nome) payload.nome = patch.nome;
        if (patch.email) payload.email = patch.email;
        if (patch.cnpj) payload.cnpj = patch.cnpj;
        if (patch.razaoSocial) payload.razao_social = patch.razaoSocial;
        if (patch.nomeFantasia) payload.nome_fantasia = patch.nomeFantasia;
        if (patch.telefoneFixo) payload.telefone_fixo = patch.telefoneFixo;
        if (patch.celular) payload.celular = patch.celular;

        payload.modificado_por_nome = user.name;
        payload.updated_at = now();

        const { error } = await supabase.from("contatos").update(payload).eq("id", id);
        if (error) {
          toast.error("Erro ao atualizar contato no banco de dados.");
          return;
        }
      }

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

  const deleteContato = useCallback(async (id: string) => {
    const { error } = await supabase.from("contatos").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir contato do banco de dados.");
      return;
    }
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const visibleContatos = useMemo(() => {
    if (!user) return [];
    if (user.role === "usuario_ra") return contatos.filter((c) => c.criadoPorId === user.id);
    return contatos;
  }, [contatos, user]);

  const value: AppContextValue = {
    user,
    users,
    login,
    registerUser,
    updateProfile,
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