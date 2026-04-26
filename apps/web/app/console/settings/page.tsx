"use client";

import { useConsole } from "@/lib/console-store";

export default function SettingsPage() {
  const {
    state: { tenant },
  } = useConsole();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tenant configuration and access controls.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-sm font-semibold text-white">Tenant</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Field k="Name" v={tenant.name} />
          <Field k="Region" v={tenant.region} />
          <Field k="Plan" v={tenant.plan} />
          <Field k="DPDP residency" v="In-region · enforced" />
          <Field k="SSO" v="Okta · enabled" />
          <Field k="Audit retention" v="365 days" />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-sm font-semibold text-white">Security</p>
        <ul className="mt-4 space-y-3 text-sm text-zinc-300">
          <li className="flex items-center justify-between">
            <span>Encryption at rest</span>
            <span className="text-helix-300">AES-256 · BYOK</span>
          </li>
          <li className="flex items-center justify-between">
            <span>PHI redaction</span>
            <span className="text-helix-300">Enforced</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Allowed engines</span>
            <span className="text-helix-300">Private · Custom</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Egress allowlist</span>
            <span className="text-helix-300">3 destinations</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/40 p-4">
      <dt className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</dt>
      <dd className="mt-2 text-sm text-white">{v}</dd>
    </div>
  );
}
