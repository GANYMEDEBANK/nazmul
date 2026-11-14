const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function safeUrl(value: string | undefined): string {
  const v = (value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^\/[^/]/.test(v)) return base + v;
  return "";
}

export function doiUrl(doi: string | undefined): string {
  const d = (doi || "").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  return d ? `https://doi.org/${encodeURI(d)}` : "";
}
