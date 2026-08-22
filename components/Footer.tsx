import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-glow">
              <Image
                src="/logo.svg"
                alt="Kavi Solutions logo"
                width={32}
                height={32}
                className="h-full w-full"
              />
            </span>
            <span className="font-display font-semibold tracking-tight">
              Kavi<span className="text-gradient">Solutions</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-fog">
            Web · Mobile · Product · Marketing · Fellowship
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-mist">
          <Link href="/web" className="transition-colors hover:text-white">Web</Link>
          <Link href="/mobile" className="transition-colors hover:text-white">Mobile</Link>
          <Link href="/product" className="transition-colors hover:text-white">Product</Link>
          <Link href="/marketing" className="transition-colors hover:text-white">Marketing</Link>
          <Link href="/#fellowship" className="transition-colors hover:text-white">Fellowship</Link>
          <Link href="/#team" className="transition-colors hover:text-white">Team</Link>
          <Link href="/#contact" className="transition-colors hover:text-white">Contact</Link>
        </div>

        <p className="text-sm text-fog">
          © {new Date().getFullYear()} Kavi Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}