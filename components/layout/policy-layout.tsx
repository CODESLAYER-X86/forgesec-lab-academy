import Link from "next/link";

const POLICY_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/acceptable-use", label: "Acceptable Use Policy" },
  { href: "/disclaimer", label: "Learning Disclaimer" },
  { href: "/cookies", label: "Cookie & Session Notice" },
  { href: "/copyright", label: "Copyright Policy" },
  { href: "/responsible-disclosure", label: "Responsible Disclosure" },
];

export function PolicyLayout({
  title,
  updatedAt,
  summary,
  children,
}: {
  title: string;
  updatedAt: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4">
            <div className="text-xs font-semibold text-[#F3F4F6]">Platform Policies</div>
            <nav aria-label="Policy documents" className="mt-3 space-y-1.5">
              {POLICY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-2.5 py-1.5 text-xs text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 sm:p-8 space-y-6">
          <header className="border-b border-[#303A44] pb-5">
            <div className="text-xs text-[#7B8794]">
              FORGESEC ACADEMY · Effective {updatedAt}
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[#F3F4F6]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">{summary}</p>
          </header>

          <div className="space-y-5 text-sm leading-relaxed text-[#D1D5DB] [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#F3F4F6] [&_h2]:pt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
