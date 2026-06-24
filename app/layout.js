import "./globals.css";
import { SITE } from "./_data/site";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default:
      "Command Applications — The AI Operating System Your Business Runs On (SDVOSB)",
    template: "%s | Command Applications",
  },
  description:
    "Command Applications installs the AI Operating System your business runs on — automations, AI agents, and internal tools built and supported by a veteran-led, SDVOSB-certified team.",
  applicationName: SITE.name,
  keywords: [
    "AI Operating System",
    "AI automation agency",
    "veteran-led AI",
    "SDVOSB",
    "workflow automation",
    "AI consulting",
    "small business AI",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: "The AI Operating System Your Business Runs On",
    description:
      "Veteran-led, SDVOSB-certified team that builds, installs, and supports the AI systems your business runs on.",
    // REPLACE: add a real 1200x630 OG image at /public/og-image.png
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Command Applications" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The AI Operating System Your Business Runs On",
    description:
      "Veteran-led, SDVOSB-certified team that builds and installs the AI systems your business runs on.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

// Organization + ProfessionalService + Person (founder) structured data (§5).
function StructuredData() {
  const personId = `${SITE.url}/#founder`;
  const orgId = `${SITE.url}/#organization`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": orgId,
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        email: SITE.email,
        description:
          "Veteran-led, SDVOSB-certified team that builds, installs, and supports the AI Operating System your business runs on.",
        slogan: SITE.oneLiner,
        areaServed: "US",
        sameAs: [SITE.linkedin, SITE.founderSite],
        founder: { "@id": personId },
        knowsAbout: [
          "Artificial Intelligence",
          "Workflow Automation",
          "AI Agents",
          "Business Process Automation",
        ],
      },
      {
        "@type": "Person",
        "@id": personId,
        name: "Charlie Eadie",
        jobTitle: "Founder",
        worksFor: { "@id": orgId },
        alumniOf: [
          "United States Military Academy at West Point",
          "London School of Economics",
          "King's College London",
        ],
        sameAs: [SITE.founderSite, SITE.linkedin],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
