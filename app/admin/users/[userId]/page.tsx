import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserRoleForm } from "@/components/admin/user-role-form";
import { getAdminUserById } from "@/modules/admin/service";
import { requireFullAdmin } from "@/modules/auth/session";

export const metadata = {
  title: "Edit User Permissions | FORGESEC Admin",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireFullAdmin();
  const { userId } = await params;
  const target = await getAdminUserById(userId);
  if (!target) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#AAB4BE] hover:text-[#F3F4F6]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to users</span>
        </Link>
      </div>

      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          User Permissions
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
          {target.displayName}
        </h1>
        <p className="text-sm text-[#AAB4BE]">
          {target.email} · Joined{" "}
          {new Date(target.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </header>

      <UserRoleForm
        targetUserId={target.id}
        email={target.email}
        initialRole={target.role}
        isPermanentAdmin={target.isPermanentAdmin}
        initialCanManageQuizzes={target.canManageQuizzes}
        initialCanManageAssignments={target.canManageAssignments}
      />
    </div>
  );
}
