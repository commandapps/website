import Stripe from "stripe";

export const runtime = "nodejs";

// Server-side source of truth for pricing. Amounts are in cents (USD).
// `priceId` points at the live reusable Price objects in Stripe so checkouts
// don't create a throwaway product each time. The `amount` is kept as an inline
// fallback used only if the Price can't be resolved (e.g. running with a test
// key locally, where the live Price IDs don't exist).
// Keep the keys in sync with the product `id`s in command-applications.jsx.
const CATALOG = {
  "jump-start": { name: "AI Jump Start", amount: 29700, mode: "payment", priceId: "price_1TgPzeJ1br9Kw7PYELoPvapv" },
  "operator-course": { name: "AI Operator Course", amount: 99700, mode: "payment", priceId: "price_1TgPzjJ1br9Kw7PYqDFZZs6X" },
  "opportunity-audit": { name: "AI Opportunity Audit", amount: 150000, mode: "payment", priceId: "price_1TgPzkJ1br9Kw7PYb4X0SpAN" },
  "advisory-retainer": { name: "AI Advisory Retainer", amount: 120000, mode: "subscription", interval: "month", priceId: "price_1TgPznJ1br9Kw7PY5teTVwUL" },
  "ai-built-website": { name: "AI-Built Website", amount: 150000, mode: "payment", priceId: "price_1TgPzoJ1br9Kw7PYiKqFX7eH" },
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Inline line item, used only as a fallback when the reusable Price can't be used.
function inlineLineItem(item) {
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: item.amount,
      product_data: { name: item.name },
      ...(item.mode === "subscription"
        ? { recurring: { interval: item.interval || "month" } }
        : {}),
    },
  };
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

  // Embedded Checkout keeps the customer on our domain. Stripe redirects to
  // return_url only after payment completes; there is no cancel_url (the user
  // simply closes the modal).
  const base = {
    ui_mode: "embedded_page",
    mode: item.mode,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    return_url: `${origin}/products?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    // Stripe Link can redirect the whole browser to checkout.stripe.com for OTP
    // verification, which breaks the embedded on-site experience. Card-only here.
    wallet_options: { link: { display: "never" } },
  };

  try {
    let session;
    try {
      // Preferred path: reference the reusable live Price object.
      session = await stripe.checkout.sessions.create({
        ...base,
        line_items: [{ price: item.priceId, quantity: 1 }],
      });
    } catch {
      // Fallback: the Price ID couldn't be used (e.g. a test key in local dev).
      session = await stripe.checkout.sessions.create({
        ...base,
        line_items: [inlineLineItem(item)],
      });
    }

    return json({ ok: true, clientSecret: session.client_secret });
  } catch {
    // Avoid leaking Stripe error internals to the client.
    return json({ ok: false, error: "Could not start checkout." }, 502);
  }
}
