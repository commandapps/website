import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "Work & Case Studies — BipolarAware and Client Wins (SDVOSB)",
  description:
    "Our flagship build, BipolarAware — a production-grade AI mental-health platform — plus client case studies as engagements complete.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return <CommandApplicationsClient initialPath="/work" />;
}
