import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Responsible Disclosure Policy",
  description: "Guidelines for responsibly reporting security vulnerabilities in FORGESEC ACADEMY.",
};

export default function ResponsibleDisclosurePage() {
  return (
    <PolicyLayout
      title="Responsible Disclosure Policy"
      updatedAt="2026-11-15"
      summary="How security researchers and students can report potential vulnerabilities in FORGESEC ACADEMY safely."
    >
      <h2>Scope &amp; Good-Faith Testing</h2>
      <p>
        If you discover an authorization bypass, data exposure, or cross-site scripting flaw
        in FORGESEC ACADEMY, report it promptly before public disclosure and avoid accessing
        or modifying another student&apos;s records.
      </p>
      <h2>What to Include</h2>
      <ul>
        <li>Affected URL or route and reproduction steps.</li>
        <li>Observed behavior versus expected security boundary.</li>
        <li>Contact email for confirmation once remediated.</li>
      </ul>
    </PolicyLayout>
  );
}
