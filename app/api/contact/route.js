export async function POST(req) {
  let body = null;
  try {
    body = await req.json();
  } catch {
    // ignore; handled below
  }

  const name = body?.name?.toString?.().trim?.() ?? "";
  const email = body?.email?.toString?.().trim?.() ?? "";
  const org = body?.org?.toString?.().trim?.() ?? "";
  const interest = body?.interest?.toString?.().trim?.() ?? "";
  const message = body?.message?.toString?.().trim?.() ?? "";

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // MVP placeholder: in production, connect to your email provider / CRM.
  // We intentionally do not log sensitive message content.
  console.log("contact_submit", {
    name,
    email,
    org,
    interest,
    messageLength: message.length,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

