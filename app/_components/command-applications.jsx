'use client';

import { useState, useEffect, useRef } from "react";
import { SITE, AIOS_DEFINITION, CREDENTIALS, TIERS, FAQ } from "../_data/site";

/* ─────────────────────────────────────────────
   COMMAND APPLICATIONS — "AI Operating System" agency site
   Pages: Home, Services, Method, Work, About, Contact
   ───────────────────────────────────────────── */

// Primary CTA used everywhere. Single, consistent conversion action (prompt §2).
const PRIMARY_CTA = "Book a Strategy Call";

// Booking: Cal.com embed URL (prompt §7). Set NEXT_PUBLIC_SCHEDULER_URL in env.
// REPLACE: real Cal.com (or Calendly) booking URL.
const SCHEDULER_URL =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SCHEDULER_URL || "" : "";

const HEADSHOT = "/assets/charlie-eadie-headshot.png";

// ── Routing ──
function useRoute(initialPath) {
  const [path, setPath] = useState(() => {
    if (typeof initialPath === "string" && initialPath) return initialPath;
    if (typeof window === "undefined") return "/";
    return window.location.pathname || "/";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);
  return path;
}
function Link({ to, children, className, onClick }) {
  return (
    <a
      href={to}
      className={className}
      onClick={() => {
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

// ── Scroll Animation Hook ──
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("revealed"); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("revealed"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = "", delay = 0, style = {} }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal-up ${className}`} style={{ ...style, transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ── Icons (inline SVG) ──
const Icons = {
  arrow: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  close: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  automate: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>,
  acquire: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>,
  support: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
  scale: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="4" width="3" height="14"/></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5.01A2.5 2.5 0 014.98 3.5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-1 1.83-2.05 3.76-2.05C20.3 8.59 21 11.07 21 14.3V21h-4v-5.9c0-1.4-.02-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V21H9z"/></svg>,
  external: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg>,
};

// ── Navbar (prompt §2) ──
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { to: "/services", label: "Services" },
    { to: "/method", label: "Method" },
    { to: "/work", label: "Work" },
    { to: "/about", label: "About" },
  ];
  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <img
            src="/assets/CommandApplicationsIcon.svg"
            alt=""
            aria-hidden="true"
            className="navbar__logo-img navbar__logo-img--icon"
            loading="eager"
          />
          <span className="navbar__logo-text">Command<br/><span>Applications</span></span>
        </Link>
        <div className={`navbar__links ${open ? "navbar__links--open" : ""}`}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="navbar__link" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link to="/contact" className="btn btn--sm btn--accent" onClick={() => setOpen(false)}>
            {PRIMARY_CTA}
          </Link>
        </div>
        <button className="navbar__toggle" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? Icons.close : Icons.menu}
        </button>
      </div>
    </nav>
  );
}

// ── Footer ──
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="navbar__logo navbar__logo--footer" style={{ marginBottom: 16 }}>
              <img
                src="/assets/CommandApplicationsIcon.svg"
                alt=""
                aria-hidden="true"
                className="navbar__logo-img navbar__logo-img--icon"
                loading="lazy"
              />
              <span className="navbar__logo-text">Command<br/><span>Applications</span></span>
            </div>
            <p className="footer__tagline">The AI Operating System your business runs on.<br/>Built and delivered by a veteran-led team.</p>
            <div className="footer__badge">
              <img
                src="/assets/SDVOSB.png"
                alt="Service Disabled Veteran Owned Small Business (SDVOSB) Certified"
                className="sdvosb-footer-seal"
                loading="lazy"
              />
            </div>
          </div>
          <div className="footer__col">
            <h4>What We Install</h4>
            <Link to="/services">The AIOS Pillars</Link>
            <Link to="/services">Core AI Engine</Link>
            <Link to="/services">Pro AI Engine</Link>
            <Link to="/services">Complete AI Engine</Link>
          </div>
          <div className="footer__col">
            <h4>Company</h4>
            <Link to="/method">The Command Method</Link>
            <Link to="/about">About</Link>
            <Link to="/work">Work</Link>
            <a href={SITE.founderSite} target="_blank" rel="noopener">charlieeadie.com</a>
          </div>
          <div className="footer__col">
            <h4>Get Started</h4>
            <Link to="/contact">{PRIMARY_CTA}</Link>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={SITE.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} {SITE.legalName}. All rights reserved.</p>
          <p className="footer__legal">Service Disabled Veteran Owned Small Business (SDVOSB)</p>
        </div>
      </div>
    </footer>
  );
}

// ── CTA Section (reusable, prompt §3.11) ──
function CTASection({ headline, sub, showAudit = true }) {
  return (
    <section className="cta-section">
      <div className="container">
        <Reveal>
          <div className="cta-section__inner">
            <h2>{headline || "Ready to put AI to work?"}</h2>
            <p>{sub || SITE.oneLiner}</p>
            <div className="cta-section__btns">
              <Link to="/contact" className="btn btn--accent btn--lg">{PRIMARY_CTA} {Icons.arrow}</Link>
            </div>
            {showAudit && (
              <Link to="/contact?source=audit" className="cta-section__secondary">Or get an AI Opportunity Audit →</Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Credential chips (prompt §3.1) ──
function CredentialChips({ className = "" }) {
  return (
    <div className={`chips ${className}`}>
      {CREDENTIALS.map((c) => (
        <span key={c} className="chip">{c}</span>
      ))}
    </div>
  );
}

// ── Pricing tier card (prompt §3.5) ──
function PricingTier({ tier, delay = 0 }) {
  return (
    <Reveal delay={delay} className="pcard-wrap">
      <article className={`pcard ${tier.featured ? "pcard--featured" : ""}`}>
        {tier.featured && tier.featuredBadge && (
          <span className="pcard__featured-badge">{Icons.star} {tier.featuredBadge}</span>
        )}
        <div className="pcard__top">
          <span className="pcard__badge">{tier.modules}</span>
        </div>
        <h3 className="pcard__name">{tier.name}</h3>
        <p className="pcard__transformation"><strong>{tier.transformation}</strong> — {tier.promise}</p>
        <div className="pcard__price">
          <span className="pcard__price-start">Starting at</span>
          <span className="pcard__price-amt">{tier.price}</span>
          <span className="pcard__price-cadence">{tier.cadence}</span>
        </div>
        <div className="pcard__divider" />
        <ul className="pcard__features">
          {tier.features.map((f, i) => (
            <li key={i}>{Icons.check} <span>{f}</span></li>
          ))}
        </ul>
        <Link to="/contact" className={`btn ${tier.featured ? "btn--accent" : "btn--outline"} btn--full pcard__cta`}>
          {PRIMARY_CTA} {Icons.arrow}
        </Link>
      </article>
    </Reveal>
  );
}

// ── Pricing ladder block (reused on Home + Services) ──
function PricingLadder() {
  return (
    <div className="pcards pcards--3">
      {TIERS.map((t, i) => (
        <PricingTier key={t.id} tier={t} delay={i * 90} />
      ))}
    </div>
  );
}

// ── FAQ accordion (prompt §3.10) — native <details> for keyboard a11y ──
function FAQAccordion() {
  return (
    <div className="faq">
      {FAQ.map((item, i) => (
        <Reveal key={i} delay={i * 40}>
          <details className="faq__item">
            <summary className="faq__q">
              <span>{item.q}</span>
              <span className="faq__icon" aria-hidden="true" />
            </summary>
            <div className="faq__a"><p>{item.a}</p></div>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

// ── Founder section (prompt §3.6a) ──
function FounderSection() {
  return (
    <section className="section section--alt">
      <div className="container">
        <div className="founder">
          <Reveal className="founder__media">
            <img
              src={HEADSHOT}
              alt="Charlie Eadie, founder of Command Applications"
              className="founder__photo"
              loading="lazy"
              width={520}
              height={520}
            />
          </Reveal>
          <Reveal delay={100} className="founder__content">
            <span className="kicker">Why veteran-led actually means something here</span>
            <h2>Veteran-led isn&apos;t a badge. It&apos;s how the work gets done.</h2>
            <p>Elite training, real combat leadership, and current hands-on work building AI inside a venture-backed company mean the systems we install are scoped, built, and supported with operator-grade accountability. This is the standard your engagement is held to.</p>
            <ul className="founder__creds">
              <li>{Icons.check} <span><strong>West Point graduate, #2 in class</strong> — led in one of the most demanding leadership environments in the world.</span></li>
              <li>{Icons.check} <span><strong>Marshall Scholar</strong> — LSE &amp; King&apos;s College London.</span></li>
              <li>{Icons.check} <span><strong>Airborne Ranger, combat veteran</strong> — Iraq &amp; Afghanistan. The discipline behind &ldquo;we don&apos;t leave until it works.&rdquo;</span></li>
              <li>{Icons.check} <span><strong>Chief Growth Officer at a venture-backed AI company</strong> — applied AI and data, every day.</span></li>
              <li>{Icons.check} <span><strong>Founder &amp; builder of BipolarAware</strong> — ships real, production-grade AI products.</span></li>
            </ul>
            <p className="founder__personal">Charlie is also a cancer survivor, an openly bipolar mental-health advocate, and a keynote speaker — the same lived experience that drives BipolarAware.</p>
            <div className="founder__links">
              <a href={SITE.founderSite} target="_blank" rel="noopener" className="founder__link">Read the full story {Icons.external}</a>
              <Link to="/work" className="founder__link">See BipolarAware {Icons.arrow}</Link>
            </div>
            <div className="founder__cta">
              <Link to="/contact" className="btn btn--accent">{PRIMARY_CTA} {Icons.arrow}</Link>
              <a href={SITE.linkedin} target="_blank" rel="noopener" className="btn btn--outline">{Icons.linkedin} Connect on LinkedIn</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// The Command Method stages (prompt §3.7) — shared by Home preview + /method.
const METHOD_STAGES = [
  { num: "01", name: "Recon", desc: "We map your workflows, bottlenecks, and the highest-ROI opportunities.", deliverable: "Prioritized AI build queue" },
  { num: "02", name: "Foundations", desc: "We connect your existing tools and data into one operating layer.", deliverable: "Working AIOS backbone" },
  { num: "03", name: "Build", desc: "We build the automations, agents, and internal tools your team actually uses.", deliverable: "Deployed systems, not demos" },
  { num: "04", name: "Install & Train", desc: "We roll it out, train your team, and document everything.", deliverable: "Adoption, not orphaned projects" },
  { num: "05", name: "Hold the Line", desc: "Ongoing support, monitoring, and iteration.", deliverable: "Systems that keep working" },
];

/* ═══════════════════════════════════════════
   PAGE: HOME
   ═══════════════════════════════════════════ */
function HomePage() {
  const pillars = [
    { icon: Icons.automate, name: "Install", tagline: "Automate the work slowing your team down.", body: "We wire AI into your real workflows so the repeatable, manual work runs itself.", mockup: "workflow" },
    { icon: Icons.acquire, name: "Acquire", tagline: "Turn AI into more revenue and pipeline.", body: "Outreach, qualification, and follow-up that keep your pipeline moving while you sleep.", mockup: "inbox" },
    { icon: Icons.support, name: "Support", tagline: "A veteran-led team that stays until it works.", body: "We don't hand over a deck and disappear. We deploy, train, and hold the line.", mockup: "team" },
    { icon: Icons.scale, name: "Scale", tagline: "Compound early wins into an operating advantage.", body: "Each module builds on the last until your whole operation moves faster.", mockup: "chart" },
  ];
  return (
    <main>
      {/* ── Hero (§3.1) ── */}
      <section className="hero">
        <div className="hero__bg-grid" />
        <div className="container hero__inner">
          <Reveal>
            <div className="hero__badge">
              <img src="/assets/SDVOSB.png" alt="SDVOSB Certified" className="sdvosb-hero-seal" loading="eager" />
              <span>SDVOSB Certified · Veteran-Led AI &amp; Automation Partner</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero__h1">
              Build the <span className="hero__h1-accent">AI Operating System</span> your business runs on.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero__sub">
              We help founders and operators identify, build, and install AI systems so your team
              moves faster, kills manual work, and creates leverage — without adding complexity.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <CredentialChips className="chips--hero" />
          </Reveal>
          <Reveal delay={300}>
            <div className="hero__cta">
              <Link to="/contact" className="btn btn--accent btn--lg">{PRIMARY_CTA} {Icons.arrow}</Link>
              <p className="hero__cta-micro">45-minute call to find where AI actually fits your business.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust / credibility bar (§3.2) ── */}
      <div className="trust-bar">
        <div className="container">
          <div className="trust-bar__inner">
            {[
              "SDVOSB Certified",
              "Veteran-Owned",
              "West Point · Marshall Scholar",
              "Airborne Ranger · Combat Veteran",
              "Builds with the tools your business already trusts",
            ].map((item, i, arr) => (
              <span key={item} className="trust-bar__group">
                <span className="trust-bar__item">{item}</span>
                {i < arr.length - 1 && <span className="trust-bar__dot" aria-hidden="true" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Positioning statement (§3.3) ── */}
      <section className="section">
        <div className="container">
          <div className="positioning">
            <Reveal className="positioning__main">
              <span className="kicker">The Thesis</span>
              <h2>Stop buying scattered AI tools. Install the system your business runs on.</h2>
              <p>{AIOS_DEFINITION}</p>
            </Reveal>
            <Reveal delay={120} className="positioning__aside">
              {/* TestimonialPlaceholder — never fabricate a quote (prompt §1, §3.3). */}
              <div className="placeholder-box">
                <span className="placeholder-box__tag">REPLACE</span>
                <p>Client testimonial goes here. Pull a real quote from an engagement before shipping — do not invent one.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Four outcome pillars (§3.4) ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">What You Get</span>
              <h2>Four outcomes, installed and supported</h2>
              <p className="section__lead">Not features. Outcomes — wired into how your business already works.</p>
            </div>
          </Reveal>
          <div className="cards-grid cards-grid--4">
            {pillars.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <div className="pillar">
                  <div className="card__icon">{p.icon}</div>
                  <h3>{p.name}</h3>
                  <p className="pillar__tagline">{p.tagline}</p>
                  <p className="pillar__body">{p.body}</p>
                  <MockupChip kind={p.mockup} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Offer ladder: three AI Engine tiers (§3.5) ── */}
      <section className="section" id="pricing">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">Where To Start</span>
              <h2>Three AI Engine tiers. Pick your ambition.</h2>
              <p className="section__lead">Every tier is a connected set of modules we build, install, and support. Prices scale with scope — start where it makes sense and compound from there.</p>
            </div>
          </Reveal>
          <PricingLadder />
        </div>
      </section>

      {/* ── Who we help (§3.6) ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">Who We Help</span>
              <h2>Built for teams that want AI installed — not another tool to play with</h2>
            </div>
          </Reveal>
          <div className="cards-grid cards-grid--3">
            {[
              { title: "Small & Mid-Sized Businesses", desc: "You know AI matters but have no team to install it. We become that team." },
              { title: "Operations-Heavy Teams", desc: "Drowning in manual processes and spreadsheets. We automate what's slowing you down." },
              { title: "Founder-Led Companies", desc: "Moving fast with limited resources. We build the highest-leverage systems first." },
              { title: "Professional Services Firms", desc: "Client delivery, reporting, and internal ops — all ripe for an operating layer." },
              { title: "Government-Adjacent Orgs", desc: "You need a trusted, SDVOSB-certified partner with a security mindset." },
              { title: "Teams Ready to Act", desc: "Past the curiosity phase. You want systems running, not next quarter." },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="card card--flat">
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder (§3.6a) ── */}
      <FounderSection />

      {/* ── The Command Method (§3.7) ── */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">The Command Method</span>
              <h2>A disciplined path from messy workflows to systems that run themselves</h2>
            </div>
          </Reveal>
          <div className="steps">
            {METHOD_STAGES.slice(0, 3).map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div className="step">
                  <span className="step__num">{s.num}</span>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <span className="step__deliverable">{Icons.check} {s.deliverable}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="section__cta-row">
              <Link to="/method" className="btn btn--outline">See the full Command Method {Icons.arrow}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Fit Check (§3.8) ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">Fit Check</span>
              <h2>Let&apos;s be honest about whether this is a fit</h2>
            </div>
          </Reveal>
          <div className="fitcheck">
            <Reveal className="fitcheck__col fitcheck__col--yes">
              <h3>This is for you if…</h3>
              <ul>
                {[
                  "You want AI installed into how your business runs, not another app to try",
                  "You want to automate the manual work slowing your team down",
                  "You want measurable ROI — hours saved, margin improved — not flashy demos",
                  "You want a partner who builds and supports, not one who hands over a deck",
                  "You're ready to move now, not 'someday'",
                ].map((t, i) => (
                  <li key={i}><span className="fitcheck__icon fitcheck__icon--yes">{Icons.check}</span><span>{t}</span></li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100} className="fitcheck__col fitcheck__col--no">
              <h3>This is not for you if…</h3>
              <ul>
                {[
                  "You want done-for-you with zero involvement from your team",
                  "You only want to chase the newest AI app each week",
                  "You don't care about measurable outcomes",
                  "You want a one-off prototype with no intention to operate it",
                  "You're looking for the cheapest possible vendor, not a partner",
                ].map((t, i) => (
                  <li key={i}><span className="fitcheck__icon fitcheck__icon--no">{Icons.x}</span><span>{t}</span></li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <div className="section__cta-row">
              <Link to="/contact" className="btn btn--accent btn--lg">{PRIMARY_CTA} {Icons.arrow}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Featured work (§3.9) ── */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">Featured Work</span>
              <h2>BipolarAware — a production-grade AI product, built end to end</h2>
              <p className="section__lead">The flagship build that shows how we take a complex problem and ship a real, AI-powered system.</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="case-highlight">
              <div className="case-highlight__grid">
                <div className="case-highlight__item">
                  <h4>The Problem</h4>
                  <p>People living with bipolar disorder lack accessible daily tools to track mood patterns, spot early warning signs, and share structured data with care providers.</p>
                </div>
                <div className="case-highlight__item">
                  <h4>The Solution</h4>
                  <p>A platform combining structured mood tracking, AI-driven pattern analysis, configurable alerting for care teams, and a calm, trustworthy interface.</p>
                </div>
                <div className="case-highlight__item">
                  <h4>Capabilities Demonstrated</h4>
                  <p>Product strategy, applied AI, workflow and alerting logic, user-centered UX, and full-stack delivery.</p>
                </div>
                <div className="case-highlight__item">
                  <h4>Why It Matters</h4>
                  <p>It proves we take complex, sensitive problems and ship working software — the same approach we bring to every engagement.</p>
                </div>
              </div>
              <div className="case-highlight__cta">
                <Link to="/work" className="btn btn--accent">See full case study {Icons.arrow}</Link>
              </div>
            </div>
          </Reveal>
          <div className="cards-grid cards-grid--3" style={{ marginTop: 24 }}>
            {[1, 2, 3].map((n) => (
              <Reveal key={n} delay={n * 70}>
                <div className="card card--flat card--placeholder">
                  <span className="card__status">REPLACE</span>
                  <h3>Client win #{n}</h3>
                  <p>Real client case study slot. Add the engagement, the workflow installed, and the measured outcome as wins land.</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (§3.10) ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">FAQ</span>
              <h2>Straight answers</h2>
            </div>
          </Reveal>
          <div className="faq-wrap">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* ── Final CTA band (§3.11) ── */}
      <CTASection headline="Ready to put AI to work?" sub={SITE.oneLiner} />
    </main>
  );
}

// ── Small illustrative UI mockups for the pillars (§3.4). Decorative only. ──
function MockupChip({ kind }) {
  if (kind === "workflow") {
    return (
      <div className="mockup mockup--flow" aria-hidden="true">
        <span className="mockup__node">New lead</span>
        <span className="mockup__arrow">→</span>
        <span className="mockup__node">Qualify</span>
        <span className="mockup__arrow">→</span>
        <span className="mockup__node">CRM sync</span>
        <span className="mockup__arrow">→</span>
        <span className="mockup__node mockup__node--accent">Booked call</span>
      </div>
    );
  }
  if (kind === "inbox") {
    return (
      <div className="mockup mockup--inbox" aria-hidden="true">
        <div className="mockup__row"><span className="mockup__dot" /> Reply drafted</div>
        <div className="mockup__row"><span className="mockup__dot" /> Follow-up sent</div>
        <div className="mockup__row"><span className="mockup__dot mockup__dot--accent" /> Meeting booked</div>
      </div>
    );
  }
  if (kind === "team") {
    return (
      <div className="mockup mockup--team" aria-hidden="true">
        <div className="mockup__avatars"><span /><span /><span /></div>
        <div className="mockup__status"><span className="mockup__pulse" /> Build team · online</div>
      </div>
    );
  }
  return (
    <div className="mockup mockup--chart" aria-hidden="true">
      <span className="mockup__bar" style={{ height: "30%" }} />
      <span className="mockup__bar" style={{ height: "52%" }} />
      <span className="mockup__bar" style={{ height: "68%" }} />
      <span className="mockup__bar mockup__bar--accent" style={{ height: "92%" }} />
      <em className="mockup__note">illustrative</em>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE: SERVICES ("What we install")
   ═══════════════════════════════════════════ */
function ServicesPage() {
  const pillars = [
    { name: "Install", tagline: "Automate the work slowing your team down.", body: "We map the repeatable, manual workflows eating your team's hours, then wire AI and automation into your existing stack so they run without anyone babysitting them." },
    { name: "Acquire", tagline: "Turn AI into more revenue and pipeline.", body: "Lead capture, qualification, outreach, and follow-up — automated and consistent — so your pipeline keeps moving and nothing slips through the cracks." },
    { name: "Support", tagline: "A veteran-led team that stays until it works.", body: "We deploy, train your people, and stay on to monitor and iterate. No orphaned projects, no 'good luck' handoff." },
    { name: "Scale", tagline: "Compound early wins into an operating advantage.", body: "Each module builds on the last. What starts as one automated workflow becomes an operating layer across how you sell, operate, deliver, and report." },
  ];
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">What We Install</span></Reveal>
          <Reveal delay={60}><h1>The AI Operating System, broken into what you actually get</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">Four outcomes and three tiers. We install a connected operating layer across your business — built, deployed, and supported by a veteran-led team.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">The Pillars</span>
              <h2>Four outcomes we install</h2>
            </div>
          </Reveal>
          <div className="service-detail__body" style={{ maxWidth: "none" }}>
            {pillars.map((p, i) => (
              <Reveal key={p.name} delay={i * 60}>
                <div className="service-pillar">
                  <h3>{p.name}</h3>
                  <p className="service-pillar__tagline">{p.tagline}</p>
                  <p className="service-pillar__body">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" id="pricing">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">The Offer Ladder</span>
              <h2>Three AI Engine tiers</h2>
              <p className="section__lead">Start where it makes sense and compound from there. Every tier is built, installed, and supported — not just advised.</p>
            </div>
          </Reveal>
          <PricingLadder />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="faq-wrap">
            <Reveal>
              <div className="section__header">
                <span className="kicker">FAQ</span>
                <h2>Common questions</h2>
              </div>
            </Reveal>
            <FAQAccordion />
          </div>
        </div>
      </section>

      <CTASection headline="Not sure which tier fits?" sub="Most engagements start with a 45-minute call. Tell us what's slowing your team down, and we'll point you to the right starting tier." />
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: METHOD (The Command Method)
   ═══════════════════════════════════════════ */
function MethodPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">The Command Method</span></Reveal>
          <Reveal delay={60}><h1>How we install an AI Operating System that actually sticks</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">A disciplined, five-stage build path. Each stage ships a concrete deliverable — so you always know what you have and what comes next.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="method-list">
            {METHOD_STAGES.map((s, i) => (
              <Reveal key={s.num} delay={i * 70}>
                <div className="method-stage">
                  <div className="method-stage__num">{s.num}</div>
                  <div className="method-stage__body">
                    <h2>{s.name}</h2>
                    <p>{s.desc}</p>
                    <div className="method-stage__deliverable">
                      <span className="method-stage__deliverable-label">What you&apos;ll have</span>
                      <span className="method-stage__deliverable-value">{Icons.check} {s.deliverable}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection headline="Start with Recon" sub="The first stage is a conversation and a map of your highest-ROI opportunities. Book a call and we'll begin." />
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: WORK / CASE STUDIES
   ═══════════════════════════════════════════ */
function WorkPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">Our Work</span></Reveal>
          <Reveal delay={60}><h1>Real products. Real capabilities. Real proof.</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">We build systems that solve actual problems. Here&apos;s our flagship build — with client case studies landing as engagements complete.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="case-study">
              <div className="case-study__label">Flagship Build</div>
              <h2 className="case-study__title">BipolarAware</h2>
              <p className="case-study__subtitle">AI-Enabled Mental Health Support Platform</p>

              <div className="case-study__section">
                <h3>Challenge</h3>
                <p>People living with bipolar disorder face a daily challenge: tracking mood patterns, recognizing early warning signs of manic or depressive episodes, and communicating meaningful data to care providers. Most existing tools are either too simplistic to be useful or too clinical to encourage consistent use.</p>
              </div>

              <div className="case-study__section">
                <h3>Solution Concept</h3>
                <p>BipolarAware combines daily structured mood and behavior tracking, AI-powered pattern recognition that identifies trends and early warning signs, configurable alerts that notify care teams when concerning patterns emerge, and an intuitive, calming interface designed to encourage consistent daily use.</p>
              </div>

              <div className="case-study__section">
                <h3>Capabilities Demonstrated</h3>
                <div className="case-study__caps">
                  {[
                    { title: "Product Strategy", desc: "Defined the vision, user needs, and feature prioritization for a sensitive, complex problem space." },
                    { title: "User-Centered Design", desc: "Balanced clinical utility with approachability to drive consistent engagement." },
                    { title: "Applied AI", desc: "Pattern analysis that surfaces actionable insights from self-reported behavioral data." },
                    { title: "Workflow & Alerting", desc: "Configurable notification systems that connect users to their support network." },
                    { title: "Full-Stack Delivery", desc: "A working application from database design through frontend to deployment." },
                    { title: "Reporting & Dashboards", desc: "Structured views that turn raw entries into meaningful trends." },
                  ].map((c, i) => (
                    <div key={i} className="case-study__cap">
                      <h4>{c.title}</h4>
                      <p>{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="case-study__section">
                <h3>Why It Matters for Clients</h3>
                <p>BipolarAware shows exactly what we deliver: the ability to take a complex, ambiguous problem, define a clear vision, and build a working system that combines thoughtful design with practical AI. That&apos;s the caliber of work we bring to every engagement.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">More Work</span>
              <h2>Client case studies</h2>
              <p className="section__lead">Placeholders for real client wins. Each will document the workflow installed and the measured outcome.</p>
            </div>
          </Reveal>
          <div className="cards-grid cards-grid--3">
            {[
              { title: "Workflow Automation", desc: "Manual work removed for an operations-heavy team." },
              { title: "Acquisition Engine", desc: "Outreach and qualification automated for a founder-led company." },
              { title: "Internal Operations Tool", desc: "A custom dashboard and alerting system for a growing team." },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="card card--flat card--placeholder">
                  <span className="card__status">REPLACE</span>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection headline="Have a project in mind?" sub="Whether it's a workflow problem, an acquisition gap, or an AI idea to validate — we'd like to hear about it." />
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: ABOUT (prompt §8)
   ═══════════════════════════════════════════ */
function AboutPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">About Command Applications</span></Reveal>
          <Reveal delay={60}><h1>Built by an operator. Run with discipline.</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">Veteran-led changes how AI gets delivered: scoped like a mission, built to standard, and supported until it works.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-split">
            <Reveal className="about-split__media">
              <img src={HEADSHOT} alt="Charlie Eadie, founder of Command Applications" className="founder__photo" loading="lazy" width={520} height={520} />
            </Reveal>
            <Reveal delay={100} className="about-split__content">
              <h2>The founder</h2>
              <p>Command Applications is led by a founder whose record makes &ldquo;veteran-led discipline&rdquo; literal, not decorative: a West Point graduate ranked #2 in class, a Marshall Scholar at LSE and King&apos;s College London, an Airborne Ranger and combat veteran of Iraq and Afghanistan.</p>
              <p>Today he serves as Chief Growth Officer at a venture-backed AI company and builds BipolarAware, a production-grade AI mental-health platform. That combination — elite training, real combat leadership, and current hands-on AI work — means the systems we install are scoped, built, and supported with operator-grade accountability.</p>
              <p>This is the standard your engagement is held to.</p>
              <ul className="founder__creds">
                <li>{Icons.check} <span>West Point graduate, #2 in class</span></li>
                <li>{Icons.check} <span>Marshall Scholar — LSE &amp; King&apos;s College London</span></li>
                <li>{Icons.check} <span>Airborne Ranger; combat deployments to Iraq &amp; Afghanistan</span></li>
                <li>{Icons.check} <span>Chief Growth Officer, venture-backed AI company</span></li>
                <li>{Icons.check} <span>Founder of Command Applications &amp; BipolarAware</span></li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="about-story__block" style={{ maxWidth: 760 }}>
              <h2>The fuller story, briefly</h2>
              <p>Charlie is also a cancer survivor, an openly bipolar mental-health advocate, and a keynote speaker. That lived experience is the authentic root of BipolarAware and of this company&apos;s mission. We keep it brief here on purpose — if you want the full arc, it lives on the speaker site.</p>
              <a href={SITE.founderSite} target="_blank" rel="noopener" className="founder__link">Read the full story {Icons.external}</a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="sdvosb-section">
              <div className="sdvosb-section__badge">
                <img src="/assets/SDVOSB.png" alt="Service Disabled Veteran Owned Small Business (SDVOSB) Certified" className="sdvosb-about-seal" loading="lazy" />
              </div>
              <div className="sdvosb-section__content">
                <h2>Why an SDVOSB is a better AI partner</h2>
                <p>As a Service-Disabled Veteran-Owned Small Business, we bring an operational mindset, a security-first habit, and accountability for outcomes — not just deliverables. For SMBs and government-adjacent organizations with veteran-friendly procurement goals, set-aside contracts, or supplier-diversity requirements, working with us helps meet those objectives while getting experienced, high-quality delivery.</p>
                <p>Our SDVOSB status reflects the discipline and mission-first mindset we bring to every engagement.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection headline="Work with a team that delivers" sub="Veteran-led discipline, applied to AI. Let's talk about what you're trying to accomplish." />
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: CONTACT (Booking & lead flow, prompt §7)
   ═══════════════════════════════════════════ */
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", interest: "", message: "" });
  const [source, setSource] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-tag lead source (e.g. the "Get an AI Opportunity Audit" secondary CTA).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search).get("source");
    if (s) {
      setSource(s);
      if (s === "audit") setForm((f) => ({ ...f, interest: "audit" }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, org: form.company, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send message.");
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Sorry — something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">{PRIMARY_CTA}</span></Reveal>
          <Reveal delay={60}><h1>Find where AI actually fits your business</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">A 45-minute call — no pitch, no pressure. We&apos;ll map where AI and automation can make an immediate, measurable difference, and recommend a clear next step.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            <Reveal>
              <div className="contact-info">
                <h2>Book a strategy call</h2>
                <p>Pick a time that works for you. Prefer to write first? Use the form and we&apos;ll reply within one business day.</p>
                {SCHEDULER_URL ? (
                  <div className="scheduler-embed">
                    <iframe
                      src={SCHEDULER_URL}
                      title="Book a strategy call"
                      loading="lazy"
                      className="scheduler-embed__frame"
                    />
                  </div>
                ) : (
                  <div className="placeholder-box placeholder-box--scheduler">
                    <span className="placeholder-box__tag">REPLACE</span>
                    <p>Scheduler embed goes here. Set <code>NEXT_PUBLIC_SCHEDULER_URL</code> to your Cal.com booking link and it will render automatically. Until then, the form is the booking path.</p>
                  </div>
                )}
                <div className="contact-info__items">
                  <div className="contact-info__item">
                    {Icons.mail}
                    <div>
                      <strong>Email</strong>
                      <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="contact-form-wrap">
                {submitted ? (
                  <div className="contact-form-success">
                    <div className="contact-form-success__icon">✓</div>
                    <h3>Message received</h3>
                    <p>Thanks for reaching out. We&apos;ll review your message and get back to you within one business day.</p>
                  </div>
                ) : (
                  <div>
                    <h3>Or tell us what&apos;s slowing you down</h3>
                    <form className="contact-form" onSubmit={handleSubmit} noValidate>
                      <div className="form-group">
                        <label htmlFor="contact-name">Your Name *</label>
                        <input id="contact-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Jane Smith" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-email">Email Address *</label>
                        <input id="contact-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="jane@company.com" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-company">Company</label>
                        <input id="contact-company" type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-interest">What are you interested in?</label>
                        <select id="contact-interest" value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })}>
                          <option value="">Select an option</option>
                          <option value="audit">AI Opportunity Audit</option>
                          <option value="core">Core AI Engine</option>
                          <option value="pro">Pro AI Engine</option>
                          <option value="complete">Complete AI Engine</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>
                      <div className="form-group form-group--full">
                        <label htmlFor="contact-message">What&apos;s the biggest manual workflow you&apos;d want gone? *</label>
                        <textarea id="contact-message" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Describe the repetitive work eating your team's time." />
                      </div>
                      {error ? <p style={{ gridColumn: "1 / -1", color: "var(--danger)", marginTop: 8 }}>{error}</p> : null}
                      <button
                        type="submit"
                        className="btn btn--accent btn--lg btn--full"
                        disabled={submitting}
                        aria-disabled={submitting}
                        style={submitting ? { opacity: 0.8, cursor: "not-allowed" } : undefined}
                      >
                        {submitting ? "Sending..." : "Send Message"} {Icons.arrow}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ═══════════════════════════════════════════
   APP SHELL + STYLES
   ═══════════════════════════════════════════ */
const STYLES = `
/* ── CSS Reset & Variables ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg: #0B0F14;
  --bg-alt: #0F1319;
  --surface: #161C24;
  --surface-2: #1D2530;
  --border: #252D38;
  --text: #E8ECF1;
  --text-muted: #8896A7;
  --accent: #3B82F6;
  --accent-hover: #60A5FA;
  --accent-glow: rgba(59,130,246,0.15);
  --accent-2: #10B981;
  --warm: #F59E0B;
  --danger: #EF4444;
  --radius: 8px;
  --radius-lg: 16px;
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --max-w: 1200px;
  --nav-h: 72px;
}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;background:var(--bg)}
body{font-family:var(--font-body);color:var(--text);background:var(--bg);line-height:1.65;font-size:16px}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
h1,h2,h3,h4{font-family:var(--font-display);font-weight:700;line-height:1.2;letter-spacing:-0.02em}
ul{list-style:none}
input,textarea,select,button{font-family:inherit;font-size:inherit}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}

/* ── Utility ── */
.container{max-width:var(--max-w);margin:0 auto;padding:0 24px}
.kicker{font-family:var(--font-mono);font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);font-weight:600;display:block;margin-bottom:12px}

/* ── Reveal Animation ── */
.reveal-up{opacity:0;transform:translateY(28px);transition:opacity 0.6s ease,transform 0.6s ease}
.reveal-up.revealed{opacity:1;transform:translateY(0)}
@media(prefers-reduced-motion:reduce){.reveal-up{opacity:1;transform:none}}

/* ── Navbar ── */
.navbar{position:fixed;top:0;left:0;right:0;z-index:100;height:var(--nav-h);display:flex;align-items:center;transition:background 0.3s,backdrop-filter 0.3s,box-shadow 0.3s}
.navbar--scrolled{background:rgba(11,15,20,0.85);backdrop-filter:blur(16px);box-shadow:0 1px 0 var(--border)}
.navbar__inner{display:flex;align-items:center;justify-content:space-between;width:100%}
.navbar__logo{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:700}
.navbar__logo-img{height:36px;width:auto;max-width:220px;object-fit:contain;display:block;flex-shrink:0}
.navbar__logo-img--icon{height:40px;max-width:40px}
.navbar__logo--footer .navbar__logo-img--icon{height:44px;max-width:44px}
.navbar__logo-text{font-size:14px;line-height:1.2;letter-spacing:0.01em;color:var(--text)}
.navbar__logo-text span{color:var(--text-muted);font-weight:400}
@media(max-width:480px){.navbar__logo-img--icon{height:34px;max-width:34px}.navbar__logo-text{font-size:12px}}
.navbar__links{display:flex;align-items:center;gap:32px}
.navbar__link{font-size:14px;font-weight:500;color:var(--text-muted);transition:color 0.2s}
.navbar__link:hover{color:var(--text)}
.navbar__toggle{display:none;background:none;border:none;color:var(--text);cursor:pointer}
@media(max-width:768px){
  .navbar__links{position:fixed;inset:0;top:var(--nav-h);background:var(--bg);flex-direction:column;align-items:flex-start;padding:32px 24px;gap:24px;transform:translateX(100%);transition:transform 0.3s;z-index:99}
  .navbar__links--open{transform:translateX(0)}
  .navbar__link{font-size:18px}
  .navbar__toggle{display:block}
}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-display);font-weight:600;font-size:15px;padding:12px 24px;border-radius:var(--radius);border:none;cursor:pointer;transition:all 0.2s;white-space:nowrap}
.btn--accent{background:var(--accent);color:#fff}
.btn--accent:hover{background:var(--accent-hover);box-shadow:0 0 24px var(--accent-glow)}
.btn--outline{background:transparent;border:1.5px solid var(--border);color:var(--text)}
.btn--outline:hover{border-color:var(--accent);color:var(--accent)}
.btn--lg{padding:14px 28px;font-size:16px}
.btn--sm{padding:8px 18px;font-size:13px}
.btn--full{width:100%;justify-content:center}
.btn svg{flex-shrink:0}

/* ── SDVOSB Badge ── */
.sdvosb-hero-seal{height:20px;width:auto;display:block}
.sdvosb-about-seal{height:64px;width:auto;display:block}
.sdvosb-footer-seal{height:56px;width:auto;display:block}

/* ── Credential chips ── */
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chips--hero{margin-bottom:36px;max-width:680px}
.chip{font-family:var(--font-mono);font-size:11.5px;letter-spacing:0.04em;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);padding:6px 12px;border-radius:999px}

/* ── Hero ── */
.hero{position:relative;padding:160px 0 90px;overflow:hidden;display:flex;align-items:center}
.hero__bg-grid{position:absolute;inset:0;background-image:
  linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),
  linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px);
  background-size:64px 64px;
  mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,black 20%,transparent 100%)}
