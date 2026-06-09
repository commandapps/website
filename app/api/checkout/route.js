import Stripe from "stripe";

export const runtime = "nodejs";

// Server-side source of truth for pricing. Amounts are in cents (USD).
// Keep the keys in sync with the product `id`s in command-applications.jsx.
const CATALOG = {
  "jump-start": { name: "AI Jump Start", amount: 29700, mode: "payment" },
  "operator-course": { name: "AI Operator Course", amount: 99700, mode: "payment" },
  "opportunity-audit": { name: "AI Opportunity Audit", amount: 150000, mode: "payment" },
  "advisory-retainer": { name: "AI Advisory Retainer", amount: 120000, mode: "subscription", interval: "month" },
  "ai-built-website": { name: "AI-Built Website", amount: 150000, mode: "payment" },
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return json({ ok: false, error: "Stripe is not configured." }, 500);
  }

  let body = null;
  try {
    body = await req.json();
  } catch {
    // handled below
  }

  const productId = body?.productId?.toString?.().trim?.();
  const item = productId ? CATALOG[productId] : null;
  if (!item) {
    return json({ ok: false, error: "Unknown product." }, 400);
  }

  const stripe = new Stripe(secret);
  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://commandapplications.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: item.amount,
            product_data: { name: item.name },
            ...(item.mode === "subscription"
              ? { recurring: { interval: item.interval || "month" } }
              : {}),
          },
        },
      ],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/products?checkout=success`,
      cancel_url: `${origin}/products?checkout=cancelled`,
    });

    return json({ ok: true, url: session.url });
  } catch {
    // Avoid leaking Stripe error internals to the client.
    return json({ ok: false, error: "Could not start checkout." }, 502);
  }
}
