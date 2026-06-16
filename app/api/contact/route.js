import { Resend } from "resend";

export const runtime = "nodejs";

const INTEREST_LABELS = {
  training: "AI Training",
  automation: "Workflow Automation",
  advisory: "AI Advisory & Implementation",
  build: "Custom AI Application",
  products: "Products / Courses",
  general: "General Inquiry",
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ ok: false, error: "Contact form is not configured." }, 503);
  }

  let body = null;
  try {
    body = await req.json();
  } catch {
    // handled below
  }

  const name = body?.name?.toString?.().trim?.() ?? "";
  const email = body?.email?.toString?.().trim?.() ?? "";
  const org = body?.org?.toString?.().trim?.() ?? "";
  const interest = body?.interest?.toString?.().trim?.() ?? "";
  const message = body?.message?.toString?.().trim?.() ?? "";

  if (!name || !email || !message) {
    return json({ ok: false, error: "Missing required fields." }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }

  const to = process.env.CONTACT_TO_EMAIL || "contact@commandapplications.com";
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Command Applications <contact@commandapplications.com>";
  const interestLabel = INTEREST_LABELS[interest] || interest || "Not specified";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `New inquiry from ${name}${org ? ` — ${org}` : ""}`,
      text: [
        `New message from commandapplications.com`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Organization: ${org || "—"}`,
        `Interest: ${interestLabel}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Organization:</strong> ${escapeHtml(org || "—")}</p>
        <p><strong>Interest:</strong> ${escapeHtml(interestLabel)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `.trim(),
    });

    if (error) {
      console.error("contact_email_failed", error.message);
      return json({ ok: false, error: "Could not send your message." }, 502);
    }

    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Could not send your message." }, 502);
  }
}
