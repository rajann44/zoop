const HOME_SAMPLE_PROFILE_APPLY_KEY = "zoop.homeSampleProfile.apply";

export function savePendingHomeSampleProfile(sampleId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HOME_SAMPLE_PROFILE_APPLY_KEY, sampleId);
}

export function popPendingHomeSampleProfile() {
  if (typeof window === "undefined") return null;
  const sampleId = window.localStorage.getItem(HOME_SAMPLE_PROFILE_APPLY_KEY);
  if (!sampleId) return null;
  window.localStorage.removeItem(HOME_SAMPLE_PROFILE_APPLY_KEY);
  return sampleId;
}
