import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { adminResetUserPassword } from "../authActions";
import { useApp } from "../AppContext";
import { Avatar } from "../components/Avatar";
import type { Role, User } from "../types";

type ManagedUser = {
  userId: string;
  name: string;
  email: string;
  loginId: string;
  setor: string;
  contrato: string;
  role: Role;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "aprovador", label: "Aprovador" },
  { value: "usuario", label: "Usuário" },
  { value: "usuario_ra", label: "Usuário RA" },
];

const ROLE_LABEL = Object.fromEntries(
  ROLE_OPTIONS.map((role) => [role.value, role.label]),
) as Record<Role, string>;

function mapCurrentUserToManagedUser(currentUser: User): ManagedUser {
  return {
    userId: currentUser.authUserId || currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    loginId: currentUser.loginId || currentUser.email,
    setor: currentUser.setor,
    contrato: currentUser.contrato,
    role: currentUser.role,
  };
}

export function GestaoUsuariosPage() {
  const { user, avatar, getAvatar, authLoading } = useApp();
  const [users, setUsers] = useState<ManagedUser[]>(() =>
    user ? [mapCurrentUserToManagedUser(user)] : [],
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const resetPasswordFn = useServerFn(adminResetUserPassword);

  const isAdmin = user?.role === "admin";

  const openPasswordDialog = (managedUser: ManagedUser) => {
    setPasswordTarget(managedUser);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = async () => {
    if (!passwordTarget) return;
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setResettingPassword(true);
    try {
      const result = await resetPasswordFn({
        data: { userId: passwordTarget.userId, password: newPassword },
      });
      if (!result.ok) {
        toast.error(result.error || "Não foi possível alterar a senha.");
        return;
      }
      toast.success(`Senha de ${passwordTarget.name} alterada com sucesso.`);
      setPasswordTarget(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro inesperado ao alterar a senha.",
      );
    } finally {
      setResettingPassword(false);
    }
  };

  const loadUsers = useCallback(async () => {
    const currentUserRow = user ? mapCurrentUserToManagedUser(user) : null;

    if (currentUserRow && users.length === 0) {
      setUsers([currentUserRow]);
    }

    if (authLoading) {
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(users.length === 0);
    setLoadError("");

    try {
      const [profilesResult, rolesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, name, email, login_identifier, setor, contrato")
          .order("name", { ascending: true }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesResult.error || rolesResult.error) {
        const message =
          profilesResult.error?.message || rolesResult.error?.message || "Erro desconhecido.";
        setLoadError(message);
        toast.error("Não foi possível carregar os usuários.");
        return;
      }

      const roleByUserId = new Map<string, Role>();
      rolesResult.data?.forEach((roleRow) => {
        roleByUserId.set(roleRow.user_id, roleRow.role as Role);
      });

      setUsers(
        (profilesResult.data ?? []).map((profile) => ({
          userId: profile.user_id,
          name: profile.name,
          email: profile.email,
          loginId: profile.login_identifier || profile.email,
          setor: profile.setor,
          contrato: profile.contrato,
          role: roleByUserId.get(profile.user_id) ?? "usuario",
        })),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao carregar usuários.";
      setLoadError(message);
      toast.error("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAdmin, user, users.length]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totals = useMemo(
    () =>
      ROLE_OPTIONS.map((role) => ({
        ...role,
        total: users.filter((managedUser) => managedUser.role === role.value).length,
      })),
    [users],
  );

  const updateRole = async (managedUser: ManagedUser, nextRole: Role) => {
    if (managedUser.role === nextRole) return;
    if (managedUser.userId === user?.id) {
      toast.error("Para evitar perda de acesso, altere sua própria role diretamente no Supabase.");
      return;
    }

    setSavingUserId(managedUser.userId);

    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", managedUser.userId);

    if (deleteError) {
      setSavingUserId(null);
      toast.error("Erro ao remover role anterior.");
      return;
    }

    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: managedUser.userId, role: nextRole });

    setSavingUserId(null);

    if (insertError) {
      toast.error("Erro ao salvar nova role.");
      await loadUsers();
      return;
    }

    setUsers((prev) =>
      prev.map((item) => (item.userId === managedUser.userId ? { ...item, role: nextRole } : item)),
    );
    toast.success(`Role de ${managedUser.name} alterada para ${ROLE_LABEL[nextRole]}.`);
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-10 font-body">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-on-surface">
          Acesso restrito
        </h1>
        <p className="text-sm text-on-surface-variant">
          Apenas administradores podem acessar a gestão de usuários.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-body">
      <header className="border-b border-outline-variant/10 py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-primary-container">
              <ShieldCheck className="h-4 w-4" /> Área administrativa
            </div>
            <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tighter text-on-surface md:text-5xl">
              Gestão de <br />
              <span className="font-light italic text-on-surface-variant">Usuários</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-low px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            <UsersRound className="h-4 w-4 text-primary-container" /> {users.length} usuários ativos
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {totals.map((role) => (
          <div key={role.value} className="border border-outline-variant/10 bg-surface-low p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">
              {role.label}
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-on-surface">{role.total}</div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden border border-outline-variant/10 bg-surface-low">
        <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_auto] gap-4 border-b border-outline-variant/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-outline max-lg:hidden">
          <span>Usuário</span>
          <span>Email / login</span>
          <span>Perfil</span>
          <span>Role</span>
          <span>Ações</span>
        </div>

        {loading && users.length === 0 ? (
          <div className="px-5 py-10 text-sm font-medium text-on-surface-variant">
            Carregando usuários...
          </div>
        ) : loadError && users.length === 0 ? (
          <div className="space-y-4 px-5 py-10 text-sm font-medium text-on-surface-variant">
            <p>Não foi possível carregar os usuários.</p>
            <button
              type="button"
              onClick={loadUsers}
              className="rounded-lg border border-outline-variant/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-container transition-colors hover:bg-primary-container/10"
            >
              Tentar novamente
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="px-5 py-10 text-sm font-medium text-on-surface-variant">
            Nenhum usuário ativo encontrado.
          </div>
        ) : (
          users.map((managedUser) => (
            <div
              key={managedUser.userId}
              className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_auto] gap-4 border-b border-outline-variant/10 px-5 py-4 last:border-b-0 max-lg:grid-cols-1"
            >
              <div className="flex items-center gap-3">
                <Avatar 
                  name={managedUser.name} 
                  size="sm" 
                  src={getAvatar(managedUser.userId)}
                  className="ring-2 ring-outline-variant/10" 
                />
                <div>
                  <div className="font-display text-sm font-bold uppercase text-on-surface">
                    {managedUser.name}
                  </div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary-container/70">
                    {managedUser.userId === user?.id ? "Você" : "Usuário ativo"}
                  </div>
                </div>
              </div>
              <div className="min-w-0 text-sm font-medium text-on-surface-variant">
                <div className="truncate text-on-surface">{managedUser.email}</div>
                <div className="mt-1 truncate text-xs text-outline">{managedUser.loginId}</div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <div>{managedUser.setor}</div>
                <div className="mt-1 text-outline">{managedUser.contrato}</div>
              </div>
              <Select
                value={managedUser.role}
                onValueChange={(value) => updateRole(managedUser, value as Role)}
                disabled={savingUserId === managedUser.userId || managedUser.userId === user?.id}
              >
                <SelectTrigger className="h-10 rounded-lg border-outline-variant/20 bg-surface text-xs font-black uppercase tracking-widest text-on-surface shadow-none focus:ring-primary-container/30 disabled:opacity-50">
                  <SelectValue>{ROLE_LABEL[managedUser.role]}</SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-outline-variant/20 bg-surface-low p-1.5 text-on-surface shadow-2xl shadow-black/60">
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      className="cursor-pointer rounded-md px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant focus:bg-primary-container/15 focus:text-primary-container data-[state=checked]:bg-primary-container/20 data-[state=checked]:text-primary-container"
                    >
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => openPasswordDialog(managedUser)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-outline-variant/20 bg-surface px-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary-container/40 hover:text-primary-container"
                title="Alterar senha"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Senha
              </button>
            </div>
          ))
        )}
      </section>

      <Dialog
        open={passwordTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordTarget(null);
            setNewPassword("");
            setConfirmPassword("");
          }
        }}
      >
        <DialogContent className="border border-outline-variant/20 bg-surface-low text-on-surface">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              Alterar senha
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant">
              {passwordTarget
                ? `Defina uma nova senha para ${passwordTarget.name}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Nova senha
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Confirmar senha
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setPasswordTarget(null)}
              disabled={resettingPassword}
              className="rounded-lg border border-outline-variant/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resettingPassword}
              className="rounded-lg bg-primary-container px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-primary-container transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {resettingPassword ? "Salvando..." : "Salvar nova senha"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
