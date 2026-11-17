import type { Metadata } from "next";
import { PathsIndexClient } from "@/components/learning/path-progress-clients";
import { getPublishedLearningPaths } from "@/modules/content/loader";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Structured cybersecurity roadmaps covering Linux Fundamentals, Networking, and Web Security.",
};

export default function LearningPathsIndexPage() {
  const paths = getPublishedLearningPaths();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Learning Paths</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#AAB4BE]">
          Guided, recommended sequences for mastering core systems and security foundations.
          Modules remain unlocked so you can study at your own pace.
        </p>
      </div>

      <PathsIndexClient paths={paths} />
    </div>
  );
}
