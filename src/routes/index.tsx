import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Bill & Savings — Track bills, unlock hidden savings" },
      {
        name: "description",
        content:
          "A private, local-first dashboard to manage recurring bills, plan payments, and find hidden savings in your subscriptions.",
      },
      { property: "og:title", content: "Smart Bill & Savings" },
      { property: "og:description", content: "Manage bills and discover hidden savings — all stored locally in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="dark">
      <Dashboard />
    </div>
  ),
});
