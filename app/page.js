import CommandApplicationsClient from "./_components/CommandApplicationsClient";
import { FAQ } from "./_data/site";

export const metadata = {
  title:
    "Command Applications — The AI Operating System Your Business Runs On (SDVOSB)",
  description:
    "We help founders and operators identify, build, and install AI systems so their team moves faster and kills manual work — delivered with veteran-led, SDVOSB discipline.",
  alternates: { canonical: "/" },
};

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <FaqJsonLd />
      <CommandApplicationsClient initialPath="/" />
    </>
  );
}
