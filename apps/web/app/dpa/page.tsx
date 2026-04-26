import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Data processing agreement" };

export default function DPAPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Data processing agreement"
        blurb="Our DPA template covers DPDP Act and GDPR equivalents. We can co-sign within 5 business days."
      />
      <section className="py-16">
        <div className="container-px max-w-3xl space-y-6 text-sm leading-relaxed text-zinc-300">
          <p>
            Request a counter-signable DPA from{" "}
            <span className="text-white">legal@evarx.in</span>. We&apos;ll typically respond
            within one business day with the latest version, our sub-processor list, and our
            incident-response policy.
          </p>
        </div>
      </section>
    </>
  );
}
