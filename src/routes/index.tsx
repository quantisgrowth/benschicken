import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { ModelCards } from "@/components/landing/ModelCards";
import { Metrics } from "@/components/landing/Metrics";
import { SocialProof } from "@/components/landing/SocialProof";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Faq } from "@/components/landing/Faq";
import { LeadForm } from "@/components/landing/LeadForm";
import { MobileCtaBar } from "@/components/landing/MobileCtaBar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import type { Interest } from "@/components/landing/types";
import { getSiteContent } from "@/lib/content.functions";
import { DEFAULT_CONTENT } from "@/lib/site-content";


const title = "Ben's Chicken | Franquia e Licenciamento de Dark Kitchen";
const description =
  "Fature até R$ 1,2 milhão por ano com as marcas Ben's Chicken e Ben's Burguer. Licencie sua cozinha atual ou abra uma franquia dark kitchen do zero.";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await getSiteContent();
    } catch {
      return DEFAULT_CONTENT;
    }
  },
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
  const content = Route.useLoaderData();
  const [interest, setInterest] = useState<Interest | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SiteHeader content={content} />
      <main>
        <Hero content={content} />
        <Metrics content={content} />
        <SocialProof content={content} />
        <ProductShowcase content={content} />
        <ModelCards content={content} onSelect={setInterest} />
        <HowItWorks content={content} />
        <Faq />
        <LeadForm content={content} interest={interest} onInterestChange={setInterest} />
      </main>
      <SiteFooter content={content} />
      <MobileCtaBar content={content} />
    </div>
  );
}

