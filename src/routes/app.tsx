import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "../features/indicacao/AppContext";
import { Sidebar } from "../features/indicacao/components/Sidebar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}