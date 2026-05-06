"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TransitionLink } from "@/components/ui/transition-link";
import type { UserProfile } from "@/types/planner";
import { ACTIVITY_LEVELS, SEX_TYPES } from "@/types/planner";
import { saveHomeBodyProfile, type HomeBodyProfile } from "@/lib/home-profile";
import { toTitleCase } from "@/lib/utils";

const defaults: HomeBodyProfile = {
  sex: "female",
  activityLevel: "light",
  age: 28,
  heightCm: 162,
  weightKg: 58,
};

const numberFields = [
  { key: "age", label: "Age", min: 15, max: 80 },
  { key: "heightCm", label: "Height", min: 130, max: 220, unit: "cm" },
  { key: "weightKg", label: "Weight", min: 35, max: 180, unit: "kg" },
] as const;

export function QuickBodySetup() {
  const [profile, setProfile] = useState<HomeBodyProfile>(defaults);

  const hint = useMemo(() => {
    return profile.activityLevel === "sedentary"
      ? "Mostly desk-based"
      : profile.activityLevel === "light"
        ? "1-2 workouts/week"
        : profile.activityLevel === "moderate"
          ? "3-4 workouts/week"
          : profile.activityLevel === "active"
            ? "Daily movement"
            : "Intense training/work";
  }, [profile.activityLevel]);

  const update = <K extends keyof HomeBodyProfile>(key: K, value: HomeBodyProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-panel rounded-[22px] p-5 sm:p-6">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Quick setup</p>
        <h2 className="mt-1 text-2xl font-semibold leading-tight text-foreground">Save your body details once</h2>
        <p className="mt-1 text-sm text-muted-foreground">We will use these to improve calorie and protein targets when you open planner.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Sex</Label>
          <SegmentedControl
            value={profile.sex}
            options={SEX_TYPES}
            onChange={(value) => update("sex", value as UserProfile["sex"])}
            getLabel={toTitleCase}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Activity</Label>
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
            const value = profile[field.key];
            const outside = value < field.min || value > field.max;
            return (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`home-${field.key}`} className="text-sm">
                  {field.label}
                </Label>
                <Input
                  id={`home-${field.key}`}
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={value}
                  onChange={(event) => update(field.key, Number(event.target.value) as HomeBodyProfile[typeof field.key])}
                />
                <p className={`text-xs ${outside ? "text-amber-600" : "text-muted-foreground"}`}>
                  {field.min}-{field.max}{"unit" in field ? ` ${field.unit}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <p className="text-xs text-muted-foreground">Optional. You can edit anytime in planner.</p>
        <Button
          asChild
          onClick={() => saveHomeBodyProfile(profile)}
          className="hover:shadow-[0_0_0_1px_rgb(10_122_255_/_0.28),0_12px_28px_rgb(10_122_255_/_0.42)] dark:hover:shadow-[0_0_0_1px_rgb(92_168_255_/_0.38),0_12px_28px_rgb(92_168_255_/_0.36)]"
        >
          <TransitionLink href="/planner">
            Continue to planner
            <ArrowRight className="ml-2 h-4 w-4" />
          </TransitionLink>
        </Button>
      </div>
    </div>
  );
}
