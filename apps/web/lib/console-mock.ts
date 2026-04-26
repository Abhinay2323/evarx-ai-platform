export const tenant = {
  name: "Acme Pharma",
  plan: "Custom · Fine-tuned SLM",
  region: "AWS Mumbai · ap-south-1",
  user: { name: "Dr. R. Iyer", role: "Medical Affairs Lead", initials: "RI" }
};

export const kpis = [
  { label: "Active workflows", value: "14", delta: "+2 this week", trend: "up" as const },
  { label: "Runs · last 7 days", value: "8,294", delta: "+18%", trend: "up" as const },
  { label: "Tokens · this month", value: "63.4M", delta: "of 80M cap", trend: "neutral" as const },
  { label: "Avg latency", value: "184ms", delta: "−12ms", trend: "up" as const }
];

export const usageSeries = [
  3.1, 3.4, 2.9, 3.8, 4.2, 4.0, 3.6, 4.5, 5.1, 4.7, 5.6, 6.0, 5.4, 6.3
];

export const agentRuns = [
  {
    name: "ICSR triage agent",
    function: "Triage · Pharmacovigilance",
    runs: 412,
    avgMs: 168,
    accuracy: 0.92,
    status: "healthy" as const
  },
  {
    name: "MSL field copilot",
    function: "Q&A · Cardiology",
    runs: 287,
    avgMs: 204,
    accuracy: 0.96,
    status: "healthy" as const
  },
  {
    name: "Pre-visit EHR summarizer",
    function: "Summarization · Internal medicine",
    runs: 1142,
    avgMs: 142,
    accuracy: 0.89,
    status: "healthy" as const
  },
  {
    name: "Promotional compliance reviewer",
    function: "Extraction · Legal",
    runs: 64,
    avgMs: 312,
    accuracy: 0.94,
    status: "watch" as const
  },
  {
    name: "Trial protocol summarizer",
    function: "Summarization · Oncology",
    runs: 98,
    avgMs: 256,
    accuracy: 0.91,
    status: "healthy" as const
  }
];

export const finetuneJobs = [
  {
    id: "ft-2026-04-26-acme-v3",
    base: "evarx-med-3b",
    status: "running" as const,
    progress: 0.62,
    eta: "1h 48m",
    stage: "Training · epoch 2/3",
    started: "10:14"
  },
  {
    id: "ft-2026-04-22-acme-v2",
    base: "evarx-med-3b",
    status: "deployed" as const,
    progress: 1,
    eta: "—",
    stage: "Deployed to acme-vpc",
    started: "Apr 22"
  },
  {
    id: "ft-2026-04-15-acme-v1",
    base: "evarx-med-1b",
    status: "deployed" as const,
    progress: 1,
    eta: "—",
    stage: "Archived",
    started: "Apr 15"
  }
];

export const activityFeed = [
  {
    when: "just now",
    actor: "MSL field copilot",
    text: "responded to KOL query · cited 3 sources",
    kind: "agent" as const
  },
  {
    when: "2 min ago",
    actor: "ft-2026-04-26-acme-v3",
    text: "epoch 2 complete · loss 1.05 → 0.81",
    kind: "train" as const
  },
  {
    when: "11 min ago",
    actor: "ICSR triage agent",
    text: "412 reports processed · 7 routed for SME review",
    kind: "agent" as const
  },
  {
    when: "32 min ago",
    actor: "Pre-visit EHR summarizer",
    text: "deployed to clinic-mumbai-3 (CPU · 16c)",
    kind: "deploy" as const
  },
  {
    when: "1 hr ago",
    actor: "Compliance reviewer",
    text: "flagged 2 items in 'Q2 Cardio Campaign'",
    kind: "agent" as const
  },
  {
    when: "3 hrs ago",
    actor: "data · pubmed-cardio",
    text: "ingested 184 new abstracts",
    kind: "data" as const
  }
];

export const dataSources = [
  { name: "Veeva Vault · Approved Content", docs: 18420, lastSync: "12 min ago" },
  { name: "Internal SOPs · S3", docs: 4182, lastSync: "1 hr ago" },
  { name: "PubMed · Cardiology corpus", docs: 92315, lastSync: "3 hrs ago" },
  { name: "EHR · Clinic-Mumbai-3", docs: 1284, lastSync: "live" }
];
