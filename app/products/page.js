import CommandApplicationsClient from "../_components/CommandApplicationsClient";

export const metadata = {
  title: "Products | AI Courses, Audits & Done-for-You Builds",
  description:
    "Five productized AI offerings for small business owners — from a $297 jump-start course to a custom AI Opportunity Audit and done-for-you website builds.",
};

export default function ProductsPage() {
  return <CommandApplicationsClient initialPath="/products" />;
}
