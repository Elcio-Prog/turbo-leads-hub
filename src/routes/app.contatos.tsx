import { createFileRoute } from "@tanstack/react-router";
import { ContatosPage } from "../features/indicacao/pages/ContatosPage";

export const Route = createFileRoute("/app/contatos")({
  component: ContatosPage,
});