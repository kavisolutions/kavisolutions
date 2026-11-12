/* Content for the Kavi Farms page.
 *
 * Two business tracks share this page: farm products and village tourism.
 * Prices are intentionally "on enquiry" until the farm confirms current
 * availability; do not publish a rate card that the team cannot honour.
 */

export type FarmProduct = {
  slug: string;
  icon: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  price: string;
};

export type FarmExperience = {
  icon: string;
  title: string;
  summary: string;
};

export type FarmDestination = {
  name: string;
  type: string;
  summary: string;
};

export type FarmItineraryDay = {
  day: string;
  title: string;
  items: { time: string; activity: string }[];
};

export const FARMS_CONTACT = {
  email: "kavisolutions1@gmail.com",
  phone: "+91 90000 00000",
  location: "Polepalli Village, Palnadu District, Andhra Pradesh",
} as const;

export const FARMS_HERO = {
  eyebrow: "Kavi Farms",
  title: "From our fields to your table —",
  highlight: "and back to the village.",
  description:
    "Farm-grown products and weekend village experiences from Polepalli, Palnadu. Buy seasonal produce directly from the farm, or spend three days living and working alongside the people who grow it.",
  metrics: [
    { value: "2", label: "Tracks: products & tourism" },
    { value: "3 days", label: "Weekend village experience" },
    { value: "Polepalli", label: "Palnadu, Andhra Pradesh" },
    { value: "Direct", label: "Farm to customer" },
  ],
} as const;

export const FARM_PRODUCT_CATEGORIES = [
  "Grains & millets",
  "Pulses",
  "Cold-pressed oils",
  "Seasonal produce",
  "Honey & preserves",
  "Village staples",
] as const;

export const FARM_PRODUCTS: FarmProduct[] = [
  {
    slug: "sona-masuri-rice",
    icon: "🌾",
    name: "Sona Masuri rice",
    category: "Grains & millets",
    description: "Single-origin paddy grown in the village, milled in small batches and cleaned before packing.",
    unit: "per kg",
    price: "Price on enquiry",
  },
  {
    slug: "foxtail-millet",
    icon: "🌱",
    name: "Foxtail millet",
    category: "Grains & millets",
    description: "Rain-fed millet with a nutty finish — good for upma, pulao and everyday mixes.",
    unit: "per kg",
    price: "Price on enquiry",
  },
  {
    slug: "toor-dal",
    icon: "🫘",
    name: "Toor dal",
    category: "Pulses",
    description: "Locally grown pigeon pea, sun-dried and hand-sorted before packing.",
    unit: "per kg",
    price: "Price on enquiry",
  },
  {
    slug: "cold-pressed-groundnut-oil",
    icon: "🫙",
    name: "Cold-pressed groundnut oil",
    category: "Cold-pressed oils",
    description: "Wood-pressed in small batches, unfiltered and without blending.",
    unit: "per litre",
    price: "Price on enquiry",
  },
  {
    slug: "seasonal-vegetables",
    icon: "🥬",
    name: "Seasonal vegetable box",
    category: "Seasonal produce",
    description: "A mixed box of whatever is ready in the field that week — picked to order.",
    unit: "per box",
    price: "Price on enquiry",
  },
  {
    slug: "mangoes",
    icon: "🥭",
    name: "Seasonal mangoes",
    category: "Seasonal produce",
    description: "Village mangoes picked at the right stage, available only during the season.",
    unit: "per box",
    price: "Price on enquiry",
  },
  {
    slug: "wild-honey",
    icon: "🍯",
    name: "Wild honey",
    category: "Honey & preserves",
    description: "Raw honey collected from local hives, strained and bottled without heating.",
    unit: "per jar",
    price: "Price on enquiry",
  },
  {
    slug: "village-pickle",
    icon: "🫙",
    name: "Village pickle",
    category: "Village staples",
    description: "Small-batch pickle made with local chillies, tamarind and traditional proportions.",
    unit: "per jar",
    price: "Price on enquiry",
  },
];

export const FARM_EXPERIENCES: FarmExperience[] = [
  {
    icon: "🌾",
    title: "Work the field",
    summary:
      "Join the morning farm round — sowing, weeding, harvesting or post-harvest work depending on the season.",
  },
  {
    icon: "🍲",
    title: "Eat what the village eats",
    summary:
      "Home-style Andhra meals cooked with produce from the farm. Vegetarian by default; tell us in advance about allergies.",
  },
  {
    icon: "🏡",
    title: "Live in the village",
    summary:
      "Stay in simple, clean village accommodation with basic amenities. This is a working farm, not a resort.",
  },
  {
    icon: "🛕",
    title: "Temples and stories",
    summary:
      "Visit nearby temples and hear the local history and stories from the people who live there.",
  },
  {
    icon: "🌊",
    title: "Waterfalls and nature",
    summary:
      "Seasonal visits to nearby waterfalls and natural spots, subject to weather and safety.",
  },
  {
    icon: "🎉",
    title: "Festivals with the village",
    summary:
      "During Sankranti and other local festivals, experience the celebrations as they actually happen.",
  },
];

