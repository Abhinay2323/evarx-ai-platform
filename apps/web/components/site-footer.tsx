import Link from "next/link";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";
import { Github, Linkedin, Twitter, MapPin } from "lucide-react";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Intelligence engines", href: "/platform#engines" },
      { label: "Data layer & RAG", href: "/platform#data" },
      { label: "Workflow builder", href: "/platform#workflows" },
      { label: "Deploy & scale", href: "/platform#deploy" },
      { label: "Custom SLM", href: "/custom-slm" }
    ]
  },
  {
    title: "Solutions",
    links: [
      { label: "Pharma R&D", href: "/solutions/pharma-rd" },
      { label: "Clinical operations", href: "/solutions/clinical-ops" },
      { label: "Medical affairs", href: "/solutions/medical-affairs" },
      { label: "Regulatory", href: "/solutions/regulatory" },
      { label: "Hospitals", href: "/solutions/hospitals" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Agents gallery", href: "/agents" },
      { label: "Whitepapers", href: "/resources#whitepapers" },
      { label: "Blog", href: "/resources" },
      { label: "Documentation", href: "/docs" },
      { label: "Status", href: "/status" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Security", href: "/security" },
      { label: "Pricing", href: "/pricing" },
      { label: "Careers", href: "/company#careers" },
      { label: "Contact", href: "/company#contact" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-950">
      <div className="container-px grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
            {site.description}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5" /> {site.location}
          </div>
          <div className="mt-6 flex items-center gap-3 text-zinc-400">
            <Link href="#" aria-label="Evarx on LinkedIn" className="rounded-full border border-white/10 p-2 hover:text-white">
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Evarx on Twitter" className="rounded-full border border-white/10 p-2 hover:text-white">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Evarx on GitHub" className="rounded-full border border-white/10 p-2 hover:text-white">
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="hairline" />

      <div className="container-px flex flex-col items-start justify-between gap-4 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {site.legalName}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
          <Link href="/dpa" className="hover:text-zinc-300">DPA</Link>
          <Link href="/security#trust" className="hover:text-zinc-300">Trust</Link>
          <span className="hidden sm:inline">·</span>
          <span>DPDP Act ready · HIPAA-aligned controls · ISO 27001 (in progress)</span>
        </div>
      </div>
    </footer>
  );
}
