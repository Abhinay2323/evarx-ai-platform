import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Sign in"
        title="Customer sign-in"
        blurb="The Evarx customer console is rolling out to design partners. If you&apos;re a current customer and need access, reach out and we&apos;ll provision your tenant."
      >
        <Link href="/demo" className="btn-primary">
          Become a design partner <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHero>
      <section className="py-16" />
    </>
  );
}
