import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "About | Veteran-Led SDVOSB AI Company",
  description:
    "Learn why Command Applications is credible: veteran-led delivery, SDVOSB discipline, and a focus on turning AI into usable systems that save time and improve workflows.",
};

export default function AboutPage() {
  return <CommandApplicationsClient initialPath="/about" />;
}