.hero__inner{position:relative;z-index:1;max-width:860px}
.hero__badge{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font-size:13px;color:var(--text-muted);margin-bottom:28px}
.hero__h1{font-size:clamp(2.4rem,5.5vw,4.1rem);margin-bottom:24px;color:var(--text);line-height:1.08}
.hero__h1-accent{color:var(--accent)}
.hero__sub{font-size:clamp(1.05rem,2vw,1.25rem);color:var(--text-muted);max-width:660px;margin-bottom:28px;line-height:1.7}
.hero__cta{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.hero__cta-micro{font-size:0.9rem;color:var(--text-muted)}
@media(max-width:768px){.hero{padding:120px 0 56px}}

/* ── Page Hero (inner pages) ── */
.page-hero{padding:140px 0 60px;border-bottom:1px solid var(--border)}
.page-hero h1{font-size:clamp(2rem,4.5vw,3rem);max-width:820px;margin-bottom:16px}
.page-hero__sub{font-size:clamp(1rem,1.8vw,1.15rem);color:var(--text-muted);max-width:680px;line-height:1.7}

/* ── Sections ── */
.section{padding:96px 0}
.section--alt{background:var(--bg-alt)}
.section__header{max-width:760px;margin-bottom:56px}
.section__header h2{font-size:clamp(1.8rem,3.5vw,2.4rem);margin-bottom:16px}
.section__lead{font-size:1.05rem;color:var(--text-muted);line-height:1.7;max-width:640px}
.section__cta-row{margin-top:40px;text-align:center}

/* ── Trust bar ── */
.trust-bar{background:var(--bg-alt);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.trust-bar__inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px 16px;padding:18px 24px}
.trust-bar__group{display:inline-flex;align-items:center;gap:12px 16px}
.trust-bar__item{font-size:0.8rem;letter-spacing:0.03em;color:var(--text-muted)}
.trust-bar__dot{width:4px;height:4px;border-radius:50%;background:var(--text-muted);opacity:0.45;flex-shrink:0}
@media(max-width:600px){.trust-bar__inner{flex-direction:column;gap:8px}.trust-bar__dot{display:none}}

/* ── Positioning ── */
.positioning{display:grid;grid-template-columns:1.5fr 1fr;gap:48px;align-items:center}
.positioning__main h2{font-size:clamp(1.8rem,3.2vw,2.4rem);margin-bottom:20px}
.positioning__main p{color:var(--text-muted);line-height:1.8;font-size:1.05rem}
@media(max-width:860px){.positioning{grid-template-columns:1fr;gap:32px}}

/* ── Placeholder boxes (testimonial / scheduler / stat) ── */
.placeholder-box{position:relative;border:1.5px dashed var(--border);border-radius:var(--radius-lg);padding:28px;background:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.012) 10px,rgba(255,255,255,0.012) 20px)}
.placeholder-box p{color:var(--text-muted);font-size:0.95rem;line-height:1.6}
.placeholder-box code{font-family:var(--font-mono);font-size:0.85em;color:var(--accent);background:var(--surface);padding:2px 6px;border-radius:4px}
.placeholder-box__tag{display:inline-block;font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.12em;color:var(--warm);border:1px solid rgba(245,158,11,0.35);background:rgba(245,158,11,0.1);padding:3px 8px;border-radius:4px;margin-bottom:12px}
.placeholder-box--scheduler{margin:24px 0}

