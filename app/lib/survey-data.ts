/* Content for the Kavi Survey & Research Solutions page.
 *
 * Everything an editor is likely to change lives here rather than in the JSX:
 * services, engagement models, industries, network details and FAQs. The page
 * component only renders this data, so categories can be updated without
 * touching layout, and the whole module can move to its own domain later.
 */

export type SurveyVertical = {
  slug: string;
  icon: string;
  tag: string;
  title: string;
  summary: string;
  services: string[];
};

export type EngagementModel = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  bestFor: string;
};

export type SurveyStep = {
  step: string;
  title: string;
  summary: string;
};

export const SURVEY_CONTACT = {
  email: "kavisolutions1@gmail.com",
  phone: "+91 90000 00000",
  location: "Hyderabad, India · Field operations across India",
} as const;

export const SURVEY_HERO = {
  eyebrow: "Survey & Research Solutions",
  title: "Field research, survey data and",
  highlight: "insight you can act on.",
  description:
    "We design surveys, run field teams across districts and states, clean and analyse the data, and deliver reports and presentations that answer the question you actually asked. Government, institutional, academic and private-sector assignments.",
  metrics: [
    { value: "6", label: "Research verticals" },
    { value: "5", label: "Engagement models" },
    { value: "PAN-India", label: "Field network" },
    { value: "End-to-end", label: "Design to report" },
  ],
} as const;

export const SURVEY_VERTICALS: SurveyVertical[] = [
  {
    slug: "field-surveys",
    icon: "📋",
    tag: "Field Surveys",
    title: "Field surveys & data collection",
    summary:
      "Structured data collection on the ground — households, institutions, communities and locations — executed by trained enumerators with validation built in.",
    services: [
      "Household and public opinion surveys",
      "Political and election-related surveys",
      "Government and public service surveys",
      "Product and customer feedback surveys",
      "Brand awareness and market research surveys",
      "Consumer behaviour surveys",
      "Employee and organisational surveys",
      "Location-based and field-level data collection",
      "Institutional and community surveys",
      "Custom research and data collection assignments",
    ],
  },
  {
    slug: "market-research",
    icon: "📈",
    tag: "Market Research",
    title: "Market & brand research",
    summary:
      "Understand your customers, your market and your competition before you commit budget. We combine survey data with secondary research to size opportunities and test assumptions.",
    services: [
      "Market research and industry studies",
      "Product feedback and product validation",
      "Brand awareness and perception surveys",
      "Customer satisfaction surveys",
      "Competitor research",
      "Consumer preference analysis",
      "Product usage and adoption studies",
      "Market opportunity assessments",
    ],
  },
  {
    slug: "political-social",
    icon: "🗳️",
    tag: "Political & Social",
    title: "Political & social research",
    summary:
      "Public opinion, constituency-level sentiment and social impact assessment, collected with consent and handled to applicable privacy and election requirements.",
    services: [
      "Public opinion surveys",
      "Constituency-level research",
      "Voter sentiment research",
      "Community and household surveys",
      "Social impact assessments",
      "Public policy feedback collection",
      "Government scheme awareness and beneficiary feedback",
    ],
  },
  {
    slug: "analysis-reporting",
    icon: "📊",
    tag: "Analysis & Reporting",
    title: "Research data analysis & reporting",
    summary:
      "Raw responses become decisions. We clean, structure, weight and analyse the data, then deliver reports, charts and dashboards that hold up to scrutiny.",
    services: [
      "Data cleaning and validation",
      "Data categorisation and structuring",
      "Statistical analysis",
      "Survey result analysis",
      "Trend identification",
      "Comparative analysis",
      "Research report preparation",
      "Charts, dashboards and visualisations",
      "Executive summaries and recommendations",
    ],
  },
  {
    slug: "predictive-research",
    icon: "🔮",
    tag: "Predictive Research",
    title: "Prediction-based research & presentations",
    summary:
      "Where the data supports it, we extend findings into forecasts and scenario analysis — and we are explicit about what is measured, what is estimated and what is assumed.",
    services: [
      "Data-driven forecasting",
      "Trend and pattern identification",
      "Predictive analysis where sufficient data exists",
      "Scenario-based analysis",
      "Research-based presentations",
      "Business and market insight presentations",
      "Decision-support reports",
    ],
  },
  {
    slug: "academic-research",
    icon: "🎓",
    tag: "Academic Support",
    title: "Academic & institutional research support",
    summary:
      "Support for students, scholars and institutions across the research lifecycle — with research integrity preserved and no fabricated data, results or findings.",
    services: [
      "Primary and secondary data collection",
      "Questionnaire and survey design",
      "Research methodology support",
      "Field research coordination",
      "Data processing and statistical analysis",
      "Research report preparation",
      "Research paper data support",
      "Charts, tables and presentation preparation",
      "Research findings documentation",
    ],
  },
];

export const SURVEY_APPROACH: SurveyStep[] = [
  {
    step: "01",
    title: "Define",
    summary:
      "Clarify the decision the research must support, then design the questionnaire, sample and coverage plan around it.",
  },
  {
    step: "02",
    title: "Pilot",
    summary:
      "Test the instrument on a small sample, fix ambiguous questions and confirm translation and field logistics before scale-up.",
  },
  {
    step: "03",
    title: "Collect",
    summary:
      "Deploy trained enumerators and coordinators, with daily submissions, back-checks and validation rules to catch bad data early.",
  },
  {
    step: "04",
    title: "Analyse",
    summary:
      "Clean, weight and structure the dataset, then run the statistical and comparative analysis the brief requires.",
  },
  {
    step: "05",
    title: "Report",
    summary:
      "Deliver findings in a format the client can use — executive summary, full report, charts, dashboards or a slide presentation.",
  },
];

