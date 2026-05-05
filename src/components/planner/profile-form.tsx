"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SAMPLE_PROFILES } from "@/data/sample-profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const sampleOptions = useMemo(() => SAMPLE_PROFILES, []);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile({ ...profile, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planner inputs</CardTitle>
        <CardDescription>Start with essentials. Open advanced only if you want finer nutrition targeting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Load sample profile</Label>
          <Select onValueChange={loadSampleProfile}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a sample profile" />
            </SelectTrigger>
            <SelectContent>
              {sampleOptions.map((sample) => (
                <SelectItem key={sample.id} value={sample.id}>
                  {sample.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          <Field label="Diet type" id="dietType">
            <Select value={profile.dietType} onValueChange={(value) => update("dietType", value as UserProfile["dietType"])}>
              <SelectTrigger id="dietType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIET_TYPES.map((diet) => (
                  <SelectItem key={diet} value={diet}>
                    {toTitleCase(diet)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Goal" id="goal">
            <Select value={profile.goal} onValueChange={(value) => update("goal", value as UserProfile["goal"])}>
              <SelectTrigger id="goal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {toTitleCase(goal)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <Field label="Protein focus" id="proteinFocus">
            <Select value={profile.proteinFocus} onValueChange={(value) => update("proteinFocus", value as UserProfile["proteinFocus"])}>
              <SelectTrigger id="proteinFocus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROTEIN_FOCUS.map((focus) => (
                  <SelectItem key={focus} value={focus}>
                    {toTitleCase(focus)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Button
          variant="ghost"
          className="h-9 w-full justify-between border border-dashed border-border"
          onClick={() => setShowAdvanced((current) => !current)}
          type="button"
        >
          {showAdvanced ? "Hide advanced body settings" : "Show advanced body settings"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </Button>

        {showAdvanced ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Sex" id="sex">
              <Select value={profile.sex} onValueChange={(value) => update("sex", value as UserProfile["sex"])}>
                <SelectTrigger id="sex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEX_TYPES.map((sex) => (
                    <SelectItem key={sex} value={sex}>
                      {toTitleCase(sex)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Activity level" id="activityLevel">
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
        ) : null}

        <Button className="w-full" onClick={regenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Regenerate weekly plan"}
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
