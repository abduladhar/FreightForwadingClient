import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/app/i18n";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { localizationKey } from "@/utils/localizationKey";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showBreadcrumbs?: boolean;
  hideRefresh?: boolean;
}

export function PageHeader({ title, description, actions, showBreadcrumbs = false, hideRefresh = false }: PageHeaderProps) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { t } = useI18n();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const showRefresh = !hideRefresh && shouldShowRefresh(location.pathname);
  const localizedTitle = t(`Page.Title.${localizationKey(title)}`, title);
  const localizedDescription = description ? t(`Page.Description.${localizationKey(description)}`, description) : undefined;

  async function refreshPage() {
    setIsRefreshing(true);
    try {
      window.dispatchEvent(new CustomEvent("app:page-refresh", { detail: { pathname: location.pathname } }));
      const moduleRefreshEvent = refreshEventForPath(location.pathname);
      if (moduleRefreshEvent) {
        window.dispatchEvent(new CustomEvent(moduleRefreshEvent));
      }
      await queryClient.invalidateQueries({ refetchType: "active" });
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {showBreadcrumbs ? <Breadcrumbs /> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{localizedTitle}</h1>
          {localizedDescription ? <p className="mt-1 break-words text-sm text-muted-foreground">{localizedDescription}</p> : null}
        </div>
        {showRefresh || actions ? (
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 [&>*]:max-w-full md:w-auto md:justify-end">
            {showRefresh ? (
              <Button type="button" variant="outline" size="sm" className="h-10 min-h-10" onClick={() => void refreshPage()} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {t("Common.Refresh", "Refresh")}
              </Button>
            ) : null}
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function shouldShowRefresh(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "").toLowerCase();
  return !normalized.endsWith("/new") && !normalized.endsWith("/create");
}

function refreshEventForPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "").toLowerCase();
  if (normalized === "/invoices") return "invoices:refresh";
  if (normalized === "/vendor-bills") return "vendor-bills:refresh";
  if (normalized === "/receipts") return "customer-receipts:refresh";
  if (normalized === "/payments") return "vendor-payments:refresh";
  if (normalized.startsWith("/master-shipments")) return "master-shipments:refresh";
  if (normalized.startsWith("/house-shipments")) return "house-shipments:refresh";
  return null;
}
