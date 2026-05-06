import type { UserProfile } from "@/types/planner";

export type HomeBodyProfile = Pick<UserProfile, "sex" | "activityLevel" | "age" | "heightCm" | "weightKg">;

const HOME_PROFILE_KEY = "zoop.homeBodyProfile";
const HOME_PROFILE_APPLY_KEY = "zoop.homeBodyProfile.apply";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitize(input: HomeBodyProfile): HomeBodyProfile {
  return {
    sex: input.sex,
    activityLevel: input.activityLevel,
    age: clamp(Math.round(input.age), 15, 80),
    heightCm: clamp(Math.round(input.heightCm), 130, 220),
    weightKg: clamp(Math.round(input.weightKg), 35, 180),
  };
}

export function saveHomeBodyProfile(profile: HomeBodyProfile) {
  if (typeof window === "undefined") return;
  const safe = sanitize(profile);
  window.localStorage.setItem(HOME_PROFILE_KEY, JSON.stringify(safe));
  window.localStorage.setItem(HOME_PROFILE_APPLY_KEY, "1");
}

export function loadHomeBodyProfile(): HomeBodyProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(HOME_PROFILE_KEY);
  if (!raw) return null;
  try {
    return sanitize(JSON.parse(raw) as HomeBodyProfile);
  } catch {
    return null;
  }
}

export function popPendingHomeBodyProfile(): HomeBodyProfile | null {
  if (typeof window === "undefined") return null;
  const shouldApply = window.localStorage.getItem(HOME_PROFILE_APPLY_KEY) === "1";
  if (!shouldApply) return null;
  window.localStorage.removeItem(HOME_PROFILE_APPLY_KEY);
  return loadHomeBodyProfile();
}