export const SURVEY_ENGAGEMENT_MODELS: EngagementModel[] = [
  {
    id: "on-call",
    icon: "🕒",
    title: "On-call support",
    summary:
      "Surveyors, field researchers and research support available whenever your team needs extra capacity.",
    bestFor: "Clients with an in-house research team who need execution bandwidth.",
  },
  {
    id: "direct",
    icon: "🎯",
    title: "Direct project execution",
    summary:
      "We take complete ownership of the assignment — planning, field execution, analysis and final reporting.",
    bestFor: "Organisations that want a single accountable partner end to end.",
  },
  {
    id: "collection",
    icon: "📥",
    title: "Data collection only",
    summary:
      "We run the fieldwork and hand over validated raw data, ready for your own analysis team.",
    bestFor: "Teams with analysts but no field presence.",
  },
  {
    id: "analysis",
    icon: "🧮",
    title: "Analysis & reporting",
    summary:
      "Send us an existing dataset and we handle cleaning, analysis, visualisation and the presentation.",
    bestFor: "Clients who already have data but need it turned into insight.",
  },
  {
    id: "end-to-end",
    icon: "🔁",
    title: "End-to-end research",
    summary:
      "The full lifecycle: questionnaire design, data collection, analysis, reporting and presentation.",
    bestFor: "Institutions running a study from scratch with no internal capacity.",
  },
];

export const SURVEY_FIELD_NETWORK = {
  title: "A field network we are building deliberately",
  description:
    "The long-term strength of this vertical is the network behind it — surveyors, field researchers, coordinators and analysts who can execute across cities, districts and states.",
  points: [
    "Individual surveyors and field researchers onboarded with verified profiles",
    "Location-based networks so a project can start in a new district quickly",
    "Teams assembled around the skill set a specific project needs",
    "Language and regional capability tracked per surveyor",
    "Project coordinators and team leads attached to larger assignments",
    "Temporary and project-based recruitment supported",
    "A maintained database of available resources for future projects",
    "Scalable field workforce across cities, districts and states",
  ],
  capabilities: [
    { label: "Languages", detail: "Telugu, Hindi, English and regional languages as the network grows" },
    { label: "Coverage", detail: "Urban, semi-urban and rural field teams" },
    { label: "Roles", detail: "Enumerator, supervisor, coordinator, analyst" },
    { label: "Engagement", detail: "Project-based and temporary assignments" },
  ],
} as const;

export const SURVEY_INDUSTRIES = [
  "Government & public services",
  "Political campaigns & constituencies",
  "Market research agencies",
  "Academic & research institutions",
  "NGOs & development organisations",
  "FMCG & consumer brands",
  "Telecom & infrastructure",
  "Healthcare",
  "Education",
  "Financial services",
];

/* Business development targets. Presented as opportunities under discussion,
   never as confirmed clients — that distinction matters legally. */
export const SURVEY_OPPORTUNITIES = [
  { name: "IFMR", note: "Research institution · exploratory" },
  { name: "GHMC", note: "Greater Hyderabad Municipal Corporation" },
  { name: "SHE Teams", note: "Government initiative" },
  { name: "DishTV", note: "Private sector · consumer research" },
  { name: "Metro Card projects", note: "Public transport data collection" },
];

export const SURVEY_SURVEYOR_QUESTIONS = [
  {
    q: "Who can join the survey network?",
    a: "Individual surveyors, field researchers, coordinators, supervisors and analysts. Students with field experience are welcome. We look for reliability, language coverage and local knowledge of the area you can cover.",
  },
  {
    q: "Is this full-time work?",
    a: "No. Assignments are project-based and temporary. You will be contacted when a project needs someone with your location, language and skills, and you are free to accept or decline each assignment.",
  },
  {
    q: "How is field work paid?",
    a: "Compensation is agreed per project and depends on the scope, the number of completed responses and the location. Rates and payment terms are confirmed in writing before fieldwork begins.",
  },
  {
    q: "Do I need my own device?",
    a: "Most projects collect data on a smartphone. If a project uses a specific form platform, training and access are provided before the survey begins.",
  },
];

export const SURVEY_CLIENT_QUESTIONS = [
  {
    q: "Which locations can you cover?",
    a: "Field operations are coordinated from Hyderabad with teams deployable across India. Coverage for a specific district is confirmed during scoping, based on the network in that area.",
  },
  {
    q: "How long does a survey take?",
    a: "A focused study with a few hundred responses typically runs two to four weeks including design and reporting. Larger or multi-district studies are scoped individually.",
  },
  {
    q: "Can you work with our existing questionnaire?",
    a: "Yes. We can field your instrument as-is, or review it first and flag questions that are likely to produce ambiguous or unusable data.",
  },
  {
    q: "How is data privacy handled?",
    a: "Personal data is collected with consent and used only for the agreed research purpose. Political and social research follows applicable privacy, election and data protection requirements, with safeguards agreed in the project contract.",
  },
  {
    q: "Do you deliver raw data or only reports?",
    a: "Both, depending on the engagement model. Clients who want to run their own analysis can receive validated raw data; clients who want conclusions receive analysis, reports and presentations.",
  },
];

export const SURVEY_SERVICE_OPTIONS = [
  "Field survey & data collection",
  "Market & brand research",
  "Political & social research",
  "Data analysis & reporting",
  "Predictive research & presentations",
  "Academic / institutional research support",
  "Not sure yet — need guidance",
];
