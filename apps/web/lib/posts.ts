export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMins: number;
  tag: "Whitepaper" | "Article" | "Case study";
  body: string[];
}

export const posts: Post[] = [
  {
    slug: "why-cpu-runnable-slms-win-in-pharma",
    title: "Why CPU-runnable SLMs win in regulated pharma",
    excerpt:
      "GPU procurement is a six-month problem. Quantised SLMs collapse it to a Docker pull.",
    date: "2026-04-12",
    readMins: 6,
    tag: "Whitepaper",
    body: [
      "When pharma teams talk about deploying AI inside their walls, the conversation almost always converges on one question: do we need a GPU farm? The honest answer for most medical workloads is no.",
      "Modern small language models, fine-tuned on domain data and quantised to 4 or 5 bits, deliver enterprise-grade latency on commodity CPU servers. We routinely see Evarx-Med-3B respond in under 200ms per token on a 16-core box that already exists in customer datacenters.",
      "This unlocks a different procurement story. No capex cycle. No GPU shortage waiting list. No ML platform team hire. Just a Docker image, an existing server, and an air-gapped network if you need one."
    ]
  },
  {
    slug: "fine-tune-vs-rag-economics",
    title: "Fine-tune vs RAG: the real economics for medical agents",
    excerpt:
      "Retrieval looks cheap until you compute the per-call cost at production volumes.",
    date: "2026-03-28",
    readMins: 8,
    tag: "Article",
    body: [
      "RAG is the right starting point for almost every medical AI project. It is fast to build, easy to evaluate, and forgiving when the underlying knowledge base shifts.",
      "But at production volumes — say, 50,000 agent runs a day — three things start to bite. Latency from retrieval round-trips. API costs from frontier models that re-read the same context. And a creeping inability to reason in your team's voice.",
      "This is where a fine-tuned SLM stops being a nice-to-have and starts paying for itself. We sketch out the math for a typical PV team in this article and show why the breakeven is closer than most CFOs expect."
    ]
  },
  {
    slug: "evarx-architecture-overview",
    title: "An architecture overview of the Evarx platform",
    excerpt:
      "How the four layers — engine, data, workflow, deploy — interlock without locking you in.",
    date: "2026-03-10",
    readMins: 10,
    tag: "Whitepaper",
    body: [
      "Evarx is opinionated about workflow ergonomics and unopinionated about everything else. This piece walks through the technical seams between our four layers and explains why each is independently swappable.",
      "We discuss the engine routing layer (LiteLLM-based), the data plane (Qdrant + Postgres hybrid), the workflow runtime (deterministic-first, with retries and observability built in), and the deployment shapes that span SaaS to air-gapped.",
      "Reading this should leave a senior engineer comfortable explaining the system to their security team in one meeting."
    ]
  }
];

export function postBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}
