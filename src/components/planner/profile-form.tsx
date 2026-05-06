"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SAMPLE_PROFILES } from "@/data/sample-profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import {
  ACTIVITY_LEVELS,
  DIET_TYPES,
  GOALS,
  INDIAN_STATES,
  MEAL_STYLES,
  PROTEIN_FOCUS,
  SEX_TYPES,
  type UserProfile,
} from "@/types/planner";
import { toTitleCase } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";

const numberFieldConfig = [
  { key: "age", label: "Age", min: 15, max: 80, step: 1 },
  { key: "weightKg", label: "Weight (kg)", min: 35, max: 180, step: 1 },
  { key: "heightCm", label: "Height (cm)", min: 130, max: 220, step: 1 },
] as const;

export function ProfileForm() {
  const profile = usePlannerStore((state) => state.profile);
  const setProfile = usePlannerStore((state) => state.setProfile);
  const loadSampleProfile = usePlannerStore((state) => state.loadSampleProfile);
  const regenerate = usePlannerStore((state) => state.regenerate);
  const isGenerating = usePlannerStore((state) => state.isGenerating);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile({ ...profile, [key]: value });
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 space-y-1.5 pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Plan setup</p>
        <CardTitle>Create your weekly plan</CardTitle>
        <CardDescription>Set your core preferences and generate a plan in one tap.</CardDescription>
      </CardHeader>
      <CardContent className="!p-0 flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 sm:px-5">
          <section className="space-y-2 pt-1">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Quick start</p>
            <div className="surface-inset rounded-xl p-3">
              <Label className="text-sm" htmlFor="sample-profile">
                Load a sample profile (optional)
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Prefills values to preview faster.</p>
              <Select onValueChange={loadSampleProfile}>
                <SelectTrigger id="sample-profile" className="mt-2">
                  <SelectValue placeholder="Choose sample" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_PROFILES.map((sample) => (
                    <SelectItem key={sample.id} value={sample.id}>
                      {sample.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          <section className="space-y-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Preferences</p>

            <Field label="State" id="state">
              <Select value={profile.state} onValueChange={(value) => update("state", value as UserProfile["state"])}>
                <SelectTrigger id="state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Goal" id="goal">
              <SegmentedControl
                id="goal"
                value={profile.goal}
                options={GOALS}
                onChange={(value) => update("goal", value as UserProfile["goal"])}
                getLabel={(value) =>
                  value === "fat loss"
                    ? "Fat loss"
                    : value === "muscle gain"
                      ? "Gain"
                      : "Maintain"
                }
              />
            </Field>

            <Field label="Diet" id="dietType">
              <Select value={profile.dietType} onValueChange={(value) => update("dietType", value as UserProfile["dietType"])}>
                <SelectTrigger id="dietType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIET_TYPES.map((diet) => (
                    <SelectItem key={diet} value={diet}>
                      {toTitleCase(diet.replace("-", " "))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Protein focus" id="proteinFocus">
              <SegmentedControl
                id="proteinFocus"
                value={profile.proteinFocus}
                options={PROTEIN_FOCUS}
                onChange={(value) => update("proteinFocus", value as UserProfile["proteinFocus"])}
                getLabel={toTitleCase}
              />
            </Field>

            <Field label="Meal style" id="mealStyle">
              <Select value={profile.mealStyle} onValueChange={(value) => update("mealStyle", value as UserProfile["mealStyle"])}>
                <SelectTrigger id="mealStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {toTitleCase(style)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </section>

          <Separator />

          <section className="space-y-2 pb-24">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left"
              onClick={() => setShowAdvanced((current) => !current)}
              aria-expanded={showAdvanced}
              aria-controls="advanced-settings"
            >
              <span>
                <span className="block text-sm font-medium">Advanced settings</span>
                <span className="block text-xs text-muted-foreground">Optional body metrics for finer targets</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {showAdvanced ? (
              <div id="advanced-settings" className="space-y-2.5 rounded-xl border border-border/70 bg-white/18 p-3">
                <Field label="Sex" id="sex">
                  <SegmentedControl id="sex" value={profile.sex} options={SEX_TYPES} onChange={(value) => update("sex", value as UserProfile["sex"])} getLabel={toTitleCase} />
                </Field>

                <Field label="Activity" id="activityLevel">
                  <Select value={profile.activityLevel} onValueChange={(value) => update("activityLevel", value as UserProfile["activityLevel"])}>
                    <SelectTrigger id="activityLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map((activity) => (
                        <SelectItem key={activity} value={activity}>
                          {toTitleCase(activity)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {numberFieldConfig.map((field) => (
                    <Field key={field.key} label={field.label} id={field.key}>
                      <Input
                        id={field.key}
                        type="number"
                        value={profile[field.key]}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onChange={(event) => update(field.key, Number(event.target.value) as UserProfile[typeof field.key])}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="shrink-0 border-t border-white/35 bg-gradient-to-b from-white/56 to-white/40 px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255_/_0.52)] supports-[backdrop-filter]:bg-white/38 sm:px-5">
          <Button className="h-10 w-full" onClick={regenerate} disabled={isGenerating}>
            {isGenerating ? "Generating plan..." : "Generate weekly plan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {children}
    </div>
  );
}
