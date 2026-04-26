import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Documentation" };

export default function DocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Documentation"
        title="Developer documentation."
        blurb="The platform exposes OpenAI-compatible chat and embeddings endpoints. Detailed reference is rolling out alongside our public SDKs."
      />
      <section className="py-16">
        <div className="container-px max-w-3xl space-y-6 text-sm leading-relaxed text-zinc-300">
          <p>
            For pre-release SDK access, write to{" "}
            <span className="text-white">developers@evarx.in</span>. We are onboarding integration
            partners ahead of the public launch.
          </p>
          <p>
            In the meantime, the{" "}
            <Link href="/platform" className="text-helix-300 link-underline">
              platform overview
            </Link>{" "}
            and{" "}
            <Link href="/security" className="text-helix-300 link-underline">
              security model
            </Link>{" "}
            answer most architectural questions.
          </p>
        </div>
      </section>
    </>
  );
}
