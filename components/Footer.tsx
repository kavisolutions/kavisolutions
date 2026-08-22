export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-500 font-display font-bold text-white">
              K
            </span>
            <span className="font-display font-semibold tracking-tight">
              Kavi<span className="text-gradient">Solutions</span>
            </span>
          </a>
          <p className="mt-2 text-sm text-fog">
            Web · Mobile · Product · Marketing · Fellowship
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-mist">
          <a href="#services" className="transition-colors hover:text-white">Services</a>
          <a href="#fellowship" className="transition-colors hover:text-white">Fellowship</a>
          <a href="#team" className="transition-colors hover:text-white">Team</a>
          <a href="#contact" className="transition-colors hover:text-white">Contact</a>
        </div>

        <p className="text-sm text-fog">
          © {new Date().getFullYear()} Kavi Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}