/* Editorial vector visuals for the Survey & Research page.
 *
 * Local SVG illustrations rather than stock photography: they carry the same
 * navy/teal language as the rest of the site, stay sharp at any size and do
 * not imply a field team or dataset that does not exist yet. Replace them with
 * project photography when real fieldwork images are available.
 */

const FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";

function Frame({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 520"
      role="img"
      aria-label={label}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      {children}
    </svg>
  );
}

export function SurveyHeroVisual({ className = "" }: { className?: string }) {
  return (
    <Frame
      label="Illustration of field data collection, quality checks and research reporting"
      className={className}
    >
      <defs>
        <linearGradient id="sv-hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1220" />
          <stop offset="55%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#102A2A" />
        </linearGradient>
        <radialGradient id="sv-hero-glow" cx="0.75" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
        </radialGradient>
        <pattern id="sv-hero-dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="#A5B3C7" opacity="0.14" />
        </pattern>
        <linearGradient id="sv-hero-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.1" />
          <stop offset="45%" stopColor="#2DD4BF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <rect width="1200" height="520" fill="url(#sv-hero-bg)" />
      <rect width="1200" height="520" fill="url(#sv-hero-dots)" />
      <rect width="1200" height="520" fill="url(#sv-hero-glow)" />

      {/* Survey coverage contours */}
      <g fill="none" stroke="#2DD4BF" strokeOpacity="0.16">
        <path d="M-40 380 C 170 300, 320 430, 520 350 S 900 250, 1240 330" />
        <path d="M-40 420 C 180 340, 340 470, 540 390 S 920 290, 1240 370" />
        <path d="M-40 460 C 190 380, 360 510, 560 430 S 940 330, 1240 410" />
      </g>

      {/* Route between sample points */}
      <path
        d="M170 340 C 270 270, 330 380, 440 300 S 620 210, 730 270 S 900 340, 1010 240"
        fill="none"
        stroke="url(#sv-hero-route)"
        strokeWidth="2.5"
        strokeDasharray="7 9"
      />

      {/* Sample points */}
      {[
        [170, 340],
        [440, 300],
        [730, 270],
        [1010, 240],
      ].map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={index === 1 ? 20 : 14} fill="#14B8A6" opacity="0.12" />
          <circle cx={x} cy={y} r={index === 1 ? 9 : 7} fill="#0B1220" stroke="#2DD4BF" strokeWidth="2" />
          <circle cx={x} cy={y} r={index === 1 ? 4 : 3} fill="#5EEAD4" />
        </g>
      ))}

      {/* Field collection card */}
      <g>
        <rect x="72" y="86" width="270" height="92" rx="18" fill="#0F172A" fillOpacity="0.92" stroke="#94A3B8" strokeOpacity="0.18" />
        <rect x="72" y="86" width="4" height="92" rx="2" fill="#2DD4BF" />
        <text x="96" y="118" fill="#5EEAD4" fontFamily={FONT} fontSize="11" letterSpacing="2.4">
          FIELD COLLECTION
        </text>
        <text x="96" y="145" fill="#F7F9FC" fontFamily={FONT} fontSize="17" fontWeight="600">
          Household · phone · online
        </text>
        <text x="96" y="164" fill="#A5B3C7" fontFamily={FONT} fontSize="10.5" letterSpacing="1.1">
          CONSENT · TRAINED ENUMERATORS
        </text>
      </g>

      {/* Quality card */}
      <g>
        <rect x="72" y="204" width="270" height="84" rx="18" fill="#0F172A" fillOpacity="0.92" stroke="#94A3B8" strokeOpacity="0.18" />
        <rect x="72" y="204" width="4" height="84" rx="2" fill="#38BDF8" />
        <text x="96" y="234" fill="#7DD3FC" fontFamily={FONT} fontSize="11" letterSpacing="2.4">
          DATA QUALITY
        </text>
        <text x="96" y="261" fill="#F7F9FC" fontFamily={FONT} fontSize="17" fontWeight="600">
          Back-checks · validation
        </text>
        <text x="96" y="279" fill="#A5B3C7" fontFamily={FONT} fontSize="10.5" letterSpacing="1.1">
          EVERY RESPONSE AUDITABLE
        </text>
      </g>

      {/* Report card */}
      <g>
        <rect x="884" y="84" width="244" height="206" rx="20" fill="#0F172A" fillOpacity="0.94" stroke="#94A3B8" strokeOpacity="0.2" />
        <text x="910" y="118" fill="#5EEAD4" fontFamily={FONT} fontSize="11" letterSpacing="2.4">
          DELIVERY
        </text>
        <text x="910" y="146" fill="#F7F9FC" fontFamily={FONT} fontSize="15" fontWeight="600">
          Report · dashboard · deck
        </text>
        <line x1="910" y1="166" x2="1100" y2="166" stroke="#A5B3C7" strokeOpacity="0.18" />
        {[
          [910, 196, 46, "#2DD4BF"],
          [968, 196, 74, "#38BDF8"],
          [1026, 196, 96, "#818CF8"],
        ].map(([x, y, height, color]) => (
          <rect
            key={`${x}-${y}`}
            x={x as number}
            y={(y as number) + 46 - (height as number)}
            width="30"
            height={height as number}
            rx="5"
            fill={color as string}
            opacity="0.75"
          />
        ))}
        <path
          d="M910 258 C 944 232, 970 250, 996 224 S 1050 206, 1092 218"
          fill="none"
          stroke="#5EEAD4"
          strokeWidth="2"
          strokeOpacity="0.85"
        />
        <text x="910" y="278" fill="#A5B3C7" fontFamily={FONT} fontSize="10" letterSpacing="1.4">
          MEASURED · ESTIMATED · PREDICTED
        </text>
      </g>

      {/* Connecting sample pins to the report */}
      <path
        d="M1010 240 C 980 214, 944 190, 910 182"
        fill="none"
        stroke="#38BDF8"
        strokeOpacity="0.35"
        strokeDasharray="4 6"
      />
    </Frame>
  );
}

