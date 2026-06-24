import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "The Command Method — How We Install AI That Sticks",
  description:
    "Our disciplined five-stage build path: Recon, Foundations, Build, Install & Train, and Hold the Line — each shipping a concrete deliverable.",
  alternates: { canonical: "/method" },
};

export default function MethodPage() {
  return <CommandApplicationsClient initialPath="/method" />;
}
