export interface ChatSuggestion {
  label: string;
  prompt: string;
  response: string;
  citations: { source: string; excerpt: string }[];
}

// The public chat is a sales surface, not a live AI. Each "response" is a
// tailored pitch that pivots the visitor to a private demo with their own data.
export const chatSuggestions: ChatSuggestion[] = [
  {
    label: "Summarize a clinical trial protocol",
    prompt: "Summarize the key inclusion criteria for the NCT06000000 protocol.",
    response:
      "Yes — Evarx Med-3B handles protocol QA, eligibility logic, and amendment summaries with citations back to the source document.\n\nBook a 15-min walkthrough and we'll run it live on **your own protocols** under NDA.",
    citations: [
      {
        source: "Use case · clinical operations",
        excerpt: "Eligibility checks, amendment diffs, deviation flagging, ICH-GCP cross-references."
      }
    ]
  },
  {
    label: "Triage an adverse event",
    prompt: "Suggest a MedDRA code for 'severe rash with mucosal involvement after dose 3'.",
    response:
      "MedDRA coding, seriousness assessment, and expedited-reporting routing are our most-requested workflows.\n\nBook a demo to see Evarx Med-3B run against **your safety database** with your SOPs and reporting rules baked in.",
    citations: [
      {
        source: "Use case · pharmacovigilance",
        excerpt: "MedDRA v27+ coding, ICSR triage, E2B(R3) export, regulatory clock tracking."
      }
    ]
  },
  {
    label: "Explain a regulatory guidance",
    prompt: "What does CDSCO require for a Phase III protocol amendment?",
    response:
      "We ship pre-trained agents for CDSCO, FDA, EMA, and PMDA — updated as guidances change, with full citation back to the regulation text.\n\nBook a demo to walk through **your jurisdictions of interest** with our regulatory affairs team on the call.",
    citations: [
      {
        source: "Use case · regulatory affairs",
        excerpt: "CDSCO, FDA, EMA, PMDA, MHRA · NDCTR 2019, 21 CFR, EU CTR, ICH guidelines."
      }
    ]
  }
];

export const greetings = [
  "Hi — I'm Evarx's demo concierge.",
  "Live agent demos run on your own documents under NDA, so we don't expose them publicly.",
  "Pick a topic below to see how Evarx Med-3B handles it — then book a 15-min walkthrough."
];