/* ── Cards ── */
.cards-grid{display:grid;gap:20px}
.cards-grid--4{grid-template-columns:repeat(4,1fr)}
.cards-grid--3{grid-template-columns:repeat(3,1fr)}
.cards-grid--2{grid-template-columns:repeat(2,1fr)}
@media(max-width:900px){.cards-grid--4,.cards-grid--3{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.cards-grid--4,.cards-grid--3,.cards-grid--2{grid-template-columns:1fr}}
.card{display:block;padding:28px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border);transition:all 0.25s;height:100%}
.card:hover{border-color:var(--accent);box-shadow:0 0 32px var(--accent-glow);transform:translateY(-2px)}
.card__icon{width:52px;height:52px;border-radius:12px;background:var(--accent-glow);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:16px}
.card h3{font-size:1.1rem;margin-bottom:10px;color:var(--text)}
.card p{font-size:0.92rem;color:var(--text-muted);line-height:1.65}
.card--flat{background:var(--surface);cursor:default}
.card--flat:hover{transform:none;box-shadow:none}
.card--placeholder{opacity:0.75;border-style:dashed}
.card__status{display:inline-block;font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.12em;color:var(--warm);border:1px solid rgba(245,158,11,0.35);background:rgba(245,158,11,0.1);padding:3px 8px;border-radius:4px;margin-bottom:12px}

