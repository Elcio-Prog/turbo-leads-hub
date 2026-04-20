import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  PlusCircle,
  ListChecks,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useApp } from "../AppContext";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";

const NAV = [
  { to: "/app/nova", label: "Nova Indicação", Icon: PlusCircle },
  { to: "/app/indicacoes", label: "Indicações", Icon: ListChecks },
  { to: "/app/analytics", label: "Analytics", Icon: BarChart3 },
] as const;

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  aprovador: "Aprovador",
  usuario: "Usuário",
};

export function Sidebar() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#111111] sticky top-0">
      <div className="px-5 py-5 border-b border-[#2a2a2a]">
        <Logo />
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2a2a]">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{user.name}</div>
          <div className="truncate text-[11px] text-[#AAAAAA]">{user.setor}</div>
          <div className="mt-0.5 inline-flex items-center rounded-full bg-[#CCFF00]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#CCFF00]">
            {ROLE_LABEL[user.role]}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#CCFF00] text-black"
                  : "text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#2a2a2a] p-3 space-y-1">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Configurações
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}