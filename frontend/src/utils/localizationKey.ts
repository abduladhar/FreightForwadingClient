export function localizationKey(value: string) {
  const normalized = value
    .replace(/&/g, " And ")
    .replace(/\+/g, " Plus ")
    .replace(/%/g, " Percent ")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return normalized || "Text";
}
