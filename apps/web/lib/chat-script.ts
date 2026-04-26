export interface ChatSuggestion {
  label: string;
  prompt: string;
  response: string;
  citations: { source: string; excerpt: string }[];
}

export const chatSuggestions: ChatSuggestion[] = [
  {
    label: "Summarize a clinical trial protocol",
    prompt: "Summarize the key inclusion criteria for the NCT06000000 protocol.",
    response:
      "Key inclusion criteria for NCT06000000 (a Phase 2 oncology trial in NSCLC):\n\n• Adults ≥ 18 with histologically confirmed advanced or metastatic NSCLC.\n• Documented EGFR exon 19 deletion or L858R mutation.\n• ECOG performance status 0 or 1.\n• Measurable disease per RECIST v1.1.\n• At least one prior line of platinum-based chemotherapy.\n\nNote — this summary is grounded only in the protocol document you uploaded. No external content was used.",
    citations: [
      {
        source: "Protocol_NCT06000000_v3.2.pdf · §4.1",
        excerpt: "Eligible subjects must be aged 18 years or older with histologically confirmed..."
      },
      {
        source: "Protocol_NCT06000000_v3.2.pdf · §4.3",
        excerpt: "Documented EGFR exon 19 deletion or L858R substitution mutation as confirmed..."
      }
    ]
  },
  {
    label: "Triage an adverse event",
    prompt: "Suggest a MedDRA code for 'severe rash with mucosal involvement after dose 3'.",
    response:
      "Most likely MedDRA term: **Stevens-Johnson syndrome** (PT, code 10042033).\n\nSecondary candidates if SJS criteria are not met:\n• Drug reaction with eosinophilia and systemic symptoms (DRESS) — PT 10067193\n• Erythema multiforme — PT 10015218\n\nRecommended action: classify as **Serious / Medically significant**, route for expedited reporting if causality is suspected. Confirm with the safety physician before final coding.",
    citations: [
      {
        source: "MedDRA v27.1 · PT lookup",
        excerpt: "10042033 — Stevens-Johnson syndrome (PT)"
      },
      {
        source: "Internal SOP · PV-014",
        excerpt: "Mucocutaneous reactions with mucosal involvement default to expedited reporting."
      }
    ]
  },
  {
    label: "Explain a regulatory guidance",
    prompt: "What does CDSCO require for a Phase III protocol amendment?",
    response:
      "Per the CDSCO New Drugs and Clinical Trials Rules, 2019 (Schedule Y refinements):\n\n1. Substantial amendments require prior written approval from CDSCO before implementation.\n2. The application must include a tracked-changes protocol, justification, and updated investigator's brochure (if affected).\n3. Approval timelines are 30 working days for substantial amendments; non-substantial changes are notification-only.\n4. Site-level Ethics Committee re-approval is required regardless of CDSCO substantive review.\n\nThis answer cites the rules version current as of April 2026.",
    citations: [
      {
        source: "New Drugs and CT Rules, 2019 · Rule 32",
        excerpt: "No substantial amendment to the protocol shall be implemented without prior approval..."
      }
    ]
  }
];

export const greetings = [
  "Hi — I&apos;m the Evarx demo agent.",
  "I run on a small medical SLM, fine-tuned on the documents in this sandbox.",
  "Pick a question below to see how I respond — with citations."
];
