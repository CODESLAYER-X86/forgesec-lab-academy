import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Terminal } from "lucide-react";
import { StudentInvitationCard } from "@/components/learning/student-invitation-card";
import { getSiteUrl } from "@/lib/env";
import {
  getPublishedLearningPaths,
  getPublishedLessons,
  getPublishedWriteups,
} from "@/modules/content/loader";

export default function HomePage() {
  const paths = getPublishedLearningPaths();
  const lessons = getPublishedLessons();
  const writeups = getPublishedWriteups();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "FORGESEC ACADEMY",
    url: getSiteUrl(),
    description:
      "Free, self-paced cybersecurity and Linux engineering education by FORGESEC LABS.",
  };

  const featuredLessons = lessons.slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Section 1: Hero */}
      <section className="border-b border-[#262F38]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-7">
              <div className="text-xs font-medium text-[#A3E635]">
                FORGESEC ACADEMY · FORGESEC LABS
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F3F4F6] sm:text-5xl">
                Build skills. Understand systems. Learn security.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#AAB4BE] sm:text-lg">
                Structured Linux, networking, and foundational security curricula designed
                for real engineering comprehension—freely readable without barriers, paired
                with local hands-on tasks and server-verified assessments.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/learn"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#A3E635] px-6 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] transition-colors whitespace-nowrap"
                >
                  <span>Explore Academy</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/writeups"
                  className="inline-flex h-11 items-center rounded-lg border border-[#303A44] bg-[#171D23] px-5 text-sm font-medium text-[#F3F4F6] hover:border-[#4B5866] transition-colors whitespace-nowrap"
                >
                  Read Write-ups
                </Link>
              </div>
            </div>

            {/* Primary Spotlight Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#303A44] bg-[#171D23] p-6 sm:p-8 lg:col-span-5">
              <div>
                <div className="text-xs text-[#AAB4BE]">
                  Flagship Learning Path · Beginner
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#F3F4F6]">
                  Understand the Linux environment.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
                  A 10-module introduction from command-line fundamentals and text pipelines
                  to permissions, systemd services, sockets, and SSH access.
                </p>

                <div className="mt-6 rounded-lg border border-[#303A44] bg-[#0C1014] p-4 font-mono text-xs text-[#E5E7EB] space-y-1.5">
                  <div className="text-[#7B8794]">$ whoami &amp;&amp; pwd</div>
                  <div>student</div>
                  <div>/home/student</div>
                  <div className="pt-1 text-[#7B8794]">$ ss -tulnp</div>
                  <div className="text-[#A3E635]">LISTEN 0 128 127.0.0.1:22</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#262F38] pt-4 text-xs text-[#AAB4BE]">
                <span className="tabular-nums">10 modules · ~200 min</span>
                <Link
                  href="/learn/paths/linux-fundamentals"
                  className="inline-flex items-center gap-1 font-semibold text-[#A3E635] hover:underline"
                >
                  Start Linux Path <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Learning Paths */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#F3F4F6]">Learning Paths</h2>
            <p className="mt-1 text-sm text-[#AAB4BE]">
              Guided, sequential curricula you can explore freely at your own pace.
            </p>
          </div>
          <Link
            href="/learn/paths"
            className="text-xs font-semibold text-[#A3E635] hover:underline"
          >
            View all paths
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {paths.map((p) => (
            <Link
              key={p.id}
              href={`/learn/paths/${p.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[#303A44] bg-[#171D23] p-6 hover:border-[#4B5866] transition-colors"
            >
              <div>
                <div className="text-xs text-[#AAB4BE] capitalize tabular-nums">
                  {p.category.replace("-", " ")} · {p.difficulty} · {p.lessons.length} modules
                </div>
                <h3 className="mt-2 text-lg font-semibold text-[#F3F4F6] group-hover:text-[#A3E635] transition-colors">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
                  {p.description}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#262F38] pt-4 text-xs text-[#7B8794]">
                <span className="tabular-nums">{p.estimatedMinutes} min</span>
                <span className="font-medium text-[#F3F4F6] group-hover:text-[#A3E635]">
                  Open Curriculum
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: Latest Content & Write-ups */}
      <section className="border-y border-[#262F38] bg-[#13181E]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold text-[#F3F4F6]">
                  Featured Modules
                </h2>
                <Link href="/learn" className="text-xs font-semibold text-[#A3E635] hover:underline">
                  Browse catalog
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
                {featuredLessons.map((lesson) => (
                  <Link
                    key={lesson.meta.id}
                    href={`/learn/lessons/${lesson.meta.slug}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-[#202831] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-[#7B8794] capitalize tabular-nums">
                        Module {String(lesson.meta.moduleNumber).padStart(2, "0")} ·{" "}
                        {lesson.meta.category} · {lesson.meta.estimatedMinutes} min
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[#F3F4F6] truncate">
                        {lesson.meta.title}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#7B8794]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold text-[#F3F4F6]">
                  Technical Write-ups
                </h2>
                <Link href="/writeups" className="text-xs font-semibold text-[#A3E635] hover:underline">
                  All write-ups
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {writeups.map((w) => (
                  <Link
                    key={w.meta.id}
                    href={`/writeups/${w.meta.slug}`}
                    className="block rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#4B5866] transition-colors"
                  >
                    <div className="text-xs text-[#7B8794] capitalize tabular-nums">
                      {w.meta.category.replace("-", " ")} · {w.meta.difficulty} ·{" "}
                      {w.meta.estimatedMinutes} min
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-[#F3F4F6]">
                      {w.meta.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#AAB4BE]">
                      {w.meta.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Why FORGESEC ACADEMY */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-[#F3F4F6]">
          Why FORGESEC ACADEMY
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
            <BookOpen className="h-5 w-5 text-[#A3E635]" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-[#F3F4F6]">
              Open Content, Zero Gatekeeping
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
              Every published tutorial, path, guide, and glossary entry is publicly accessible
              without mandatory sign-up walls.
            </p>
          </div>
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
            <Terminal className="h-5 w-5 text-[#A3E635]" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-[#F3F4F6]">
              Practice on Real Systems
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
              Practical assignments guide you through real local CLI exercises with explicit
              safety boundaries instead of fragile simulated terminals.
            </p>
          </div>
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
            <ShieldCheck className="h-5 w-5 text-[#A3E635]" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-[#F3F4F6]">
              Verified Assessments &amp; Progress
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
              Sign in with Google to save bookmarks, track path completion, and verify
              knowledge through server-graded quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Student Invitation */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <StudentInvitationCard />
      </section>
    </>
  );
}
