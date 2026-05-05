import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "../AppContext";
import { PrimaryButton } from "../components/PrimaryButton";
import { CONTRATOS, SETORES, type Contrato, type Setor } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementSettings } from "../components/AnnouncementSettings";

function maskCpf(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function normalizeSetor(value: string | undefined): Setor {
  const normalized = value?.trim().toUpperCase();
  return SETORES.find((setor) => setor.toUpperCase() === normalized) ?? "COMERCIAL";
}

function normalizeContrato(value: string | undefined): Contrato {
  const normalized = value?.trim().toUpperCase();
  return CONTRATOS.find((contrato) => contrato === normalized) ?? "CLT";
}

export function ConfiguracoesPage() {
  const { user } = useApp();

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-body">
        <header className="relative border-b border-outline-variant/10 py-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
              Configurações
            </h1>
          </div>
        </header>
        <div className="p-8 text-center text-outline text-sm italic">
          Nenhuma configuração disponível para o seu perfil no momento.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-body">
      <header className="relative border-b border-outline-variant/10 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
              Configurações <br />
              <span className="font-light italic text-on-surface-variant">do Sistema</span>
            </h1>
          </div>
        </div>
      </header>
      
      <AnnouncementSettings />
    </div>
  );
}
