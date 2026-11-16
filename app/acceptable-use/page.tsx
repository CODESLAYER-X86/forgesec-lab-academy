import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Permitted and prohibited security learning activities on FORGESEC ACADEMY.",
};

export default function AcceptableUsePage() {
  return (
    <PolicyLayout
      title="Acceptable Use Policy"
      updatedAt="2026-11-15"
      summary="Clear rules separating authorized hands-on system practice from unauthorized testing or platform abuse."
    >
      <h2>Allowed Activities</h2>
      <ul>
        <li>Studying published lessons, practicing Linux commands on your own hardware or authorized virtual machines, and verifying local configurations.</li>
        <li>Completing quizzes honestly and tracking personal assignment milestones.</li>
      </ul>
      <h2>Prohibited Activities</h2>
      <ul>
        <li>Using commands or techniques taught on FORGESEC ACADEMY against networks, servers, or accounts you do not own or lack written authorization to test.</li>
        <li>Attempting to bypass authorization checks, probe private student data, or disrupt platform availability.</li>
      </ul>
    </PolicyLayout>
  );
}
