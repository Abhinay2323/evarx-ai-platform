import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { posts, postBySlug } from "@/lib/posts";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  return (
    <article className="pt-32 pb-24">
      <div className="container-px max-w-3xl">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to resources
        </Link>

        <div className="mt-8 flex items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-300">
            {post.tag}
          </span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </time>
          <span>· {post.readMins} min read</span>
        </div>

        <h1 className="heading-display mt-5 text-4xl sm:text-5xl">{post.title}</h1>
        <p className="lede mt-5">{post.excerpt}</p>

        <div className="hairline mt-10" />

        <div className="prose prose-invert mt-10 max-w-none space-y-5 text-zinc-300">
          {post.body.map((para, i) => (
            <p key={i} className="text-base leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        <div className="hairline mt-12" />

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm font-medium text-white">
            Want to see how this applies to your team?
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            We can map a fine-tune scope to your highest-leverage workflow on a 30-minute call.
          </p>
          <Link href="/demo" className="btn-primary mt-4">
            Book a demo
          </Link>
        </div>
      </div>
    </article>
  );
}
