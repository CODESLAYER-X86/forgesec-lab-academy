import { AssignmentManager } from "@/components/admin/assignment-manager";
import { getAllAssignmentsForAdmin } from "@/modules/assignments/service";
import { requireAssignmentManager } from "@/modules/auth/session";

export const metadata = {
  title: "Manage Assignments | FORGESEC Admin",
};

export default async function AdminAssignmentsPage() {
  await requireAssignmentManager();
  const assignments = await getAllAssignmentsForAdmin();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Hands-On Practice
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
          Practical Assignments
        </h1>
        <p className="text-sm text-[#AAB4BE]">
          Author local self-verified labs with clear safety warnings and expected terminal outcomes.
        </p>
      </header>

      <AssignmentManager assignments={assignments} />
    </div>
  );
}
