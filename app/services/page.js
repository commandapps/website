import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "Services | AI Training & Workflow Automation (SDVOSB)",
  description:
    "AI training, workflow automation, AI advisory & implementation, and custom AI applications built by a veteran-led SDVOSB partner.",
};

export default function ServicesPage() {
  return <CommandApplicationsClient initialPath="/services" />;
}

