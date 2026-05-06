"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransitionLink } from "@/components/ui/transition-link";
import { usePlannerStore } from "@/store/planner-store";
import { toTitleCase } from "@/lib/utils";
import { t } from "@/locales";

export function BodyMetricsSummary() {
  const profile = usePlannerStore((state) => state.profile);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>{t.planner.bodyMetrics.title}</CardTitle>
            <CardDescription>{t.planner.bodyMetrics.description}</CardDescription>
          </div>
          <TransitionLink href="/" className="rounded-md px-2 py-1 text-sm font-medium text-accent transition-opacity hover:opacity-85">
            {t.planner.bodyMetrics.editCta}
          </TransitionLink>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label={t.planner.profileForm.fields.sex} value={toTitleCase(profile.sex)} />
        <Metric label={t.planner.profileForm.fields.activity} value={toTitleCase(profile.activityLevel)} />
        <Metric label={t.planner.profileForm.fields.age} value={`${profile.age}`} />
        <Metric label={t.planner.profileForm.fields.heightCm} value={`${profile.heightCm} cm`} />
        <Metric label={t.planner.profileForm.fields.weightKg} value={`${profile.weightKg} kg`} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-inset rounded-xl px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
