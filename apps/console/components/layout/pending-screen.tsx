import { Clock, Mail, ShieldCheck } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { BackgroundGlow } from "@/components/layout/background-glow";

export function PendingScreen({ email }: { email: string | null }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12 text-zinc-100">
      <BackgroundGlow />

      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-8 shadow-glow backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-2.5 text-amber-200">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200">
                Awaiting access
              </p>
              <h1 className="text-xl font-display font-bold text-white">
                Your account is pending approval
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-zinc-400">
            Evarx is invite-only. Your sign-up worked, but your email
            <span className="text-zinc-200"> {email ?? ""} </span>
            isn't yet attached to an organization.
          </p>

          <ul className="mt-5 space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-helix-300" />
              <span>
                Ask an admin in your org to send you an invite from{" "}
                <span className="text-zinc-100">Members → Invite teammate</span>.
                When they do, sign in again and you'll be in.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-helix-300" />
              <span>
                If you arrived here from an invite link, the invite has expired
                or was revoked. Ask the admin to re-send.
              </span>
            </li>
          </ul>

          <div className="mt-7 flex items-center justify-between">
            <a
              href="mailto:contact@evarx.in?subject=Console%20access"
              className="text-xs text-helix-300 hover:underline"
            >
              Contact Evarx support
            </a>
            <LogoutButton label="Sign out" />
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-zinc-600">
          Hosted in Mumbai (ap-south-1) for DPDP compliance.
        </p>
      </div>
    </div>
  );
}