export function SurveyNetworkVisual({ className = "" }: { className?: string }) {
  return (
    <Frame
      label="Illustration of a district-by-district surveyor network"
      className={className}
    >
      <defs>
        <linearGradient id="sv-net-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1220" />
          <stop offset="100%" stopColor="#0F1F2A" />
        </linearGradient>
        <radialGradient id="sv-net-glow" cx="0.2" cy="0.8" r="0.7">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        <pattern id="sv-net-grid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0H0V36" fill="none" stroke="#A5B3C7" strokeOpacity="0.08" />
        </pattern>
      </defs>

      <rect width="1200" height="520" fill="url(#sv-net-bg)" />
      <rect width="1200" height="520" fill="url(#sv-net-grid)" />
      <rect width="1200" height="520" fill="url(#sv-net-glow)" />

      {/* Network links */}
      <g stroke="#2DD4BF" strokeOpacity="0.28" strokeWidth="1.4">
        <line x1="310" y1="278" x2="470" y2="180" />
        <line x1="310" y1="278" x2="500" y2="330" />
        <line x1="500" y1="330" x2="690" y2="244" />
        <line x1="470" y1="180" x2="690" y2="244" />
        <line x1="690" y1="244" x2="860" y2="170" />
        <line x1="690" y1="244" x2="880" y2="340" />
        <line x1="500" y1="330" x2="620" y2="418" />
        <line x1="860" y1="170" x2="1010" y2="252" />
        <line x1="880" y1="340" x2="1010" y2="252" />
      </g>

      {/* Nodes */}
      {[
        { x: 310, y: 278, r: 16, label: "HYDERABAD", base: true },
        { x: 470, y: 180, r: 9, label: "DISTRICT 01" },
        { x: 500, y: 330, r: 11, label: "DISTRICT 02" },
        { x: 690, y: 244, r: 13, label: "DISTRICT 03" },
        { x: 860, y: 170, r: 8, label: "DISTRICT 04" },
        { x: 880, y: 340, r: 10, label: "DISTRICT 05" },
        { x: 620, y: 418, r: 7, label: "DISTRICT 06" },
        { x: 1010, y: 252, r: 11, label: "DISTRICT 07" },
      ].map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r={node.r + 12} fill="#2DD4BF" opacity={node.base ? 0.12 : 0.07} />
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.base ? "#0F766E" : "#0B1220"}
            stroke={node.base ? "#5EEAD4" : "#2DD4BF"}
            strokeWidth="2"
          />
          <circle cx={node.x} cy={node.y} r={node.r / 3} fill="#99F6E4" />
          <text
            x={node.x}
            y={node.y + node.r + 20}
            textAnchor="middle"
            fill={node.base ? "#99F6E4" : "#A5B3C7"}
            fontFamily={FONT}
            fontSize="10"
            letterSpacing="1.2"
          >
            {node.label}
          </text>
        </g>
      ))}

      {/* Side legend */}
      <g>
        <rect x="828" y="392" width="292" height="76" rx="16" fill="#0F172A" fillOpacity="0.92" stroke="#94A3B8" strokeOpacity="0.16" />
        <text x="850" y="419" fill="#5EEAD4" fontFamily={FONT} fontSize="10" letterSpacing="2.2">
          NETWORK MODEL
        </text>
        <text x="850" y="444" fill="#F7F9FC" fontFamily={FONT} fontSize="13">
          Surveyor · coordinator · analyst
        </text>
      </g>

      <text x="72" y="82" fill="#5EEAD4" fontFamily={FONT} fontSize="11" letterSpacing="2.4">
        FIELD NETWORK
      </text>
      <text x="72" y="116" fill="#F7F9FC" fontFamily={FONT} fontSize="26" fontWeight="600">
        Built district by district
      </text>
      <text x="72" y="143" fill="#A5B3C7" fontFamily={FONT} fontSize="11" letterSpacing="1.2">
        LOCATION · LANGUAGE · SKILL · AVAILABILITY
      </text>
    </Frame>
  );
}

