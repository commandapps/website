import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "Contact | Book a Consultation (Command Applications)",
  description:
    "Book a consultation for AI training, workflow automation, AI advisory, and custom AI applications. Veteran-led SDVOSB partner focused on practical execution.",
};

export default function ContactPage() {
  return <CommandApplicationsClient initialPath="/contact" />;
}