export const FARM_DESTINATIONS: FarmDestination[] = [
  {
    name: "Chennakesava Swamy Temple",
    type: "Temple",
    summary: "A nearby temple with local significance and traditional architecture.",
  },
  {
    name: "Adigoppala Temple",
    type: "Temple",
    summary: "A village temple visited as part of the local cultural round.",
  },
  {
    name: "Nearby waterfalls",
    type: "Nature",
    summary: "Seasonal waterfalls and natural spots, visited only when conditions are safe.",
  },
  {
    name: "Polepalli village",
    type: "Village",
    summary: "The farm, the fields, the village lanes and the people who make the experience real.",
  },
];

export const FARM_ITINERARY: FarmItineraryDay[] = [
  {
    day: "Friday night",
    title: "Departure from Hyderabad",
    items: [
      { time: "Night", activity: "Assemble in Hyderabad and travel overnight to Polepalli." },
    ],
  },
  {
    day: "Saturday",
    title: "Arrival, farm and village",
    items: [
      { time: "5:00 AM", activity: "Wake up and get ready." },
      { time: "6:00–9:00 AM", activity: "Farm visit, farming activity and breakfast at the farm." },
      { time: "9:00–10:00 AM", activity: "Freshen up and prepare for sightseeing." },
      { time: "10:00 AM–1:00 PM", activity: "Visit nearby attractions and temples." },
      { time: "1:00–2:00 PM", activity: "Lunch at a local destination." },
      { time: "2:00–4:00 PM", activity: "Return to the village, rest and local experiences." },
      { time: "4:00–6:00 PM", activity: "Evening farm visit and agricultural activities." },
      { time: "6:00–8:30 PM", activity: "Village walk, local culture, history and temples." },
      { time: "9:00 PM", activity: "Dinner and sleep." },
    ],
  },
  {
    day: "Sunday",
    title: "Farm, food and culture",
    items: [
      { time: "6:00–9:00 AM", activity: "Morning farm round and breakfast." },
      { time: "10:00 AM–1:00 PM", activity: "Second sightseeing destination or a slower village day." },
      { time: "1:00–2:00 PM", activity: "Lunch." },
      { time: "2:00–6:00 PM", activity: "Cooking, craft or agricultural activity with the village team." },
      { time: "6:00–9:00 PM", activity: "Cultural evening, dinner and conversation." },
    ],
  },
  {
    day: "Monday",
    title: "Return to Hyderabad",
    items: [
      { time: "5:00 AM", activity: "Wake up, tea and pack." },
      { time: "6:00 AM", activity: "Depart for Hyderabad." },
    ],
  },
];

export const FARM_PACKAGE_INCLUSIONS = [
  "Overnight travel from Hyderabad and back",
  "Village accommodation for two nights",
  "All meals during the stay",
  "Farm activities and guided village experience",
  "Local sightseeing as per the itinerary",
] as const;

export const FARM_PACKAGE_EXCLUSIONS = [
  "Personal expenses and shopping",
  "Travel insurance",
  "Anything not listed under inclusions",
  "Entry fees at destinations, where applicable",
] as const;

export const FARM_FAQ = [
  {
    q: "Is this a resort?",
    a: "No. It is a working farm and a real village. Accommodation is simple and clean, and the schedule follows the farm, not a hotel.",
  },
  {
    q: "Is the trip suitable for children?",
    a: "Yes, with supervision. The farm has water, tools and uneven ground, so children remain the responsibility of their parents or guardians.",
  },
  {
    q: "What should we bring?",
    a: "Comfortable clothes, walking shoes, a hat, sunscreen, personal medication and a reusable water bottle. We share a fuller list after the booking is confirmed.",
  },
  {
    q: "Can you deliver farm products outside Andhra Pradesh?",
    a: "Some dry products can be couriered. Fresh produce is limited to local pickup or scheduled delivery. Ask before ordering.",
  },
  {
    q: "How do we confirm availability?",
    a: "Send an enquiry with your dates and group size. We confirm availability and the current package contribution before any payment.",
  },
];

export const FARM_SERVICE_OPTIONS = [
  "Farm products / bulk order",
  "Weekend village experience",
  "School or college farm visit",
  "Corporate rural experience",
  "Festival special package",
  "Something else",
] as const;

export const FARM_TRAVEL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
