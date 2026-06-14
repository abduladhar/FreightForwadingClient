import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/app/i18n";
import { PermissionGuard } from "@/auth/PermissionGuard";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { masterDataItems } from "@/layouts/navigation";
import { cn } from "@/utils/cn";

const masterDataPermissions = masterDataItems.flatMap((entry) =>
  Array.isArray(entry.permission) ? entry.permission : entry.permission ? [entry.permission] : []
);

export function MasterDataPage() {
  const { hasPermission } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return masterDataItems.filter((item) => {
      if (!hasPermission(item.permission)) return false;
      if (!query) return true;
      const label = t(masterDataItemKey(item.id, "Label"), item.label);
      const description = t(masterDataItemKey(item.id, "Description"), item.description);
      return `${label} ${description}`.toLowerCase().includes(query);
    });
  }, [hasPermission, search, t]);

  return (
    <PermissionGuard permission={masterDataPermissions}>
      <div className="space-y-5">
        <PageHeader
          title="Master Data"
          description="A single workspace for tenant, commercial, operational, and accounting setup masters."
          actions={<AuditTrailButton />}
        />

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{t("MasterData.SetupModules", "Setup modules")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("MasterData.SetupModulesDescription", "Choose a master to maintain codes, defaults, mappings, and active setup values.")}
                </p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                  placeholder={t("MasterData.SearchPlaceholder", "Search master data...")}
                />
              </div>
            </div>

            {visibleItems.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <MasterDataCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("MasterData.EmptyTitle", "No master screens found")}
                description={
                  search
                    ? t("MasterData.EmptySearchDescription", "Try a different search term.")
                    : t("MasterData.EmptyPermissionDescription", "Your current role does not have access to master data screens.")
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

function MasterDataCard({ item }: { item: (typeof masterDataItems)[number] }) {
  const Icon = item.icon;
  const { t } = useI18n();
  const label = t(masterDataItemKey(item.id, "Label"), item.label);
  const description = t(masterDataItemKey(item.id, "Description"), item.description);

  return (
    <Link
      to={item.path}
      className={cn(
        "group flex min-h-36 min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900",
        "hover:-translate-y-0.5 hover:border-blue-300"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
            <Icon className="h-5 w-5" />
          </div>
          <Badge tone="blue">{t("MasterData.Badge", "Master")}</Badge>
        </div>
        <div>
          <h3 className="break-words font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm font-medium text-blue-700">
        <span>{t("MasterData.OpenSetup", "Open setup")}</span>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-700 group-hover:bg-blue-50">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

function masterDataItemKey(id: string, suffix: "Label" | "Description") {
  return `MasterData.Item.${id}.${suffix}`;
}
