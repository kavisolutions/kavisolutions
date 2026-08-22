import { Reveal } from "./motion";

export function SectionHeading({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto mb-14 max-w-3xl text-center">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gradient">
        {tag}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base text-mist sm:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}