import React, { useEffect, useRef, useState, type ReactNode } from "react";

/* ---------------------------------------------------------------- Props */
interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

/* ---------------------------------------------------------------- Primitives */
function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`label text-[#E6E2D8]/70 ${className}`}>{children}</span>;
}

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#D83B20] text-xs leading-none select-none">✳</span>
      <span className="label text-[#E6E2D8]/90">{children}</span>
    </div>
  );
}

function TalkButton({
  tone = "sand",
  onClick,
}: {
  tone?: "sand" | "ink";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-3 select-none cursor-pointer"
      aria-label="Launch Triage"
    >
      <span
        className={`label pl-4 pr-3 py-3 border ${
          tone === "ink" ? "border-[#E6E2D8]/20 text-[#E6E2D8]" : "border-[#E6E2D8]/20 text-[#E6E2D8]"
        }`}
      >
        Launch Triage
      </span>
      <span className="grid h-10 w-14 place-items-center bg-[#D83B20] text-[#E6E2D8] transition-transform duration-300 group-hover:translate-x-1">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
          <path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
    </button>
  );
}

function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-[#E6E2D8]/15 py-5 bg-[#121212]">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="display text-2xl md:text-4xl text-[#E6E2D8]/85">
            {item}
            <span className="text-[#D83B20] ml-10">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Navigation */
const NAV = [
  { label: "Console", href: "#top" },
  { label: "Dual Pipeline", href: "#intro", count: "(2)" },
  { label: "Capabilities", href: "#services" },
  { label: "Workspaces", href: "#pricing" },
  { label: "Research", href: "#journal" },
];

function Nav({ onLogin, onGetStarted }: { onLogin: () => void; onGetStarted: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-[999] bg-[#0F0F0F]/80 backdrop-blur-md border-b border-[#E6E2D8]/10">
      <nav className="grid grid-cols-2 items-center gap-4 px-6 py-4 md:grid-cols-5 md:px-12 w-full">
        {/* SupportNova Logo */}
        <button
          onClick={onLogin}
          className="display text-lg tracking-[0.25em] text-[#E6E2D8] text-left hover:text-[#D83B20] transition-colors cursor-pointer"
        >
          SupportNova
        </button>

        {NAV.slice(1).map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="label hidden text-[#E6E2D8]/80 transition-colors hover:text-[#D83B20] md:block text-center"
          >
            {item.label}
            {item.count ? <sup className="ml-1 text-[#D83B20] font-bold">{item.count}</sup> : null}
          </a>
        ))}

      </nav>
    </header>
  );
}

/* ---------------------------------------------------------------- Hero */
function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toUpperCase(),
      );
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return <span className="label text-[#E6E2D8]/70">{time ?? "--:--"}</span>;
}

function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden isolate flex flex-col justify-between">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover brightness-[0.45]"
      >
        <source src="/Herobg.mp4" type="video/mp4" />
      </video>

      <div className="ticks pointer-events-none absolute inset-y-0 left-0 w-4 opacity-60" />
      <div className="ticks pointer-events-none absolute inset-y-0 right-0 w-4 opacity-60" />

      <div className="flex flex-1 flex-col justify-end px-6 pb-16 pt-28 md:px-14">
        <div className="mb-4">
          <SectionTag>ResponseX Intelligence • Generative AI PowerPlay</SectionTag>
        </div>
        <h1 className="display max-w-5xl text-[13vw] leading-[0.85] md:text-[7.2vw] text-[#E6E2D8]">
          Autonomous complaint triage grounded in ground truth
        </h1>

        <div className="mt-14 grid gap-10 md:grid-cols-2 md:items-end">
          <div>
            <div className="display text-lg tracking-[0.3em] text-[#E6E2D8]">SupportNova</div>
            <div className="label mt-2 text-[#E6E2D8]/70">100% Deterministic Verification</div>
            <div className="mt-1 text-[#D83B20]">★★★★★</div>
            <div className="label mt-2 text-[#E6E2D8]/70">Benchmarked across 500+ complaint streams</div>
          </div>
          <div className="md:justify-self-end md:text-right">
            <p className="label max-w-sm leading-[1.9] text-[#E6E2D8]/85">
              Every complaint classified with precision. Every GenAI response verified against approved company SOPs. Zero hallucinations, zero unauthorized promises.
            </p>
            <div className="mt-6 flex md:justify-end">
              <TalkButton onClick={onGetStarted} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#E6E2D8]/15 px-6 py-3 md:px-14 bg-black/40 backdrop-blur-sm">
        <Label>[ResponseX Intelligence]</Label>
        <Label className="hidden md:inline">[Dual Python Pipeline • GenAI + Deterministic Rules]</Label>
        <Label className="hidden md:inline">[TechWiz 7 Edition]</Label>
        <Clock />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Intro */
