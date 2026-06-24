// Shared site data — imported by both server components (for metadata + JSON-LD)
// and the client UI component (for rendering). Keeping a single source of truth
// means the on-page FAQ and the FAQPage structured data can never drift apart.

export const SITE = {
  name: "Command Applications",
  legalName: "Command Applications LLC",
  url: "https://commandapplications.com",
  email: "contact@commandapplications.com",
  // Company LinkedIn page. REPLACE: set the real Command Applications company
  // URL. Left blank on purpose so no placeholder/broken link renders publicly;
  // LinkedIn links are hidden until this is set (never the founder's personal
  // profile).
  linkedin: "",
  oneLiner:
    "Command Applications installs the AI Operating System your business runs on — built and delivered with the discipline of a veteran-led team.",
};

// Canonical definition of the "AI Operating System" — reused verbatim in the
// FAQ answer and the positioning copy so the term means one thing site-wide.
export const AIOS_DEFINITION =
  "An AI Operating System is the practical operating layer we install across how your business sells, operates, delivers, and reports. It's not a single tool or a one-off automation — it's a connected set of AI-driven modules wired into your existing stack and your team's real workflows, then supported until it works. AI finds the opportunities and does the repeatable work, so your people spend their time on the decisions and relationships that actually need them.";

// Founder credentials — verified, safe to state (see prompt §8). Used for the
// hero chip row and the founder/about sections.
export const CREDENTIALS = [
  "West Point Graduate",
  "Marshall Scholar",
  "Airborne Ranger · Combat Veteran",
  "Chief Growth Officer, venture-backed AI company",
];

// Veteran-led team. Render via a data array so members drop in/out cleanly.
// Kylie is gated behind SHOW_KYLIE: keep false until she has confirmed joining
// and consented to being named publicly. Presented strictly by merit — no
// family relationship is stated. The employer is never named.
export const SHOW_KYLIE = false;

export const TEAM = [
  {
    name: "Charlie Eadie",
    role: "Founder",
    photo: "/assets/charlie-eadie-headshot.png",
    blurb:
      "West Point graduate (#2 in class), Marshall Scholar (LSE & King's College London), Airborne Ranger and combat veteran of Iraq & Afghanistan, now Chief Growth Officer at a venture-backed AI company.",
  },
  ...(SHOW_KYLIE
    ? [
        {
          name: "Kylie Park",
          role: "AI Strategist",
          blurb:
            "Studying Computer Science and Mathematics at the University of South Carolina, Kylie brings the analytical and technical horsepower behind our builds.",
        },
      ]
    : []),
];

// The three AI Engine tiers (prompt §3.5). Prices are client-provided and real.
export const TIERS = [
  {
    id: "core",
    name: "Core AI Engine",
    modules: "3 Modules",
    transformation: "Intelligence",
    promise: "AI finds the opportunities, your team executes.",
    price: "$2,500",
    cadence: "/mo",
    features: [
      "Daily intelligence briefs",
      "Automated data collection",
      "System maintenance",
      "Quarterly optimization",
    ],
  },
  {
    id: "pro",
    name: "Pro AI Engine",
    modules: "7 Modules",
    transformation: "Execution",
    promise: "AI does the work, you show up to meetings.",
    price: "$4,500",
    cadence: "/mo",
    featured: true,
    featuredBadge: "Most Popular",
    features: [
      "Everything in Core, plus:",
      "AI-generated actions",
      "Outreach automation",
      "Review queue",
      "Bi-weekly strategy calls",
      "Priority support",
    ],
  },
  {
    id: "complete",
    name: "Complete AI Engine",
    modules: "15+ Modules",
    transformation: "Transformation",
    promise: "Every job in your business, automated.",
    price: "$10,500",
    cadence: "/mo",
    features: [
      "Full business task audit",
      "On-site visits",
      "Weekly strategy calls",
      "A new module deployed every month",
      "...until your entire operation runs itself",
    ],
  },
];

// FAQ (prompt §3.10). Answers are written in-voice, honest, no fabrication.
export const FAQ = [
  {
    q: "What's an AI Operating System?",
    a: AIOS_DEFINITION,
  },
  {
    q: "Will this work for my industry?",
    a: "Almost certainly. The work that slows teams down — chasing leads, moving data between tools, writing the same updates, reporting on what happened — looks similar across industries. We start by mapping your specific workflows, so what we install fits how your business actually runs, not a generic template.",
  },
  {
    q: "Do I need a technical team?",
    a: "No. We build, connect, deploy, and keep running the systems with you. You don't need engineers on staff — you need people who want their manual work to disappear.",
  },
  {
    q: "Is my data safe?",
    a: "We treat your data with an operator's discipline: least-privilege access, encrypted connections, and tools configured to keep your information inside systems you control. As an SDVOSB led by a combat veteran, security isn't a checkbox — it's a habit. We'll document exactly what connects to what before anything goes live.",
  },
  {
    q: "Will this replace my staff or help them?",
    a: "Help them. We automate the repeatable, low-judgment work so your people spend their time on decisions, relationships, and the work only a human should do. The goal is leverage for your team, not a smaller one.",
  },
  {
    q: "How fast is ROI, and how is it measured?",
    a: "We scope every engagement around measurable outcomes — hours saved, manual steps removed, faster turnaround — and agree on how we'll track them before we build. We won't quote you a fabricated percentage; we'll define the metric for your situation and report against it.",
  },
  {
    q: "Do I have to buy a pile of new tools?",
    a: "No. We build on the tools your business already uses wherever possible and only add something new when it earns its place. The AI Operating System is a layer across your existing stack — not a rip-and-replace.",
  },
  {
    q: "What exactly gets built, and who builds it?",
    a: "Automations and AI agents wired into your real workflows — the modules of your AI Operating System, scoped to your highest-ROI opportunities first. A veteran-led team builds it, deploys it, and stays on to run and support it. You get working systems, not a strategy deck.",
  },
];
