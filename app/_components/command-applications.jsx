import { useState, useEffect, useRef, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

// Publishable key is inlined at build time (NEXT_PUBLIC_*). In Vercel this must
// be the LIVE publishable key (pk_live_…) and match the live secret key.
const STRIPE_PK =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : undefined;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

/* ─────────────────────────────────────────────
   COMMAND APPLICATIONS — Full Production Site
   5 pages: Home, Services, About, Work, Contact
   ───────────────────────────────────────────── */

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
      onClick={(e) => {
        window.scrollTo({ top: 0, behavior: "auto" });
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
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  close: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  training: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8l3 2-3 2M12 12h4"/></svg>,
  automation: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>,
  advisory: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  build: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
  phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  bolt: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2L4.09 12.7a1 1 0 00.77 1.64H11l-1 7.66 8.91-10.7a1 1 0 00-.77-1.64H12l1-7.66z"/></svg>,
  cap: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/><path d="M22 10v6"/></svg>,
  clipboard: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M9 13l2 2 4-4"/></svg>,
  cycle: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  globe: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
};

// ── Navbar ──
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About" },
    { to: "/work", label: "Work" },
    { to: "/contact", label: "Contact" },
  ];
  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <img
            src="/assets/LogoWhite.png"
            alt="Command Applications"
            className="navbar__logo-img"
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
            Book a Consultation
          </Link>
        </div>
        <button className="navbar__toggle" onClick={() => setOpen(!open)} aria-label="Menu">
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
            <div className="navbar__logo" style={{ marginBottom: 16 }}>
              <img
                src="/assets/LogoWhite.png"
                alt="Command Applications"
                className="navbar__logo-img"
                loading="lazy"
              />
              <span className="navbar__logo-text">Command<br/><span>Applications</span></span>
            </div>
            <p className="footer__tagline">Veteran-led AI &amp; automation partner.<br/>From strategy to implementation.</p>
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
            <h4>Services</h4>
            <Link to="/services">AI Training</Link>
            <Link to="/services">Workflow Automation</Link>
            <Link to="/services">AI Advisory</Link>
            <Link to="/services">Custom AI Apps</Link>
          </div>
          <div className="footer__col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/work">Our Work</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer__col">
            <h4>Get Started</h4>
            <Link to="/contact">Book a Consultation</Link>
            <Link to="/contact">Discuss Your Workflow</Link>
            <a href="mailto:contact@commandapplications.com">contact@commandapplications.com</a>
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Command Applications LLC. All rights reserved.</p>
          <p className="footer__legal">Service Disabled Veteran Owned Small Business (SDVOSB)</p>
        </div>
      </div>
    </footer>
  );
}

