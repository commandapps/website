import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "What We Install — The AI Operating System (SDVOSB)",
  description:
    "The four outcomes we install — Install, Acquire, Support, Scale — and the three AI Engine tiers (Core, Pro, Complete) we build and support for your business.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <CommandApplicationsClient initialPath="/services" />;
}
