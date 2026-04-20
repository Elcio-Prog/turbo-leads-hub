import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../features/indicacao/pages/LoginPage";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <LoginPage />;
}
