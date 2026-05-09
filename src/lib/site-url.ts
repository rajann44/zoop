function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export function getSiteUrl() {
  const configured =
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "") ||
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "") ||
    normalizeSiteUrl(process.env.VERCEL_URL ?? "");

  return configured ?? "http://localhost:3000";
}
