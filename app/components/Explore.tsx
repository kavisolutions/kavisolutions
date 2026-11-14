"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Smartphone,
  Cpu,
  TrendingUp,
  Layers,
  GraduationCap,
  Sprout,
  Landmark,
  BarChart3,
  CircleDollarSign,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

export type StudioService = {
  id: string;
  number: string;
  category: "software" | "ventures" | "projects" | "civic";
  categoryLabel: string;
  tag: string;
  icon: typeof Globe;
  title: string;
  highlight: string;
  sub: string;
  desc: string;
  href: string;
  cta: string;
  topGradient: string;
  iconColor: string;
  iconBg: string;
  chips: string[];
  metrics: { value: string; label: string }[];
  deliverables: string[];
};

const allServices: StudioService[] = [
  {
    id: "web",
    number: "01 / WEB ARCHITECTURE",
    category: "software",
    categoryLabel: "Software & Cloud",
    tag: "Distributed Web Systems",
    icon: Globe,
    title: "Web Development & Cloud Systems",
    highlight: "engineered to convert & scale",
    sub: "Sub-second Next.js 16 architectures, Go microservices, and zero-downtime edge deploys",
    desc: "From blazing-fast corporate marketing sites and high-conversion headless e-commerce to multi-tenant SaaS dashboards and distributed API gateways. Engineered with sub-second page loads, zero-downtime CI/CD, and SOC2-ready security.",
    href: "/web",
    cta: "Explore Web Development",
    topGradient: "from-[#2563EB] via-[#91B4FF] to-[#06B6D4]",
    iconColor: "text-[#91B4FF]",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    chips: [
      "Next.js 16",
      "React 19",
      "Go Microservices",
      "PostgreSQL",
      "Cloudflare Edge",
      "Tailwind CSS",
      "Headless CMS",
      "Docker",
    ],
    metrics: [
      { value: "80+", label: "Web Systems Shipped" },
      { value: "99+", label: "Average Lighthouse" },
      { value: "<1s", label: "Typical Load Time" },
      { value: "100%", label: "Mobile Responsive" },
    ],
    deliverables: [
      "Corporate & Brand Portals",
      "Headless E-Commerce Engines",
      "Multi-Tenant SaaS Dashboards",
      "Edge API Gateways",
    ],
  },
  {
    id: "mobile",
    number: "02 / MOBILE PLATFORMS",
    category: "software",
    categoryLabel: "Mobile Engineering",
    tag: "Native & Distributed Apps",
    icon: Smartphone,
    title: "Mobile App Development",
    highlight: "native polish people love to open",
    sub: "Native iOS (Swift), Android (Kotlin), and cross-platform Flutter platforms",
    desc: "iOS and Android mobile products engineered for fluid 60fps responsiveness, offline-first local database synchronization, biometric security, and zero-degradation battery efficiency. Shipped to App Store and Google Play with full confidence.",
    href: "/mobile",
    cta: "Explore App Development",
    topGradient: "from-[#06B6D4] via-[#38BDF8] to-[#3B82F6]",
    iconColor: "text-[#38BDF8]",
    iconBg: "bg-sky-500/10 border-sky-500/20",
    chips: [
      "Swift (iOS)",
      "Kotlin (Android)",
      "Flutter",
      "React Native",
      "Offline-First Sync",
      "CRDT Engines",
      "Biometric Auth",
      "TestFlight CI",
    ],
    metrics: [
      { value: "50+", label: "Mobile Apps Shipped" },
      { value: "4.8★", label: "App Store Rating" },
      { value: "60fps", label: "Smooth Interactions" },
      { value: "100%", label: "Offline-First Ready" },
    ],
    deliverables: [
      "Native iOS & Android Apps",
      "Cross-Platform Codebases",
      "Background Telemetry Engines",
      "Store Launch & Rollout",
    ],
  },
  {
    id: "projects",
    number: "03 / SHIPPED REPOSITORIES",
    category: "projects",
    categoryLabel: "Production Work",
    tag: "Live Shipped Systems",
    icon: Layers,
    title: "Production Projects & Client Systems",
    highlight: "proven software operating live at scale",
    sub: "Transparent case studies detailing architectural trade-offs, live metrics and performance",
    desc: "Browse our shipped production portfolio spanning distributed fintech ledgers, HIPAA-compliant edge medical AI, telemetry pipelines ingesting millions of daily events, Pan-India logistics grids, and secure government citizen portals.",
    href: "/projects",
    cta: "Browse Shipped Projects",
    topGradient: "from-[#2563EB] via-[#3B82F6] to-[#60A5FA]",
    iconColor: "text-[#60A5FA]",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    chips: [
      "Apex Financial Ledger",
      "Pulse Health AI",
      "Orbit SaaS Telemetry",
      "FieldGrid Pan-India",
      "Zenith GovPortal",
      "Chrono Crypto Vault",
    ],
    metrics: [
      { value: "120+", label: "Systems Deployed" },
      { value: "40+", label: "Enterprise Clients" },
      { value: "99.99%", label: "Live Availability" },
      { value: "Zero", label: "Critical Vulnerabilities" },
    ],
    deliverables: [
      "High-Frequency Fintech Systems",
      "Clinical AI Edge Telemetry",
      "SaaS Infrastructure at Scale",
      "Pan-India Field Logistics",
    ],
  },
  {
    id: "fellowship",
    number: "04 / TALENT RESIDENCY",
    category: "ventures",
    categoryLabel: "Ventures & Academy",
    tag: "11-Month Engineering Cohort",
    icon: GraduationCap,
    title: "Kavi Fellowship — 11-Month Engineering Residency",
    highlight: "real code, Vipassana retreats & guaranteed careers",
    sub: "An intensive residential engineering fellowship for diploma students, graduates & career switchers",
    desc: "A transformative 11-month full-time residency combining high-craft software engineering on live client repositories, three mandatory 10-day Vipassana meditation retreats, and grassroots rural leadership assignments — backed by a 100% placement track record.",
    href: "/fellowship",
    cta: "Learn About Fellowship & Apply",
    topGradient: "from-[#F59E0B] via-[#FBBF24] to-[#F97316]",
    iconColor: "text-[#FBBF24]",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    chips: [
      "11 Months Full-Time",
      "Vipassana Retreats",
      "Real Client Repositories",
      "100% Career Placement",
      "Monthly Living Stipend",
      "1-on-1 Staff Mentorship",
    ],
    metrics: [
      { value: "11 Mos", label: "Immersive Duration" },
      { value: "100%", label: "Graduate Placement" },
      { value: "3", label: "Vipassana Retreats" },
      { value: "Stipend", label: "Financial Support" },
    ],
    deliverables: [
      "Production-Ready Portfolio",
      "Mindfulness & Deep Focus",
      "Full-Stack System Mastery",
      "Tier-One Studio Placements",
    ],
  },
  {
    id: "farms",
    number: "05 / REGENERATIVE AGRICULTURE",
    category: "ventures",
    categoryLabel: "Ventures & Tourism",
    tag: "Farm Products & Village Tourism",
    icon: Sprout,
    title: "Kavi Farms — Organic Produce & Village Tourism",
    highlight: "pure farm produce and restorative weekend retreats",
    sub: "Direct-from-farm natural produce and weekend village experiences from Polepalli, Palnadu, AP",
    desc: "Connecting urban families with authentic regenerative rural life. Chemical-free heritage produce, pure wood-churned cold-pressed oils, and curated weekend village homestay experiences in Polepalli, Palnadu, Andhra Pradesh.",
    href: "/farms",
    cta: "Discover Kavi Farms",
    topGradient: "from-[#84CC16] via-[#A3E635] to-[#10B981]",
    iconColor: "text-[#A3E635]",
    iconBg: "bg-lime-500/10 border-lime-500/20",
    chips: [
      "Chemical-Free Produce",
      "Cold-Pressed Oils",
      "Heritage Mangoes",
      "Village Homestays",
      "Bullock-Cart Treks",
      "Palnadu, Andhra Pradesh",
    ],
    metrics: [
      { value: "100%", label: "Chemical-Free" },
      { value: "Polepalli", label: "Palnadu, AP Location" },
      { value: "Weekend", label: "Village Homestays" },
      { value: "Farm Direct", label: "Cold-Pressed Oils" },
    ],
    deliverables: [
      "Seasonal Heritage Produce",
      "Wood-Pressed Oils & Honey",
      "Weekend Rural Retreats",
      "Farm-to-Door Delivery",
    ],
  },
  {
    id: "ai-blockchain",
    number: "06 / DETERMINISTIC INTELLIGENCE",
    category: "software",
    categoryLabel: "Deep Tech & AI",
    tag: "Autonomous Agents & Cryptography",
    icon: Cpu,
    title: "Applied AI & Zero-Knowledge Verification",
    highlight: "deterministic agent runners & cryptographic proofs",
    sub: "Production LLM agent systems, safety guardrails and zero-knowledge state verification",
    desc: "Autonomous agent runners with multi-step deterministic safety guardrails, domain-specific RAG vector retrieval pipelines, and zero-knowledge cryptographic state proofs that guarantee tamper-evident enterprise execution without hallucinations.",
    href: "/ai-blockchain",
    cta: "Explore Applied AI & Deep Tech",
    topGradient: "from-[#8B5CF6] via-[#C084FC] to-[#EC4899]",
    iconColor: "text-[#C084FC]",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    chips: [
      "Gemini API",
      "Agent Runners",
      "RAG Vector Pipelines",
      "Zero-Knowledge SNARKs",
      "Deterministic Workflows",
      "Vector DBs",
      "Guardrail Sandboxes",
    ],
    metrics: [
      { value: "12ms", label: "Cryptographic Proofs" },
      { value: "0%", label: "Unchecked Hallucination" },
      { value: "Multi-Agent", label: "Concurrent Runners" },
      { value: "SOC2", label: "Boundary Isolated" },
    ],
    deliverables: [
      "Enterprise Agent Workflows",
      "Private RAG Knowledge Bases",
      "ZK State Verifications",
      "Model Evaluation Sandboxes",
    ],
  },
  {
    id: "marketing",
    number: "07 / GROWTH SYSTEMS",
    category: "software",
    categoryLabel: "Growth & SEO",
    tag: "Compounding Customer Loops",
    icon: TrendingUp,
    title: "Growth Systems & Programmatic Marketing",
    highlight: "predictable acquisition channels that compound",
    sub: "Algorithmic programmatic SEO, revenue attribution, and closed-loop conversion funnels",
    desc: "Programmatic SEO engines generating thousands of indexable high-intent landing pages, multi-touch revenue attribution pipelines, automated conversion rate optimization, and performance paid acquisition measured against closed pipeline revenue.",
    href: "/marketing",
    cta: "Explore Growth Systems",
    topGradient: "from-[#06B6D4] via-[#34D399] to-[#10B981]",
    iconColor: "text-[#34D399]",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    chips: [
      "Programmatic SEO",
      "Revenue Attribution",
      "Paid Acquisition",
      "Conversion Rate Opt",
      "Mixpanel / PostHog",
      "Customer Retention",
      "A/B Testing",
    ],
    metrics: [
      { value: "3.4x", label: "Pipeline Velocity Lift" },
      { value: "100%", label: "Closed-Loop Attribution" },
      { value: "Top-10", label: "SERP Rankings" },
      { value: "<30d", label: "Payback Period Target" },
    ],
    deliverables: [
      "Programmatic SEO Engines",
      "Multi-Touch Attribution Stack",
      "Performance Paid Campaigns",
      "Automated Retention Funnels",
    ],
  },
  {
    id: "government",
    number: "08 / PUBLIC SYSTEMS",
    category: "civic",
    categoryLabel: "Civic Infrastructure",
    tag: "GovTech Modernization",
    icon: Landmark,
    title: "Government Technology (GovTech) Services",
    highlight: "modern public platforms & seamless citizen journeys",
    sub: "Platform modernization, high-concurrency exam engines, and zero-trust security audits",
    desc: "We partner with government departments, state university boards, and public institutions across India to modernize legacy digital portals, architect zero-downtime examination registration engines, and harden citizen data workflows under written authorization.",
    href: "/government",
    cta: "Explore GovTech Solutions",
    topGradient: "from-[#2563EB] via-[#06B6D4] to-[#38BDF8]",
    iconColor: "text-[#38BDF8]",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    chips: [
      "Citizen Service Portals",
      "Exam Registration Engines",
      "AP-First Strategy",
      "Zero-Trust Auditing",
      "High Concurrency",
      "G2C & G2B Workflows",
    ],
    metrics: [
      { value: "Millions", label: "Citizens Served" },
      { value: "3 Layers", label: "Data, Frontend & Backend" },
      { value: "Zero", label: "Peak Load Downtime" },
      { value: "Authorized", label: "Audited Assessments" },
    ],
    deliverables: [
      "State Portal Modernization",
      "High-Throughput Exam Engines",
      "Security Hardening Audits",
      "Citizen Journey Optimizations",
    ],
  },
  {
    id: "survey",
    number: "09 / FIELD RESEARCH",
    category: "civic",
    categoryLabel: "Field Intelligence",
    tag: "Pan-India Surveyor Network",
    icon: BarChart3,
    title: "Survey & Research Solutions — Pan-India Field Network",
    highlight: "verified field surveyors, polling and statistical analytics",
    sub: "End-to-end research execution from questionnaire design to verified field data",
    desc: "Deploying audited on-the-ground field surveyors across 15+ Indian states for consumer market research, political sentiment polling, socio-economic studies, and corporate supply audits — equipped with real-time GPS and biometric photo verification.",
    href: "/survey",
    cta: "Explore Survey Network",
    topGradient: "from-[#EC4899] via-[#F43F5E] to-[#E11D48]",
    iconColor: "text-[#F43F5E]",
    iconBg: "bg-pink-500/10 border-pink-500/20",
    chips: [
      "Pan-India Network",
      "GPS & Photo Verification",
      "Market Research",
      "Political Polling",
      "Socio-Economic Surveys",
      "Executive Analytics",
    ],
    metrics: [
      { value: "15+ States", label: "Pan-India Reach" },
      { value: "100%", label: "Field Verified" },
      { value: "Real-Time", label: "Telemetry Stream" },
      { value: "Audited", label: "Clean Datasets" },
    ],
    deliverables: [
      "Field Survey Execution",
      "Questionnaire & Sample Design",
      "Fraud-Proof GPS Telemetry",
      "Executive Board Reports",
    ],
  },
  {
    id: "financial",
    number: "10 / FINANCIAL ADVISORY",
    category: "civic",
    categoryLabel: "Financial Practice",
    tag: "Tax, Planning & Compliance",
    icon: CircleDollarSign,
    title: "Financial Services — Tax, Planning & Cash Flow",
    highlight: "handled properly, year-round and fully documented",
    sub: "Income tax filing, tax planning, accounting and cash flow advisory for individuals and businesses",
    desc: "Comprehensive financial support spanning individual ITR filing, long-term tax optimization, corporate bookkeeping, GST filing, and dynamic cash-flow forecasting. Delivered year-round through appropriately qualified professional partners.",
    href: "/financial",
    cta: "Explore Financial Advisory",
    topGradient: "from-[#10B981] via-[#059669] to-[#047857]",
    iconColor: "text-[#10B981]",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    chips: [
      "Individual ITR Filing",
      "Corporate Bookkeeping",
      "GST & Payroll",
      "Cash Flow Forecasting",
      "Year-Round Support",
      "Documented Plans",
    ],
    metrics: [
      { value: "2 Tracks", label: "Individual & Business" },
      { value: "Year-Round", label: "Not Just Tax Season" },
      { value: "100%", label: "Documented Advice" },
      { value: "Compliant", label: "Zero Discrepancy" },
    ],
    deliverables: [
      "Tax Filing & Planning",
      "Corporate Financial Accounting",
      "Cash-Flow Forecasting Models",
      "Regulatory Filings Support",
    ],
  },
  {
    id: "verify",
    number: "11 / PUBLIC REGISTRY",
    category: "civic",
    categoryLabel: "Registry & Trust",
    tag: "Instant Certificate Verification",
    icon: ShieldCheck,
    title: "Public Credential Registry & Verification",
    highlight: "cryptographic tamper-proofing and instant QR checks",
    sub: "Search and verify authentic Kavi Solutions certificates, fellowship awards and surveyor IDs",
    desc: "A public, cryptographically verifiable registry ensuring complete credential transparency. Validate authentic certificates issued to fellowship graduates, surveyors, and enterprise clients using unique certificate IDs or camera QR scans.",
    href: "/verify",
    cta: "Verify a Certificate",
    topGradient: "from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]",
    iconColor: "text-[#60A5FA]",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    chips: [
      "Instant QR Scanning",
      "Unique Cryptographic Hash",
      "Public Ledger",
      "Fellowship Certificates",
      "Surveyor Credentials",
      "Tamper-Proof",
    ],
    metrics: [
      { value: "Instant", label: "Real-Time Verification" },
      { value: "Unique", label: "Cryptographic IDs" },
      { value: "Public", label: "Open Registry" },
      { value: "100%", label: "Tamper Evident" },
    ],
    deliverables: [
      "Instant Certificate Check",
      "QR Code Verification Engine",
      "Credential Revocation Status",
      "Digital PDF Certification",
    ],
  },
];

