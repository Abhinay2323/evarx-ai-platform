"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hooks must be called in the same order on every render — keep the early
  // return AFTER all hooks. The previous shape (early return between useState
  // and useEffect) crashed React when navigating between marketing routes and
  // /console because the hook count flipped, which broke the "Live preview"
  // link mid-navigation.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/console")) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-ink-950/70 backdrop-blur-md"
          : "border-b border-transparent"
      )}
    >
      <div className="container-px flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Evarx home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/console" className="btn-ghost text-sm">
            Live preview
          </Link>
          <Link href="/demo" className="btn-primary text-sm">
            Book a demo
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-zinc-200 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="lg:hidden">
          <div className="container-px space-y-1 border-t border-white/10 bg-ink-950/95 py-4 backdrop-blur">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Link
                href="/console"
                onClick={() => setOpen(false)}
                className="btn-ghost flex-1 text-sm"
              >
                Live preview
              </Link>
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="btn-primary flex-1 text-sm"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
