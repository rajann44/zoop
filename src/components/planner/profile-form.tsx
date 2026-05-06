"use client";

import { SAMPLE_PROFILES } from "@/data/sample-profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import {
  DIET_TYPES,
  GOALS,
  INDIAN_STATES,
  MEAL_STYLES,
  PROTEIN_FOCUS,
  type UserProfile,
} from "@/types/planner";
import { toTitleCase } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";
import { t } from "@/locales";

export function ProfileForm() {
  const profile = usePlannerStore((state) => state.profile);
  const setProfile = usePlannerStore((state) => state.setProfile);
  const loadSampleProfile = usePlannerStore((state) => state.loadSampleProfile);
  const regenerate = usePlannerStore((state) => state.regenerate);
  const isGenerating = usePlannerStore((state) => state.isGenerating);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile({ ...profile, [key]: value });
  };

  return (
    <Card className="glass-sidebar flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 space-y-1.5 pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t.planner.profileForm.planSetup}</p>
        <CardTitle>{t.planner.profileForm.createWeeklyPlan}</CardTitle>
        <CardDescription>{t.planner.profileForm.setupDescription}</CardDescription>
      </CardHeader>
      <CardContent className="!p-0 flex min-h-0 flex-1 flex-col">
        <div className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-4 pb-6 sm:px-5">
          <section className="space-y-2 pt-1">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t.planner.profileForm.quickStart}</p>
            <div className="surface-inset rounded-xl p-3">
              <Label className="text-sm" htmlFor="sample-profile">
                {t.planner.profileForm.sampleProfileLabel}
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.planner.profileForm.sampleProfileHint}</p>
              <Select onValueChange={loadSampleProfile}>
                <SelectTrigger id="sample-profile" className="mt-2">
                  <SelectValue placeholder={t.planner.profileForm.samplePlaceholder} />
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
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t.planner.profileForm.preferences}</p>

            <Field label={t.planner.profileForm.fields.state} id="state">
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

            <Field label={t.planner.profileForm.fields.goal} id="goal">
              <SegmentedControl
                id="goal"
                value={profile.goal}
                options={GOALS}
                onChange={(value) => update("goal", value as UserProfile["goal"])}
                getLabel={(value) => t.planner.profileForm.goalLabels[value]}
              />
            </Field>

            <Field label={t.planner.profileForm.fields.diet} id="dietType">
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

            <Field label={t.planner.profileForm.fields.proteinFocus} id="proteinFocus">
              <SegmentedControl
                id="proteinFocus"
                value={profile.proteinFocus}
                options={PROTEIN_FOCUS}
                onChange={(value) => update("proteinFocus", value as UserProfile["proteinFocus"])}
                getLabel={toTitleCase}
              />
            </Field>

            <Field label={t.planner.profileForm.fields.mealStyle} id="mealStyle">
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

          <div className="pb-24" />
        </div>

        <div className="shrink-0 border-t border-[color:var(--border-glass)] bg-[color:var(--surface-glass-header)]/70 px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255_/_0.52)] sm:px-5">
          <Button className="h-10 w-full" onClick={regenerate} disabled={isGenerating}>
            {isGenerating ? t.planner.profileForm.generating : t.planner.profileForm.generatePlan}
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