const categoryFilters = [
  { id: "all", label: "All Services & Offerings", count: 11 },
  { id: "software", label: "Software & AI", count: 4 },
  { id: "projects", label: "Production Projects", count: 1 },
  { id: "ventures", label: "Ventures & Fellowship", count: 2 },
  { id: "civic", label: "Civic & Public Good", count: 4 },
] as const;

export default function Explore() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredServices =
    activeTab === "all"
      ? allServices
      : allServices.filter((s) => s.category === activeTab);

  return (
    <section id="explore" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Background glow orbs */}
      <GlowOrb className="top-1/4 -left-20 w-[500px] h-[350px] bg-[#175CD3]/12 blur-[120px]" />
      <GlowOrb className="bottom-1/3 -right-20 w-[550px] h-[380px] bg-[#06B6D4]/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-14 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full bg-[#19202E]/80 backdrop-blur-md border border-[rgba(148,163,184,0.18)]">
            <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              COMPLETE STUDIO ECOSYSTEM
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] max-w-3xl mb-4 leading-tight">
            All our services &amp; practices,{" "}
            <span className="bg-gradient-to-r from-[#91B4FF] via-[#70A1FF] to-[#68FCBF] bg-clip-text text-transparent">
              shipped under one studio.
            </span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-[#A5B3C7] max-w-2xl">
            From high-velocity web and mobile systems to applied AI, talent residency, organic farms,
            and civic infrastructure — explore our full portfolio of services in detail.
          </p>

          {/* Interactive Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categoryFilters.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#175CD3] text-white shadow-[0_0_20px_rgba(23,92,211,0.4)]"
                    : "bg-[#19202E]/80 hover:bg-[#19202E] text-[#7889A0] hover:text-[#F7F9FC] border border-[rgba(148,163,184,0.14)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-[#7889A0]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Distinct Service Rows */}
        <div className="space-y-8">
          {filteredServices.map((service, idx) => {
            const Icon = service.icon;
            const isReversed = idx % 2 === 1;

            return (
              <Reveal key={service.id}>
                <TiltCard
                  intensity={4}
                  className="group relative rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-9 lg:p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] hover:border-[rgba(148,163,184,0.35)] transition-all overflow-hidden"
                >
                  {/* Top accent gradient line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${service.topGradient}`}
                  />

                  <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center ${
                      isReversed ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Left/Primary Info Column (7 Cols) */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div>
                        {/* Eyebrow & Category Badges */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7889A0]">
                            {service.number}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium bg-white/5 border border-[rgba(148,163,184,0.14)] text-[#91B4FF]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                            {service.categoryLabel}
                          </span>
                        </div>

                        {/* Title & Highlight */}
                        <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F7F9FC] tracking-tight mb-2 leading-snug">
                          {service.title}
                        </h3>
                        <p className="text-[14px] sm:text-[15px] font-medium text-[#91B4FF] mb-3">
                          {service.sub}
                        </p>

                        {/* Narrative Description */}
                        <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                          {service.desc}
                        </p>

                        {/* Capability Chips */}
                        <div className="flex flex-wrap gap-2 mb-8">
                          {service.chips.map((chip) => (
                            <span
                              key={chip}
                              className="px-3 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-xs font-mono text-[#A5B3C7]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action CTA */}
                      <div>
                        <Link
                          href={service.href}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-6 text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] focus:outline-none focus:ring-2 focus:ring-[#91B4FF]"
                        >
                          <span>{service.cta}</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>

                    {/* Right/Telemetry & Deliverables Column (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Visual Header Tile */}
                      <div className="flex items-center justify-between p-4 rounded-[18px] bg-[#151B2A]/90 border border-[rgba(148,163,184,0.12)]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${service.iconBg} ${service.iconColor} transition-transform group-hover:scale-105`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block">
                              Active Practice
                            </span>
                            <span className="font-display text-[15px] font-semibold text-[#F7F9FC]">
                              {service.tag}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                          Online
                        </span>
                      </div>

                      {/* Joined 2x2 Metric Strip */}
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-[20px] bg-[#151B2A]/70 border border-[rgba(148,163,184,0.1)]">
                        {service.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="p-3 rounded-[14px] bg-[#19202E]/80 border border-[rgba(148,163,184,0.08)] flex flex-col justify-center"
                          >
                            <span className="font-display text-xl sm:text-2xl font-bold text-[#F7F9FC] tracking-tight">
                              {m.value}
                            </span>
                            <span className="font-mono text-[10px] sm:text-[11px] text-[#7889A0] mt-0.5 line-clamp-1">
                              {m.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Core Deliverables Box */}
                      <div className="p-4 rounded-[18px] bg-[#151B2A]/70 border border-[rgba(148,163,184,0.1)]">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block mb-2.5 font-semibold">
                          Core Deliverables &amp; Outputs
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.deliverables.map((d) => (
                            <div
                              key={d}
                              className="flex items-center gap-2 text-xs text-[#A5B3C7]"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                              <span className="truncate">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
