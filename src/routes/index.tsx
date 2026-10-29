import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth-gate";
import { Dashboard } from "@/components/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Bill & Savings — Track bills, unlock hidden savings" },
      {
        name: "description",
        content:
          "A private dashboard to manage recurring bills, plan payments, and find hidden savings in your subscriptions.",
      },
      { property: "og:title", content: "Smart Bill & Savings" },
      {
        property: "og:description",
        content: "Manage bills and discover hidden savings, synced securely to your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="dark">
      <AuthGate>{(session) => <Dashboard session={session} />}</AuthGate>
    </div>
  ),
});