/* ── Pillar cards (with mockups) ── */
.pillar{display:flex;flex-direction:column;padding:28px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border);height:100%;transition:all 0.25s}
.pillar:hover{border-color:var(--accent);box-shadow:0 0 32px var(--accent-glow);transform:translateY(-2px)}
.pillar h3{font-size:1.15rem;margin-bottom:8px;color:var(--text)}
.pillar__tagline{font-size:0.95rem;color:var(--text);font-weight:500;margin-bottom:8px}
.pillar__body{font-size:0.88rem;color:var(--text-muted);line-height:1.6;margin-bottom:18px}

/* ── Mockup chips ── */
.mockup{margin-top:auto;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);padding:14px;font-family:var(--font-mono);font-size:10.5px;color:var(--text-muted)}
.mockup--flow{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.mockup__node{background:var(--surface-2);border:1px solid var(--border);border-radius:5px;padding:4px 7px;white-space:nowrap}
.mockup__node--accent{background:var(--accent-glow);border-color:var(--accent);color:var(--accent-hover)}
.mockup__arrow{opacity:0.5}
.mockup--inbox{display:flex;flex-direction:column;gap:8px}
.mockup__row{display:flex;align-items:center;gap:8px}
.mockup__dot{width:7px;height:7px;border-radius:50%;background:var(--text-muted);opacity:0.5;flex-shrink:0}
.mockup__dot--accent{background:var(--accent-2);opacity:1}
.mockup--team{display:flex;align-items:center;justify-content:space-between;gap:10px}
.mockup__avatars{display:flex}
.mockup__avatars span{width:22px;height:22px;border-radius:50%;background:var(--surface-2);border:2px solid var(--surface);margin-left:-6px}
.mockup__avatars span:first-child{margin-left:0;background:var(--accent-glow)}
.mockup__status{display:flex;align-items:center;gap:6px}
.mockup__pulse{width:8px;height:8px;border-radius:50%;background:var(--accent-2)}
.mockup--chart{display:flex;align-items:flex-end;gap:8px;height:72px;position:relative}
.mockup__bar{flex:1;background:var(--surface-2);border-radius:3px 3px 0 0}
.mockup__bar--accent{background:var(--accent)}
.mockup__note{position:absolute;top:4px;right:6px;font-style:normal;font-size:9px;opacity:0.6}

/* ── Product / pricing cards ── */
.pcards{display:grid;gap:24px;align-items:stretch}
.pcards--3{grid-template-columns:repeat(3,1fr)}
.pcard-wrap{height:100%}
.pcards .reveal-up{height:100%}
@media(max-width:960px){.pcards--3{grid-template-columns:1fr;max-width:520px;margin:0 auto}}
.pcard{display:flex;flex-direction:column;height:100%;padding:32px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border);transition:transform 0.25s,border-color 0.25s,box-shadow 0.25s}
.pcard:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:0 0 32px var(--accent-glow)}
.pcard__top{display:flex;align-items:center;justify-content:flex-start;margin-bottom:16px}
.pcard__badge{font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-muted);border:1px solid var(--border);padding:5px 10px;border-radius:999px}
.pcard__name{font-size:1.4rem;color:var(--text);margin-bottom:10px}
.pcard__transformation{font-size:0.92rem;color:var(--text-muted);line-height:1.5;margin-bottom:18px}
.pcard__transformation strong{color:var(--text)}
.pcard__price{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-bottom:18px}
.pcard__price-start{font-size:0.8rem;color:var(--text-muted);width:100%}
.pcard__price-amt{font-family:var(--font-display);font-size:2.3rem;font-weight:800;letter-spacing:-0.02em;color:var(--text);line-height:1}
.pcard__price-cadence{font-size:0.9rem;color:var(--text-muted)}
.pcard__divider{height:1px;background:var(--border);margin-bottom:20px}
.pcard__features{display:flex;flex-direction:column;gap:12px;margin-bottom:28px}
.pcard__features li{display:flex;align-items:flex-start;gap:10px;color:var(--text-muted);font-size:0.92rem;line-height:1.5}
.pcard__features li svg{color:var(--accent-2);flex-shrink:0;margin-top:2px}
.pcard__cta{margin-top:auto}
.pcard--featured{position:relative;border-color:var(--accent);background:linear-gradient(180deg,rgba(59,130,246,0.08),var(--surface) 26%);box-shadow:0 0 0 1px var(--accent),0 20px 60px rgba(0,0,0,0.45)}
.pcard--featured:hover{transform:translateY(-3px);box-shadow:0 0 0 1px var(--accent),0 26px 70px rgba(0,0,0,0.55)}
.pcard--featured .pcard__badge{color:var(--accent-hover);border-color:rgba(59,130,246,0.4)}
.pcard__featured-badge{position:absolute;top:-13px;left:32px;display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.03em;padding:6px 14px;border-radius:999px;box-shadow:0 4px 16px var(--accent-glow)}
.pcard__featured-badge svg{width:13px;height:13px}
@media(min-width:961px){.pcard--featured{transform:translateY(-10px)}.pcard--featured:hover{transform:translateY(-13px)}}

