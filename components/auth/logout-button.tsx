"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6] transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}
