import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { AgentsGallery } from "@/components/agents-gallery";

export const metadata: Metadata = {
  title: "Agents gallery",
  description:
    "Browse 12+ pre-built medical agents — protocol summarizers, ICSR triage, MSL copilots, and more. Forkable. Deployable on any Evarx engine."
};

export default function AgentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Agents gallery"
        title="Twelve medical agents your team can ship this quarter."
        blurb="Every template is forkable, observable, and runs on the engine you choose — Standard, Private Medical SLM, or your fine-tuned Custom SLM."
      />
      <AgentsGallery />
    </>
  );
}