/* ── Steps (method preview) ── */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.step{padding:32px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border);position:relative}
.step__num{font-family:var(--font-display);font-size:3rem;font-weight:800;color:var(--accent);opacity:0.18;position:absolute;top:16px;right:20px;line-height:1}
.step h3{font-size:1.2rem;margin-bottom:12px}
.step p{font-size:0.93rem;color:var(--text-muted);line-height:1.65;margin-bottom:14px}
.step__deliverable{display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;color:var(--accent-2);font-weight:500}
.step__deliverable svg{width:15px;height:15px;flex-shrink:0}
@media(max-width:768px){.steps{grid-template-columns:1fr}}

/* ── Method page list ── */
.method-list{display:flex;flex-direction:column;gap:20px;max-width:860px}
.method-stage{display:flex;gap:28px;padding:32px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border)}
.method-stage__num{font-family:var(--font-display);font-size:2.4rem;font-weight:800;color:var(--accent);line-height:1;flex-shrink:0;width:64px}
.method-stage__body h2{font-size:1.4rem;margin-bottom:10px}
.method-stage__body p{color:var(--text-muted);line-height:1.7;margin-bottom:16px}
.method-stage__deliverable{display:flex;flex-direction:column;gap:4px;padding:12px 16px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius)}
.method-stage__deliverable-label{font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-muted)}
.method-stage__deliverable-value{display:inline-flex;align-items:center;gap:8px;color:var(--text);font-weight:500;font-size:0.95rem}
.method-stage__deliverable-value svg{color:var(--accent-2);width:16px;height:16px;flex-shrink:0}
@media(max-width:600px){.method-stage{flex-direction:column;gap:12px;padding:24px}.method-stage__num{font-size:2rem}}

