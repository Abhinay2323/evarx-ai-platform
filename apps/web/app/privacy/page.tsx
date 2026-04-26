import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        blurb="A plain-language summary of how Evarx handles personal information. The full DPDP-aligned policy is available on request."
      />
      <section className="py-16">
        <div className="container-px max-w-3xl space-y-6 text-sm leading-relaxed text-zinc-300">
          <p>
            <strong className="text-white">Effective:</strong> 25 April 2026.
          </p>
          <p>
            Evarx Health Technologies Pvt. Ltd. processes personal information strictly in
            accordance with India&apos;s Digital Personal Data Protection Act 2023. Our customer
            data is stored in AWS Mumbai by default. For customers running in their own VPC or
            on-prem, we do not have access to their data at all.
          </p>
          <p>
            We do not sell or rent personal information. We do not use customer data to train
            shared models. Custom fine-tunes use only that customer&apos;s data, and the resulting
            model weights are theirs.
          </p>
          <p>
            For the full policy, the list of sub-processors, or to exercise your rights under
            DPDP, write to <span className="text-white">privacy@evarx.in</span>.
          </p>
        </div>
      </section>
    </>
  );
}
