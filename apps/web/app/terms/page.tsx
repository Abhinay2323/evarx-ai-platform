import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of service"
        blurb="The agreement under which you may use the Evarx platform and website."
      />
      <section className="py-16">
        <div className="container-px max-w-3xl space-y-6 text-sm leading-relaxed text-zinc-300">
          <p>
            These terms govern access to evarx.in and the Evarx platform. Enterprise customers
            sign a master services agreement that supersedes these terms.
          </p>
          <p>
            For the executable contract, write to{" "}
            <span className="text-white">legal@evarx.in</span>. Mutual NDA, DPA, and BAA are
            available on request.
          </p>
        </div>
      </section>
    </>
  );
}
