import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, GraduationCap } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Whitepapers, articles, and case studies on building private medical AI — from fine-tuning to deployment to evaluation."
};

const collections = [
  { icon: FileText, title: "Whitepapers", body: "Long-form pieces for technical and procurement audiences." },
  { icon: BookOpen, title: "Articles", body: "Short reads on what we&apos;re seeing in the field." },
  { icon: GraduationCap, title: "Case studies", body: "How customers ship private medical AI." }
];

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="The thinking behind the platform."
        blurb="Whitepapers, technical articles, and case studies for medical and pharma leaders evaluating private AI."
      />

      <section className="py-12">
        <div className="container-px grid gap-4 md:grid-cols-3">
          {collections.map((c) => (
            <div key={c.title} className="card flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-helix-500/10 text-helix-300">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <p
                  className="mt-1 text-xs text-zinc-400"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="whitepapers" className="py-12">
        <div className="container-px">
          <div className="grid gap-4">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/resources/${p.slug}`}
                className="card group flex flex-col gap-2 transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-300">
                      {p.tag}
                    </span>
                    <time dateTime={p.date}>
                      {new Date(p.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </time>
                    <span>· {p.readMins} min read</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-zinc-400">{p.excerpt}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-helix-300">
                  Read <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