export function SurveyAnalysisVisual({ className = "" }: { className?: string }) {
  return (
    <Frame
      label="Illustration of survey data analysis and reporting"
      className={className}
    >
      <defs>
        <linearGradient id="sv-an-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1220" />
          <stop offset="100%" stopColor="#141B33" />
        </linearGradient>
        <radialGradient id="sv-an-glow" cx="0.8" cy="0.2" r="0.7">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sv-an-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>

      <rect width="1200" height="520" fill="url(#sv-an-bg)" />
      <rect width="1200" height="520" fill="url(#sv-an-glow)" />

      {/* Chart panel */}
      <g>
        <rect x="250" y="88" width="700" height="344" rx="22" fill="#0F172A" fillOpacity="0.94" stroke="#94A3B8" strokeOpacity="0.18" />
        <text x="284" y="128" fill="#5EEAD4" fontFamily={FONT} fontSize="11" letterSpacing="2.4">
          ANALYSIS / REPORTING
        </text>
        <text x="284" y="158" fill="#F7F9FC" fontFamily={FONT} fontSize="17" fontWeight="600">
          From raw responses to a decision
        </text>

        {/* Bars */}
        {[
          [300, 200, 62],
          [356, 200, 96],
          [412, 200, 74],
          [468, 200, 128],
          [524, 200, 108],
          [580, 200, 154],
        ].map(([x, baseY, height]) => (
          <rect
            key={x}
            x={x}
            y={baseY + 168 - height}
            width="34"
            height={height}
            rx="5"
            fill="url(#sv-an-bar)"
            opacity="0.82"
          />
        ))}
        <line x1="292" y1="368" x2="626" y2="368" stroke="#A5B3C7" strokeOpacity="0.2" />

        {/* Line trend */}
        <path
          d="M292 330 C 336 312, 372 322, 410 294 S 480 270, 520 254 S 598 230, 626 242"
          fill="none"
          stroke="#818CF8"
          strokeWidth="2.5"
        />
        {[
          [292, 330],
          [410, 294],
          [520, 254],
          [626, 242],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#C7D2FE" />
        ))}

        {/* Donut */}
        <g transform="translate(704 238)">
          <circle r="54" fill="none" stroke="#1E293B" strokeWidth="18" />
          <circle
            r="54"
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="18"
            strokeDasharray="210 340"
            strokeLinecap="round"
            transform="rotate(-90)"
          />
          <circle
            r="54"
            fill="none"
            stroke="#818CF8"
            strokeWidth="18"
            strokeDasharray="80 340"
            strokeDashoffset="-218"
            strokeLinecap="round"
            transform="rotate(-90)"
          />
          <text textAnchor="middle" y="6" fill="#F7F9FC" fontFamily={FONT} fontSize="15" fontWeight="600">
            REPORT
          </text>
        </g>

        <g fill="#A5B3C7" fontFamily={FONT} fontSize="10" letterSpacing="1.2">
          <circle cx="684" cy="330" r="4" fill="#2DD4BF" />
          <text x="696" y="334">MEASURED</text>
          <circle cx="790" cy="330" r="4" fill="#818CF8" />
          <text x="802" y="334">ESTIMATED</text>
        </g>
      </g>

      {/* Deliverable chips */}
      <g fontFamily={FONT} fontSize="11" letterSpacing="1.1">
        {["CLEAN DATA", "CODEBOOK", "CHARTS", "DASHBOARD", "DECK"].map((label, index) => (
          <g key={label}>
            <rect
              x={250 + index * 136}
              y="456"
              width="124"
              height="34"
              rx="17"
              fill="#0F172A"
              stroke="#2DD4BF"
              strokeOpacity="0.25"
            />
            <text x={312 + index * 136} y="477" textAnchor="middle" fill="#A5B3C7">
              {label}
            </text>
          </g>
        ))}
      </g>
    </Frame>
  );
}
