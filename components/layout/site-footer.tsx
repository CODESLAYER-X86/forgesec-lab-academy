import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#303A44] bg-[#101418] text-sm text-[#AAB4BE]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm font-semibold text-[#F3F4F6]">FORGESEC ACADEMY</div>
            <p className="mt-3 text-xs leading-relaxed text-[#AAB4BE]">
              Free, self-paced cybersecurity and Linux engineering education by FORGESEC LABS.
              Public lessons remain open without mandatory registration.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#F3F4F6]">Curriculum</div>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/learn" className="hover:text-[#F3F4F6]">
                  Learning Catalog
                </Link>
              </li>
              <li>
                <Link href="/learn/paths/linux-fundamentals" className="hover:text-[#F3F4F6]">
                  Linux Fundamentals
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="hover:text-[#F3F4F6]">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/assignments" className="hover:text-[#F3F4F6]">
                  Practical Assignments
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#F3F4F6]">Knowledge Base</div>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/writeups" className="hover:text-[#F3F4F6]">
                  Technical Write-ups
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#F3F4F6]">
                  Guides &amp; References
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="hover:text-[#F3F4F6]">
                  Security Glossary
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F3F4F6]">
                  About Academy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#F3F4F6]">Policies &amp; Trust</div>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-[#F3F4F6]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#F3F4F6]">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-[#F3F4F6]">
                  Acceptable Use Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[#F3F4F6]">
                  Learning Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[#F3F4F6]">
                  Cookie &amp; Session Notice
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-[#F3F4F6]">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link href="/responsible-disclosure" className="hover:text-[#F3F4F6]">
                  Responsible Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#262F38] pt-6 text-xs text-[#7B8794] sm:flex-row sm:items-center sm:justify-between">
          <span>FORGESEC ACADEMY · FORGESEC LABS</span>
          <span>Educational Version 1.0</span>
        </div>
      </div>
    </footer>
  );
}
