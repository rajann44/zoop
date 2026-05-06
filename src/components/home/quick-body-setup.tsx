"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TransitionLink } from "@/components/ui/transition-link";
import type { UserProfile } from "@/types/planner";
import { ACTIVITY_LEVELS, SEX_TYPES } from "@/types/planner";
import { saveHomeBodyProfile, type HomeBodyProfile } from "@/lib/home-profile";
import { toTitleCase } from "@/lib/utils";
import { t } from "@/locales";

const defaults: HomeBodyProfile = {
  sex: "female",
  activityLevel: "light",
  age: 28,
  heightCm: 162,
  weightKg: 58,
};

const numberFields = [
  { key: "age", label: t.home.quickSetup.ageLabel, min: 15, max: 80 },
  { key: "heightCm", label: t.home.quickSetup.heightLabel, min: 130, max: 220, unit: "cm" },
  { key: "weightKg", label: t.home.quickSetup.weightLabel, min: 35, max: 180, unit: "kg" },
] as const;

export function QuickBodySetup() {
  const [profile, setProfile] = useState<HomeBodyProfile>(defaults);
  const [numberInputs, setNumberInputs] = useState<Record<(typeof numberFields)[number]["key"], string>>({
    age: String(defaults.age),
    heightCm: String(defaults.heightCm),
    weightKg: String(defaults.weightKg),
  });

  const hint = useMemo(() => {
    return t.home.quickSetup.activityHints[profile.activityLevel];
  }, [profile.activityLevel]);

  const update = <K extends keyof HomeBodyProfile>(key: K, value: HomeBodyProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const adjustNumber = (key: (typeof numberFields)[number]["key"], min: number, max: number, delta: number) => {
    setProfile((prev) => {
      const next = Math.min(max, Math.max(min, prev[key] + delta));
      setNumberInputs((current) => ({ ...current, [key]: String(next) }));
      return { ...prev, [key]: next };
    });
  };

  const updateNumberInput = (key: (typeof numberFields)[number]["key"], raw: string) => {
    const digitsOnly = raw.replace(/\D+/g, "").replace(/^0+(?=\d)/, "");
    setNumberInputs((prev) => ({ ...prev, [key]: digitsOnly }));
    if (!digitsOnly) return;
    update(key, Number(digitsOnly) as HomeBodyProfile[typeof key]);
  };

  const onNumberBlur = (key: (typeof numberFields)[number]["key"], min: number, max: number) => {
    const current = numberInputs[key];
    if (!current) {
      setNumberInputs((prev) => ({ ...prev, [key]: String(profile[key]) }));
      return;
    }
    const clamped = Math.min(max, Math.max(min, Math.round(Number(current))));
    update(key, clamped as HomeBodyProfile[typeof key]);
    setNumberInputs((prev) => ({ ...prev, [key]: String(clamped) }));
  };

  return (
    <div className="glass-panel rounded-[22px] p-5 sm:p-6">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t.home.quickSetup.eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold leading-tight text-foreground">{t.home.quickSetup.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.home.quickSetup.description}</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Label className="text-sm">{t.home.quickSetup.sexLabel}</Label>
            <SegmentedControl
              value={profile.sex}
              options={SEX_TYPES}
              onChange={(value) => update("sex", value as UserProfile["sex"])}
              getLabel={toTitleCase}
              fullWidth={false}
              compact
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">{t.home.quickSetup.activityLabel}</Label>
          <SegmentedControl
            value={profile.activityLevel}
            options={ACTIVITY_LEVELS}
            onChange={(value) => update("activityLevel", value as UserProfile["activityLevel"])}
            getLabel={(value) => (value === "very active" ? "Very active" : toTitleCase(value))}
            className="grid grid-cols-2 sm:grid-cols-5"
          />
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {numberFields.map((field) => {
            const value = numberInputs[field.key];
            const parsed = value ? Number(value) : null;
            const outside = parsed !== null && (parsed < field.min || parsed > field.max);
            return (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`home-${field.key}`} className="text-sm">
                  {field.label}
                </Label>
                <div
                  id={`home-${field.key}`}
                  className="control-surface flex min-h-10 items-center justify-between rounded-xl px-2 py-1"
                >
                  <button
                    type="button"
                    aria-label={`Decrease ${field.label}`}
                    onClick={() => adjustNumber(field.key, field.min, field.max, -1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[color:var(--accent-primary-muted)] hover:text-foreground"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    id={`home-${field.key}`}
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(event) => updateNumberInput(field.key, event.target.value)}
                    onBlur={() => onNumberBlur(field.key, field.min, field.max)}
                    className="w-24 bg-transparent text-center text-sm font-semibold tabular-nums text-foreground outline-none"
                  />
                  <button
                    type="button"
                    aria-label={`Increase ${field.label}`}
                    onClick={() => adjustNumber(field.key, field.min, field.max, 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[color:var(--accent-primary-muted)] hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className={`text-xs ${outside ? "text-amber-600" : "text-muted-foreground"}`}>
                  {field.min}-{field.max}{"unit" in field ? ` ${field.unit}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <p className="text-xs text-muted-foreground">{t.home.quickSetup.optionalNote}</p>
        <Button
          asChild
          onClick={() => saveHomeBodyProfile(profile)}
          className="hover:shadow-[0_0_0_1px_rgb(10_122_255_/_0.28),0_12px_28px_rgb(10_122_255_/_0.42)] dark:hover:shadow-[0_0_0_1px_rgb(92_168_255_/_0.38),0_12px_28px_rgb(92_168_255_/_0.36)]"
        >
          <TransitionLink href="/planner">
            {t.home.quickSetup.continueCta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </TransitionLink>
        </Button>
      </div>
    </div>
  );
}
