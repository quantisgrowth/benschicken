import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { ModelCards } from "@/components/landing/ModelCards";
import { Metrics } from "@/components/landing/Metrics";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LeadForm } from "@/components/landing/LeadForm";
import { SiteFooter } from "@/components/landing/SiteFooter";
import type { Interest } from "@/components/landing/types";

const title = "Ben's Chicken | Franquia e Licenciamento de Dark Kitchen";
const description =
  "Fature até R$ 1,2 milhão por ano com as marcas Ben's Chicken e Ben's Burguer. Licencie sua cozinha atual ou abra uma franquia dark kitchen do zero.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [interest, setInterest] = useState<Interest | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <ModelCards onSelect={setInterest} />
        <Metrics />
        <HowItWorks />
        <LeadForm interest={interest} onInterestChange={setInterest} />
      </main>
      <SiteFooter />
    </div>
  );
}
