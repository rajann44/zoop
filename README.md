# zoop

A production-quality MVP built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style components, and Zustand.

It generates a practical weekly Indian meal plan for one person and a merged grocery list from deterministic seed data (no AI meal generation, no database, no auth).

## Highlights

- 28 Indian state preferences and vegan/vegetarian/eggetarian/non-vegetarian support
- Expanded predefined Indian meals with nutrition and ingredient details (including vegan set)
- Deterministic recommendation scoring with regenerate support
- Mifflin-St Jeor calories + activity multipliers
- Goal and protein-focus based protein targets
- Weekly grocery list split into to-buy vs pantry-covered items
- Pantry staples + dynamic pack suggestions from Open Food Facts
- Sample personas for instant testing
- Light/dark mode, rendering mode toggle, responsive liquid-glass inspired UI

## Tech Stack

- Next.js `16` with App Router
- TypeScript
- Tailwind CSS `v4`
- Zustand for state management
- Radix primitives + utility components (`shadcn/ui` style)

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Deploy on Vercel

1. Import this repository in Vercel.
2. Set **Environment Variable**:
   - `NEXT_PUBLIC_SITE_URL` = your production URL (e.g. `https://zoop.vercel.app`)
3. Build command: `npm run build`
4. Output: default Next.js output

This app includes `robots` and `sitemap` metadata routes and uses `NEXT_PUBLIC_SITE_URL` for canonical and OG metadata.

## Core User Flow

1. Choose state, diet, protein focus, meal style, and body profile
2. App calculates calorie and protein targets
3. Planner builds a 7-day meal plan (breakfast/lunch/dinner/snack)
4. Grocery list merges all weekly ingredients for 1 person
5. Pantry toggles remove owned staples from the list
6. Regenerate creates another valid week combination from seed data

## Recommendation Logic (Deterministic)

Implemented in `src/lib/planner-engine.ts`.

Each candidate meal is scored by:

- **State match**: strong boost when meal contains selected state tag
- **Diet compatibility**: strict filter (vegetarian < eggetarian < non-veg)
- **Meal style match**: boost for homely/budget/high-protein/quick-cook/traditional fit
- **Protein preference fit**: compares meal protein level with selected focus
- **Calorie suitability**: closeness to meal-slot calorie share target
- **Ingredient reuse**: boosts repeated core ingredients to reduce waste
- **Diversity penalties**: discourages repeating identical meals too often

Selection uses seeded weighted randomness from top-scoring candidates so regeneration stays valid yet varied.

## Nutrition Calculations

Implemented in `src/lib/nutrition.ts`.

- **BMR (Mifflin-St Jeor)**
  - Male: `10*kg + 6.25*cm - 5*age + 5`
  - Female: `10*kg + 6.25*cm - 5*age - 161`
- **Calories**: `BMR * activity_multiplier` with goal adjustment
  - Fat loss: `-350`
  - Maintenance: `0`
  - Muscle gain: `+250`
- **Protein target**: weight-based g/kg by goal + protein focus modifier

## Data Model

Types live in `src/types/planner.ts`.

- `UserProfile`
- `Meal`
- `Ingredient`
- `WeeklyPlan`
- `GroceryItem`

## Seed Data

- Meals: `src/data/meals.ts`
- States: `src/data/states.ts`
- Pantry staples: `src/data/pantry.ts`
- Sample personas: `src/data/sample-profiles.ts`

Included meal examples: poha, upma, besan chilla, paneer bhurji, egg bhurji, dal chawal, rajma chawal, chole rice, roti sabzi, curd rice, khichdi, paneer curry, chicken curry, bhindi sabzi, aloo gobi, moong dal cheela, oats egg omelette, dahi, fruit bowl, roasted chana, peanut chaat, and more.

Haryana coverage is intentionally strong and realistic for a solo home-cooking weekly cycle.

## App Structure

```text
src/
  app/
    page.tsx              # Landing
    planner/page.tsx      # Planner entry
  components/
    planner/*             # Planner UI modules
    ui/*                  # Reusable UI primitives
  data/*                  # Seed datasets
  lib/*                   # Nutrition, planning, grocery utilities
  store/planner-store.ts  # Zustand state and actions
  types/planner.ts        # Domain models
```

## Notes

- No DB, no auth in this MVP
- Code is modular for future Supabase/Postgres integration
- Uses predefined meal data for planning and Open Food Facts for pantry pack suggestions
