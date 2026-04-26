import type { Metadata } from "next";
import { ConsoleProvider } from "@/lib/console-store";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { ConsoleTopbar } from "@/components/console/topbar";
import { PreviewBanner } from "@/components/console/preview-banner";

export const metadata: Metadata = {
  title: { default: "Console · Evarx", template: "%s · Console · Evarx" },
  robots: { index: false, follow: false },
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleProvider>
      <PreviewBanner />
      <div className="flex min-h-screen bg-ink-950">
        <ConsoleSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <ConsoleTopbar />
          <div className="flex-1 px-6 py-8">{children}</div>
        </div>
      </div>
    </ConsoleProvider>
  );
}
