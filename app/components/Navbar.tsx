import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import NavAuth from "./NavAuth";

/* Keep the top bar short. Services live in the homepage explore section and
   the footer; the navbar only carries the durable entry points. */
const links = [
  { href: "/#explore", label: "Showcase" },
  { href: "/projects", label: "Projects" },
  { href: "/fellowship", label: "Fellowship" },
  { href: "/team", label: "Team" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 pointer-events-none">
      <div className="mx-auto mt-4 flex max-w-[1152px] h-16 items-center justify-between gap-3 rounded-[12px] bg-[rgba(18,29,47,0.84)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.14)] px-4 sm:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] pointer-events-auto">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-glow">
            <Image
              src="/logo.svg"
              alt="Kavi Solutions logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-[#F7F9FC]">
            Kavi<span className="text-[#91B4FF]">Solutions</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-[14px] font-medium text-[#A5B3C7] transition-colors hover:bg-white/5 hover:text-[#F7F9FC]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <NavAuth />
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-[#FFFFFF] text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] focus:outline-none focus:ring-2 focus:ring-[#91B4FF] focus:ring-offset-2 focus:ring-offset-[#0B1220]"
          >
            Let&apos;s Talk
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
