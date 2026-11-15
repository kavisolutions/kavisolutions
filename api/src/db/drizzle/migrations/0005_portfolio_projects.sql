-- Portfolio projects developed in the Kavi workspace.
--
-- The public /projects page reads these rows from GET /api/projects. Insert
-- them here so a production deploy publishes the real portfolio without
-- anyone needing to re-enter it through the admin panel. ON CONFLICT keeps the
-- migration idempotent and never overwrites a row an editor has changed.

INSERT INTO "projects"
  ("id", "name", "description", "app_link", "web_link", "live_link_type", "project_types", "skills", "sort_order")
VALUES
  (
    'kavi-tent-on-rent',
    'Tent on Rent',
    'Multi-vendor tent and event-equipment rental marketplace with date-based inventory, verified owners, advance payments, order lifecycle and an Expo app on top of a NestJS API.',
    NULL,
    'https://tentonrent.kavisolutions.in',
    'web',
    ARRAY['App', 'Web']::text[],
    ARRAY['Expo', 'React Native', 'Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'MinIO', 'Razorpay']::text[],
    1
  ),
  (
    'kavi-where-am-i',
    'Where Am I',
    'AI visual inventory that turns cupboard photos into searchable objects, then shows exactly where each item is stored. Live at whereami.kavisolutions.in.',
    NULL,
    'https://whereami.kavisolutions.in',
    'web',
    ARRAY['Web', 'App']::text[],
    ARRAY['Next.js', 'Expo', 'better-auth', 'Drizzle ORM', 'PostgreSQL', 'pgvector', 'MinIO', 'Groq']::text[],
    2
  ),
  (
    'kavi-social-agent',
    'Social Agent',
    'Scheduled social publishing sidecar that imports a year of images, writes captions with a vision model, routes every post through Telegram approval and publishes to LinkedIn, Facebook and Instagram.',
    NULL,
    NULL,
    'web',
    ARRAY['Web']::text[],
    ARRAY['Fastify', 'TypeScript', 'SQLite', 'Node cron', 'LinkedIn API', 'Meta Graph API', 'Telegram Bot API']::text[],
    3
  ),
  (
    'kavi-certificate-system',
    'Certificate System',
    'Print-ready certificate design system with five templates, QR verification, batch CSV issuing and an audit registry wired to the public /verify page.',
    NULL,
    'https://kavisolutions.in/verify',
    'web',
    ARRAY['Web']::text[],
    ARRAY['HTML/CSS', 'JavaScript', 'qrcode', 'jsQR', 'PDF generation', 'QR verification']::text[],
    4
  ),
  (
    'kavi-solutions-platform',
    'Kavi Solutions Platform',
    'This site: a Next.js 16 marketing platform with a NestJS API, Better Auth sign-in, admin-managed team, projects, certificates and surveyors, live page switches and MinIO uploads.',
    NULL,
    'https://kavisolutions.in',
    'web',
    ARRAY['Web', 'Enterprise']::text[],
    ARRAY['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS', 'NestJS', 'PostgreSQL', 'Drizzle ORM', 'Better Auth', 'Docker']::text[],
    5
  )
ON CONFLICT ("id") DO NOTHING;
