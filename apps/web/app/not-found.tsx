import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="pt-40 pb-32">
      <div className="container-px max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-helix-300">
          404 · Not found
        </p>
        <h1 className="heading-display mt-5 text-4xl sm:text-5xl">
          That page seems to have been redacted.
        </h1>
        <p className="lede mx-auto mt-5">
          The link is broken or the page was moved. Head back home or jump straight to a demo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-ghost">
            Back to home
          </Link>
          <Link href="/demo" className="btn-primary">
            Book a demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
