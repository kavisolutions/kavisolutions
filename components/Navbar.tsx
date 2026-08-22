import Link from "next/link";
import MobileMenu from "./MobileMenu";

const links = [
  { href: "/web", label: "Web" },
  { href: "/mobile", label: "Mobile" },
  { href: "/product", label: "Product" },
  { href: "/marketing", label: "Marketing" },
  { href: "/#fellowship", label: "Fellowship" },
  { href: "/#team", label: "Team" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between gap-3 rounded-2xl glass px-5 py-3 shadow-lift">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 font-display text-lg font-bold text-white shadow-glow">
            K
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-ring" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Kavi<span className="text-gradient">Solutions</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-mist transition-all hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#contact"
          className="hidden rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 sm:block"
        >
          Let&apos;s Talk
        </Link>

                <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
