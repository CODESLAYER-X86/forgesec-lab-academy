"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Save } from "lucide-react";
import { updateUserRoleAction } from "@/app/actions/admin";
import type { AppRole } from "@/lib/types/domain";

interface UserRoleFormProps {
  targetUserId: string;
  email: string;
  initialRole: AppRole;
  isPermanentAdmin: boolean;
  initialCanManageQuizzes: boolean;
  initialCanManageAssignments: boolean;
}

export function UserRoleForm({
  targetUserId,
  email,
  initialRole,
  isPermanentAdmin,
  initialCanManageQuizzes,
  initialCanManageAssignments,
}: UserRoleFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<AppRole>(initialRole);
  const [canManageQuizzes, setCanManageQuizzes] = useState(initialCanManageQuizzes);
  const [canManageAssignments, setCanManageAssignments] = useState(initialCanManageAssignments);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const res = await updateUserRoleAction({
      targetUserId,
      role: isPermanentAdmin ? "admin" : role,
      canManageQuizzes: role === "admin" ? true : canManageQuizzes,
      canManageAssignments: role === "admin" ? true : canManageAssignments,
    });

    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to update role.");
      return;
    }

    setMessage("Permissions saved and recorded in the audit log.");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-6"
    >
      {isPermanentAdmin ? (
        <div className="flex items-start gap-3 rounded-lg border border-[#303A44] bg-[#173D35]/40 p-4 text-xs text-[#D1FAE5]">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#A3E635] mt-0.5" aria-hidden="true" />
          <div>
            <div className="font-semibold">Permanent Administrator Allowlist</div>
            <p className="mt-1 text-[#AAB4BE]">
              {email} is listed in <code className="font-mono text-[#F3F4F6]">ADMIN_EMAILS</code> and
              cannot be demoted through the admin interface.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="role-select" className="block text-xs font-medium text-[#AAB4BE]">
          Account Role
        </label>
        <select
          id="role-select"
          value={isPermanentAdmin ? "admin" : role}
          disabled={isPermanentAdmin || saving}
          onChange={(e) => setRole(e.target.value as AppRole)}
          className="w-full max-w-sm rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none disabled:opacity-60"
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor (Scoped Permissions)</option>
          <option value="admin">Admin (Full Console Access)</option>
        </select>
      </div>

      <div className="space-y-3 border-t border-[#262F38] pt-5">
        <div className="text-xs font-medium text-[#AAB4BE]">
          Scoped Instructor Capabilities
        </div>

        <label className="flex items-start gap-3 text-sm text-[#F3F4F6]">
          <input
            type="checkbox"
            checked={role === "admin" || canManageQuizzes}
            disabled={role === "admin" || role === "student" || saving}
            onChange={(e) => setCanManageQuizzes(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#303A44] bg-[#101418] accent-[#A3E635]"
          />
          <span>
            <span className="font-medium block">Manage Quizzes</span>
            <span className="text-xs text-[#7B8794]">
              Create, publish, and archive knowledge checks inside the admin console.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-[#F3F4F6]">
          <input
            type="checkbox"
            checked={role === "admin" || canManageAssignments}
            disabled={role === "admin" || role === "student" || saving}
            onChange={(e) => setCanManageAssignments(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#303A44] bg-[#101418] accent-[#A3E635]"
          />
          <span>
            <span className="font-medium block">Manage Practical Assignments</span>
            <span className="text-xs text-[#7B8794]">
              Create, publish, and archive hands-on lab checklists and safety warnings.
            </span>
          </span>
        </label>
      </div>

      {error ? <div className="text-xs text-[#EF4444]">{error}</div> : null}
      {message ? <div className="text-xs text-[#A3E635]">{message}</div> : null}

      <button
        type="submit"
        disabled={saving || isPermanentAdmin}
        className="inline-flex items-center gap-2 rounded-lg bg-[#A3E635] px-4 py-2 text-xs font-semibold text-[#101418] hover:bg-[#bef264] disabled:opacity-50 transition-colors"
      >
        <Save className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{saving ? "Saving..." : "Save Role & Permissions"}</span>
      </button>
    </form>
  );
}
