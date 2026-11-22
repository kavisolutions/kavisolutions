-- Pre-data: Kavi Survey & Research page content.
--
-- Idempotent. Run once on production before deploying a survey frontend that
-- has no bundled fallback. If a content row already exists, this leaves it
-- untouched so admin-published edits are never overwritten.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0001_survey_content.sql

INSERT INTO survey_content (id, data, updated_at)
VALUES (
  'main',
  $survey_content$
  {
    "faqs": [
      {
        "a": "Government departments and public services, private companies and startups, research institutions and think tanks, academic institutions, NGOs and development organisations, political campaigns, market research agencies and multi-sector clients. The method and compliance requirements are adapted to the client and the assignment.",
        "q": "Which types of organisations do you work with?"
      },
      {
        "a": "Yes. We run in-depth interviews, focus group discussions, observational and ethnographic fieldwork, case studies, field verification and mystery-shopping visits alongside structured surveys.",
        "q": "Do you handle qualitative field research?"
      },
      {
        "a": "Yes. The data-collection-only engagement gives you validated raw data from the field, with the questionnaire, sampling plan and quality checks agreed before fieldwork starts.",
        "q": "Can we hire you for data collection only?"
      },
      {
        "a": "Personal data is collected with consent and used only for the agreed research purpose. Political and social research follows applicable privacy, election and data protection requirements, with safeguards agreed in the project contract.",
        "q": "How is data privacy handled?"
      },
      {
        "a": "Both, depending on the engagement model. Clients who want to run their own analysis can receive validated raw data; clients who want conclusions receive analysis, reports and presentations.",
        "q": "Do you deliver raw data or only reports?"
      },
      {
        "a": "Yes. We design questionnaires and sampling plans, programme CAPI, CATI and online instruments, pilot and translate them, then handle data entry, transcription, coding, cleaning and dataset documentation. You can engage us for design only, data processing only or the full study.",
        "q": "Do you handle survey design and data processing?"
      },
      {
        "a": "Yes. We support M&E frameworks and indicators, baseline, midline and endline studies, process and impact evaluations, and independent third-party monitoring for government, NGO, CSR and donor-funded programmes.",
        "q": "Do you run evaluations and third-party monitoring?"
      }
    ],
    "hero": {
      "title": "Field research, survey data and",
      "eyebrow": "Survey & Research Solutions",
      "metrics": [
        {
          "label": "Research verticals",
          "value": "8"
        },
        {
          "label": "Engagement models",
          "value": "5"
        },
        {
          "label": "Field network, expanding",
          "value": "Multi-state"
        },
        {
          "label": "Design to report",
          "value": "End-to-end"
        }
      ],
      "highlight": "insight you can act on.",
      "description": "We design surveys and sampling plans, run field research and field teams across districts and states, manage and analyse the data, evaluate programmes, and deliver reports and presentations that answer the question you actually asked. Government, private-sector, research, academic, NGO and multi-sector assignments."
    },
    "brand": {
      "name": "Kavi Survey & Research Solutions",
      "location": "Hyderabad, India · Field operations across India",
      "vertical": "A Kavi Solutions business vertical",
      "contactName": "Basha",
      "contactEmail": "kavisolutions1@gmail.com"
    },
    "sectors": [
      "Government departments & public services",
      "Private companies & startups",
      "Research institutions & think tanks",
      "Academic institutions & universities",
      "NGOs & development organisations",
      "Political campaigns & constituencies",
      "Market research agencies",
      "FMCG & consumer brands",
      "Telecom & infrastructure",
      "Healthcare",
      "Education",
      "Financial services",
      "Other clients & multi-sector assignments"
    ],
    "approach": [
      {
        "step": "01",
        "title": "Define",
        "summary": "Clarify the decision the research must support, then design the questionnaire, sample and coverage plan around it."
      },
      {
        "step": "02",
        "title": "Pilot",
        "summary": "Test the instrument on a small sample, fix ambiguous questions and confirm translation and field logistics before scale-up."
      },
      {
        "step": "03",
        "title": "Collect",
        "summary": "Deploy trained enumerators and coordinators, with daily submissions, back-checks and validation rules to catch bad data early."
      },
      {
        "step": "04",
        "title": "Analyse",
        "summary": "Clean, weight and structure the dataset, then run the statistical and comparative analysis the brief requires."
      },
      {
        "step": "05",
        "title": "Report",
        "summary": "Deliver findings in a format the client can use — executive summary, full report, charts, dashboards or a slide presentation."
      }
    ],
    "verticals": [
      {
        "tag": "Field Research & Surveys",
        "icon": "📋",
        "slug": "field-surveys",
        "title": "Field research, surveys & data collection",
        "summary": "Structured and qualitative field research — households, institutions, communities, markets and locations — executed by trained enumerators and researchers with validation built in.",
        "services": [
          "Household and public opinion surveys",
          "Political and election-related surveys",
          "Government and public service surveys",
          "Product and customer feedback surveys",
          "Brand awareness and market research surveys",
          "Consumer behaviour surveys",
          "Employee and organizational surveys",
          "Location-based and field-level data collection",
          "Institutional and community surveys",
          "Custom research and data collection assignments"
        ]
      },
      {
        "tag": "Survey Design & Data",
        "icon": "🧭",
        "slug": "survey-design",
        "title": "Survey design, data management & qualitative analysis",
        "summary": "The method behind a defensible dataset: instrument and sample design, survey programming and piloting, multilingual preparation, then clean, documented data ready for analysis.",
        "services": [
          "Questionnaire and survey instrument design",
          "Sampling design and sample-size planning",
          "Survey programming (CAPI / CATI / CAWI) and pilot testing",
          "Translation and multilingual instrument preparation",
          "Telephonic, online and mixed-mode surveys",
          "Data entry, scanning and digitisation",
          "Transcription, translation and coding",
          "Qualitative analysis: thematic and content analysis",
          "Codebooks, data cleaning and dataset documentation",
          "Secure data storage, transfer and archival"
        ]
      },
      {
        "tag": "Market Research",
        "icon": "📈",
        "slug": "market-research",
        "title": "Market & brand research",
        "summary": "Understand your customers, your market and your competition before you commit budget. We combine survey data with secondary research to size opportunities and test assumptions.",
        "services": [
          "Market research and industry studies",
          "Product feedback and product validation",
          "Brand awareness and perception surveys",
          "Customer satisfaction surveys",
          "Competitor research",
          "Consumer preference analysis",
          "Product usage and adoption studies",
          "Market opportunity assessments"
        ]
      },
      {
        "tag": "Political & Social",
        "icon": "🗳️",
        "slug": "political-social",
        "title": "Political & social research",
        "summary": "Undertake research and survey assignments related to public opinion, social development, and community requirements. All political and personal data collection must follow applicable privacy, election, and data protection requirements, with appropriate consent and safeguards.",
        "services": [
          "Public opinion surveys",
          "Constituency-level research",
          "Voter sentiment research",
          "Community and household surveys",
          "Social impact assessments",
          "Public policy feedback collection",
          "Government scheme awareness and beneficiary feedback surveys"
        ]
      },
      {
        "tag": "M&E & Impact",
        "icon": "📐",
        "slug": "monitoring-evaluation",
        "title": "Monitoring, evaluation & impact research",
        "summary": "Evidence for programme decisions: frameworks and indicators, baseline-to-endline measurement, independent monitoring and impact evaluation for government, NGO and donor-funded programmes.",
        "services": [
          "M&E frameworks, indicators and results chains",
          "Baseline, midline and endline studies",
          "Process and implementation evaluations",
          "Impact evaluation (experimental and quasi-experimental)",
          "Third-party monitoring and field verification",
          "Government scheme and programme evaluations",
          "NGO and development programme evaluations",
          "Citizen service-delivery and beneficiary feedback studies",
          "CSR and social impact assessment",
          "Donor and grant reporting support"
        ]
      },
      {
        "tag": "Analysis & Reporting",
        "icon": "📊",
        "slug": "analysis-reporting",
        "title": "Research data analysis & reporting",
        "summary": "Raw responses become decisions. We clean, structure, weight and analyse the data, then deliver reports, charts and dashboards that hold up to scrutiny.",
        "services": [
          "Data cleaning and validation",
          "Data categorization and structuring",
          "Statistical analysis",
          "Survey result analysis",
          "Trend identification",
          "Comparative analysis",
          "Research report preparation",
          "Charts, dashboards, and visualizations",
          "Executive summaries and recommendations"
        ]
      },
      {
        "tag": "Predictive Research",
        "icon": "🔮",
        "slug": "predictive-research",
        "title": "Prediction-Based Research & Presentations",
        "summary": "Create analytical presentations based on collected research data and relevant historical information. Clearly distinguish data-supported findings, estimates, and predictions, including assumptions and limitations.",
        "services": [
          "Data-driven forecasting",
          "Trend and pattern identification",
          "Predictive analysis where sufficient data is available",
          "Scenario-based analysis",
          "Research-based presentations",
          "Business and market insight presentations",
          "Decision-support reports"
        ]
      },
      {
        "tag": "Academic Support",
        "icon": "🎓",
        "slug": "academic-research",
        "title": "Academic & Institutional Research Support",
        "summary": "Provide research support to students, scholars, educational institutions, and research organizations. Academic support should preserve research integrity, with no fabricated data, results, or findings.",
        "services": [
          "Primary and secondary data collection",
          "Questionnaire and survey design",
          "Research methodology support",
          "Field research coordination",
          "Data processing and statistical analysis",
          "Research report preparation",
          "Research paper data support",
          "Charts, tables, and presentation preparation",
          "Research findings documentation"
        ]
      }
    ],
    "engagement": [
      {
        "title": "On-call support",
        "bestFor": "Clients with an in-house research team who need execution bandwidth.",
        "summary": "Surveyors, field researchers and research support available whenever your team needs extra capacity."
      },
      {
        "title": "Direct project execution",
        "bestFor": "Organisations that want a single accountable partner end to end.",
        "summary": "We take complete ownership of the assignment — planning, field execution, analysis and final reporting."
      },
      {
        "title": "Data collection only",
        "bestFor": "Teams with analysts but no field presence.",
        "summary": "We run the fieldwork and hand over validated raw data, ready for your own analysis team."
      },
      {
        "title": "Analysis & reporting",
        "bestFor": "Clients who already have data but need it turned into insight.",
        "summary": "Send us an existing dataset and we handle cleaning, analysis, visualisation and the presentation."
      },
      {
        "title": "End-to-end research",
        "bestFor": "Institutions running a study from scratch with no internal capacity.",
        "summary": "The full lifecycle: questionnaire design, data collection, analysis, reporting and presentation."
      }
    ],
    "previousWork": [
      {
        "name": "IFMR",
        "note": "Research institution · survey assignment"
      },
      {
        "name": "World Bank",
        "note": "Socio-economic survey support"
      },
      {
        "name": "Metro Card",
        "note": "Commuter and public transport study"
      },
      {
        "name": "Tata Sky",
        "note": "Consumer and product feedback"
      },
      {
        "name": "Smoking study",
        "note": "Public health and behaviour survey"
      },
      {
        "name": "ITC",
        "note": "Consumer and market research"
      },
      {
        "name": "Piramal Group",
        "note": "Healthcare and market research"
      }
    ],
    "sampleProjects": [
      {
        "tag": "Product",
        "desc": "Product feedback, feature validation, usage and adoption, and customer satisfaction across current, lapsed and prospective users.",
        "title": "Product & usage survey"
      },
      {
        "tag": "Political",
        "desc": "Constituency-level voter sentiment, issue salience, awareness and approval tracking, fielded with consent and election-safe safeguards.",
        "title": "Political & public opinion poll"
      },
      {
        "tag": "Academic",
        "desc": "Primary data collection for doctoral and post-graduate research, with questionnaire design, sampling support and a documented dataset.",
        "title": "PhD / thesis fieldwork"
      },
      {
        "tag": "Academic",
        "desc": "Institutional studies, student and faculty surveys, impact assessments and field coordination for universities and research organisations.",
        "title": "Academic research project"
      },
      {
        "tag": "Market",
        "desc": "Brand awareness, competitor research, consumer preference and market opportunity assessment for private and institutional clients.",
        "title": "Market & brand study"
      },
      {
        "tag": "Government",
        "desc": "Household, community and scheme-beneficiary surveys with back-checks, consent and location-level field supervision.",
        "title": "Household & beneficiary survey"
      },
      {
        "tag": "Market",
        "desc": "CATI and online survey waves tracking awareness, usage and satisfaction over time, with comparable samples and wave-level reporting.",
        "title": "Telephonic & online tracking study"
      },
      {
        "tag": "Government",
        "desc": "Baseline, midline and endline measurement, beneficiary feedback and third-party verification for government schemes and public services.",
        "title": "Scheme & programme evaluation"
      },
      {
        "tag": "Development",
        "desc": "Needs assessment, process evaluation, outcome measurement and donor-ready reporting for development and CSR programmes.",
        "title": "NGO programme evaluation"
      }
    ]
  }
  $survey_content$::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT id, updated_at
FROM survey_content
WHERE id = 'main';
