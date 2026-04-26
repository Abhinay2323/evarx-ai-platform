import { ShieldCheck, FileLock2, ServerCog, KeyRound, Globe2 } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "DPDP Act 2023", sub: "India data residency" },
  { icon: FileLock2, label: "HIPAA-aligned", sub: "PHI handling" },
  { icon: ServerCog, label: "On-prem & VPC", sub: "Air-gapped ready" },
  { icon: KeyRound, label: "RBAC + audit", sub: "Full trace logs" },
  { icon: Globe2, label: "ISO 27001", sub: "In progress" }
];

export function ComplianceStrip() {
  return (
    <section className="relative py-16">
      <div className="container-px">
        <div className="card flex flex-col items-center gap-8 p-8 sm:flex-row sm:gap-12">
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-semibold text-white">
              Built for regulated medical workloads.
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Compliance is a feature, not an afterthought.
            </p>
          </div>
          <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-5">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-helix-300" />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-[11px] text-zinc-500">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
