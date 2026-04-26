import type { Metadata } from "next";
import { DataSources } from "@/components/console/data-sources";

export const metadata: Metadata = {
  title: "Data sources · Console",
  robots: { index: false, follow: false }
};

export default function DataPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Data sources</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Connectors feeding retrieval and continuous fine-tune refinement.
        </p>
      </header>
      <DataSources />
    </div>
  );
}
