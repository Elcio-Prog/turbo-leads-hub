import { createFileRoute } from "@tanstack/react-router";
import { NovoContatoPage } from "../features/indicacao/pages/NovoContatoPage";

export const Route = createFileRoute("/app/novo-contato")({
  component: NovoContatoPage,
});