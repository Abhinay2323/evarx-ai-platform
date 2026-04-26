import type { Metadata } from "next";
import { ActivityFeed } from "@/components/console/activity-feed";

export const metadata: Metadata = {
  title: "Logs · Console",
  robots: { index: false, follow: false }
};

export default function LogsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Logs</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Recent platform activity. Full audit trail with citations is available per workflow.
        </p>
      </header>
      <ActivityFeed />
    </div>
  );
}