/* ── Fit Check ── */
.fitcheck{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.fitcheck__col{padding:32px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border)}
.fitcheck__col--yes{border-color:rgba(16,185,129,0.3)}
.fitcheck__col--no{border-color:rgba(239,68,68,0.25)}
.fitcheck__col h3{font-size:1.2rem;margin-bottom:20px}
.fitcheck__col ul{display:flex;flex-direction:column;gap:14px}
.fitcheck__col li{display:flex;align-items:flex-start;gap:12px;color:var(--text-muted);line-height:1.55;font-size:0.95rem}
.fitcheck__icon{flex-shrink:0;margin-top:1px}
.fitcheck__icon--yes{color:var(--accent-2)}
.fitcheck__icon--no{color:var(--danger)}
@media(max-width:768px){.fitcheck{grid-template-columns:1fr}}

/* ── Founder ── */
.founder{display:grid;grid-template-columns:0.85fr 1.15fr;gap:56px;align-items:center}
.founder__photo{width:100%;max-width:480px;border-radius:var(--radius-lg);border:1px solid var(--border);object-fit:cover;aspect-ratio:1/1}
.founder__content h2{font-size:clamp(1.6rem,3vw,2.2rem);margin-bottom:18px}
.founder__content > p{color:var(--text-muted);line-height:1.75;margin-bottom:18px;font-size:1.02rem}
.founder__creds{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}
.founder__creds li{display:flex;align-items:flex-start;gap:10px;color:var(--text-muted);line-height:1.55;font-size:0.95rem}
.founder__creds li svg{color:var(--accent-2);flex-shrink:0;margin-top:3px}
.founder__creds strong{color:var(--text)}
.founder__personal{font-size:0.95rem!important;color:var(--text-muted);font-style:italic;border-left:2px solid var(--border);padding-left:16px}
.founder__links{display:flex;flex-wrap:wrap;gap:20px;margin-bottom:28px}
.founder__link{display:inline-flex;align-items:center;gap:6px;color:var(--accent);font-weight:600;font-size:0.95rem;font-family:var(--font-display)}
.founder__link:hover{color:var(--accent-hover)}
.founder__cta{display:flex;flex-wrap:wrap;gap:12px}
@media(max-width:860px){.founder{grid-template-columns:1fr;gap:32px}.founder__photo{max-width:340px}}

