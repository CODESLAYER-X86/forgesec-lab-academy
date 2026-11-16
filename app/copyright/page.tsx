import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Copyright Policy",
  description: "Content ownership, code snippet usage, and attribution policy for FORGESEC ACADEMY.",
};

export default function CopyrightPage() {
  return (
    <PolicyLayout
      title="Copyright Policy"
      updatedAt="2026-11-15"
      summary="Ownership and educational reuse terms for FORGESEC ACADEMY curricula, write-ups, and terminal examples."
    >
      <h2>Curriculum Ownership</h2>
      <p>
        Original lessons, diagrams, assessments, and guides published by FORGESEC ACADEMY belong
        to FORGESEC LABS and respective contributors unless noted otherwise.
      </p>
      <h2>Code &amp; Command Examples</h2>
      <p>
        Short terminal commands and configuration snippets shown in lessons may be practiced
        freely for personal learning and local administration. Republishing complete modules
        verbatim without attribution or permission is prohibited.
      </p>
    </PolicyLayout>
  );
}
