import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Rules governing access to FORGESEC ACADEMY educational services and student accounts.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of Use"
      updatedAt="2026-11-15"
      summary="Terms governing use of FORGESEC ACADEMY educational materials, quizzes, practical assignments, and student accounts."
    >
      <h2>1. Educational Purpose</h2>
      <p>
        All tutorials, write-ups, and practical assignments on FORGESEC ACADEMY are provided
        solely for lawful educational and defensive engineering purposes.
      </p>
      <h2>2. Account Responsibility</h2>
      <p>
        Access to authenticated student features uses Google OAuth. You are responsible for
        maintaining the security of your Google account and refraining from sharing unauthorized
        automated scraping or abuse against platform endpoints.
      </p>
      <h2>3. Service Availability</h2>
      <p>
        FORGESEC ACADEMY is provided free of charge on an educational basis. Features, learning
        paths, and assessments may be updated or archived to maintain technical accuracy.
      </p>
    </PolicyLayout>
  );
}
