"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPortionHint } from "@/lib/portion";
import type { Goal, Meal } from "@/types/planner";
import { toTitleCase } from "@/lib/utils";

type MealDetailDialogProps = {
  meal: Meal | null;
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MealDetailDialog({ meal, goal, open, onOpenChange }: MealDetailDialogProps) {
  if (!meal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meal details</DialogTitle>
            <DialogDescription>No meal selected.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const portionHint = getPortionHint(meal, goal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="max-w-[92%] text-xl leading-tight">{meal.name}</DialogTitle>
          <DialogDescription>
            {toTitleCase(meal.mealType)} • {meal.prepTimeMin} min prep
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 text-sm sm:grid-cols-4 sm:gap-3">
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">kcal</div>
            <div className="font-semibold">{meal.kcal}</div>
          </div>
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">Protein</div>
            <div className="font-semibold">{meal.protein} g</div>
          </div>
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">Carbs</div>
            <div className="font-semibold">{meal.carbs} g</div>
          </div>
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">Fat</div>
            <div className="font-semibold">{meal.fat} g</div>
          </div>
        </div>

        {portionHint ? (
          <div className="glass-soft rounded-xl p-3 text-sm">
            <span className="text-muted-foreground">Suggested serving for your goal: </span>
            <span className="font-medium text-foreground">{portionHint}</span>
          </div>
        ) : null}

        <div className="surface-inset rounded-xl p-3">
          <h4 className="mb-2 text-sm font-semibold">Ingredients</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {meal.ingredients.map((ingredient) => (
              <li key={`${meal.id}-${ingredient.name}`}>- {ingredient.name}: {ingredient.quantity} {ingredient.unit}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{toTitleCase(meal.dietType)}</Badge>
          <Badge variant="neutral">Protein {toTitleCase(meal.proteinLevel)}</Badge>
          {meal.mealStyleTags.map((tag) => (
            <Badge key={`${meal.id}-${tag}`} variant="outline">
              {toTitleCase(tag)}
            </Badge>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
