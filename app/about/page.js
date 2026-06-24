import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "About — Built by an Operator, Run with Discipline (SDVOSB)",
  description:
    "Command Applications is veteran-led: West Point graduate (#2 in class), Marshall Scholar, Airborne Ranger and combat veteran, now building AI as a Chief Growth Officer. Why an SDVOSB is a better AI partner.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <CommandApplicationsClient initialPath="/about" />;
}
