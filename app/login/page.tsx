import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/login-panel";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser, getPreviewDemoUsers } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to FORGESEC ACADEMY using Google OAuth.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const [currentUser, demoUsers] = await Promise.all([
    getCurrentUser(),
    getPreviewDemoUsers(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <LoginPanel
        supabaseEnabled={isSupabaseConfigured()}
        demoUsers={demoUsers}
        currentUser={currentUser}
        nextPath={safeNext}
      />
    </div>
  );
}
