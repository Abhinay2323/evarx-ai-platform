"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";

export function SiteFooterWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/console")) return null;
  return <SiteFooter />;
}
