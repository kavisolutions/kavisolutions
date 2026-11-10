export type ServiceData = {
  slug: string;
  tag: string;
  title: string;
  highlight: string;
  hero: string;
  gradient: string;
  icon: string;
  metrics: { value: string; label: string }[];
  featuresTitle: string;
  features: { icon: string; title: string; desc: string }[];
  processTitle: string;
  process: { step: string; title: string; desc: string }[];
  stackTitle: string;
  stack: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaDesc: string;
};

export const services: Record<string, ServiceData> = {
  web: {
    slug: "web",
    tag: "Web Development",
    title: "Websites & web apps",
    highlight: "that win customers",
    hero: "From blazing-fast marketing sites to full-scale web applications — we design, build and deploy web experiences that are fast, secure and beautiful on every screen.",
    gradient: "from-violet-500 to-purple-500",
    icon: "🌐",
    metrics: [
      { value: "80+", label: "Web projects shipped" },
      { value: "90+", label: "Average Lighthouse score" },
      { value: "<1s", label: "Typical load time" },
      { value: "100%", label: "Mobile responsive" },
    ],
    featuresTitle: "What we build",
    features: [
      { icon: "🏢", title: "Corporate websites", desc: "Brand sites that tell your story with polish, motion and clarity." },
      { icon: "🛒", title: "E-commerce stores", desc: "Conversion-focused storefronts with carts, payments and inventory." },
      { icon: "📊", title: "SaaS dashboards", desc: "Data-rich applications with roles, analytics and real-time views." },
      { icon: "🔗", title: "Web portals", desc: "Customer, partner and admin portals with secure authentication." },
      { icon: "🧠", title: "Headless CMS", desc: "Content that your team edits easily, delivered at edge speed." },
      { icon: "🚀", title: "SEO-first builds", desc: "Structured, semantic and fast — built to rank from day one." },
      { icon: "📱", title: "Progressive web apps", desc: "Installable, offline-capable web apps that feel native." },
      { icon: "🎯", title: "Landing pages", desc: "High-converting campaign pages designed to turn clicks into leads." },
    ],
    processTitle: "Our web process",
    process: [
      { step: "01", title: "Discover", desc: "Workshops to define goals, audience and success metrics." },
      { step: "02", title: "Design", desc: "Wireframes to high-fidelity UI with your brand at the center." },
      { step: "03", title: "Build", desc: "Clean, typed, tested code with performance baked in." },
      { step: "04", title: "Launch", desc: "Zero-downtime deploy on your VPS or cloud with SSL." },
      { step: "05", title: "Grow", desc: "Analytics, SEO and iterations that compound results." },
    ],
    stackTitle: "Technologies we use",
    stack: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Redis", "Nginx", "Docker", "Vercel / VPS"],
    faqTitle: "Common questions",
    faq: [
      { q: "How long does a website take?", a: "A landing page takes 1–2 weeks; a full web app typically 4–10 weeks depending on scope." },
      { q: "Do you handle hosting and deployment?", a: "Yes — we deploy on your VPS or cloud with nginx, PM2 and SSL included, plus ongoing maintenance." },
      { q: "Can you work with our existing design?", a: "Absolutely. We can build from scratch or implement an existing brand system." },
      { q: "Is SEO included?", a: "Every build is SEO-structured. We can also run a full content and keyword strategy." },
    ],
    ctaTitle: "Ready to launch your web presence?",
    ctaDesc: "Tell us about your project and we'll come back with a plan within 24 hours.",
  },
  mobile: {
    slug: "mobile",
    tag: "Mobile Development",
    title: "Native-feel mobile apps",
    highlight: "people love to open",
    hero: "iOS and Android apps engineered for smoothness, speed and delight — shipped to the App Store and Play Store with confidence.",
    gradient: "from-sky-500 to-cyan-500",
    icon: "📱",
    metrics: [
      { value: "50+", label: "Mobile apps shipped" },
      { value: "4.8★", label: "Average store rating" },
      { value: "2", label: "Platforms, one codebase" },
      { value: "60fps", label: "Buttery interactions" },
    ],
    featuresTitle: "What we build",
    features: [
      { icon: "🍏", title: "iOS apps", desc: "Swift-native polish, App Store review-ready and TestFlight tested." },
      { icon: "🤖", title: "Android apps", desc: "Kotlin and modern Android tooling for every screen size." },
      { icon: "⚛️", title: "React Native", desc: "One codebase, two stores — with true native performance." },
      { icon: "🐦", title: "Flutter", desc: "Beautiful UIs with pixel-perfect consistency across platforms." },
      { icon: "🔔", title: "Push & realtime", desc: "Notifications, chat and live updates that keep users engaged." },
      { icon: "📶", title: "Offline-first", desc: "Sync engines so your app works even without a connection." },
      { icon: "💳", title: "Payments", desc: "In-app purchases, subscriptions and wallet integrations." },
      { icon: "🛡️", title: "Security", desc: "Encrypted storage, biometric auth and hardened APIs." },
    ],
    processTitle: "Our mobile process",
    process: [
      { step: "01", title: "Ideate", desc: "Product goals, user stories and the core value proposition." },
      { step: "02", title: "Prototype", desc: "Clickable prototypes to validate the flow before code." },
      { step: "03", title: "Build", desc: "Cross-platform code with native modules where it matters." },
      { step: "04", title: "Test", desc: "Device-matrix QA, performance tuning and crash-free polish." },
      { step: "05", title: "Ship", desc: "Store submission, rollout and analytics instrumentation." },
    ],
    stackTitle: "Technologies we use",
    stack: ["React Native", "Expo", "Flutter", "Swift", "Kotlin", "Firebase", "TypeScript", "GraphQL", "WebSockets", "Fastlane"],
    faqTitle: "Common questions",
    faq: [
      { q: "iOS, Android or both?", a: "Both — we build cross-platform so you ship to two stores with one team and budget." },
      { q: "Do you handle App Store and Play Store submission?", a: "Yes, including accounts guidance, screenshots, review fixes and updates." },
      { q: "Can we reuse an existing backend?", a: "Sure. We integrate with your APIs or build one to power the app." },
      { q: "What does maintenance look like?", a: "We offer post-launch support, OS updates, bug fixes and feature iterations." },
    ],
    ctaTitle: "Turn your app idea into downloads",
    ctaDesc: "Let's scope your mobile app — from first prototype to store launch.",
  },
  product: {
    slug: "product",
    tag: "Digital Products",
    title: "Digital products",
    highlight: "people adopt",
    hero: "From fuzzy idea to launched product — we design, prototype and ship software products that solve real problems and get traction.",
    gradient: "from-fuchsia-500 to-pink-500",
    icon: "🧩",
    metrics: [
      { value: "30+", label: "Products launched" },
      { value: "2wk", label: "MVP sprints" },
      { value: "100%", label: "Design to dev handoff" },
      { value: "5/5", label: "Client satisfaction" },
    ],
    featuresTitle: "What we do",
    features: [
      { icon: "💡", title: "Product strategy", desc: "Positioning, roadmap and the smallest path to a valuable product." },
      { icon: "🧪", title: "MVP sprints", desc: "Ship a focused, launchable version in weeks, not months." },
      { icon: "🎨", title: "UX & UI design", desc: "Interfaces backed by research, wireframes and delightful visuals." },
      { icon: "📐", title: "Design systems", desc: "Reusable components and tokens that keep products consistent." },
      { icon: "🔬", title: "Prototyping", desc: "Test ideas cheaply with interactive, clickable prototypes." },
      { icon: "📈", title: "Product analytics", desc: "Instrument the metrics that matter and iterate with data." },
      { icon: "🔁", title: "Iteration", desc: "Continuous discovery and delivery as your product grows." },
      { icon: "🧑‍🔧", title: "Fractional teams", desc: "Senior product talent embedded in your team on demand." },
    ],
    processTitle: "Our product process",
    process: [
      { step: "01", title: "Discover", desc: "User research, market analysis and problem framing." },
      { step: "02", title: "Define", desc: "Value proposition, scope and measurable success metrics." },
      { step: "03", title: "Design", desc: "Flows, wireframes and high-fidelity UI to validate." },
      { step: "04", title: "Build", desc: "Agile delivery of a polished, testable product." },
      { step: "05", title: "Launch & learn", desc: "Ship, measure, and iterate toward product-market fit." },
    ],
    stackTitle: "How we work",
    stack: ["Product strategy", "UX research", "Figma", "Prototyping", "Agile delivery", "Analytics", "Design systems", "MVP development"],
    faqTitle: "Common questions",
    faq: [
      { q: "What is an MVP sprint?", a: "A focused 2-week build of the core value so you can test with real users fast." },
      { q: "Do you just design, or build too?", a: "Both. We run end-to-end from research and design to shipping code." },
      { q: "Can you join our existing team?", a: "Yes — we work as embedded product designers and engineers." },
      { q: "How do you decide what to build first?", a: "We prioritize by user value vs. effort, keeping scope honest and small." },
    ],
    ctaTitle: "Validate your product idea fast",
    ctaDesc: "Book a product scoping call — walk away with a clear plan and estimate.",
  },
  marketing: {
    slug: "marketing",
    tag: "Digital Marketing",
    title: "Marketing that",
    highlight: "turns clicks into customers",
    hero: "Data-driven campaigns across SEO, paid ads, content and social — engineered to grow your audience and compound your revenue.",
    gradient: "from-emerald-500 to-teal-500",
    icon: "📈",
    metrics: [
      { value: "3x", label: "Average ROAS" },
      { value: "200+", label: "Campaigns run" },
      { value: "40%", label: "Avg. lead growth" },
      { value: "24/7", label: "Reporting & optimization" },
    ],
    featuresTitle: "What we offer",
    features: [
      { icon: "🔍", title: "SEO & content", desc: "Keyword strategy, on-page optimization and content that ranks." },
      { icon: "🎯", title: "Paid ads", desc: "Google, Meta and social campaigns with strict ROAS tracking." },
      { icon: "📲", title: "Social media", desc: "Content calendars, community and engagement that build brand." },
      { icon: "✉️", title: "Email marketing", desc: "Automated journeys, newsletters and retention flows." },
      { icon: "🧰", title: "Marketing automation", desc: "CRM + funnels wired so leads never fall through the cracks." },
      { icon: "📊", title: "Analytics", desc: "Dashboards and attribution so you know what actually works." },
      { icon: "🖼️", title: "Creative & branding", desc: "Ad creatives, copy and landing pages designed to convert." },
      { icon: "🔄", title: "CRO", desc: "A/B testing and funnel optimization to lift conversion rates." },
    ],
    processTitle: "Our marketing process",
    process: [
      { step: "01", title: "Audit", desc: "We analyze your funnel, audience and current performance." },
      { step: "02", title: "Strategy", desc: "Channels, budget and KPIs aligned to your business goals." },
      { step: "03", title: "Launch", desc: "Campaigns, creatives and content go live fast." },
      { step: "04", title: "Optimize", desc: "Daily data reviews and continuous A/B improvements." },
      { step: "05", title: "Scale", desc: "Winning channels get more budget, faster and cleaner." },
    ],
    stackTitle: "Platforms & tools",
    stack: ["Google Ads", "Meta Ads", "GA4", "Google Search Console", "SEMrush", "HubSpot", "Mailchimp", "Meta Business Suite", "Hotjar", "Notion"],
    faqTitle: "Common questions",
    faq: [
      { q: "How soon will we see results?", a: "SEO compounds over 2–4 months; paid ads can show results in the first weeks." },
      { q: "Do you require a long-term contract?", a: "No. Month-to-month after an initial setup sprint." },
      { q: "What reporting do we get?", a: "A live dashboard plus a monthly review with recommendations." },
      { q: "Can you take over our existing campaigns?", a: "Yes — we audit and optimize what you already have running." },
    ],
    ctaTitle: "Grow your business with marketing that works",
    ctaDesc: "Get a free funnel audit and a growth plan for your brand.",
  },
};
