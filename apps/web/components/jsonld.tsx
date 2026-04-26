import { site } from "@/lib/site";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: site.name,
    url: site.url,
    description: site.description,
    slogan: site.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "TG",
      addressCountry: "IN"
    },
    sameAs: ["https://www.linkedin.com/company/evarx", "https://github.com/evarx"]
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
