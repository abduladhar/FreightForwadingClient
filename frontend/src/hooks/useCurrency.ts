import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTenantCurrencies } from "@/api/currencyApi";
import { useWorkspace } from "@/hooks/useWorkspace";

export function useCurrency() {
  const workspace = useWorkspace();
  const query = useQuery({
    queryKey: ["currency", "tenant-enabled", workspace.tenantCode],
    queryFn: getTenantCurrencies
  });

  const options = useMemo(
    () =>
      (query.data ?? [])
        .filter((item) => item.isEnabled)
        .map((item) => ({ code: item.currencyCode, name: item.currencyName, isBaseCurrency: item.isBaseCurrency })),
    [query.data]
  );

  function setCurrency(currencyCode: string) {
    workspace.setBaseCurrency(currencyCode);
  }

  function formatAmount(value: number, currencyCode = workspace.baseCurrency, decimalPlaces = 2) {
    const normalized = normalizeCurrencyCode(currencyCode);
    if (normalized) {
      try {
        return new Intl.NumberFormat(workspace.cultureCode, {
          style: "currency",
          currency: normalized,
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        }).format(value);
      } catch {
        // Fallback handled below.
      }
    }

    const numeric = new Intl.NumberFormat(workspace.cultureCode, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);
    return `${currencyCode || "Amount"} ${numeric}`;
  }

  return {
    selectedCurrencyCode: workspace.baseCurrency,
    options,
    setCurrency,
    formatAmount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}

function normalizeCurrencyCode(currencyCode: string | undefined) {
  if (!currencyCode) return null;
  const code = currencyCode.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  if (code === "BASE") return null;
  return code;
}
