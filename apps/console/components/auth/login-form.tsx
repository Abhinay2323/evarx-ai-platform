"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Min 8 characters")
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError(error.message);
      return;
    }
    router.replace(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field
        label="Email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        {...register("email")}
      />
      <Field
        label="Password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        {...register("password")}
      />

      {serverError ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110",
          isSubmitting && "pointer-events-none opacity-70"
        )}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in
      </button>
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

const Field = function Field(props: FieldProps) {
  const { label, icon, error, className, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-300">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          {icon}
        </span>
        <input
          {...rest}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-ink-800/60 pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-helix-400/40 focus:ring-2 focus:ring-helix-400/20",
            error && "border-red-500/40",
            className
          )}
        />
      </span>
      {error ? <span className="mt-1 block text-[11px] text-red-400">{error}</span> : null}
    </label>
  );
};
