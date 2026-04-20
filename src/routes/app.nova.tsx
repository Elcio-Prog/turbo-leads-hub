import { createFileRoute } from "@tanstack/react-router";
import { NovaIndicacaoPage } from "../features/indicacao/pages/NovaIndicacaoPage";

export const Route = createFileRoute("/app/nova")({
  component: NovaIndicacaoPage,
});