import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata = { title: "Sign in · Evarx Console" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href={process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://evarx.in"}
            className="inline-block text-2xl font-display font-bold tracking-tight text-white"
          >
            Evarx
          </Link>
          <p className="mt-3 text-sm text-zinc-400">Sign in to your console</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6 shadow-glow">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-zinc-500">
          New to Evarx?{" "}
          <Link href="/signup" className="text-helix-300 hover:text-helix-200">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
