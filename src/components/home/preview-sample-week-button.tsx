"use client";

import { SAMPLE_PROFILES } from "@/data/sample-profiles";
import { savePendingHomeSampleProfile } from "@/lib/home-sample-profile";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";

function pickRandomSampleId() {
  if (!SAMPLE_PROFILES.length) return null;
  const index = Math.floor(Math.random() * SAMPLE_PROFILES.length);
  return SAMPLE_PROFILES[index]?.id ?? null;
}

export function PreviewSampleWeekButton({ label }: { label: string }) {
  return (
    <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-300">
      <TransitionLink
        href="/planner"
        onClick={() => {
          const sampleId = pickRandomSampleId();
          if (!sampleId) return;
          savePendingHomeSampleProfile(sampleId);
        }}
      >
        {label}
      </TransitionLink>
    </Button>
  );
}
