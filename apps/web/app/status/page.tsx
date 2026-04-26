import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "System status" };

const services = [
  { name: "Web app", status: "Operational" },
  { name: "API gateway", status: "Operational" },
  { name: "Inference (Standard)", status: "Operational" },
  { name: "Inference (Private SLM)", status: "Operational" },
  { name: "Fine-tune queue", status: "Operational" },
  { name: "Vector index", status: "Operational" }
];

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Status"
        title="System status."
        blurb="Live operational state of the Evarx platform. A full status page with historical incidents lands ahead of GA."
      />
      <section className="py-16">
        <div className="container-px max-w-2xl">
          <ul className="card divide-y divide-white/10 p-0">
            {services.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl"
              >
                <span className="text-sm text-white">{s.name}</span>
                <span className="inline-flex items-center gap-2 text-xs text-helix-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full bg-helix-400" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-helix-400" />
                  </span>
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
