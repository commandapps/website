import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "Work & Case Studies | Command Applications (SDVOSB)",
  description:
    "See examples of real tools and AI-enabled digital products built by Command Applications, including BipolarAware and upcoming work.",
};

export default function WorkPage() {
  return <CommandApplicationsClient initialPath="/work" />;
}

