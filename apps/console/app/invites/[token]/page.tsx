import Link from "next/link";

import { AcceptInvite } from "@/components/members/accept-invite";

export const metadata = { title: "Accept invite · Evarx Console" };
export const dynamic = "force-dynamic";

export default async function InviteAcceptPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block text-2xl font-display font-bold tracking-tight text-white"
          >
            Evarx
          </Link>
          <p className="mt-2 text-sm text-zinc-400">You've been invited.</p>
        </div>

        <AcceptInvite token={token} />
      </div>
    </div>
  );
}
