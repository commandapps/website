import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "Book a Strategy Call — Find Where AI Fits Your Business",
  description:
    "A 45-minute call — no pitch, no pressure. We'll map where AI and automation can make an immediate, measurable difference for your team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <CommandApplicationsClient initialPath="/contact" />;
}
