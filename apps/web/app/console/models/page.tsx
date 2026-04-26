import type { Metadata } from "next";
import { FinetunePanel } from "@/components/console/finetune-panel";

export const metadata: Metadata = {
  title: "Models · Console",
  robots: { index: false, follow: false }
};

export default function ModelsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Models</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your fine-tuned weights and base model versions.
        </p>
      </header>
      <FinetunePanel />
    </div>
  );
}
