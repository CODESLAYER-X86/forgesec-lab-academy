import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Cookie & Session Notice",
  description: "How FORGESEC ACADEMY uses essential HttpOnly session cookies without advertising trackers.",
};

export default function CookiesPage() {
  return (
    <PolicyLayout
      title="Cookie & Session Notice"
      updatedAt="2026-11-15"
      summary="FORGESEC ACADEMY uses strictly necessary session cookies for authenticated functionality and sets zero advertising cookies."
    >
      <h2>Essential Session Cookies</h2>
      <p>
        When you sign in, secure HttpOnly cookies maintain your verified server session across
        page transitions. Public visitors reading lessons or searching content do not require
        session cookies.
      </p>
      <h2>No Third-Party Tracking</h2>
      <p>
        We do not embed advertising pixels, cross-site trackers, or third-party behavioral
        analytics cookies.
      </p>
    </PolicyLayout>
  );
}
