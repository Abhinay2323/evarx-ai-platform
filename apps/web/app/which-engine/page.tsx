import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { EngineQuiz } from "@/components/engine-quiz";

export const metadata: Metadata = {
  title: "Which engine fits you?",
  description:
    "A 30-second diagnostic to pick the right Evarx engine for your medical AI workload. Standard, Private, or Custom — based on your data, deployment, and volume."
};

export default function WhichEnginePage() {
  return (
    <>
      <PageHero
        eyebrow="Diagnostic"
        title="Which Evarx engine fits your team?"
        blurb="Four questions, thirty seconds. We&apos;ll recommend the engine that matches your sensitivity, deployment posture, and volume."
        align="center"
      />
      <EngineQuiz />
    </>
  );
}
