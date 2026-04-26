export interface Agent {
  slug: string;
  name: string;
  function:
    | "Q&A"
    | "Summarization"
    | "Extraction"
    | "Drafting"
    | "Monitoring"
    | "Triage";
  specialty: string;
  audience: string;
  short: string;
  inputs: string[];
  outputs: string[];
  engineHint: "Standard" | "Private" | "Custom";
}

export const agents: Agent[] = [
  {
    slug: "trial-protocol-summarizer",
    name: "Trial protocol summarizer",
    function: "Summarization",
    specialty: "Oncology",
    audience: "Clinical R&D",
    short:
      "Reduces 80-page protocols to one-page briefs covering eligibility, endpoints, and visit schedule.",
    inputs: ["Protocol PDF", "Investigator brochure"],
    outputs: ["Plain-language brief", "Eligibility checklist", "Visit schedule"],
    engineHint: "Private"
  },
  {
    slug: "icsr-triage",
    name: "ICSR triage agent",
    function: "Triage",
    specialty: "Pharmacovigilance",
    audience: "Drug safety",
    short:
      "Reads adverse event reports and assigns severity, expectedness, and proposed MedDRA codes.",
    inputs: ["Adverse event narrative", "Patient demographics"],
    outputs: ["MedDRA suggestions", "Severity flag", "Expectedness rationale"],
    engineHint: "Custom"
  },
  {
    slug: "pre-visit-summarizer",
    name: "Pre-visit EHR summarizer",
    function: "Summarization",
    specialty: "Internal medicine",
    audience: "Hospital",
    short:
      "Synthesizes EHR history into a one-page brief before the clinician walks into the room.",
    inputs: ["EHR record", "Recent labs"],
    outputs: ["Visit brief", "Open issues list", "Med-rec checks"],
    engineHint: "Custom"
  },
  {
    slug: "msl-field-copilot",
    name: "MSL field copilot",
    function: "Q&A",
    specialty: "Cardiology",
    audience: "Medical affairs",
    short:
      "Conversational answers grounded only in your approved scientific content library.",
    inputs: ["Approved content library", "PI"],
    outputs: ["Cited answer", "Source links", "Suggested follow-ups"],
    engineHint: "Private"
  },
  {
    slug: "regulatory-qa",
    name: "Regulatory guidance Q&A",
    function: "Q&A",
    specialty: "All",
    audience: "Regulatory",
    short:
      "Cited answers across CDSCO, FDA, and EMA guidance — with version-aware retrieval.",
    inputs: ["Region", "Question"],
    outputs: ["Cited answer", "Guidance excerpt", "Version stamp"],
    engineHint: "Private"
  },
  {
    slug: "promo-compliance",
    name: "Promotional compliance reviewer",
    function: "Extraction",
    specialty: "Multi",
    audience: "Legal · Med affairs",
    short:
      "Pre-screens marketing collateral against approved labels, PI, and prior MLR decisions.",
    inputs: ["Promo asset", "Approved label", "MLR history"],
    outputs: ["Flag report", "Suggested edits", "Citation map"],
    engineHint: "Custom"
  },
  {
    slug: "literature-monitor",
    name: "Daily literature monitor",
    function: "Monitoring",
    specialty: "Multi",
    audience: "Med affairs · R&D",
    short:
      "Daily PubMed and conference digest filtered by therapeutic area, with extracted endpoints.",
    inputs: ["Therapeutic area", "Keywords"],
    outputs: ["Digest email", "Endpoint table", "Trend chart"],
    engineHint: "Standard"
  },
  {
    slug: "icf-multilingual",
    name: "Multilingual ICF Q&A",
    function: "Q&A",
    specialty: "All",
    audience: "Clinical ops",
    short:
      "Answers patient questions about consent forms in Hindi, Tamil, Telugu, and English.",
    inputs: ["ICF document", "Question"],
    outputs: ["Translated answer", "Reference paragraph"],
    engineHint: "Custom"
  },
  {
    slug: "kol-brief-generator",
    name: "KOL briefing generator",
    function: "Drafting",
    specialty: "Multi",
    audience: "Med affairs",
    short:
      "Pre-meeting briefs with publication history, prior interactions, and topic primers.",
    inputs: ["KOL name", "Therapeutic area"],
    outputs: ["1-page brief", "Talking points", "Cited references"],
    engineHint: "Private"
  },
  {
    slug: "csr-section-drafter",
    name: "CSR section drafter",
    function: "Drafting",
    specialty: "All",
    audience: "Medical writing",
    short:
      "Drafts CSR sections from your statistical outputs and protocol — your house style preserved.",
    inputs: ["Statistical outputs", "Protocol", "Style guide"],
    outputs: ["Draft section", "Reviewer comments"],
    engineHint: "Custom"
  },
  {
    slug: "site-monitoring-narratives",
    name: "Site monitoring narrative writer",
    function: "Drafting",
    specialty: "All",
    audience: "Clinical ops",
    short:
      "Generates monitoring visit narratives from EDC + visit log inputs in your CRA voice.",
    inputs: ["EDC export", "Visit log"],
    outputs: ["Narrative draft", "Deviation flags"],
    engineHint: "Private"
  },
  {
    slug: "patient-kiosk",
    name: "Patient education kiosk",
    function: "Q&A",
    specialty: "Multi",
    audience: "Hospital",
    short:
      "Multilingual touchscreen Q&A grounded in your hospital protocols and patient leaflets.",
    inputs: ["Hospital protocol library"],
    outputs: ["Spoken answer", "Printable summary"],
    engineHint: "Custom"
  }
];

export const agentFunctions = [
  "All",
  "Q&A",
  "Summarization",
  "Extraction",
  "Drafting",
  "Monitoring",
  "Triage"
] as const;

export const agentAudiences = [
  "All",
  "Clinical R&D",
  "Drug safety",
  "Hospital",
  "Medical affairs",
  "Regulatory",
  "Clinical ops",
  "Medical writing",
  "Legal · Med affairs",
  "Med affairs · R&D"
] as const;
