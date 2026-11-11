/* Content for the Kavi Financial Services page.
 *
 * Everything an editor is likely to change lives here rather than in the JSX.
 * Compliance copy is deliberately conservative — see the notes at the bottom
 * and docs/financial-page.md before adding claims about registrations.
 */

export type FinancialService = {
  slug: string;
  icon: string;
  title: string;
  summary: string;
  items: string[];
};

export type FinancialStep = {
  step: string;
  title: string;
  summary: string;
};

export const FINANCIAL_CONTACT = {
  email: "kavisolutions1@gmail.com",
  location: "Hyderabad, India · Remote consultations across India",
} as const;

export const FINANCIAL_HERO = {
  eyebrow: "Financial Services",
  title: "Tax, planning and cash flow —",
  highlight: "handled properly.",
  description:
    "Support for individuals and businesses across income tax filing, tax planning, budgeting, cash-flow management and long-term financial planning. Where a service is regulated, it is delivered through appropriately qualified professionals.",
  metrics: [
    { value: "2", label: "Tracks: individual & business" },
    { value: "5", label: "Service areas" },
    { value: "Year-round", label: "Not just filing season" },
    { value: "Documented", label: "Every engagement" },
  ],
} as const;

/* --- individual track --------------------------------------------------- */

export const INDIVIDUAL_SERVICES: FinancialService[] = [
  {
    slug: "itr-filing",
    icon: "🧾",
    title: "Income tax return filing",
    summary:
      "Filing for salaried employees, self-employed professionals and individuals with more than one income source.",
    items: [
      "Individual ITR filing across applicable return forms",
      "Income from salary, profession, capital gains and other sources",
      "Reconciliation against Form 16, AIS and 26AS",
      "Old vs. new regime comparison for your situation",
      "Tax-related documentation support",
      "Support responding to tax notices, through qualified professionals",
    ],
  },
  {
    slug: "tax-planning",
    icon: "📉",
    title: "Tax planning",
    summary:
      "Plan through the year rather than discovering the liability at filing time.",
    items: [
      "Year-round tax planning based on your income pattern",
      "Tax-saving strategy within the current legal framework",
      "Regime choice modelled on your actual numbers",
      "Advance tax and TDS awareness",
      "Documentation and record-keeping guidance",
      "Coordination with your employer or other advisors",
    ],
  },
  {
    slug: "personal-planning",
    icon: "📊",
    title: "Personal financial planning",
    summary:
      "A written plan for your income, expenses, savings and goals — not a product pitch.",
    items: [
      "Monthly income and expense planning",
      "Budget preparation you can actually maintain",
      "Savings and investment allocation by goal",
      "Loan and EMI planning",
      "Education and retirement goal planning",
      "Tax-saving planning integrated with the above",
    ],
  },
  {
    slug: "investment-guidance",
    icon: "🌱",
    title: "Savings & investment guidance",
    summary:
      "Educational guidance on structuring savings and investments around your goals and risk appetite. We do not sell products and do not promise returns.",
    items: [
      "Investment planning and financial goal setting",
      "Mutual fund and SIP planning guidance",
      "Fixed deposit and savings structuring",
      "Retirement and emergency fund planning",
      "Portfolio review and diversification guidance",
      "Long-term wealth creation planning",
    ],
  },
];

/* --- business track ----------------------------------------------------- */

export const BUSINESS_SERVICES: FinancialService[] = [
  {
    slug: "business-tax",
    icon: "🏢",
    title: "Business & company taxation",
    summary:
      "Filing and tax planning for proprietorships, partnerships, LLPs, startups and companies.",
    items: [
      "Business and company ITR filing",
      "Tax planning for the entity and its owners",
      "Compliance calendar and deadline tracking",
      "Financial documentation and record management",
      "GST-related coordination where applicable",
      "Support responding to notices, through qualified professionals",
    ],
  },
  {
    slug: "accounting",
    icon: "📚",
    title: "Accounting & bookkeeping",
    summary:
      "Keep the books current so filing, reporting and funding conversations are not a scramble.",
    items: [
      "Accounting and bookkeeping support",
      "Transaction categorisation and reconciliation",
      "Financial reporting and expense tracking",
      "Ledger review before filing",
      "Documentation standards for audit readiness",
      "Monthly or quarterly reporting cadence",
    ],
  },
  {
    slug: "cash-flow",
    icon: "💧",
    title: "Cash flow & working capital",
    summary:
      "Understand when money arrives and when it leaves, then plan around the gaps.",
    items: [
      "Cash flow planning and forecasting",
      "Working capital requirement assessment",
      "Cash transaction documentation and reconciliation",
      "Expense tracking and record maintenance",
      "Financial process improvement",
      "Monthly cash flow projections",
    ],
  },
  {
    slug: "business-planning",
    icon: "📈",
    title: "Business financial planning",
    summary:
      "Budgets, projections and profitability analysis that hold up when someone asks a hard question.",
    items: [
      "Revenue and expense planning",
      "Budget preparation",
      "Profitability analysis by product or service",
      "Working capital management",
      "Financial performance tracking",
      "Fundraising-readiness documentation",
    ],
  },
];

export const FINANCIAL_APPROACH: FinancialStep[] = [
  {
    step: "01",
    title: "Understand",
    summary:
      "Sit down with your actual numbers — income, obligations, entities and goals — before recommending anything.",
  },
  {
    step: "02",
    title: "Organise",
    summary:
      "Get documentation and records into a state where filing and planning are straightforward rather than annual emergencies.",
  },
  {
    step: "03",
    title: "Plan",
    summary:
      "Produce a written plan covering tax, cash flow and goals, with the trade-offs stated plainly.",
  },
  {
    step: "04",
    title: "Execute",
    summary:
      "Handle the filing, bookkeeping or reporting, and hand you the records and acknowledgements.",
  },
  {
    step: "05",
    title: "Review",
    summary:
      "Revisit at agreed intervals and when something changes — a new job, a new entity, a new goal.",
  },
];

