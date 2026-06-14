import { useWorkspace } from "@/hooks/useWorkspace";

export function useMoney() {
  const workspace = useWorkspace();
  return (value: number, currency = workspace.baseCurrency) => formatMoney(value, currency, workspace.cultureCode);
}

function formatMoney(value: number, currency: string, cultureCode: string) {
  const normalized = normalizeCurrencyCode(currency);
  if (normalized) {
    try {
      return new Intl.NumberFormat(cultureCode, {
        style: "currency",
        currency: normalized,
        maximumFractionDigits: 0
      }).format(value);
    } catch {
      // Fallback handled below.
    }
  }

  const numeric = new Intl.NumberFormat(cultureCode, {
    maximumFractionDigits: 0
  }).format(value);
  const label = currency?.trim() || "Amount";
  return `${label} ${numeric}`;
}

function normalizeCurrencyCode(currency: string | undefined) {
  if (!currency) return null;
  const code = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  if (code === "BASE") return null;
  return code;
}
