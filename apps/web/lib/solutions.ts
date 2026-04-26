export interface Solution {
  slug: string;
  role: string;
  title: string;
  blurb: string;
  hero: string;
  outcomes: { metric: string; label: string }[];
  agents: { title: string; body: string }[];
  pains: string[];
  proofPoints: string[];
}

export const solutions: Solution[] = [
  {
    slug: "pharma-rd",
    role: "For Pharma R&D",
    title: "Compress discovery-to-decision loops with private medical AI.",
    blurb:
      "Surface signal from millions of pages of literature, internal SOPs, and trial data — without exposing molecules or pipelines to a third-party API.",
    hero: "Bench-to-bedside, accelerated.",
    outcomes: [
      { metric: "−60%", label: "literature triage time" },
      { metric: "3×", label: "faster protocol drafting" },
      { metric: "100%", label: "of data stays in your VPC" }
    ],
    agents: [
      {
        title: "Target rationale assistant",
        body: "Synthesizes mechanistic evidence across PubMed, internal decks, and patent corpora."
      },
      {
        title: "Protocol drafter",
        body: "Generates trial protocol skeletons grounded in your therapeutic area precedents."
      },
      {
        title: "Competitive intelligence agent",
        body: "Daily digests of pipeline moves, ClinicalTrials.gov updates, and regulatory filings."
      }
    ],
    pains: [
      "Literature volume outpaces what humans can read.",
      "Protocols drafted from scratch each cycle.",
      "Sensitive IP can&apos;t leave the company perimeter."
    ],
    proofPoints: [
      "Custom SLM fine-tuned on your therapeutic area.",
      "Air-gap deployment for early-discovery teams.",
      "Audit trail for every retrieved citation."
    ]
  },
  {
    slug: "clinical-ops",
    role: "For Clinical Operations",
    title: "Run trials with the consistency of a senior CRA — at every site.",
    blurb:
      "From eligibility screening to monitoring narratives, give your study teams an AI co-worker that knows your protocols and your SOPs.",
    hero: "Operational excellence, agentic.",
    outcomes: [
      { metric: "−45%", label: "screen failure rate" },
      { metric: "2×", label: "faster monitoring write-ups" },
      { metric: "0", label: "PHI leaving your VPC" }
    ],
    agents: [
      {
        title: "Eligibility screener",
        body: "Reads structured + unstructured patient data and proposes match rationale."
      },
      {
        title: "Site monitoring assistant",
        body: "Drafts narratives from EDC + visit logs, flags protocol deviations."
      },
      {
        title: "ICF Q&A agent",
        body: "Multilingual patient-facing Q&A grounded in your approved consent forms."
      }
    ],
    pains: [
      "CRA capacity is the bottleneck.",
      "Site-level inconsistency in documentation.",
      "Multilingual patient comms are slow and risky."
    ],
    proofPoints: [
      "Indian languages out of the box.",
      "Templates aligned to ICH-GCP and CDSCO.",
      "Per-site role-based access."
    ]
  },
  {
    slug: "medical-affairs",
    role: "For Medical Affairs",
    title: "Equip every MSL with the institutional memory of your science team.",
    blurb:
      "Approved-content-grounded answers, instantly — for field calls, KOL prep, and conference response.",
    hero: "Field, congress, and content — unified.",
    outcomes: [
      { metric: "−70%", label: "time-to-response on field queries" },
      { metric: "100%", label: "answers grounded in approved content" },
      { metric: "5×", label: "MSL knowledge surface area" }
    ],
    agents: [
      {
        title: "MSL field copilot",
        body: "Conversational answers grounded in your medical content library and PI."
      },
      {
        title: "KOL briefing generator",
        body: "Pre-meeting briefs with publication history, prior interactions, and topic primers."
      },
      {
        title: "Congress monitor",
        body: "Live abstract and session digests from major medical congresses."
      }
    ],
    pains: [
      "MSLs lose hours searching for the right slide.",
      "Approved-content lookup is fragmented across systems.",
      "Field response times slip past the customer&apos;s window of attention."
    ],
    proofPoints: [
      "Integrates with Veeva Vault and SharePoint.",
      "Citations link back to the exact approved-content paragraph.",
      "Mobile-first MSL interface."
    ]
  },
  {
    slug: "regulatory",
    role: "For Regulatory Affairs",
    title: "Draft, defend, and track submissions with a regulatory copilot.",
    blurb:
      "An agent fluent in CDSCO, FDA, and EMA guidance — and in your dossier history.",
    hero: "Submission velocity, with a paper trail.",
    outcomes: [
      { metric: "−50%", label: "first-draft time on Module 2 sections" },
      { metric: "100%", label: "answers grounded in cited guidance" },
      { metric: "0", label: "dossier data egress" }
    ],
    agents: [
      {
        title: "Guidance Q&A bot",
        body: "Cited answers across CDSCO, FDA, and EMA guidance documents."
      },
      {
        title: "Module 2 drafter",
        body: "First-draft generation for clinical overview and summary sections."
      },
      {
        title: "Question-response engine",
        body: "Drafts responses to agency queries grounded in your dossier."
      }
    ],
    pains: [
      "Guidance changes faster than teams can absorb.",
      "Drafting from a blank page each cycle.",
      "Cross-region inconsistency in submission language."
    ],
    proofPoints: [
      "Indexed against current CDSCO + ICH guidance.",
      "Citation-linked answers — no hallucinated guidance.",
      "Per-region SLM fine-tunes available."
    ]
  },
  {
    slug: "hospitals",
    role: "For Hospitals & Health Systems",
    title: "AI for clinicians that runs inside the hospital.",
    blurb:
      "Pre-visit summaries, structured note drafting, and patient Q&A — all running on CPU servers within your firewall.",
    hero: "Bedside intelligence, no cloud required.",
    outcomes: [
      { metric: "−40%", label: "documentation time per visit" },
      { metric: "On-prem", label: "100% deployment, air-gappable" },
      { metric: "Multilingual", label: "Indian languages + English" }
    ],
    agents: [
      {
        title: "Pre-visit summarizer",
        body: "Synthesizes EHR history into a one-page brief before the clinician walks in."
      },
      {
        title: "Note drafter",
        body: "Drafts structured progress notes from voice and unstructured input."
      },
      {
        title: "Patient Q&A kiosk",
        body: "Indian-language patient education grounded in your hospital&apos;s protocols."
      }
    ],
    pains: [
      "Clinicians drowning in documentation.",
      "Cloud AI tools are non-starters under DPDP Act.",
      "GPU procurement is impossible at most hospitals."
    ],
    proofPoints: [
      "Runs on existing hospital-grade CPU servers.",
      "DPDP-compliant by default — data never leaves the building.",
      "Integrates with major HIS / EMR systems."
    ]
  }
];

export function solutionBySlug(slug: string) {
  return solutions.find((s) => s.slug === slug);
}