/* ── About split ── */
.about-split{display:grid;grid-template-columns:0.8fr 1.2fr;gap:56px;align-items:start}
.about-split__content h2{font-size:clamp(1.5rem,2.5vw,2rem);margin-bottom:18px}
.about-split__content > p{color:var(--text-muted);line-height:1.75;margin-bottom:16px;font-size:1.02rem}
@media(max-width:860px){.about-split{grid-template-columns:1fr;gap:32px}.about-split__media{max-width:340px}}

/* ── About story / values ── */
.about-story__block h2{font-size:clamp(1.4rem,2.5vw,1.8rem);margin-bottom:16px}
.about-story__block p{color:var(--text-muted);line-height:1.75;margin-bottom:14px;font-size:1.02rem}
.sdvosb-section{display:flex;align-items:flex-start;gap:40px}
.sdvosb-section__badge{flex-shrink:0;padding-top:4px}
.sdvosb-section__content h2{font-size:1.6rem;margin-bottom:16px}
.sdvosb-section__content p{color:var(--text-muted);line-height:1.75;margin-bottom:14px;font-size:1.02rem}
@media(max-width:600px){.sdvosb-section{flex-direction:column;gap:20px}}

/* ── Services pillars ── */
.service-detail__body{display:grid;gap:20px}
.service-pillar{padding:28px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border)}
.service-pillar h3{font-size:1.3rem;margin-bottom:8px}
.service-pillar__tagline{color:var(--text);font-weight:500;margin-bottom:10px}
.service-pillar__body{color:var(--text-muted);line-height:1.7}

