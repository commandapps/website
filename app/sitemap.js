import { SITE } from "./_data/site";

export default function sitemap() {
  const now = new Date();
  const routes = ["", "/services", "/method", "/work", "/about", "/contact"];
  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
