'use client';

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

// Official Cal.com inline embed. More reliable than a raw <iframe>, which
// Cal.com can block via frame-ancestors. Auto-resizes to fit content and
// inherits our dark theme. `calLink` is the path after cal.com/ (e.g.
// "commandapplications").
export default function CalEmbed({ calLink }) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi();
      if (cancelled) return;
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: { dark: { "cal-brand": "#3B82F6" } },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Cal
      calLink={calLink}
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
      config={{ layout: "month_view", theme: "dark" }}
    />
  );
}