/* ── Case Highlight (home) ── */
.case-highlight{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:40px;overflow:hidden}
.case-highlight__grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
.case-highlight__item h4{font-size:0.95rem;color:var(--accent);margin-bottom:8px;font-family:var(--font-mono);letter-spacing:0.04em}
.case-highlight__item p{font-size:0.92rem;color:var(--text-muted);line-height:1.65}
.case-highlight__cta{text-align:center;padding-top:12px;border-top:1px solid var(--border)}
@media(max-width:600px){.case-highlight__grid{grid-template-columns:1fr}.case-highlight{padding:24px}}

/* ── Case Study (work page) ── */
.case-study{max-width:820px}
.case-study__label{font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.case-study__title{font-size:clamp(2rem,4vw,2.8rem);margin-bottom:8px}
.case-study__subtitle{font-size:1.15rem;color:var(--text-muted);margin-bottom:48px}
.case-study__section{margin-bottom:40px}
.case-study__section h3{font-size:1.1rem;color:var(--accent);margin-bottom:12px;font-family:var(--font-mono);letter-spacing:0.04em}
.case-study__section p{color:var(--text-muted);line-height:1.75;font-size:1.02rem}
.case-study__caps{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:20px}
.case-study__cap{padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.case-study__cap h4{font-size:0.95rem;margin-bottom:8px;color:var(--text)}
.case-study__cap p{font-size:0.88rem;color:var(--text-muted);line-height:1.6}
@media(max-width:600px){.case-study__caps{grid-template-columns:1fr}}

/* ── FAQ ── */
.faq-wrap{max-width:820px}
.faq{display:flex;flex-direction:column;gap:12px}
.faq__item{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.faq__q{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;cursor:pointer;font-family:var(--font-display);font-weight:600;font-size:1.02rem;color:var(--text);list-style:none}
.faq__q::-webkit-details-marker{display:none}
.faq__icon{position:relative;width:14px;height:14px;flex-shrink:0}
.faq__icon::before,.faq__icon::after{content:"";position:absolute;background:var(--accent);transition:transform 0.2s}
.faq__icon::before{top:6px;left:0;width:14px;height:2px}
.faq__icon::after{top:0;left:6px;width:2px;height:14px}
.faq__item[open] .faq__icon::after{transform:scaleY(0)}
.faq__a{padding:0 24px 22px}
.faq__a p{color:var(--text-muted);line-height:1.7;font-size:0.97rem}

/* ── CTA Section ── */
.cta-section{padding:96px 0;background:linear-gradient(180deg,var(--bg) 0%,rgba(59,130,246,0.05) 50%,var(--bg) 100%)}
.cta-section__inner{text-align:center;max-width:640px;margin:0 auto}
.cta-section__inner h2{font-size:clamp(1.8rem,3.5vw,2.4rem);margin-bottom:16px}
.cta-section__inner p{color:var(--text-muted);margin-bottom:32px;font-size:1.05rem;line-height:1.7}
.cta-section__btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.cta-section__secondary{display:inline-block;margin-top:20px;font-size:0.95rem;color:var(--text-muted);border-bottom:1px solid transparent;transition:color 0.2s,border-color 0.2s}
.cta-section__secondary:hover{color:var(--accent);border-color:var(--accent)}

/* ── Contact ── */
.contact-layout{display:grid;grid-template-columns:1fr 1.1fr;gap:64px;align-items:start}
@media(max-width:768px){.contact-layout{grid-template-columns:1fr;gap:48px}}
.contact-info h2{font-size:1.6rem;margin-bottom:16px}
.contact-info > p{color:var(--text-muted);line-height:1.7;margin-bottom:24px}
.contact-info__items{display:flex;flex-direction:column;gap:16px;margin-top:24px}
.contact-info__item{display:flex;align-items:center;gap:12px;color:var(--text-muted)}
.contact-info__item svg{color:var(--accent);flex-shrink:0}
.contact-info__item strong{display:block;font-size:0.85rem;color:var(--text);margin-bottom:2px}
.contact-info__item a{color:var(--accent);font-size:0.95rem}
.scheduler-embed{border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface)}
.scheduler-embed__frame{width:100%;height:640px;border:0;display:block}
.contact-form-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:36px}
.contact-form-wrap h3{font-size:1.2rem;margin-bottom:24px}
.contact-form{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group--full{grid-column:1/-1}
.form-group label{font-size:0.85rem;font-weight:600;color:var(--text-muted)}
.form-group input,.form-group select,.form-group textarea{padding:12px 14px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg);color:var(--text);outline:none;transition:border-color 0.2s}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--accent)}
.form-group select{-webkit-appearance:none;appearance:none}
.form-group textarea{resize:vertical}
.contact-form .btn{grid-column:1/-1;margin-top:8px}
@media(max-width:600px){.contact-form{grid-template-columns:1fr}}
.contact-form-success{text-align:center;padding:48px 24px}
.contact-form-success__icon{width:64px;height:64px;border-radius:50%;background:rgba(16,185,129,0.12);color:var(--accent-2);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin:0 auto 20px}
.contact-form-success h3{margin-bottom:12px}
.contact-form-success p{color:var(--text-muted)}

/* ── Footer ── */
.footer{padding:72px 0 36px;border-top:1px solid var(--border);background:var(--bg-alt)}
.footer__grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
.footer__tagline{font-size:0.9rem;color:var(--text-muted);line-height:1.6;margin-bottom:20px}
.footer__badge{display:flex;align-items:center;gap:10px}
.footer__col h4{font-size:0.8rem;font-family:var(--font-mono);letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px}
.footer__col a{display:block;font-size:0.9rem;color:var(--text-muted);margin-bottom:10px;transition:color 0.2s}
.footer__col a:hover{color:var(--accent)}
.footer__bottom{display:flex;justify-content:space-between;padding-top:24px;border-top:1px solid var(--border);font-size:0.82rem;color:var(--text-muted)}
.footer__legal{color:var(--warm);font-family:var(--font-mono);font-size:0.75rem;letter-spacing:0.06em}
@media(max-width:768px){.footer__grid{grid-template-columns:1fr 1fr;gap:32px}.footer__bottom{flex-direction:column;gap:8px}}
@media(max-width:500px){.footer__grid{grid-template-columns:1fr}}
`;

export default function App({ initialPath }) {
  const route = useRoute(initialPath);
  let Page;
  switch (route) {
    case "/services": Page = ServicesPage; break;
    case "/method": Page = MethodPage; break;
    case "/about": Page = AboutPage; break;
    case "/work": Page = WorkPage; break;
    case "/contact": Page = ContactPage; break;
    default: Page = HomePage;
  }
  return (
    <>
      <style>{STYLES}</style>
      <Navbar />
      <Page />
      <Footer />
    </>
  );
}
