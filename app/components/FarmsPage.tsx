import Link from "next/link";

import FarmsForms from "@/components/FarmsForms";
import { GlowOrb, Reveal, RevealItem, RevealStagger } from "@/components/motion";
import {
  FARM_DESTINATIONS,
  FARM_EXPERIENCES,
  FARM_FAQ,
  FARM_ITINERARY,
  FARM_PACKAGE_EXCLUSIONS,
  FARM_PACKAGE_INCLUSIONS,
  FARM_PRODUCTS,
  FARM_PRODUCT_CATEGORIES,
  FARMS_CONTACT,
  FARMS_HERO,
} from "@/lib/farms-data";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-lime-300">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-mist">{description}</p>}
    </Reveal>
  );
}

export function FarmsPage() {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-40 pb-20">
        <GlowOrb className="-left-24 top-10 h-80 w-80 bg-gradient-to-br from-emerald-500 to-lime-500 opacity-25 blur-3xl" />
        <GlowOrb className="-right-24 bottom-10 h-80 w-80 bg-gradient-to-br from-amber-500 to-orange-500 opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-lime-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-lime-300 ring-1 ring-lime-400/20">
              🌾 {FARMS_HERO.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              {FARMS_HERO.title}{" "}
              <span className="text-gradient">{FARMS_HERO.highlight}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              {FARMS_HERO.description}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#products"
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
              >
                Explore farm products →
              </a>
              <a
                href="#tourism"
                className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Weekend village experience
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 w-full">
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {FARMS_HERO.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col items-center gap-1 bg-ink-soft p-6 transition-colors hover:bg-white/5"
                >
                  <span className="font-display text-2xl font-bold text-gradient sm:text-3xl">
                    {metric.value}
                  </span>
                  <span className="text-center text-xs text-fog">{metric.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-lime-300">
              About Kavi Farms
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              A working farm with an open gate
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              Kavi Farms is a village-rooted business in Polepalli, Palnadu. We grow and source
              produce from the farm and nearby families, and we invite city visitors to spend a
              weekend living with the people who grow it.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              The products track is straightforward: good food, fairly sourced, delivered without a
              long supply chain. The tourism track is slower: you work in the field, eat with the
              village, visit local temples and come back with a more honest picture of rural life.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-lime-400/20 bg-gradient-to-br from-emerald-600/15 to-lime-500/5 p-7">
              <h3 className="font-display text-lg font-semibold">What we are building</h3>
              <ul className="mt-4 space-y-3 text-sm text-mist">
                {[
                  "A direct farm-to-customer product line",
                  "A repeatable weekend village experience",
                  "A fair, transparent relationship with local growers",
                  "Room to grow into a separate Kavi Farms brand",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Farm products"
            title="Grown here, packed here"
            description="A small, seasonal catalogue rather than a marketplace. Prices and availability are confirmed on enquiry — we would rather tell you the truth than publish a rate we cannot honour."
          />
          <Reveal className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {FARM_PRODUCT_CATEGORIES.map((category) => (
              <span key={category} className="rounded-full glass px-4 py-2 text-xs text-mist">
                {category}
              </span>
            ))}
          </Reveal>
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FARM_PRODUCTS.map((product) => (
              <RevealItem key={product.slug}>
                <div className="group h-full rounded-3xl glass p-5 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/10 text-4xl">
                    {product.icon}
                  </div>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-lime-300">
                    {product.category}
                  </p>
                  <h3 className="mt-1 font-display text-base font-semibold">{product.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{product.description}</p>
                  <p className="mt-4 border-t border-white/10 pt-3 text-xs font-semibold text-white">
                    {product.price}{" "}
                    <span className="font-normal text-fog">· {product.unit}</span>
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
          <Reveal className="mt-10 text-center">
            <a
              href="#enquiry"
              className="inline-flex rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
            >
              Ask about a product or bulk order →
            </a>
          </Reveal>
        </div>
      </section>

      {/* TOURISM */}
      <section id="tourism" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Farm tourism"
            title="Three days in a real village"
            description="Leave Hyderabad on Friday night, arrive in Polepalli on Saturday morning, and return early on Monday. The schedule follows the farm and the village, not a tourist checklist."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FARM_EXPERIENCES.map((experience) => (
              <RevealItem key={experience.title}>
                <div className="h-full rounded-3xl glass p-6">
                  <span className="text-2xl">{experience.icon}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{experience.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{experience.summary}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ITINERARY */}
      <section id="itinerary" className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Weekend package"
            title="The working itinerary"
            description="A sample schedule. Weather, crop cycles and the group's energy decide the final order; the farm work is real, not a photo opportunity."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {FARM_ITINERARY.map((day) => (
              <RevealItem key={day.day}>
                <div className="h-full rounded-3xl glass p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-lime-300">
                    {day.day}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold">{day.title}</h3>
                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {day.items.map((item) => (
                      <li key={`${day.day}-${item.time}-${item.activity}`} className="flex gap-3 text-xs leading-relaxed text-mist">
                        <span className="w-20 shrink-0 font-semibold text-white/80">{item.time}</span>
                        <span>{item.activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Reveal>
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-6">
                <h3 className="font-display text-base font-semibold text-emerald-200">Included</h3>
                <ul className="mt-3 space-y-2 text-xs text-mist">
                  {FARM_PACKAGE_INCLUSIONS.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6">
                <h3 className="font-display text-base font-semibold text-amber-200">Not included</h3>
                <ul className="mt-3 space-y-2 text-xs text-mist">
                  {FARM_PACKAGE_EXCLUSIONS.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-400">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-6 rounded-2xl glass p-5 text-center text-xs text-mist">
            Package contribution: <span className="font-semibold text-white">on enquiry</span>.
            Confirmed after we check availability, group size and the season.
          </Reveal>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Around Polepalli"
            title="Temples, water and village lanes"
            description="One or two destinations per day, depending on distance and the weather. The village itself is part of the itinerary, not just the base."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FARM_DESTINATIONS.map((destination) => (
              <RevealItem key={destination.name}>
                <div className="h-full rounded-3xl glass p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-lime-300">
                    {destination.type}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold">{destination.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{destination.summary}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* GALLERY PLACEHOLDER */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Gallery"
            title="The farm, before you arrive"
            description="We will replace these placeholders with real farm, product and village photographs as the season progresses."
          />
          <RevealStagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { icon: "🌾", label: "Paddy field" },
              { icon: "🥭", label: "Mango season" },
              { icon: "🛕", label: "Village temple" },
              { icon: "🍲", label: "Village kitchen" },
              { icon: "🌊", label: "Seasonal waterfall" },
              { icon: "🪔", label: "Festival evening" },
            ].map((tile) => (
              <RevealItem key={tile.label}>
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-600/10 to-lime-500/5 text-center">
                  <span className="text-3xl">{tile.icon}</span>
                  <span className="text-xs text-mist">{tile.label}</span>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Common questions" title="Before you book" />
          <RevealStagger className="space-y-3">
            {FARM_FAQ.map((item) => (
              <RevealItem key={item.q}>
                <details className="group rounded-2xl glass p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold">
                    {item.q}
                    <span className="ml-4 text-mist transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{item.a}</p>
                </details>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ENQUIRY */}
      <section id="enquiry" className="relative px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="rounded-3xl glass p-8">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Enquire about a product or a visit
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-mist">
                Tell us what you need — a product, a bulk order, a weekend for two, or a group
                visit. We will confirm availability and the current contribution before anything is
                booked.
              </p>
              <div className="mt-8 space-y-3 text-sm">
                <p className="text-mist">
                  <span className="font-semibold text-white">Email:</span>{" "}
                  <a className="text-lime-300 hover:text-lime-200" href={`mailto:${FARMS_CONTACT.email}`}>
                    {FARMS_CONTACT.email}
                  </a>
                </p>
                <p className="text-mist">
                  <span className="font-semibold text-white">Phone:</span> {FARMS_CONTACT.phone}
                </p>
                <p className="text-mist">
                  <span className="font-semibold text-white">Location:</span> {FARMS_CONTACT.location}
                </p>
              </div>
              <p className="mt-8 rounded-xl border border-lime-400/20 bg-lime-500/5 p-4 text-xs leading-relaxed text-lime-200/80">
                This is a working farm. Visitors follow the farm&apos;s safety instructions, stay with the
                group, and accept that weather and crop work can change the schedule.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <FarmsForms />
          </Reveal>
        </div>
      </section>

      <div className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-fog sm:flex-row">
          <p>
            Kavi Farms — a business vertical of{" "}
            <Link href="/" className="text-mist transition-colors hover:text-white">
              Kavi Solutions
            </Link>
            .
          </p>
          <div className="flex gap-5">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/projects" className="transition-colors hover:text-white">
              Projects
            </Link>
            <Link href="/#contact" className="transition-colors hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
