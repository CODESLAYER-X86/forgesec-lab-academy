import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Cybersecurity Learning Disclaimer",
  description: "Safety scope and authorization disclaimer for FORGESEC ACADEMY practical exercises.",
};

export default function DisclaimerPage() {
  return (
    <PolicyLayout
      title="Cybersecurity Learning Disclaimer"
      updatedAt="2026-11-15"
      summary="Practical exercises are executed independently on learner-owned or explicitly authorized environments."
    >
      <h2>1. Independent Execution</h2>
      <p>
        FORGESEC ACADEMY Version 1.0 does not host remote virtual machines or live attack ranges.
        All CLI commands and assignments should be run inside isolated local machines or
        authorized lab environments.
      </p>
      <h2>2. Authorization Requirement</h2>
      <p>
        Always confirm ownership or written permission before inspecting network interfaces,
        services, or configurations on any system. Self-reported assignment statuses reflect your
        own checklist rather than remote verification by FORGESEC LABS.
      </p>
    </PolicyLayout>
  );
}