// ── CTA Section (reusable) ──
function CTASection({ headline, sub, primary, secondary }) {
  return (
    <section className="cta-section">
      <div className="container">
        <Reveal>
          <div className="cta-section__inner">
            <h2>{headline || "Ready to put AI to work?"}</h2>
            <p>{sub || "Tell us about your workflow challenges. We'll show you where AI and automation can make an immediate, measurable difference."}</p>
            <div className="cta-section__btns">
              <Link to="/contact" className="btn btn--accent btn--lg">{primary || "Book a Consultation"} {Icons.arrow}</Link>
              {secondary !== false && (
                <Link to="/contact" className="btn btn--outline btn--lg">{secondary || "Talk About Your Workflow"}</Link>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PAGE: HOME
   ═══════════════════════════════════════════ */
function HomePage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg-grid" />
        <div className="container hero__inner">
          <Reveal>
            <div className="hero__badge">
              <img
                src="/assets/SDVOSB.png"
                alt="SDVOSB Certified"
                className="sdvosb-hero-seal"
                loading="eager"
              />
              <span>Veteran-Led AI &amp; Automation Partner</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero__h1">
              Stop talking about AI.<br/>
              <span className="hero__h1-accent">Start using it.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero__sub">
              Command Applications helps organizations cut manual work, streamline operations,
              and turn AI ideas into working systems — with the discipline and accountability
              of a veteran-led team.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="hero__btns">
              <Link to="/contact" className="btn btn--accent btn--lg">Book a Consultation {Icons.arrow}</Link>
              <Link to="/services" className="btn btn--outline btn--lg">See Our Services</Link>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <div className="hero__proof">
              <div className="hero__proof-item">
                <strong>Training</strong><span>Hands-on AI workshops</span>
              </div>
              <div className="hero__proof-divider" />
              <div className="hero__proof-item">
                <strong>Automation</strong><span>Workflow redesign &amp; integration</span>
              </div>
              <div className="hero__proof-divider" />
              <div className="hero__proof-item">
                <strong>Advisory</strong><span>Implementation roadmaps</span>
              </div>
              <div className="hero__proof-divider" />
              <div className="hero__proof-item">
                <strong>Build</strong><span>Custom AI apps &amp; tools</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="section" id="what">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">What We Do</span>
              <h2>AI and automation services that deliver real business outcomes</h2>
              <p className="section__lead">We don't sell hype. We train your team, redesign your workflows, build your tools, and guide your implementation — so AI actually works in your organization.</p>
            </div>
          </Reveal>
          <div className="cards-grid cards-grid--4">
            {[
              { icon: Icons.training, title: "AI Training", desc: "Practical, hands-on workshops that teach your team to use AI in their actual workflows — not theoretical lectures.", link: "/services" },
              { icon: Icons.automation, title: "Workflow Automation", desc: "Identify bottlenecks, eliminate repetitive tasks, and redesign processes so your team spends time on work that matters.", link: "/services" },
              { icon: Icons.advisory, title: "AI Advisory & Implementation", desc: "Know where to start, what to prioritize, and how to move from pilot to production with a clear implementation roadmap.", link: "/services" },
              { icon: Icons.build, title: "Custom AI Applications", desc: "Internal tools, dashboards, copilots, and MVPs — built to solve your specific problems, not generic off-the-shelf software.", link: "/services" },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <Link to={c.link} className="card">
                  <div className="card__icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <span className="card__arrow">Learn more {Icons.arrow}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We Help ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">Who We Help</span>
              <h2>Built for organizations that need practical AI help — not another pitch deck</h2>
            </div>
          </Reveal>
          <div className="cards-grid cards-grid--3">
            {[
              { title: "Small & Mid-Sized Businesses", desc: "You know AI matters but don't have a dedicated team to figure it out. We become your AI implementation partner." },
              { title: "Operations-Heavy Teams", desc: "Drowning in manual processes, spreadsheets, and repetitive tasks. We automate what's slowing you down." },
              { title: "Founder-Led Companies", desc: "Moving fast with limited resources. We help you identify the highest-leverage AI opportunities and build what matters first." },
              { title: "Professional Services Firms", desc: "Client delivery, reporting, and internal operations — all ripe for automation and AI-enabled improvement." },
              { title: "Government-Adjacent Orgs", desc: "Need a trusted, SDVOSB-certified partner with the discipline and security mindset to get it right." },
              { title: "Teams Ready to Act", desc: "You're past the curiosity phase. You need someone who can train, advise, and build — today, not next quarter." },
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

      {/* ── Why Command Applications ── */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="split__left">
              <Reveal>
                <span className="kicker">Why Command Applications</span>
                <h2>Veteran-led discipline.<br/>Real-world execution.</h2>
                <p>Most AI consultancies sell strategy decks and leave you to figure out the hard part. We don't stop at recommendations — we train your team, build your tools, and stay until the work is done.</p>
                <p>As a Service Disabled Veteran Owned Small Business, we bring the operational mindset, accountability, and mission-focus that gets results in complex environments.</p>
              </Reveal>
            </div>
            <div className="split__right">
              <Reveal delay={100}>
                <div className="why-grid">
                  {[
                    "We train, advise, and build — not just consult",
                    "Veteran-led with SDVOSB certification",
                    "Practical outcomes, not buzzword strategies",
                    "We translate messy problems into usable systems",
                    "From assessment to prototype to production",
                    "Operational discipline in every engagement",
                  ].map((item, i) => (
                    <div key={i} className="why-grid__item">
                      <span className="why-grid__check">{Icons.check}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Work: BipolarAware ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">Featured Work</span>
              <h2>BipolarAware — AI-enabled mental health support platform</h2>
              <p className="section__lead">An example of what we build: a thoughtful, AI-powered digital product designed to help individuals manage bipolar disorder through pattern recognition, structured self-reporting, and intelligent alerting.</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="case-highlight">
              <div className="case-highlight__grid">
                <div className="case-highlight__item">
                  <h4>The Problem</h4>
                  <p>People living with bipolar disorder lack accessible, daily tools that help them track mood patterns, identify early warning signs, and share structured data with care providers.</p>
                </div>
                <div className="case-highlight__item">
                  <h4>The Solution Concept</h4>
                  <p>A digital platform combining structured mood tracking, AI-driven pattern analysis, configurable alerting for care teams, and user-centered design focused on consistency and trust.</p>
                </div>
                <div className="case-highlight__item">
                  <h4>Capabilities Demonstrated</h4>
                  <p>Product strategy, applied AI design, workflow logic, alerting and reporting systems, user-centered UX, and full-stack application development.</p>
                </div>
                <div className="case-highlight__item">
                  <h4>Why It Matters</h4>
                  <p>This project shows our ability to take a complex, sensitive problem space and deliver a real software solution — the same approach we bring to every client engagement.</p>
                </div>
              </div>
              <div className="case-highlight__cta">
                <Link to="/work" className="btn btn--accent">See Full Case Study {Icons.arrow}</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">How We Work</span>
              <h2>Three steps from conversation to capability</h2>
            </div>
          </Reveal>
          <div className="steps">
            {[
              { num: "01", title: "Discover", desc: "We start with your goals, workflows, and pain points. No generic questionnaire — a real conversation about where AI and automation can make the biggest impact." },
              { num: "02", title: "Design & Build", desc: "We create a clear plan and get to work — training your team, automating processes, building tools, or all of the above. You see progress fast." },
              { num: "03", title: "Deliver & Support", desc: "We hand off working systems with documentation and training. No orphaned projects — we make sure your team can run with it." },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="step">
                  <span className="step__num">{s.num}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: SERVICES
   ═══════════════════════════════════════════ */
function ServicesPage() {
  const services = [
    {
      id: "training",
      icon: Icons.training,
      title: "AI Training",
      tagline: "Practical AI skills for your team — not theory, not demos, real workflow adoption.",
      who: "Teams that need to understand how to use AI tools effectively in their day-to-day work. Executives who need a clear picture of what AI can do for their organization.",
      painPoints: [
        "Your team is curious about AI but doesn't know where to start",
        "People are using AI tools inconsistently or not at all",
        "Leadership needs an honest assessment of AI's potential for the business",
        "Previous AI training was too abstract to be useful",
      ],
      outcomes: [
        "Team members confidently using AI in their actual workflows",
        "Clear understanding of high-value AI use cases for your organization",
        "Executive alignment on AI priorities and investment",
        "Measurable productivity improvements within weeks",
      ],
      deliverables: "Customized training workshops • Executive AI briefings • Use-case playbooks • Hands-on exercises with real workflow scenarios • Post-training action plans",
    },
    {
      id: "automation",
      icon: Icons.automation,
      title: "Workflow Automation",
      tagline: "Eliminate the manual work that's slowing your team down.",
      who: "Operations-heavy teams, growing businesses with scaling pains, and organizations drowning in manual processes, data entry, and repetitive coordination tasks.",
      painPoints: [
        "Your team spends hours on repetitive tasks that should take minutes",
        "Data moves between systems manually, introducing errors and delays",
        "You're scaling headcount to handle work that could be automated",
        "Process bottlenecks are limiting your capacity to grow",
      ],
      outcomes: [
        "Significant reduction in manual, repetitive work",
        "Faster turnaround on operational processes",
        "Fewer errors in data handling and coordination",
        "Team capacity freed up for higher-value work",
      ],
      deliverables: "Workflow audit and analysis • Process redesign recommendations • Automation implementation • System integration • Documentation and team training",
    },
    {
      id: "advisory",
      icon: Icons.advisory,
      title: "AI Advisory & Implementation",
      tagline: "A clear roadmap from 'where do we start?' to 'we're live.'",
      who: "Organizations that know AI is important but need expert guidance to identify the right opportunities, avoid costly mistakes, and move from idea to implementation.",
      painPoints: [
        "You don't know where AI will have the biggest impact on your business",
        "You've seen demos but have no idea how to actually implement AI",
        "You're worried about investing in the wrong tools or approach",
        "Previous consultants delivered strategy decks but no real progress",
      ],
      outcomes: [
        "Clear, prioritized list of AI opportunities for your business",
        "Actionable implementation roadmap with timelines and milestones",
        "Successful pilot projects that demonstrate real value",
        "Confidence to make informed AI investment decisions",
      ],
      deliverables: "AI opportunity assessment • Use-case prioritization matrix • Implementation roadmap • Pilot design and execution support • Vendor/tool evaluation guidance",
    },
    {
      id: "build",
      icon: Icons.build,
      title: "Custom AI Applications",
      tagline: "Internal tools, MVPs, and AI-enabled systems built for your specific problems.",
      who: "Organizations that need custom software solutions — internal tools, workflow copilots, reporting dashboards, or AI-powered applications that off-the-shelf products can't provide.",
      painPoints: [
        "You need a tool that doesn't exist off the shelf",
        "Your team is cobbling together spreadsheets and manual workarounds",
        "You have an AI product idea but no technical team to build it",
        "You need a prototype to validate an idea before a larger investment",
      ],
      outcomes: [
        "Working software that solves your specific problem",
        "Faster decision-making with AI-powered dashboards and insights",
        "Validated product concepts ready for further development",
        "Internal tools your team actually uses and relies on",
      ],
      deliverables: "Requirements analysis • Architecture design • Working prototype/MVP • AI-enabled features (classification, summarization, alerting, etc.) • Documentation and handoff",
    },
  ];

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">Our Services</span></Reveal>
          <Reveal delay={60}><h1>AI training, automation, advisory, and custom builds — all under one roof</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">We help organizations move from AI curiosity to AI capability. Whether you need to train your team, automate your workflows, build a roadmap, or create custom tools — we do the work.</p></Reveal>
        </div>
      </section>

      {services.map((s, idx) => (
        <section key={s.id} id={s.id} className={`section ${idx % 2 === 1 ? "section--alt" : ""}`}>
          <div className="container">
            <div className="service-detail">
              <Reveal>
                <div className="service-detail__header">
                  <div className="service-detail__icon">{s.icon}</div>
                  <h2>{s.title}</h2>
                  <p className="service-detail__tagline">{s.tagline}</p>
                </div>
              </Reveal>
              <div className="service-detail__body">
                <Reveal delay={60}>
                  <div className="service-detail__block">
                    <h3>Who This Is For</h3>
                    <p>{s.who}</p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="service-detail__block">
                    <h3>Problems We Solve</h3>
                    <ul>{s.painPoints.map((p, i) => <li key={i}>{Icons.check} {p}</li>)}</ul>
                  </div>
                </Reveal>
                <Reveal delay={140}>
                  <div className="service-detail__block">
                    <h3>Business Outcomes</h3>
                    <ul>{s.outcomes.map((o, i) => <li key={i}>{Icons.check} {o}</li>)}</ul>
                  </div>
                </Reveal>
                <Reveal delay={180}>
                  <div className="service-detail__block">
                    <h3>Example Deliverables</h3>
                    <p>{s.deliverables}</p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <Link to="/contact" className="btn btn--accent">Discuss {s.title} {Icons.arrow}</Link>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      ))}

      <CTASection headline="Not sure which service you need?" sub="That's fine — most engagements start with a conversation. Tell us what's going on, and we'll help you figure out the right starting point." primary="Start a Conversation" />
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: PRODUCTS (productized offerings)
   ═══════════════════════════════════════════ */
// Product CTAs POST the product `id` to /api/checkout, which creates a Stripe
// Checkout Session (server-side, using STRIPE_SECRET_KEY) and returns a hosted
// URL we redirect to. Pricing lives server-side in app/api/checkout/route.js —
// keep the `id`s here in sync with the CATALOG keys there.
const PRODUCT_TIERS = [
  {
    tier: "Education",
    cols: "pcards--2",
    products: [
      {
        id: "jump-start",
        icon: Icons.bolt,
        badge: "Education",
        name: "AI Jump Start",
        price: "$297",
        cadence: "one-time",
        tagline: "Get your team using AI tools in a day — without the overwhelm.",
        desc: "An on-demand video course (approx. 90 minutes) with a companion prompt library. Work through it at your own pace, implement the same day.",
        features: [
          "On-demand video training (~90 min)",
          "10 industry-specific use cases",
          "Prompt library PDF — yours to keep",
          "30-day email Q&A access",
        ],
        cta: "Get instant access",
      },
      {
        id: "operator-course",
        icon: Icons.cap,
        badge: "Education",
        name: "AI Operator Course",
        price: "$997",
        cadence: "one-time",
        tagline: "Build AI workflows into every part of your business — no coding required.",
        desc: "A self-paced 6-module course covering every core business function. Comes with done-for-you prompt templates and community access.",
        features: [
          "6 modules: operations, marketing, sales, finance, HR, customer service",
          "Pre-built prompt templates for each module",
          "Private community access (12 months)",
          "Live monthly Q&A calls",
        ],
        cta: "Enroll now",
      },
    ],
  },
  {
    tier: "Advisory",
    cols: "pcards--2",
    products: [
      {
        id: "opportunity-audit",
        icon: Icons.clipboard,
        badge: "Advisory",
        featured: true,
        featuredBadge: "Most popular",
        name: "AI Opportunity Audit",
        price: "$1,500",
        cadence: "one-time",
        tagline: "Find out exactly where AI can save you time and make you money — specific to your business.",
        desc: "A structured intake process, one 60-minute discovery call, and a custom 15–20 page report mapping your highest-value AI opportunities. You walk away with a prioritized roadmap, not generic advice.",
        features: [
          "Pre-work intake questionnaire",
          "60-min recorded discovery call",
          "15–20 page custom AI opportunity report",
          "Prioritized roadmap: quick wins + long-term plays",
          "1 follow-up call to walk through findings",
        ],
        cta: "Book your audit",
      },
      {
        id: "advisory-retainer",
        icon: Icons.cycle,
        badge: "Advisory",
        name: "AI Advisory Retainer",
        price: "$1,200",
        cadence: "/ month",
        tagline: "Ongoing strategic guidance as you implement — so you don't waste money on the wrong tools.",
        desc: "Two calls per month plus async support. We review your tool stack, hold you accountable to your roadmap, and help you make smart decisions as AI keeps evolving.",
        features: [
          "2 × 45-min calls per month",
          "Async Slack or email support",
          "Tool stack reviews and vendor vetting",
          "Monthly implementation progress report",
        ],
        cta: "Apply for a retainer",
      },
    ],
  },
  {
    tier: "Done for you",
    cols: "pcards--1",
    products: [
      {
        id: "ai-built-website",
        icon: Icons.globe,
        badge: "Done for you",
        name: "AI-Built Website",
        price: "$1,500",
        cadence: "one-time",
        tagline: "A professional, modern website — designed, written, and built using AI. Delivered in 7 business days.",
        desc: "We use AI tooling to design, write, and build your website at a fraction of what a traditional agency charges. You review and approve the copy before anything goes live.",
        features: [
          "5 pages: home, about, services, contact, blog",
          "AI-generated copy (client-reviewed and approved)",
          "Mobile-responsive, SEO-ready build",
          "Hosting setup and domain configuration",
          "30-day bug-fix guarantee",
        ],
        cta: "Start your project",
      },
    ],
  },
];

// Embedded Checkout modal — mounts Stripe's checkout form in-page so the
// customer never leaves commandapplications.com.
function CheckoutModal({ productId, onClose }) {
  const [failed, setFailed] = useState(false);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (!data?.clientSecret) throw new Error("no_client_secret");
    return data.clientSecret;
  }, [productId]);

  // Lock body scroll while open + close on Escape.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="checkout-modal" role="dialog" aria-modal="true" aria-label="Secure checkout">
      <div className="checkout-modal__overlay" onClick={onClose} />
      <div className="checkout-modal__panel">
        <button type="button" className="checkout-modal__close" onClick={onClose} aria-label="Close checkout">
          {Icons.close}
        </button>
        <div className="checkout-modal__body">
          {!stripePromise || failed ? (
            <div className="checkout-modal__error">
              <p>We couldn't start secure checkout right now.</p>
              <Link to="/contact" className="btn btn--accent">Contact us instead {Icons.arrow}</Link>
            </div>
          ) : (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret, onComplete: undefined }}
            >
              <EmbeddedCheckout onError={() => setFailed(true)} />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, delay, onCheckout }) {
  return (
    <Reveal delay={delay} className="pcard-wrap">
      <article className={`pcard ${p.featured ? "pcard--featured" : ""}`}>
        {p.featured && p.featuredBadge && (
          <span className="pcard__featured-badge">{Icons.star} {p.featuredBadge}</span>
        )}
        <div className="pcard__top">
          <div className="pcard__icon" aria-hidden="true">{p.icon}</div>
          <span className="pcard__badge">{p.badge}</span>
        </div>
        <h3 className="pcard__name">{p.name}</h3>
        <div className="pcard__price">
          <span className="pcard__price-amt">{p.price}</span>
          <span className="pcard__price-cadence">{p.cadence}</span>
        </div>
        <p className="pcard__tagline">{p.tagline}</p>
        <p className="pcard__desc">{p.desc}</p>
        <div className="pcard__divider" />
        <ul className="pcard__features">
          {p.features.map((f, i) => (
            <li key={i}>{Icons.check} <span>{f}</span></li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onCheckout(p.id)}
          className={`btn ${p.featured ? "btn--warm" : "btn--accent"} btn--full pcard__cta`}
        >
          {p.cta} {Icons.arrow}
        </button>
      </article>
    </Reveal>
  );
}

// Reads the ?checkout=success|cancelled flag Stripe redirects back with, shows
// a dismissible banner, and strips the param so a refresh won't re-trigger it.
function CheckoutBanner() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const c = params.get("checkout");
    if (c === "success" || c === "cancelled") {
      setStatus(c);
      params.delete("checkout");
      params.delete("session_id");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash
      );
    }
  }, []);
  if (!status) return null;
  return (
    <div className={`checkout-banner checkout-banner--${status}`} role="status">
      <span className="checkout-banner__icon" aria-hidden="true">
        {status === "success" ? Icons.check : Icons.close}
      </span>
      <p>
        {status === "success"
          ? "Thank you — your purchase is confirmed. A receipt is on its way to your email, and we'll follow up shortly with next steps."
          : "Checkout was cancelled — no charge was made. Whenever you're ready, pick up where you left off below."}
      </p>
      <button
        type="button"
        className="checkout-banner__close"
        aria-label="Dismiss"
        onClick={() => setStatus(null)}
      >
        {Icons.close}
      </button>
    </div>
  );
}

function ProductsPage() {
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const openCheckout = (productId) => setCheckoutProduct(productId);
  const closeCheckout = () => setCheckoutProduct(null);
  const scrollToProducts = (e) => {
    e.preventDefault();
    if (typeof document === "undefined") return;
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      {/* ── Hero ── */}
      <section className="products-hero">
        <div className="hero__bg-grid" />
        <div className="container products-hero__inner">
          <CheckoutBanner />
          <Reveal>
            <h1>
              AI isn't the future.{" "}
              <span className="products-hero__accent">It's already the advantage your competitors are using.</span>
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="products-hero__sub">
              We help small business owners cut through the noise — and start using AI to save
              time, grow revenue, and stop doing work that software should be doing.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="hero__btns">
              <a href="#products" className="btn btn--accent btn--lg" onClick={scrollToProducts}>
                See our services {Icons.arrow}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Credibility / Trust bar ── */}
      <div className="trust-bar">
        <div className="container">
          <div className="trust-bar__inner">
            {[
              "Veteran-led & SDVOSB-certified",
              "Built for small business owners",
              "Practical AI — implemented, not just advised",
              "Plain-English guidance, no jargon",
              "From first workflow to fully built systems",
            ].map((item, i, arr) => (
              <span key={item} className="trust-bar__group">
                <span className="trust-bar__item">{item}</span>
                {i < arr.length - 1 && <span className="trust-bar__dot" aria-hidden="true" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <section className="section" id="products">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">What we offer</span>
              <h2>Three ways to work with us — from self-guided learning to fully done-for-you delivery.</h2>
            </div>
          </Reveal>

          {PRODUCT_TIERS.map((t) => (
            <div className="tier" key={t.tier}>
              <Reveal>
                <span className="tier__label">{t.tier}</span>
              </Reveal>
              <div className={`pcards ${t.cols}`}>
                {t.products.map((p, i) => (
                  <ProductCard key={p.id} p={p} delay={i * 90} onCheckout={openCheckout} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">How it works</span>
              <h2>From first conversation to AI working in your business</h2>
            </div>
          </Reveal>
          <div className="steps">
            {[
              { num: "01", title: "Start with a course or audit", desc: "Get clarity on what AI can do for your business." },
              { num: "02", title: "Build a roadmap", desc: "Leave with a prioritized plan tailored to your situation." },
              { num: "03", title: "Execute with support", desc: "Implement on your own or let us build it for you." },
            ].map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div className="step">
                  <span className="step__num">{s.num}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="cta-section">
        <div className="container">
          <Reveal>
            <div className="cta-section__inner">
              <h2>Not sure where to start?</h2>
              <p>
                The AI Opportunity Audit is the fastest way to get a clear picture of what's
                possible for your specific business. Most clients see ROI within 30 days of
                implementation.
              </p>
              <div className="cta-section__btns">
                <button
                  type="button"
                  onClick={() => openCheckout("opportunity-audit")}
                  className="btn btn--warm btn--lg"
                >
                  Book your audit — $1,500 {Icons.arrow}
                </button>
              </div>
              {/* TODO: wire to the free email course signup (e.g. newsletter/ESP link) */}
              <a href="#" className="cta-section__secondary">Or start with the free email course →</a>
            </div>
          </Reveal>
        </div>
      </section>

      {checkoutProduct && (
        <CheckoutModal productId={checkoutProduct} onClose={closeCheckout} />
      )}
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: ABOUT
   ═══════════════════════════════════════════ */
function AboutPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">About Command Applications</span></Reveal>
          <Reveal delay={60}><h1>Veteran-led. Execution-focused. Built to deliver.</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">Command Applications exists because too many organizations are stuck between knowing AI matters and actually making it work. We close that gap.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-story">
            <Reveal>
              <div className="about-story__block">
                <h2>Our Mission</h2>
                <p>Command Applications was founded to solve a specific problem: organizations everywhere know that AI and automation can transform their work, but most lack the practical guidance, training, and technical support to make it happen.</p>
                <p>We bridge that gap. We're not a research lab, and we're not a strategy-only consultancy. We're a veteran-led team that trains people, redesigns workflows, builds tools, and stays until the work delivers results.</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="about-story__block">
                <h2>Why Veteran-Led Matters</h2>
                <p>Military service builds a specific kind of professional: someone who plans under uncertainty, executes under pressure, adapts when the plan doesn't survive first contact, and takes accountability for outcomes — not just deliverables.</p>
                <p>As a Service Disabled Veteran Owned Small Business (SDVOSB), Command Applications brings that operational DNA to every client engagement. We don't overpromise. We don't hide behind jargon. We define the mission, build the plan, and get it done.</p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="about-story__block">
                <h2>What We Believe</h2>
                <div className="values-grid">
                  {[
                    { title: "Execution Over Theory", desc: "Ideas are easy. Implementation is what matters. We measure success by what's working, not what's in a slide deck." },
                    { title: "Clarity Over Complexity", desc: "We make AI understandable and approachable. No jargon walls. No intentional mystification. Clear language, clear plans." },
                    { title: "Outcomes Over Activity", desc: "We focus on business results — time saved, errors reduced, workflows improved, tools delivered — not hours billed." },
                    { title: "Discipline Over Shortcuts", desc: "Good systems are built with care. We document, we test, we train, and we hand off clean work your team can maintain." },
                    { title: "Partnership Over Sales", desc: "We succeed when our clients succeed. Every engagement is about building your capability, not your dependency on us." },
                    { title: "Honesty Over Hype", desc: "If AI isn't the right answer, we'll tell you. If your problem needs a simpler solution, we'll recommend it." },
                  ].map((v, i) => (
                    <div key={i} className="values-grid__item">
                      <h4>{v.title}</h4>
                      <p>{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="sdvosb-section">
              <div className="sdvosb-section__badge">
                <img
                  src="/assets/SDVOSB.png"
                  alt="Service Disabled Veteran Owned Small Business (SDVOSB) Certified"
                  className="sdvosb-about-seal"
                  loading="lazy"
                />
              </div>
              <div className="sdvosb-section__content">
                <h2>SDVOSB Certified</h2>
                <p>Command Applications is a certified Service Disabled Veteran Owned Small Business. For organizations with veteran-friendly procurement goals, set-aside contracts, or supplier diversity requirements, working with us helps meet those objectives while getting experienced, high-quality AI and automation support.</p>
                <p>Our SDVOSB status isn't just a certification — it reflects the discipline, service orientation, and mission-first mindset we bring to every engagement.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection headline="Work with a team that delivers" sub="We bring veteran-led discipline to every AI and automation engagement. Let's talk about what you're trying to accomplish." />
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
          <Reveal delay={120}><p className="page-hero__sub">We build tools, platforms, and systems that solve actual problems. Here's an example of what we deliver.</p></Reveal>
        </div>
      </section>

      {/* ── BipolarAware Full Case Study ── */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="case-study">
              <div className="case-study__label">Featured Project</div>
              <h2 className="case-study__title">BipolarAware</h2>
              <p className="case-study__subtitle">AI-Enabled Mental Health Support Platform</p>

              <div className="case-study__section">
                <h3>Challenge</h3>
                <p>People living with bipolar disorder face a daily challenge: tracking mood patterns, recognizing early warning signs of manic or depressive episodes, and communicating meaningful data to care providers. Most existing tools are either too simplistic to be useful or too clinical to encourage consistent use. There was no accessible, intelligent platform that combined structured self-reporting with AI-driven analysis and proactive alerting.</p>
              </div>

              <div className="case-study__section">
                <h3>Solution Concept</h3>
                <p>BipolarAware is a digital platform designed to support individuals with bipolar disorder through daily structured mood and behavior tracking, AI-powered pattern recognition that identifies trends and early warning signs, configurable alert systems that notify care teams or trusted contacts when concerning patterns emerge, and an intuitive, calming user interface designed to encourage consistent daily use without adding stress.</p>
              </div>

              <div className="case-study__section">
                <h3>Capabilities Demonstrated</h3>
                <div className="case-study__caps">
                  {[
                    { title: "Product Strategy", desc: "Defined the product vision, user needs, and feature prioritization for a sensitive, complex problem space." },
                    { title: "User-Centered Design", desc: "Designed an interface that balances clinical utility with approachability, encouraging consistent engagement." },
                    { title: "Applied AI", desc: "Implemented AI-driven pattern analysis to surface actionable insights from self-reported behavioral data." },
                    { title: "Workflow & Alerting Logic", desc: "Built configurable notification and alerting systems that connect users to their support network." },
                    { title: "Full-Stack Development", desc: "Delivered a working application from database design through frontend interface to deployment." },
                    { title: "Reporting & Dashboards", desc: "Created structured data views for users and care providers, turning raw entries into meaningful trends." },
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
                <p>BipolarAware demonstrates exactly what Command Applications delivers to clients: the ability to take a complex, ambiguous problem, define a clear product vision, and build a working system that combines thoughtful design with practical AI capabilities. Whether your challenge is a patient-facing health tool, an internal operations platform, or a customer-facing application — this is the approach and caliber of work we bring to every engagement.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Future Work Placeholders ── */}
      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__header">
              <span className="kicker">More Work</span>
              <h2>Additional projects and case studies</h2>
              <p className="section__lead">We're actively building more examples. Upcoming case studies will cover workflow automation, AI training engagements, and custom internal tools.</p>
            </div>
          </Reveal>
          <div className="cards-grid cards-grid--3">
            {[
              { title: "Workflow Automation", desc: "Reducing manual data processing by 70% for an operations-heavy professional services team.", status: "Coming Soon" },
              { title: "AI Training Program", desc: "Designing and delivering a hands-on AI adoption workshop for a mid-sized organization.", status: "Coming Soon" },
              { title: "Internal Operations Tool", desc: "Building a custom dashboard and alerting system for a growing team managing complex logistics.", status: "Coming Soon" },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="card card--flat card--placeholder">
                  <span className="card__status">{c.status}</span>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection headline="Have a project in mind?" sub="Whether it's a custom tool, a workflow problem, or an AI idea you want to validate — we'd like to hear about it." primary="Discuss Your Project" />
    </main>
  );
}

/* ═══════════════════════════════════════════
   PAGE: CONTACT
   ═══════════════════════════════════════════ */
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", org: "", interest: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSubmitted(true);
    } catch {
      setError("Sorry—something went wrong sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal><span className="kicker">Contact Us</span></Reveal>
          <Reveal delay={60}><h1>Let's talk about what you're trying to accomplish</h1></Reveal>
          <Reveal delay={120}><p className="page-hero__sub">Whether you need training, automation, advisory, or a custom build — the first step is a conversation. No sales pitch, no pressure. Tell us what's going on, and we'll tell you how we can help.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            <Reveal>
              <div className="contact-info">
                <h2>Start a conversation</h2>
                <p>Most engagements begin with a 30-minute discovery call. We'll learn about your organization, your pain points, and your goals — then recommend a clear next step.</p>

                <div className="contact-info__items">
                  <div className="contact-info__item">
                    {Icons.mail}
                    <div>
                      <strong>Email</strong>
                      <a href="mailto:contact@commandapplications.com">contact@commandapplications.com</a>
                    </div>
                  </div>
                </div>

                <div className="contact-info__topics">
                  <h3>Common starting points:</h3>
                  <ul>
                    <li>{Icons.check} "We need AI training for our team"</li>
                    <li>{Icons.check} "We have workflows that should be automated"</li>
                    <li>{Icons.check} "We need help figuring out where to start with AI"</li>
                    <li>{Icons.check} "We have an idea for a tool and need someone to build it"</li>
                    <li>{Icons.check} "We need an SDVOSB AI partner"</li>
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="contact-form-wrap">
                {submitted ? (
                  <div className="contact-form-success">
                    <div className="contact-form-success__icon">✓</div>
                    <h3>Message received</h3>
                    <p>Thank you for reaching out. We'll review your message and get back to you within one business day.</p>
                  </div>
                ) : (
                  <div>
                    <h3>Send us a message</h3>
                    <div className="contact-form">
                      <div className="form-group">
                        <label>Your Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Jane Smith" />
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="jane@company.com" />
                      </div>
                      <div className="form-group">
                        <label>Organization</label>
                        <input type="text" value={form.org} onChange={e => setForm({...form, org: e.target.value})} placeholder="Acme Corp" />
                      </div>
                      <div className="form-group">
                        <label>What are you interested in?</label>
                        <select value={form.interest} onChange={e => setForm({...form, interest: e.target.value})}>
                          <option value="">Select an option</option>
                          <option value="training">AI Training</option>
                          <option value="automation">Workflow Automation</option>
                          <option value="advisory">AI Advisory &amp; Implementation</option>
                          <option value="build">Custom AI Application</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>
                      <div className="form-group form-group--full">
                        <label>Tell us about your situation *</label>
                        <textarea rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required placeholder="What challenges are you facing? What are you hoping to achieve?" />
                      </div>
                      {error ? <p style={{ gridColumn: "1 / -1", color: "var(--danger)", marginTop: 8 }}>{error}</p> : null}
                      <button
                        type="button"
                        className="btn btn--accent btn--lg btn--full"
                        onClick={handleSubmit}
                        disabled={submitting}
                        aria-disabled={submitting}
                        style={submitting ? { opacity: 0.8, cursor: "not-allowed" } : undefined}
                      >
                        {submitting ? "Sending..." : "Send Message"} {Icons.arrow}
                      </button>
                    </div>
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

/* ── Utility ── */
.container{max-width:var(--max-w);margin:0 auto;padding:0 24px}
.kicker{font-family:var(--font-mono);font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);font-weight:600;display:block;margin-bottom:12px}

/* ── Reveal Animation ── */
.reveal-up{opacity:0;transform:translateY(28px);transition:opacity 0.6s ease,transform 0.6s ease}
.reveal-up.revealed{opacity:1;transform:translateY(0)}

/* ── Navbar ── */
.navbar{position:fixed;top:0;left:0;right:0;z-index:100;height:var(--nav-h);display:flex;align-items:center;transition:background 0.3s,backdrop-filter 0.3s,box-shadow 0.3s}
.navbar--scrolled{background:rgba(11,15,20,0.85);backdrop-filter:blur(16px);box-shadow:0 1px 0 var(--border)}
.navbar__inner{display:flex;align-items:center;justify-content:space-between;width:100%}
.navbar__logo{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:700}
.navbar__logo-img{width:44px;height:44px;object-fit:contain}
.navbar__logo-mark{font-size:28px;color:var(--accent);line-height:1}
.navbar__logo-text{font-size:14px;line-height:1.2;letter-spacing:0.01em}
.navbar__logo-text span{color:var(--text-muted);font-weight:400}
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
.btn--warm{background:var(--warm);color:#1A1205}
.btn--warm:hover{background:#FBBF24;box-shadow:0 0 24px rgba(245,158,11,0.25)}
.btn--lg{padding:14px 28px;font-size:16px}
.btn--sm{padding:8px 18px;font-size:13px}
.btn--full{width:100%;justify-content:center}
.btn svg{flex-shrink:0}

/* ── SDVOSB Badge ── */
.sdvosb-badge{display:inline-block;padding:4px 10px;border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.12em;background:rgba(245,158,11,0.12);color:var(--warm);border:1px solid rgba(245,158,11,0.25)}
.sdvosb-badge--sm{font-size:10px;padding:3px 8px}
.sdvosb-badge--lg{font-size:16px;padding:10px 20px}
.sdvosb-label{font-size:12px;color:var(--text-muted);line-height:1.3}

.sdvosb-hero-seal{height:20px;width:auto;display:block}
.sdvosb-about-seal{height:64px;width:auto;display:block}
.sdvosb-footer-seal{height:56px;width:auto;display:block}

/* ── Hero ── */
.hero{position:relative;padding:160px 0 100px;overflow:hidden;min-height:90vh;display:flex;align-items:center}
.hero__bg-grid{position:absolute;inset:0;background-image:
  linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),
  linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px);
  background-size:64px 64px;
  mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,black 20%,transparent 100%)}
.hero__inner{position:relative;z-index:1;max-width:820px}
.hero__badge{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font-size:13px;color:var(--text-muted);margin-bottom:28px}
.hero__h1{font-size:clamp(2.4rem,5.5vw,4rem);margin-bottom:24px;color:var(--text);line-height:1.08}
.hero__h1-accent{color:var(--accent)}
.hero__sub{font-size:clamp(1.05rem,2vw,1.25rem);color:var(--text-muted);max-width:640px;margin-bottom:36px;line-height:1.7}
.hero__btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:56px}
.hero__proof{display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface)}
.hero__proof-item{padding:20px 24px;flex:1;min-width:0}
.hero__proof-item strong{display:block;font-family:var(--font-display);font-size:14px;color:var(--text);margin-bottom:4px}
.hero__proof-item span{font-size:13px;color:var(--text-muted)}
.hero__proof-divider{width:1px;background:var(--border)}
@media(max-width:768px){
  .hero{padding:120px 0 60px;min-height:auto}
  .hero__proof{flex-direction:column}
  .hero__proof-divider{width:100%;height:1px}
}

/* ── Page Hero (inner pages) ── */
.page-hero{padding:140px 0 60px;border-bottom:1px solid var(--border)}
.page-hero h1{font-size:clamp(2rem,4.5vw,3rem);max-width:760px;margin-bottom:16px}
.page-hero__sub{font-size:clamp(1rem,1.8vw,1.15rem);color:var(--text-muted);max-width:640px;line-height:1.7}

/* ── Sections ── */
.section{padding:96px 0}
.section--alt{background:var(--bg-alt)}
.section__header{max-width:720px;margin-bottom:56px}
.section__header h2{font-size:clamp(1.8rem,3.5vw,2.4rem);margin-bottom:16px}
.section__lead{font-size:1.05rem;color:var(--text-muted);line-height:1.7;max-width:620px}

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
.card__arrow{display:inline-flex;align-items:center;gap:6px;margin-top:16px;font-size:13px;font-weight:600;color:var(--accent);font-family:var(--font-display)}
.card--flat{background:var(--surface);cursor:default}
.card--flat:hover{transform:none;box-shadow:none}
.card--placeholder{opacity:0.65;position:relative}
.card__status{display:inline-block;font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--warm);margin-bottom:12px}

/* ── Split Layout ── */
.split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
.split__left h2{font-size:clamp(1.8rem,3vw,2.2rem);margin-bottom:20px}
.split__left p{color:var(--text-muted);line-height:1.7;margin-bottom:16px;font-size:1.02rem}
@media(max-width:768px){.split{grid-template-columns:1fr;gap:40px}}

/* ── Why Grid ── */
.why-grid{display:flex;flex-direction:column;gap:16px}
.why-grid__item{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--border);font-size:0.95rem}
.why-grid__check{color:var(--accent-2);flex-shrink:0;margin-top:1px}

/* ── Case Highlight (home page) ── */
.case-highlight{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:40px;overflow:hidden}
.case-highlight__grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
.case-highlight__item h4{font-size:0.95rem;color:var(--accent);margin-bottom:8px;font-family:var(--font-mono);letter-spacing:0.04em}
.case-highlight__item p{font-size:0.92rem;color:var(--text-muted);line-height:1.65}
.case-highlight__cta{text-align:center;padding-top:12px;border-top:1px solid var(--border)}
@media(max-width:600px){.case-highlight__grid{grid-template-columns:1fr}.case-highlight{padding:24px}}

/* ── Steps ── */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.step{padding:32px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border);position:relative}
.step__num{font-family:var(--font-display);font-size:3rem;font-weight:800;color:var(--accent);opacity:0.18;position:absolute;top:16px;right:20px;line-height:1}
.step h3{font-size:1.2rem;margin-bottom:12px}
.step p{font-size:0.93rem;color:var(--text-muted);line-height:1.65}
@media(max-width:768px){.steps{grid-template-columns:1fr}}

/* ── CTA Section ── */
.cta-section{padding:96px 0;background:linear-gradient(180deg,var(--bg) 0%,rgba(59,130,246,0.04) 50%,var(--bg) 100%)}
.cta-section__inner{text-align:center;max-width:640px;margin:0 auto}
.cta-section__inner h2{font-size:clamp(1.8rem,3.5vw,2.4rem);margin-bottom:16px}
.cta-section__inner p{color:var(--text-muted);margin-bottom:32px;font-size:1.05rem;line-height:1.7}
.cta-section__btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* ── Service Detail ── */
.service-detail__header{margin-bottom:48px}
.service-detail__icon{width:64px;height:64px;border-radius:16px;background:var(--accent-glow);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:20px}
.service-detail__header h2{font-size:clamp(1.6rem,3vw,2rem);margin-bottom:12px}
.service-detail__tagline{font-size:1.1rem;color:var(--text-muted);max-width:600px}
.service-detail__body{display:grid;gap:32px;max-width:720px}
.service-detail__block h3{font-size:1rem;font-weight:700;color:var(--accent);margin-bottom:12px;font-family:var(--font-mono);letter-spacing:0.04em;text-transform:uppercase;font-size:0.8rem}
.service-detail__block p{color:var(--text-muted);line-height:1.7}
.service-detail__block ul{display:flex;flex-direction:column;gap:10px}
.service-detail__block li{display:flex;align-items:flex-start;gap:10px;color:var(--text-muted);line-height:1.6}
.service-detail__block li svg{color:var(--accent-2);flex-shrink:0;margin-top:3px}

/* ── About Page ── */
.about-story{display:flex;flex-direction:column;gap:64px}
.about-story__block h2{font-size:clamp(1.4rem,2.5vw,1.8rem);margin-bottom:16px}
.about-story__block p{color:var(--text-muted);line-height:1.75;margin-bottom:14px;max-width:720px;font-size:1.02rem}
.values-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:24px}
.values-grid__item{padding:24px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--border)}
.values-grid__item h4{font-size:1rem;margin-bottom:8px;color:var(--text)}
.values-grid__item p{font-size:0.9rem;color:var(--text-muted);line-height:1.6}
@media(max-width:600px){.values-grid{grid-template-columns:1fr}}
.sdvosb-section{display:flex;align-items:flex-start;gap:40px}
.sdvosb-section__badge{flex-shrink:0;padding-top:4px}
.sdvosb-section__content h2{font-size:1.6rem;margin-bottom:16px}
.sdvosb-section__content p{color:var(--text-muted);line-height:1.75;margin-bottom:14px;font-size:1.02rem}
@media(max-width:600px){.sdvosb-section{flex-direction:column;gap:20px}}

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

/* ── Contact ── */
.contact-layout{display:grid;grid-template-columns:1fr 1.1fr;gap:64px;align-items:start}
@media(max-width:768px){.contact-layout{grid-template-columns:1fr;gap:48px}}
.contact-info h2{font-size:1.6rem;margin-bottom:16px}
.contact-info > p{color:var(--text-muted);line-height:1.7;margin-bottom:32px}
.contact-info__items{display:flex;flex-direction:column;gap:16px;margin-bottom:36px}
.contact-info__item{display:flex;align-items:center;gap:12px;color:var(--text-muted)}
.contact-info__item svg{color:var(--accent);flex-shrink:0}
.contact-info__item strong{display:block;font-size:0.85rem;color:var(--text);margin-bottom:2px}
.contact-info__item a{color:var(--accent);font-size:0.95rem}
.contact-info__topics h3{font-size:0.95rem;margin-bottom:12px;color:var(--text)}
.contact-info__topics li{display:flex;align-items:flex-start;gap:8px;color:var(--text-muted);font-size:0.93rem;margin-bottom:10px;line-height:1.5}
.contact-info__topics li svg{color:var(--accent-2);flex-shrink:0;margin-top:2px}
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

/* ── Products Page ── */
.products-hero{position:relative;overflow:hidden;padding:150px 0 72px;border-bottom:1px solid var(--border)}
.products-hero__inner{position:relative;z-index:1;max-width:880px}
.products-hero h1{font-size:clamp(2.1rem,5vw,3.5rem);margin-bottom:22px;line-height:1.1}
.products-hero__accent{color:var(--accent)}
.products-hero__sub{font-size:clamp(1.05rem,2vw,1.25rem);color:var(--text-muted);max-width:700px;margin-bottom:34px;line-height:1.7}

/* ── Embedded Checkout modal ── */
.checkout-modal{position:fixed;inset:0;z-index:200;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto}
.checkout-modal__overlay{position:fixed;inset:0;background:rgba(5,8,12,0.78);backdrop-filter:blur(4px)}
.checkout-modal__panel{position:relative;z-index:1;width:100%;max-width:560px;background:#fff;border-radius:var(--radius-lg);padding:24px;box-shadow:0 30px 80px rgba(0,0,0,0.55);margin:auto}
.checkout-modal__close{position:absolute;top:12px;right:12px;z-index:2;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:none;border-radius:50%;background:#f1f3f4;color:#202124;cursor:pointer;transition:background 0.2s}
.checkout-modal__close:hover{background:#e3e6e8}
.checkout-modal__body{min-height:120px}
.checkout-modal__error{text-align:center;padding:32px 16px;color:#202124}
.checkout-modal__error p{margin-bottom:16px}
@media(max-width:600px){.checkout-modal{padding:16px 8px}.checkout-modal__panel{padding:16px}}

/* ── Checkout result banner ── */
.checkout-banner{display:flex;align-items:flex-start;gap:12px;padding:16px 18px;border-radius:var(--radius);margin-bottom:32px;border:1px solid var(--border);background:var(--surface)}
.checkout-banner--success{border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.09)}
.checkout-banner--cancelled{border-color:rgba(245,158,11,0.4);background:rgba(245,158,11,0.09)}
.checkout-banner p{margin:0;flex:1;color:var(--text);font-size:0.95rem;line-height:1.5}
.checkout-banner__icon{flex-shrink:0;margin-top:2px}
.checkout-banner--success .checkout-banner__icon{color:var(--accent-2)}
.checkout-banner--cancelled .checkout-banner__icon{color:var(--warm)}
.checkout-banner__close{background:none;border:none;color:var(--text-muted);cursor:pointer;padding:2px;flex-shrink:0;line-height:0;transition:color 0.2s}
.checkout-banner__close:hover{color:var(--text)}

/* ── Trust / Credibility bar ── */
.trust-bar{background:var(--bg-alt);border-bottom:1px solid var(--border)}
.trust-bar__inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px 16px;padding:18px 24px}
.trust-bar__group{display:inline-flex;align-items:center;gap:12px 16px}
.trust-bar__item{font-size:0.8rem;letter-spacing:0.03em;color:var(--text-muted)}
.trust-bar__dot{width:4px;height:4px;border-radius:50%;background:var(--text-muted);opacity:0.45;flex-shrink:0}
@media(max-width:600px){
  .trust-bar__inner{flex-direction:column;gap:8px}
  .trust-bar__dot{display:none}
}

/* ── Tier groups ── */
.tier{margin-bottom:56px}
.tier:last-child{margin-bottom:0}
.tier__label{display:flex;align-items:center;gap:16px;font-family:var(--font-mono);font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:24px}
.tier__label::after{content:"";flex:1;height:1px;background:var(--border)}

/* ── Product cards ── */
.pcards{display:grid;gap:24px;align-items:stretch}
.pcards--2{grid-template-columns:repeat(2,1fr)}
.pcards--1{grid-template-columns:minmax(0,560px)}
.pcard-wrap{height:100%}
.pcard-wrap .reveal-up,.pcards .reveal-up{height:100%}
@media(max-width:860px){.pcards--2{grid-template-columns:1fr}}

.pcard{display:flex;flex-direction:column;height:100%;padding:32px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border);transition:transform 0.25s,border-color 0.25s,box-shadow 0.25s}
.pcard:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:0 0 32px var(--accent-glow)}
.pcard__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.pcard__icon{width:52px;height:52px;border-radius:12px;background:var(--accent-glow);display:flex;align-items:center;justify-content:center;color:var(--accent)}
.pcard__badge{font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-muted);border:1px solid var(--border);padding:5px 10px;border-radius:999px}
.pcard__name{font-size:1.3rem;color:var(--text);margin-bottom:10px}
.pcard__price{display:flex;align-items:baseline;gap:8px;margin-bottom:16px}
.pcard__price-amt{font-family:var(--font-display);font-size:2.2rem;font-weight:800;letter-spacing:-0.02em;color:var(--text);line-height:1}
.pcard__price-cadence{font-size:0.9rem;color:var(--text-muted)}
.pcard__tagline{color:var(--text);font-weight:500;line-height:1.55;margin-bottom:16px;font-size:0.98rem}
.pcard__desc{color:var(--text-muted);line-height:1.65;font-size:0.92rem;margin-bottom:20px}
.pcard__divider{height:1px;background:var(--border);margin-bottom:20px}
.pcard__features{display:flex;flex-direction:column;gap:12px;margin-bottom:28px}
.pcard__features li{display:flex;align-items:flex-start;gap:10px;color:var(--text-muted);font-size:0.92rem;line-height:1.5}
.pcard__features li svg{color:var(--accent-2);flex-shrink:0;margin-top:2px}
.pcard__cta{margin-top:auto}

/* ── Featured (Audit) card ── */
.pcard--featured{position:relative;border-color:var(--warm);background:linear-gradient(180deg,rgba(245,158,11,0.07),var(--surface) 28%);box-shadow:0 0 0 1px var(--warm),0 20px 60px rgba(0,0,0,0.45)}
.pcard--featured:hover{transform:translateY(-3px);border-color:var(--warm);box-shadow:0 0 0 1px var(--warm),0 26px 70px rgba(0,0,0,0.55)}
.pcard--featured .pcard__icon{background:rgba(245,158,11,0.14);color:var(--warm)}
.pcard--featured .pcard__badge{color:var(--warm);border-color:rgba(245,158,11,0.4)}
.pcard__featured-badge{position:absolute;top:-13px;left:32px;display:inline-flex;align-items:center;gap:6px;background:var(--warm);color:#1A1205;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.03em;padding:6px 14px;border-radius:999px;box-shadow:0 4px 16px rgba(245,158,11,0.35)}
.pcard__featured-badge svg{width:13px;height:13px}
@media(min-width:861px){.pcard--featured{transform:translateY(-8px)}.pcard--featured:hover{transform:translateY(-11px)}}

/* ── Bottom CTA secondary link ── */
.cta-section__secondary{display:inline-block;margin-top:20px;font-size:0.95rem;color:var(--text-muted);border-bottom:1px solid transparent;transition:color 0.2s,border-color 0.2s}
.cta-section__secondary:hover{color:var(--accent);border-color:var(--accent)}

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
@media(max-width:768px){
  .footer__grid{grid-template-columns:1fr 1fr;gap:32px}
  .footer__bottom{flex-direction:column;gap:8px}
}
@media(max-width:500px){.footer__grid{grid-template-columns:1fr}}
`;

export default function App({ initialPath }) {
  const route = useRoute(initialPath);
  let Page;
  switch (route) {
    case "/services": Page = ServicesPage; break;
    case "/products": Page = ProductsPage; break;
    case "/about": Page = AboutPage; break;
    case "/work": Page = WorkPage; break;
    case "/contact": Page = ContactPage; break;
    default: Page = HomePage;
  }
  return (
    <>
      <style>{STYLES}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />
      <Page />
      <Footer />
    </>
  );
}
