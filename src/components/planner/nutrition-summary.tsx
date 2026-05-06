"use client";

import { CheckCircle2, TriangleAlert, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlannerStore } from "@/store/planner-store";

export function NutritionSummary() {
  const targets = usePlannerStore((state) => state.nutritionTargets);
  const totals = usePlannerStore((state) => state.weeklyPlan.totals);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition progress</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Metric label="Calories" target={targets.dailyCalories} planned={totals.avgKcal} unit="kcal" />
        <Metric label="Protein" target={targets.dailyProtein} planned={totals.avgProtein} unit="g" />
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  target,
  planned,
  unit,
}: {
  label: string;
  target: number;
  planned: number;
  unit: string;
}) {
  const ratio = target > 0 ? planned / target : 0;
  const progress = Math.max(0, Math.min(ratio * 100, 130));
  const percentGap = target > 0 ? Math.abs((planned - target) / target) : 1;
  const isOnTrack = percentGap <= 0.08;
  const isClose = percentGap > 0.08 && percentGap <= 0.16;
  const delta = planned - target;
  const statusLabel = isOnTrack ? "On track" : isClose ? "Slightly off" : delta > 0 ? "Above target" : "Below target";
  const statusTone = isOnTrack
    ? "status-chip-strong"
    : isClose
      ? "status-chip"
      : "border border-[color:var(--border-glass)] bg-[color:var(--surface-control)] text-[color:var(--text-secondary)]";
  const StatusIcon = isOnTrack ? CheckCircle2 : isClose ? TriangleAlert : TrendingUp;
  const roundedDelta = Math.round(delta * 10) / 10;

  return (
    <div className="surface-inset rounded-xl p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusTone}`}>
          <StatusIcon className="h-3 w-3" />
          {statusLabel}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="control-surface rounded-lg px-2.5 py-2">
          <p className="text-[11px] text-muted-foreground">Target</p>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {target} {unit}
          </p>
        </div>
        <div className="control-surface rounded-lg px-2.5 py-2">
          <p className="text-[11px] text-muted-foreground">Planned avg</p>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {planned} {unit}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--accent-primary-muted)]">
          <div className="h-full rounded-full bg-[color:var(--accent-progress)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {roundedDelta === 0 ? "Exactly on target" : `${roundedDelta > 0 ? "+" : ""}${roundedDelta} ${unit} vs target`}
        </p>
      </div>
    </div>
  );
}
