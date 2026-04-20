import { createFileRoute } from "@tanstack/react-router";
import { IndicacoesPage } from "../features/indicacao/pages/IndicacoesPage";

export const Route = createFileRoute("/app/indicacoes")({
  component: IndicacoesPage,
});