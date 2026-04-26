import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionPage } from "@/components/solution-page";
import { solutionBySlug, solutions } from "@/lib/solutions";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) return {};
  return {
    title: s.role,
    description: s.blurb
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const solution = solutionBySlug(slug);
  if (!solution) notFound();
  return <SolutionPage solution={solution} />;
}
