import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B1220] border-t border-[rgba(255,255,255,0.08)] mt-24">
      <div className="max-w-[1152px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-8 pb-14 border-b border-[rgba(255,255,255,0.08)]">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-glow">
                <Image
                  src="/logo.svg"
                  alt="Kavi Solutions Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-[#F7F9FC]">
                Kavi<span className="text-[#91B4FF]">Solutions</span>
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-[#7889A0] max-w-sm leading-relaxed">
              Web · Mobile · Product · Marketing · AI · Fellowship
            </p>
            <p className="text-xs text-[#7889A0]">
              Bangalore &amp; beyond · Worldwide remote delivery.
            </p>
          </div>

          {/* Nav links columns */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] font-semibold text-[#F7F9FC] uppercase tracking-[0.2em]">
                Services
              </span>
              <ul className="flex flex-col gap-2.5 text-[14px] text-[#A5B3C7]">
                <li>
                  <Link href="/web" className="hover:text-white transition-colors">
                    Web Development
                  </Link>
                </li>
                <li>
                  <Link href="/mobile" className="hover:text-white transition-colors">
                    Mobile Products
                  </Link>
                </li>
                <li>
                  <Link href="/product" className="hover:text-white transition-colors">
                    Product Design
                  </Link>
                </li>
                <li>
                  <Link href="/marketing" className="hover:text-white transition-colors">
                    Growth &amp; SEO
                  </Link>
                </li>
                <li>
                  <Link href="/ai-blockchain" className="hover:text-white transition-colors">
                    AI &amp; Blockchain
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] font-semibold text-[#F7F9FC] uppercase tracking-[0.2em]">
                Studio
              </span>
              <ul className="flex flex-col gap-2.5 text-[14px] text-[#A5B3C7]">
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    Selected Work
                  </Link>
                </li>
                <li>
                  <Link href="/fellowship" className="hover:text-white transition-colors">
                    Fellowship
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="hover:text-white transition-colors">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-white transition-colors">
                    Contact &amp; Quotes
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] font-semibold text-[#F7F9FC] uppercase tracking-[0.2em]">
                Portal &amp; Legal
              </span>
              <ul className="flex flex-col gap-2.5 text-[14px] text-[#A5B3C7]">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Account Login
                  </Link>
                </li>
                <li>
                  <Link href="/verify" className="hover:text-white transition-colors">
                    Verify Certificate
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
                <li className="text-xs text-[#7889A0] pt-1">
                  Private &amp; Confidential
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7889A0]">
          <p>© {new Date().getFullYear()} Kavi Solutions. Worldwide · Remote-first.</p>
          <p className="font-mono text-[11px]">Engineered to impress and built to perform.</p>
        </div>
      </div>
    </footer>
  );
}
