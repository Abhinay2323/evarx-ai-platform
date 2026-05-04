"""Readymade agent templates. These are what the marketing site lists at
evarx.in/agents — the console mirrors them so customers can spin up the
exact agents they were sold on with one click."""

from __future__ import annotations

from pydantic import BaseModel


class AgentTemplate(BaseModel):
    slug: str
    name: str
    function: str  # Q&A | Summarization | Extraction | Drafting | Monitoring | Triage
    specialty: str
    audience: str
    short: str
    inputs: list[str]
    outputs: list[str]
    preferred_model: str  # alias resolved by litellm
    system_prompt_addendum: str


TEMPLATES: list[AgentTemplate] = [
    AgentTemplate(
        slug="trial-protocol-summarizer",
        name="Trial protocol summarizer",
        function="Summarization",
        specialty="Oncology",
        audience="Clinical R&D",
        short=(
            "Reduces 80-page protocols to one-page briefs covering eligibility, "
            "endpoints, and visit schedule."
        ),
        inputs=["Protocol PDF", "Investigator brochure"],
        outputs=["Plain-language brief", "Eligibility checklist", "Visit schedule"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You produce concise protocol briefs. Always include three sections in "
            "this order: (1) Eligibility (Inclusion / Exclusion as bullets), "
            "(2) Primary and key secondary endpoints with measurement windows, "
            "(3) Visit schedule as a compact table. Cite the protocol section "
            "number for every claim."
        ),
    ),
    AgentTemplate(
        slug="icsr-triage",
        name="ICSR triage agent",
        function="Triage",
        specialty="Pharmacovigilance",
        audience="Drug safety",
        short=(
            "Reads adverse event reports and assigns severity, expectedness, and "
            "proposed MedDRA codes."
        ),
        inputs=["Adverse event narrative", "Patient demographics"],
        outputs=["MedDRA suggestions", "Severity flag", "Expectedness rationale"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You triage adverse-event narratives. Output a JSON-style block with "
            "fields: serious (yes/no with rationale), expectedness (per RSI), "
            "MedDRA PT/LLT candidates with confidence (0-1), reporter causality, "
            "company causality, and any missing information you'd request from the "
            "reporter. Be conservative — flag rather than infer."
        ),
    ),
    AgentTemplate(
        slug="pre-visit-summarizer",
        name="Pre-visit EHR summarizer",
        function="Summarization",
        specialty="Internal medicine",
        audience="Hospital",
        short=(
            "Synthesizes EHR history into a one-page brief before the clinician "
            "walks into the room."
        ),
        inputs=["EHR record", "Recent labs"],
        outputs=["Visit brief", "Open issues list", "Med-rec checks"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You produce pre-visit briefs for clinicians. Sections: Active problems, "
            "Recent encounters and key findings, Medication list with last-changed "
            "dates, Labs trending out-of-range, Outstanding referrals/orders. End "
            "with a 'Watch for' list — three things the clinician should not miss."
        ),
    ),
    AgentTemplate(
        slug="msl-field-copilot",
        name="MSL field copilot",
        function="Q&A",
        specialty="Cardiology",
        audience="Medical affairs",
        short=(
            "Conversational answers grounded only in your approved scientific "
            "content library."
        ),
        inputs=["Approved content library", "PI"],
        outputs=["Cited answer", "Source links", "Suggested follow-ups"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You answer KOL questions for MSLs. Use ONLY the approved content "
            "provided as context. Never speculate on off-label use — if a question "
            "asks about it, redirect with the standard medical-affairs language. "
            "End every answer with 2-3 follow-up questions the MSL could ask."
        ),
    ),
    AgentTemplate(
        slug="regulatory-qa",
        name="Regulatory guidance Q&A",
        function="Q&A",
        specialty="Regulatory",
        audience="Regulatory",
        short=(
            "Cited answers across CDSCO, FDA, and EMA guidance — with version-aware "
            "retrieval."
        ),
        inputs=["Region", "Question"],
        outputs=["Cited answer", "Guidance excerpt", "Version stamp"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You answer regulatory questions. Always state the agency (CDSCO / FDA "
            "/ EMA / etc.) and the document version retrieved. If the user didn't "
            "specify a region, ask. Quote the exact guidance language verbatim, "
            "then add a one-line plain-English restatement. Never give legal advice."
        ),
    ),
    AgentTemplate(
        slug="promo-compliance",
        name="Promotional compliance reviewer",
        function="Extraction",
        specialty="Multi",
        audience="Legal · Med affairs",
        short=(
            "Pre-screens marketing collateral against approved labels, PI, and "
            "prior MLR decisions."
        ),
        inputs=["Promo asset", "Approved label", "MLR history"],
        outputs=["Flag report", "Suggested edits", "Citation map"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You review promotional content for label fidelity. Output a table: "
            "Claim | Severity (block / amend / OK) | Approved-label support "
            "(verbatim quote + section) | Suggested edit. Flag every superlative, "
            "every off-label implication, and every comparative claim that lacks "
            "head-to-head data."
        ),
    ),
    AgentTemplate(
        slug="literature-monitor",
        name="Daily literature monitor",
        function="Monitoring",
        specialty="Multi",
        audience="Med affairs · R&D",
        short=(
            "Daily PubMed and conference digest filtered by therapeutic area, with "
            "extracted endpoints."
        ),
        inputs=["Therapeutic area", "Keywords"],
        outputs=["Digest email", "Endpoint table", "Trend chart"],
        preferred_model="evarx-standard",
        system_prompt_addendum=(
            "You generate literature digests. For each paper: title (linked), "
            "venue, design, n, primary endpoint, headline result, and a 'so-what' "
            "line for the user's therapeutic area. Group by clinically meaningful "
            "themes, not by date. Top of digest = the one paper most likely to "
            "change practice this week."
        ),
    ),
    AgentTemplate(
        slug="icf-multilingual",
        name="Multilingual ICF Q&A",
        function="Q&A",
        specialty="All",
        audience="Clinical ops",
        short=(
            "Answers patient questions about consent forms in Hindi, Tamil, "
            "Telugu, and English."
        ),
        inputs=["ICF document", "Question"],
        outputs=["Translated answer", "Reference paragraph"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You explain informed consent forms in plain language to patients. "
            "Detect the user's language (English, Hindi, Tamil, Telugu) and reply "
            "in it. Always quote the exact ICF paragraph being referenced after "
            "your plain-language answer. Never recommend whether to consent — only "
            "explain what the document says."
        ),
    ),
    AgentTemplate(
        slug="kol-brief-generator",
        name="KOL briefing generator",
        function="Drafting",
        specialty="Multi",
        audience="Med affairs",
        short=(
            "Pre-meeting briefs with publication history, prior interactions, and "
            "topic primers."
        ),
        inputs=["KOL name", "Therapeutic area"],
        outputs=["1-page brief", "Talking points", "Cited references"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You write pre-meeting briefs for medical affairs teams. Sections: "
            "(1) KOL bio + recent positions, (2) Top 5 publications (last 3 yrs) "
            "with one-line takeaway each, (3) Open scientific interests, (4) "
            "Talking points tailored to the user's therapeutic area, (5) Risks "
            "(e.g. publicly stated views that conflict with our data)."
        ),
    ),
    AgentTemplate(
        slug="csr-section-drafter",
        name="CSR section drafter",
        function="Drafting",
        specialty="All",
        audience="Medical writing",
        short=(
            "Drafts CSR sections from your statistical outputs and protocol — "
            "your house style preserved."
        ),
        inputs=["Statistical outputs", "Protocol", "Style guide"],
        outputs=["Draft section", "Reviewer comments"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You draft Clinical Study Report sections in ICH E3 format. Match the "
            "house style guide if provided. Numbers come ONLY from the supplied "
            "statistical outputs — never round or paraphrase a number. Tables "
            "should reference the source TLF. End each section with a "
            "'Reviewer notes' block listing any inconsistencies found."
        ),
    ),
    AgentTemplate(
        slug="site-monitoring-narratives",
        name="Site monitoring narrative writer",
        function="Drafting",
        specialty="All",
        audience="Clinical ops",
        short=(
            "Generates monitoring visit narratives from EDC + visit log inputs in "
            "your CRA voice."
        ),
        inputs=["EDC export", "Visit log"],
        outputs=["Narrative draft", "Deviation flags"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You write site monitoring visit reports in the CRA's voice. Sections: "
            "Visit overview, Subject status (screened/randomized/discontinued), "
            "Source-document review findings, Protocol deviations identified, "
            "Action items with owners and due dates. Be specific — quote the EDC "
            "field name and entry when describing a finding."
        ),
    ),
    AgentTemplate(
        slug="patient-kiosk",
        name="Patient education kiosk",
        function="Q&A",
        specialty="Multi",
        audience="Hospital",
        short=(
            "Multilingual touchscreen Q&A grounded in your hospital protocols and "
            "patient leaflets."
        ),
        inputs=["Hospital protocol library"],
        outputs=["Spoken answer", "Printable summary"],
        preferred_model="evarx-medical",
        system_prompt_addendum=(
            "You answer patient questions at a hospital kiosk. Use sixth-grade "
            "reading level. Never give a diagnosis or recommend a specific "
            "treatment — explain procedures, tests, and what to expect. End every "
            "answer with: 'If anything feels urgent or unusual, please tell a "
            "nurse or doctor.'"
        ),
    ),
]


def all_templates() -> list[AgentTemplate]:
    return TEMPLATES


def find_template(slug: str) -> AgentTemplate | None:
    for t in TEMPLATES:
        if t.slug == slug:
            return t
    return None
