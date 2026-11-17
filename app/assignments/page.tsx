import type { Metadata } from "next";
import { AssignmentsExplorer } from "@/components/learning/assignments-explorer";
import { getPublishedAssignments } from "@/modules/assignments/service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Practical Assignments",
  description:
    "Hands-on cybersecurity and Linux exercises executed safely on your local machine.",
};

export default async function AssignmentsIndexPage() {
  const assignments = await getPublishedAssignments();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Practical Assignments</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#AAB4BE]">
          Execute real commands on your own Linux environment or authorized lab, verify
          expected outcomes, and track your completion status.
        </p>
      </div>

      <AssignmentsExplorer assignments={assignments} />
    </div>
  );
}