export const FINANCIAL_AUDIENCES = [
  {
    id: "individual",
    icon: "👤",
    title: "For individuals",
    summary:
      "Salaried employees, self-employed professionals and anyone whose tax and finances have outgrown a spreadsheet.",
    points: [
      "ITR filing and regime comparison",
      "Year-round tax planning",
      "Budget and savings structure",
      "EMI and loan planning",
      "Retirement and education goals",
    ],
  },
  {
    id: "business",
    icon: "🏛️",
    title: "For businesses",
    summary:
      "Proprietorships, partnerships, LLPs, startups and companies that need their finances organised and their filings on time.",
    points: [
      "Entity and owner-level tax planning",
      "Bookkeeping and monthly reporting",
      "Cash flow and working capital",
      "Profitability analysis",
      "Compliance coordination",
    ],
  },
] as const;

export const FINANCIAL_INDUSTRIES = [
  "Salaried professionals",
  "Freelancers & consultants",
  "Startups",
  "Small & medium businesses",
  "Professional practices",
  "LLPs & partnerships",
  "E-commerce sellers",
  "NRI taxation",
];

/* Compliance boundaries, rendered as a visible section rather than buried in a
   footer. Keep these statements accurate; see docs/financial-page.md. */
export const FINANCIAL_COMPLIANCE = {
  title: "How we work, and what we do not do",
  intro:
    "Financial services are regulated for good reason. Being clear about the boundaries protects you as much as it protects us.",
  points: [
    {
      tone: "positive" as const,
      title: "Qualified professionals",
      body: "Taxation, audit and filing work is carried out or reviewed by appropriately qualified professionals. Where a matter needs a specialist, we involve one rather than improvising.",
    },
    {
      tone: "positive" as const,
      title: "Documented engagements",
      body: "Scope, fees and deliverables are agreed in writing before work begins. Every filing comes with its acknowledgement and a copy of the records.",
    },
    {
      tone: "positive" as const,
      title: "Lawful processes only",
      body: "All cash-related work runs through documented, traceable and compliant processes. We do not handle undocumented cash or assist with tax evasion.",
    },
    {
      tone: "limit" as const,
      title: "Not investment advice",
      body: "Investment content on this page is educational planning guidance, not regulated investment advice or a recommendation to buy or sell any security. We do not manage funds or guarantee returns.",
    },
    {
      tone: "limit" as const,
      title: "No guaranteed outcomes",
      body: "Tax positions are based on the law and facts at the time. Outcomes depend on your circumstances and on decisions by the tax authorities.",
    },
    {
      tone: "limit" as const,
      title: "Data handled carefully",
      body: "Financial documents are shared through agreed channels, retained only as long as needed, and never sold. Do not send sensitive documents before an engagement is agreed.",
    },
  ],
} as const;

export const FINANCIAL_FAQ = [
  {
    q: "Do you file returns for salaried employees with only one income source?",
    a: "Yes. Simple salaried filings are the most common engagement, and they are usually the entry point for a longer planning relationship. If your return is genuinely straightforward we will tell you, rather than adding work you do not need.",
  },
  {
    q: "Can you handle both my personal and business filings?",
    a: "Yes, and it is usually better value. The entity's tax position and the owner's personal position interact, so looking at them together often surfaces savings that separate advisors miss.",
  },
  {
    q: "Is the first consultation free?",
    a: "The initial conversation to understand your situation is free. If it needs detailed analysis before a proposal, we will say so and quote for that separately rather than doing unpaid work or billing you by surprise.",
  },
  {
    q: "What documents do I need to start?",
    a: "For an individual filing: PAN, Aadhaar, Form 16 or income details, bank statements and investment proofs. For a business: registration documents, books or ledgers, bank statements and prior-year returns. A checklist is issued once scope is agreed.",
  },
  {
    q: "Do you provide investment advice?",
    a: "We provide financial planning and educational guidance on structuring savings and investments around your goals. We do not provide regulated investment advice, manage funds on your behalf, or guarantee returns. Where regulated advice is needed, it must come from a suitably registered professional.",
  },
  {
    q: "Can you help with a tax notice I have already received?",
    a: "Yes. Notice handling is done through qualified professionals. Share the notice and the underlying return; do not ignore deadlines, because penalties accrue while a notice sits unanswered.",
  },
  {
    q: "How is my financial data protected?",
    a: "Documents are exchanged through agreed channels, access is limited to the people working on your engagement, and records are retained only as long as necessary. We do not sell or share your data. Avoid sending sensitive documents through this website's enquiry form.",
  },
];

export const FINANCIAL_SERVICE_OPTIONS: Record<"individual" | "business", string[]> = {
  individual: [
    "ITR filing",
    "Tax planning",
    "Personal financial planning",
    "Savings & investment guidance",
    "Loan / EMI planning",
    "Tax notice support",
    "Not sure yet — need guidance",
  ],
  business: [
    "Company / business ITR filing",
    "Business tax planning",
    "Accounting & bookkeeping",
    "Cash flow & working capital",
    "Business financial planning",
    "Compliance coordination",
    "Not sure yet — need guidance",
  ],
};

export const FINANCIAL_ENTITY_TYPES = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "Public Limited",
  "Startup / early stage",
  "Other",
];
