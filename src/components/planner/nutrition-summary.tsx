"use client";

import { CheckCircle2, TriangleAlert, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlannerStore } from "@/store/planner-store";
import { t } from "@/locales";

export function NutritionSummary() {
  const targets = usePlannerStore((state) => state.nutritionTargets);
  const totals = usePlannerStore((state) => state.weeklyPlan.totals);
  const days = usePlannerStore((state) => state.weeklyPlan.days);
  const calorieSeries = days.map((day) => day.breakfast.kcal + day.lunch.kcal + day.dinner.kcal + day.snack.kcal);
  const proteinSeries = days.map((day) => day.breakfast.protein + day.lunch.protein + day.dinner.protein + day.snack.protein);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.planner.nutrition.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Metric label={t.planner.nutrition.calories} target={targets.dailyCalories} planned={totals.avgKcal} unit="kcal" series={calorieSeries} />
        <Metric label={t.planner.nutrition.protein} target={targets.dailyProtein} planned={totals.avgProtein} unit="g" series={proteinSeries} />
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  target,
  planned,
  unit,
  series,
}: {
  label: string;
  target: number;
  planned: number;
  unit: string;
  series: number[];
}) {
  const ratio = target > 0 ? planned / target : 0;
  const progress = Math.max(0, Math.min(ratio * 100, 130));
  const percentGap = target > 0 ? Math.abs((planned - target) / target) : 1;
  const isOnTrack = percentGap <= 0.08;
  const isClose = percentGap > 0.08 && percentGap <= 0.16;
  const delta = planned - target;
  const statusLabel = isOnTrack
    ? t.planner.nutrition.onTrack
    : isClose
      ? t.planner.nutrition.slightlyOff
      : delta > 0
        ? t.planner.nutrition.aboveTarget
        : t.planner.nutrition.belowTarget;
  const statusTone = isOnTrack
    ? "status-chip-strong"
    : isClose
      ? "status-chip"
      : "border border-[color:var(--border-glass)] bg-[color:var(--surface-control)] text-[color:var(--text-secondary)]";
  const StatusIcon = isOnTrack ? CheckCircle2 : isClose ? TriangleAlert : TrendingUp;
  const roundedDelta = Math.round(delta * 10) / 10;
  const endValue = series.at(-1) ?? planned;
  const endGap = endValue - target;
  const endStateLabel =
    Math.abs(endGap) <= Math.max(target * 0.08, 1)
      ? t.planner.nutrition.onTrack
      : endGap > 0
        ? t.planner.nutrition.aboveTarget
        : t.planner.nutrition.belowTarget;

  return (
    <div className="surface-inset rounded-2xl p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusTone}`}>
          <StatusIcon className="h-3 w-3" />
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressOrb value={progress} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">{t.planner.nutrition.plannedAvg}</p>
          <p className="text-xl font-semibold leading-tight text-foreground">
            {planned}
            <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t.planner.nutrition.target}: {target} {unit}
          </p>
        </div>
      </div>
      <MiniSparkline values={series} target={target} unit={unit} />
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{t.planner.insights.weeklyTrends}</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-progress)]" />
          {endStateLabel}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {roundedDelta === 0
          ? t.planner.nutrition.exactTarget
          : `${roundedDelta > 0 ? "+" : ""}${roundedDelta} ${unit} ${t.planner.nutrition.vsTarget}`}
      </p>
    </div>
  );
}

function ProgressOrb({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(value, 100));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="relative h-[78px] w-[78px] shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--accent-primary-muted)" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--accent-progress)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-[11px] rounded-full border border-[color:var(--border-glass)] bg-[color:var(--surface-control)]/80" />
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-foreground">{Math.round(value)}%</div>
    </div>
  );
}

function MiniSparkline({ values, target, unit }: { values: number[]; target: number; unit: string }) {
  if (values.length === 0) return null;

  const min = Math.min(...values, target);
  const max = Math.max(...values, target, 1);
  const range = Math.max(max - min, 1);
  const targetY = 100 - ((target - min) / range) * 100;
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return { x, y: (y / 100) * 24 };
    });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaString = `0,24 ${pointString} 100,24`;

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-px w-3 rounded-full bg-[color:var(--accent-progress)]" />
          {t.planner.insights.weeklyTrends}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-px w-3 border-t border-dashed border-[color:var(--text-secondary)]/70" />
          {t.planner.nutrition.target}
        </span>
      </div>
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-7 w-full">
      <polygon points={areaString} fill="var(--accent-primary-muted)" fillOpacity="0.35" />
      <line
        x1="0"
        y1={(targetY / 100) * 24}
        x2="100"
        y2={(targetY / 100) * 24}
        stroke="var(--text-secondary)"
        strokeDasharray="3 2"
        strokeOpacity="0.45"
        strokeWidth="1"
      >
        <title>{`${t.planner.nutrition.target}: ${target} ${unit}`}</title>
      </line>
      <polyline fill="none" stroke="var(--accent-progress)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pointString} />
      {points.map((point, index) => (
        <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="1.2" fill="var(--accent-progress)">
          <title>{`Day ${index + 1}: ${values[index]} ${unit}`}</title>
        </circle>
      ))}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="1.8" fill="var(--accent-progress)" />
      </svg>
    </div>
  );
}
