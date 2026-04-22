import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  PlusCircle,
  ListChecks,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "../AppContext";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { useState, useEffect } from "react";

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

export function Sidebar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden grid h-10 w-10 place-items-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          flex h-screen shrink-0 flex-col border-r border-[#2a2a2a] bg-[#111111] sticky top-0 transition-all duration-300
          ${collapsed ? "w-16" : "w-64"}
          max-lg:fixed max-lg:z-50 max-lg:w-64
          ${mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
        `}
      >
        <div className={`flex items-center border-b border-[#2a2a2a] ${collapsed ? "justify-center px-2 py-5" : "justify-between px-5 py-5"}`}>
          {!collapsed && <Logo />}
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen(false);
              } else {
                onToggle?.();
              }
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className={`flex items-center gap-3 border-b border-[#2a2a2a] ${collapsed ? "justify-center px-2 py-4" : "px-5 py-4"}`}>
          <Avatar name={user.name} />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{user.name}</div>
              <div className="truncate text-[11px] text-[#AAAAAA]">{user.setor}</div>
              <div className="mt-0.5 inline-flex items-center rounded-full bg-[#CCFF00]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#CCFF00]">
                {ROLE_LABEL[user.role]}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-[#CCFF00] text-black"
                    : "text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#2a2a2a] p-3 space-y-1">
          <button
            type="button"
            title={collapsed ? "Configurações" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white ${collapsed ? "justify-center" : ""}`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && "Configurações"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#AAAAAA] hover:bg-[#1a1a1a] hover:text-white ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Sair"}
          </button>
          </div>
      </aside>
    </>
  );
}