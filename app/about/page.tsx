import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About FORGESEC ACADEMY",
  description:
    "Learn about FORGESEC ACADEMY's mission, educational methodology, and safe self-paced cybersecurity philosophy.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <header className="border-b border-[#303A44] pb-6">
        <div className="text-xs font-medium text-[#A3E635]">FORGESEC LABS</div>
        <h1 className="mt-2 text-3xl font-bold text-[#F3F4F6]">
          About FORGESEC ACADEMY
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#AAB4BE]">
          FORGESEC ACADEMY is an open, self-paced technical learning platform dedicated to
          building strong foundations in Linux systems, networking, and cybersecurity.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
          <h2 className="text-lg font-semibold text-[#F3F4F6]">Content-First Education</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
            Public lessons, technical write-ups, and glossary references remain accessible
            without mandatory registration. Every module emphasizes why commands work—not just
            copy-paste shortcuts.
          </p>
        </div>

        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
          <h2 className="text-lg font-semibold text-[#F3F4F6]">Authorized Practice</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
            Instead of fragile hosted VMs, practical assignments guide learners to practice
            safely on their own computers or explicitly authorized lab machines while following
            responsible disclosure and acceptable-use standards.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#F3F4F6]">Contact &amp; Governance</h2>
        <p className="text-sm leading-relaxed text-[#AAB4BE]">
          For curriculum corrections, privacy inquiries, or vulnerability reports, review our{" "}
          <Link href="/responsible-disclosure" className="text-[#A3E635] underline">
            Responsible Disclosure Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#A3E635] underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