function Intro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalDistance = windowHeight * 0.85;
      const currentDistance = windowHeight - rect.top;
      const rawProgress = currentDistance / totalDistance;
      const clamped = Math.min(Math.max(rawProgress, 0), 1);

      setProgress(clamped);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const maxOffset = isMobile ? 60 : 140;

  const leftX = (1 - progress) * -maxOffset;
  const rightX = (1 - progress) * maxOffset;
  const opacity = 0.2 + progress * 0.8;

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative bg-[#121212] px-6 py-24 text-[#E6E2D8] md:px-14 md:py-36 overflow-hidden"
    >
      <div className="mb-14 flex items-baseline justify-between">
        <SectionTag>Dual Pipeline Core</SectionTag>
        <Label>SupportNova Architecture</Label>
      </div>

      <div className="display max-w-6xl text-[6vw] leading-[1.08] md:text-[3vw] space-y-4">
        <div
          style={{
            transform: `translate3d(${leftX}px, 0, 0)`,
            opacity: opacity,
          }}
          className="will-change-transform transition-transform ease-out duration-75 text-[#E6E2D8]"
        >
          SUPPORTNOVA WAS BUILT TO ELIMINATE MANUAL TRIAGE DELAYS AND PREVENT HALLUCINATED PROMISES.
        </div>

        <div
          style={{
            transform: `translate3d(${rightX}px, 0, 0)`,
            opacity: opacity,
          }}
          className="will-change-transform transition-transform ease-out duration-75 text-[#E6E2D8]/75"
        >
          BY COMBINING THE NATURAL LANGUAGE INTELLIGENCE OF GENERATIVE AI WITH AN INDEPENDENT PYTHON GROUND-TRUTH VALIDATION PIPELINE, EVERY COMPLAINT IS ROUTED, PRIORITIZED, AND ANSWERED WITH TOTAL BUSINESS COMPLIANCE.
        </div>
      </div>

      <div className="mt-16 grid gap-8 border-t border-[#E6E2D8]/15 pt-8 md:grid-cols-3">
        {[
          ["ANALYZE", "WITH GENERATIVE AI"],
          ["VALIDATE", "WITH GROUND TRUTH"],
          ["RESOLVE", "WITH ZERO RISK"],
        ].map(([a, b]) => (
          <div key={a}>
            <div className="display text-3xl md:text-4xl text-[#E6E2D8]">{a}</div>
            <div className="label mt-2 text-[#E6E2D8]/60">{b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Impact */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 1400);
          setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="display block text-[16vw] leading-none md:text-[9vw] text-[#E6E2D8]">
      {value}
      {suffix}
    </span>
  );
}

function Impact() {
  return (
    <section className="bg-[#121212] px-6 py-24 text-[#E6E2D8] md:px-14">
      <div className="mb-10 flex items-baseline justify-between">
        <SectionTag>Performance Benchmarks</SectionTag>
        <Label>SRS Compliance Metrics</Label>
      </div>
      <div className="grid gap-10 border-t border-[#E6E2D8]/15 pt-10 md:grid-cols-3">
        <div>
          <Counter to={99} suffix="%" />
          <Label className="mt-3 block">Routing &amp; Policy Accuracy</Label>
        </div>
        <div>
          <Counter to={500} suffix="+" />
          <Label className="mt-3 block">Complaints Benchmarked</Label>
        </div>
        <div>
          <Counter to={100} suffix="+" />
          <Label className="mt-3 block">Structured Resolution Rules</Label>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Services (Linked to Workspace) */
const SERVICES = [
  {
    n: "01",
    title: "Complaint Triage",
    subtitle: "Categorization & Entity Recognition",
    body: "Automatic extraction of primary and secondary issues, sentiment detection, and objective priority classification (P0 to P3).",
    tags: ["Issue Triage", "Sentiment", "Priority P0-P3", "Entity Extraction"],
  },
  {
    n: "02",
    title: "Ground-Truth Validator",
    subtitle: "Deterministic Compliance",
    body: "An independent Python engine compares GenAI output against the Complaint Resolution Rule Matrix and SLA thresholds.",
    tags: ["Rule Matrix", "Independent", "Deterministic", "Schema Validation"],
  },
  {
    n: "03",
    title: "Policy & SOP Precedence",
    subtitle: "Knowledge Base Versioning",
    body: "Parses PDF and DOCX documents into traceable chunks, prioritizing active company policies over outdated FAQs and draft SOPs.",
    tags: ["Document Parsing", "Chunk Traceability", "Version Control"],
  },
  {
    n: "04",
    title: "Anti-Shortcut Defense",
    subtitle: "Adversarial Integrity",
    body: "Traps prompt injection attacks, blocks unauthorized refunds or guarantees, and decouples anger from true safety urgency.",
    tags: ["Prompt Injection", "Hallucination Trap", "Safety Traps", "Security"],
  },
  {
    n: "05",
    title: "Omnichannel Workspaces",
    subtitle: "Multi-Role Ecosystem",
    body: "Delivers dedicated interfaces for Customer tracking, Agent copilot assistance, and Executive leadership analytics.",
    tags: ["Agent Copilot", "Customer Portal", "Manual Review Queue", "Audit Trail"],
  },
];

function Services({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="services" className="bg-[#E6E2D8] text-[#121212] px-6 py-16 md:px-14 md:py-24 border-t border-[#121212]/15">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-[#121212]/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D83B20] animate-pulse" />
            <span className="font-mono text-sm md:text-base uppercase tracking-widest text-[#121212]/80 font-bold">
              Core Capabilities
            </span>
          </div>
          <h2 className="display mt-3 text-4xl md:text-6xl text-[#121212]">
            What SupportNova does
          </h2>
        </div>
        <div className="max-w-md md:text-right">
          <p className="font-mono text-sm md:text-base uppercase tracking-wider text-[#121212]/80 leading-relaxed font-bold">
            Automating complaint resolution with grounded compliance.
          </p>
          <span className="inline-block mt-1 font-mono text-xs md:text-sm text-[#D83B20] font-extrabold">
            Dual-Pipeline Verification • 0% Single Point of Failure
          </span>
        </div>
      </div>

      <div className="border-t border-[#121212]/15">
        {SERVICES.map((s) => (
          <div
            key={s.n}
            onClick={onGetStarted}
            title={`Launch ${s.title} workspace`}
            className="group relative grid gap-5 border-b border-[#121212]/15 py-7 md:py-8 px-4 md:px-6 transition-all duration-300 hover:bg-[#121212] hover:text-[#E6E2D8] hover:rounded-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] md:grid-cols-12 md:items-center cursor-pointer"
          >
            <div className="md:col-span-1 flex items-center">
              <span className="display text-2xl md:text-3xl text-[#D83B20]">
                {s.n}
              </span>
            </div>

            <div className="md:col-span-4 transition-transform duration-300 group-hover:translate-x-2">
              <h3 className="display text-2xl md:text-3xl text-[#121212] group-hover:text-[#E6E2D8]">
                {s.title}
              </h3>
              <span className="block mt-1 font-mono text-xs md:text-sm uppercase tracking-wider text-[#D83B20] font-bold">
                {s.subtitle}
              </span>
            </div>

            <p className="text-base md:text-lg leading-relaxed font-medium text-[#121212]/90 md:col-span-4 group-hover:text-[#E6E2D8] transition-colors">
              {s.body}
            </p>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 md:col-span-3">
              <div className="flex flex-wrap gap-2 md:justify-end">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs md:text-sm uppercase tracking-wider border border-[#121212]/30 px-3 py-1.5 text-[#121212] font-semibold group-hover:border-[#E6E2D8]/30 group-hover:bg-[#E6E2D8]/10 group-hover:text-[#E6E2D8] transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#121212]/30 group-hover:border-[#D83B20] group-hover:bg-[#D83B20] group-hover:text-white transition-all ml-2">
                <span className="text-base font-bold transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Process */
const PROCESS_STEPS = [
  {
    step: "01",
    engine: "Ingestion Engine",
    title: "Intake",
    body: "Multi-channel complaint submission with sanitization, deduplication, and metadata parsing.",
    badge: "Payload Sanitized",
  },
  {
    step: "02",
    engine: "Pipeline 1 (GenAI)",
    title: "GenAI Triage",
    body: "Pipeline 1 extracts entities, classifies category, urgency, and drafts structured JSON.",
    badge: "LLM Reasoning",
  },
  {
    step: "03",
    engine: "Pipeline 2 (Python)",
    title: "Ground Truth",
    body: "Pipeline 2 verifies routing, escalation triggers, and policy eligibility against 100+ rules.",
    badge: "Rule Matrix Check",
  },
  {
    step: "04",
    engine: "Integrity Core",
    title: "Comparison",
    body: "The comparison engine matches recommendations and diverts discrepancies to the manual queue.",
    badge: "Mismatch Trapped",
  },
  {
    step: "05",
    engine: "Resolution Output",
    title: "Dispatch",
    body: "Sends verified empathetic responses, updates agent workspaces, and logs immutable audit trails.",
    badge: "Immutable Audit Log",
  },
];

function Process({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative bg-[#121212] px-6 py-28 text-[#E6E2D8] md:px-14 md:py-36 overflow-hidden">
      <div className="relative mb-16 flex flex-wrap items-end justify-between gap-6 border-b border-[#E6E2D8]/15 pb-10">
        <div>
          <SectionTag>Operational Workflow</SectionTag>
          <h2 className="display mt-4 text-4xl md:text-6xl tracking-tight text-[#E6E2D8]">
            How the system operates
          </h2>
        </div>
        <div className="max-w-md md:text-right">
          <p className="label text-[#E6E2D8]/60 leading-relaxed">
            From complaint ingestion to verified resolution in under 20 seconds.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 font-mono text-[11px] text-[#D83B20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D83B20] animate-pulse" />
            <span>End-to-End Latency Target: &lt; 2.4s</span>
          </div>
        </div>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PROCESS_STEPS.map((s, i) => (
          <div
            key={s.step}
            onClick={onGetStarted}
            title="Launch live interactive workflow"
            className="group relative flex flex-col justify-between border border-[#E6E2D8]/15 bg-[#121212] p-7 transition-all duration-300 hover:border-[#D83B20]/70 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#E6E2D8]/10 pb-3">
                <span className="display text-xl text-[#D83B20]">
                  {s.step}
                </span>
                <span className="label text-[10px] text-[#E6E2D8]/60 group-hover:text-[#D83B20] transition-colors">
                  {s.engine}
                </span>
              </div>

              <h3 className="display mt-6 text-2xl text-[#E6E2D8] group-hover:text-[#D83B20] transition-colors">
                {s.title}
              </h3>

              <p className="label mt-4 leading-[1.85] text-[#E6E2D8]/65 group-hover:text-[#E6E2D8] transition-colors">
                {s.body}
              </p>
            </div>

            <div className="mt-8 border-t border-[#E6E2D8]/10 pt-4 flex items-center justify-between font-mono text-[10px] text-[#E6E2D8]/60">
              <span className="tracking-wider">{s.badge}</span>
              <span className="text-[#D83B20] text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {i < PROCESS_STEPS.length - 1 ? "→" : "✓"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Workspaces */
const PLANS = [
  {
    sid: "ROLE — 01",
    srs: "SRS REQ. LXVI",
    name: "Customer Portal",
    blurb: "Transparent self-service tracking, real-time ticket updates, and grounded clarification requests.",
    price: "Tier 1",
    tierLabel: "Self-Service",
    buttonText: "Access Portal",
    features: [
      "Real-time ticket status tracking",
      "Document & evidence attachment upload",
      "Focused clarification question responses",
      "Automated follow-up schedule alerts",
    ],
    featured: false,
  },
  {
    sid: "ROLE — 02",
    srs: "SRS REQ. LXVII",
    name: "Agent Copilot",
    blurb: "Complete workspace for support specialists with verified step-by-step resolution checklists.",
    price: "Tier 2",
    tierLabel: "Specialist Core",
    buttonText: "Launch Copilot",
    badge: "MOST ACTIVE WORKSPACE",
    features: [
      "Verified step-by-step resolution checklist",
      "Pre-screened empathetic draft reply",
      "Internal supervisory escalation notes",
      "SLA countdown & deadline risk warnings",
    ],
    featured: true,
  },
  {
    sid: "ROLE — 03",
    srs: "SRS REQ. LXVIII",
    name: "Admin Hub",
    blurb: "Enterprise governance, rule matrix maintenance, SLA controls, and supervisor review queues.",
    price: "Tier 3",
    tierLabel: "Leadership & Audit",
    buttonText: "Open Command Hub",
    features: [
      "Complaint Rule Matrix manager (100+ Rules)",
      "GenAI vs. Python validation mismatch logs",
      "Active SOP & policy version precedence",
      "Manual Review Queue supervisory overrides",
    ],
    featured: false,
  },
];

function Pricing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="pricing" className="bg-[#E6E2D8] text-[#121212] px-6 py-20 md:px-14 md:py-28 border-t border-[#121212]/15">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 border-b border-[#121212]/15 pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D83B20] animate-pulse" />
            <span className="font-mono text-sm md:text-base uppercase tracking-widest text-[#121212]/80 font-bold">
              Workspaces &amp; Roles
            </span>
          </div>
          <h2 className="display mt-3 text-4xl md:text-6xl text-[#121212]">
            Role-Based Governance Across All Tiers
          </h2>
        </div>
        <div className="max-w-md md:text-right">
          <p className="font-mono text-xs md:text-sm uppercase tracking-wider text-[#121212]/70 leading-relaxed font-bold">
            Designed to satisfy SRS Functional Requirements.
          </p>
          <span className="inline-block mt-1 font-mono text-xs text-[#D83B20] font-extrabold">
            Role-Based Access Control • Full Audit Trail
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col justify-between p-8 transition-all duration-300 ${
              p.featured
                ? "bg-[#121212] text-[#E6E2D8] border-2 border-[#D83B20] shadow-[0_20px_50px_rgba(216,59,32,0.18)] lg:-translate-y-2"
                : "bg-white/70 text-[#121212] border border-[#121212]/20 hover:border-[#121212] hover:bg-white/90 hover:shadow-xl"
            }`}
          >
            {p.badge ? (
              <div className="absolute -top-3.5 left-8 bg-[#D83B20] text-white px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest shadow-sm">
                {p.badge}
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between border-b pb-4 border-current/15">
                <span className={`font-mono text-xs uppercase tracking-widest font-bold ${p.featured ? "text-[#D83B20]" : "text-[#121212]/70"}`}>
                  {p.sid}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold opacity-70">
                  {p.srs}
                </span>
              </div>

              <h3 className={`display mt-5 text-3xl md:text-4xl ${p.featured ? "text-[#E6E2D8]" : "text-[#121212]"}`}>
                {p.name}
              </h3>

              <p className={`mt-3 text-sm font-medium leading-relaxed ${p.featured ? "text-[#E6E2D8]/80" : "text-[#121212]/80"}`}>
                {p.blurb}
              </p>

              <div className="mt-8 flex items-baseline gap-3 border-t pt-5 border-current/15">
                <span className="display text-4xl">
                  {p.price}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider opacity-70 font-semibold">
                  / {p.tierLabel}
                </span>
              </div>

              <ul className="mt-6 space-y-3.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-xs md:text-sm font-semibold leading-snug">
                    <span className="text-[#D83B20] text-base leading-none select-none font-bold">
                      ✳
                    </span>
                    <span className={p.featured ? "text-[#E6E2D8]/95" : "text-[#121212]/90"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-6 border-t border-current/15">
              <button
                type="button"
                onClick={onGetStarted}
                className={`w-full group flex items-center justify-between px-5 py-4 font-mono text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  p.featured
                    ? "bg-[#D83B20] text-white hover:bg-[#c2331b] shadow-md"
                    : "border-2 border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-[#E6E2D8]"
                }`}
              >
                <span>{p.buttonText}</span>
                <span className="text-base font-bold transition-transform duration-200 group-hover:translate-x-1.5">
                  →
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- FAQ */
const FAQS = [
  [
    "Why does SupportNova use two independent processing pipelines?",
    "Generative AI models must never validate their own decisions. Pipeline 1 interprets natural language, while Pipeline 2 executes deterministic rules against approved SOPs.",
  ],
  [
    "How does SupportNova prevent prompt injection attacks?",
    "Incoming complaints are evaluated in delimited context blocks and re-checked by Python regex rules to strip instruction override phrases.",
  ],
  [
    "How is customer sentiment separated from actual priority?",
    "Angry complaints regarding minor delivery delays remain P3, while calm complaints reporting overheating batteries are escalated to P1 safety priority.",
  ],
  [
    "What occurs when GenAI and Python validation disagree?",
    "Discrepancies trigger a manual review flag, pausing automated replies and recording both assessments in an immutable audit trail.",
  ],
  [
    "How does the platform handle conflicting company policies?",
    "Document versioning guarantees active policies supersede older drafts and FAQs automatically.",
  ],
];

function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-[#E6E2D8] text-[#121212] px-6 py-20 md:px-14 md:py-32 border-t border-[#121212]/25">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 border-b border-[#121212]/25 pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#D83B20] text-sm font-bold">✳</span>
            <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#121212] font-bold">
              Compliance &amp; Operations FAQ
            </span>
          </div>
          <h2 className="display mt-3 text-4xl md:text-6xl text-[#121212]">
            System Verification Inquiries
          </h2>
        </div>
      </div>

      <div className="border-t border-[#121212]/25">
        {FAQS.map(([q, a], i) => (
          <div key={q} className="border-b border-[#121212]/25">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex w-full items-center justify-between gap-6 py-6 md:py-8 text-left group cursor-pointer"
              aria-expanded={open === i}
            >
              <span className="display text-xl md:text-2xl text-[#121212] transition-colors group-hover:text-[#D83B20]">
                {q}
              </span>
              <span className="text-[#D83B20] text-2xl font-light leading-none select-none">
                {open === i ? "−" : "+"}
              </span>
            </button>

            {open === i ? (
              <p className="text-base md:text-lg leading-relaxed text-[#121212] font-medium pb-8 max-w-3xl">
                {a}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Journal (Linked) */
const POSTS = [
  ["Architecture Log · 08 min", "Eliminating Hallucinations: Ground-Truth Python Verification in Customer Support"],
  ["Integrity Protocol · 06 min", "Sentiment vs. Risk: Why Angry Complaints Don't Always Get Top Priority"],
  ["Security Defense · 07 min", "Defeating Prompt Injections and Unauthorized Financial Commitments in Production AI"],
];

function Journal({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="journal" className="bg-[#121212] px-6 py-28 text-[#E6E2D8] md:px-14">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <SectionTag>Technical Blog Highlights</SectionTag>
        <div className="max-w-xl">
          <h2 className="display text-4xl md:text-5xl text-[#E6E2D8]">Engineering notes &amp; research</h2>
          <p className="label mt-3 text-[#E6E2D8]/60">
            Documentation of our dual-pipeline architecture and prompt injection defense.
          </p>
        </div>
      </div>
      <div className="grid gap-px bg-[#E6E2D8]/15 md:grid-cols-3">
        {POSTS.map(([meta, title]) => (
          <article
            key={title}
            onClick={onGetStarted}
            title="Read technical specifications"
            className="group bg-[#121212] p-7 cursor-pointer hover:bg-[#181818] transition-colors"
          >
            <Label>{meta}</Label>
            <h3 className="display mt-6 text-2xl leading-[1.1] transition-colors group-hover:text-[#D83B20] text-[#E6E2D8]">
              {title}
            </h3>
            <span className="inline-block mt-4 text-xs font-mono text-[#D83B20] group-hover:underline">
              Explore Live Demo →
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Rotating Stamp */
function RotatingFooterStamp() {
  return (
    <a
      href="#top"
      aria-label="Back to top"
      className="group relative flex h-32 w-32 md:h-36 md:w-36 items-center justify-center transition-transform hover:scale-105"
    >
      <svg
        className="h-full w-full animate-[spin_20s_linear_infinite] text-[#121212]"
        viewBox="0 0 120 120"
      >
        <path
          id="footerCirclePath"
          d="M 60, 16 A 44, 44 0 1, 1 59.9, 16"
          fill="none"
        />
        <text className="font-mono text-[9px] uppercase tracking-[0.24em] fill-[#121212] font-bold">
          <textPath href="#footerCirclePath" startOffset="0%">
            SUPPORTNOVA • ALL RIGHTS RESERVED • 2026 •
          </textPath>
        </text>
      </svg>

      <span className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-[#121212]/30 text-base font-light text-[#121212] transition-colors group-hover:bg-[#121212] group-hover:text-[#E6E2D8]">
        ↑
      </span>
    </a>
  );
}

/* ---------------------------------------------------------------- Footer with Working Subscribe Form */
function Footer({ onLogin, onGetStarted }: { onLogin: () => void; onGetStarted: () => void }) {
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    setEmailInput("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  const footerLinks = [
    { label: "CONSOLE", href: "#top" },
    { label: "PIPELINES", href: "#intro" },
    { label: "CAPABILITIES", href: "#services" },
    { label: "WORKSPACES", href: "#pricing" },
    { label: "RESEARCH", href: "#journal" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="relative bg-[#E6E2D8] text-[#121212] px-6 pt-10 pb-16 md:px-14 border-t border-[#121212]/15">
      <div className="overflow-hidden border-b border-[#121212]/15 pb-6">
        <h2 className="display text-[8.5vw] md:text-[9vw] leading-[0.9] tracking-normal text-[#121212] select-none">
          SUPPORTNOVA
        </h2>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <p className="max-w-md text-sm font-semibold uppercase leading-[1.6] tracking-wide text-[#121212]">
            BUILDING AUTONOMOUS COMPLAINT INTELLIGENCE, DUAL GROUND-TRUTH PIPELINES, AND RESOLUTION COMPLIANCE.
          </p>

          {/* Validated Subscription Form */}
          <form onSubmit={handleSubscribe} className="space-y-1.5">
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="YOUR EMAIL"
                className="bg-[#D83B20] text-white placeholder:text-white/80 px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded-none focus:outline-none"
              />
              <button
                type="submit"
                className="font-mono text-xs uppercase tracking-wider text-[#121212] font-bold hover:text-[#D83B20] transition-colors cursor-pointer"
              >
                {subscribed ? "✓ SUBSCRIBED" : "SUBSCRIBE"}
              </button>
            </div>
            {emailError && <p className="text-[10px] text-[#D83B20] font-mono">{emailError}</p>}
            {subscribed && <p className="text-[10px] text-[#121212] font-mono font-bold">Thank you for subscribing to updates.</p>}
          </form>

          <div className="space-y-1 font-mono text-xs uppercase tracking-wider text-[#121212]/80">
            <div>RESPONSEX INTELLIGENCE · ENTERPRISE ED.</div>
            <a
              href="mailto:supportnova@techwiz.internal"
              className="block font-bold hover:text-[#D83B20] transition-colors"
            >
              SUPPORTNOVA@TECHWIZ.INTERNAL
            </a>
          </div>

          <div className="flex items-center gap-4 text-[#121212]/80">
            <button onClick={onLogin} className="hover:text-[#D83B20] font-mono text-xs uppercase font-bold transition cursor-pointer">
              Sign In
            </button>
            <span>•</span>
            <button onClick={onGetStarted} className="text-[#D83B20] font-mono text-xs uppercase font-bold hover:underline transition cursor-pointer">
              Access Workspace
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 border-t border-[#121212]/15 lg:border-t-0">
          <div className="divide-y divide-[#121212]/15 border-t border-b border-[#121212]/15">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group flex items-center justify-between py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#121212] transition-colors hover:text-[#D83B20]"
              >
                <span>{link.label}</span>
                <span className="text-sm transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-start lg:justify-end items-center">
          <RotatingFooterStamp />
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- Main Landing Page */
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="bg-[#0F0F0F] text-[#EBE9E5] relative selection:bg-[#D83B20] selection:text-white scroll-smooth">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&family=Phudu:wght@800;900&display=swap');

        html {
          scroll-behavior: smooth;
        }

        .display {
          font-family: 'Phudu', sans-serif !important;
          font-weight: 800 !important;
          line-height: 0.88 !important;
          letter-spacing: -0.02em !important;
          text-transform: uppercase !important;
        }

        .label {
          font-family: 'Mona Sans', ui-sans-serif, system-ui, sans-serif !important;
          font-size: 0.6875rem !important;
          letter-spacing: 0.18em !important;
          text-transform: uppercase !important;
          line-height: 1.2 !important;
        }

        .ticks {
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(230, 226, 216, 0.22) 0 1px,
            transparent 1px 14px
          );
        }

        @keyframes marquee-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .marquee-track {
          animation: marquee-x 28s linear infinite !important;
          will-change: transform;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Nav */}
      <Nav onLogin={onLogin} onGetStarted={onGetStarted} />

      <main className="relative">
        {/* Layer 1: Hero */}
        <div className="sticky top-0 z-10 min-h-screen w-full">
          <Hero onGetStarted={onGetStarted} />
        </div>

        {/* Layer 2: Intro */}
        <div className="sticky top-0 z-20 min-h-screen w-full bg-[#121212] shadow-[0_-30px_60px_rgba(0,0,0,0.6)]">
          <Intro />
        </div>

        {/* Layer 3: Marquee & Impact */}
        <div className="sticky top-0 z-30 min-h-screen w-full bg-[#121212] shadow-[0_-30px_60px_rgba(0,0,0,0.6)] flex flex-col justify-center">
          <Marquee
            items={[
              "Dual-Pipeline Architecture Active",
              "100+ Complaint Resolution Rules",
              "Zero Unsupported Guarantees",
              "Prompt Injection Defense Engaged",
              "Decoupled Sentiment & Urgency",
              "Full SOP Precedence Control",
            ]}
          />
          <Impact />
        </div>

        {/* Layer 4: Services */}
        <div className="relative z-40 w-full bg-[#E6E2D8] shadow-[0_-30px_60px_rgba(0,0,0,0.35)]">
          <Services onGetStarted={onGetStarted} />
        </div>

        {/* Layer 5: Process */}
        <div className="sticky top-0 z-50 min-h-screen w-full bg-[#121212] shadow-[0_-30px_60px_rgba(0,0,0,0.6)]">
          <Process onGetStarted={onGetStarted} />
        </div>

        {/* Layer 6: Pricing / Workspaces */}
        <div className="relative z-[60] w-full bg-[#E6E2D8] shadow-[0_-30px_60px_rgba(0,0,0,0.35)]">
          <Pricing onGetStarted={onGetStarted} />
        </div>

        {/* Layer 7: FAQ */}
        <div className="relative z-[70] w-full bg-[#E6E2D8] shadow-[0_-30px_60px_rgba(0,0,0,0.35)]">
          <Faq />
        </div>

        {/* Layer 8: Journal */}
        <div className="sticky top-0 z-[80] min-h-screen w-full bg-[#121212] shadow-[0_-30px_60px_rgba(0,0,0,0.6)]">
          <Journal onGetStarted={onGetStarted} />
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-[90] shadow-[0_-30px_60px_rgba(0,0,0,0.4)]">
        <Footer onLogin={onLogin} onGetStarted={onGetStarted} />
      </div>
    </div>
  );
};