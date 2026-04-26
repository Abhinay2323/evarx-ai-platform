import { Hero } from "@/components/hero";
import { LogoCloud } from "@/components/logo-cloud";
import { Pipeline } from "@/components/pipeline";
import { Engines } from "@/components/engines";
import { QuizBanner } from "@/components/quiz-banner";
import { USP } from "@/components/usp";
import { UseCases } from "@/components/use-cases";
import { ComplianceStrip } from "@/components/compliance-strip";
import { CTA } from "@/components/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoCloud />
      <Pipeline />
      <Engines />
      <QuizBanner />
      <USP />
      <UseCases />
      <ComplianceStrip />
      <CTA />
    </>
  );
}
