export const site = {
  name: "Evarx",
  legalName: "Evarx Innovations Private Limited",
  tagline: "Engineering the biology of tomorrow",
  description:
    "Evarx is the healthcare AI infrastructure for India. Build private agents, fine-tune CPU-runnable medical SLMs on your own data, and deploy in your own perimeter — in hours, not months.",
  url: "https://evarx.in",
  contactEmail: "contact@evarx.in",
  location: "Hyderabad, India",
  nav: [
    { label: "Platform", href: "/platform" },
    { label: "Custom SLM", href: "/custom-slm" },
    { label: "Solutions", href: "/solutions" },
    { label: "Agents", href: "/agents" },
    { label: "Pricing", href: "/pricing" },
    { label: "Security", href: "/security" },
    { label: "Resources", href: "/resources" },
    { label: "Company", href: "/company" }
  ]
} as const;

export type NavItem = (typeof site.nav)[number];
