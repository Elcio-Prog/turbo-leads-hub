import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "../features/indicacao/pages/AnalyticsPage";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});