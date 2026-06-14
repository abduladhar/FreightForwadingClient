import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PermissionGuard } from "@/auth/PermissionGuard";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { accountingItems } from "@/layouts/navigation";
import { cn } from "@/utils/cn";
import { lt } from "@/modules/operationsLocalization";

const accountingPermissions = accountingItems.flatMap((entry) =>
  Array.isArray(entry.permission) ? entry.permission : entry.permission ? [entry.permission] : []
);

export function AccountingWorkspacePage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accountingItems.filter((item) => {
      if (!hasPermission(item.permission)) return false;
      if (!query) return true;
      return `${lt(item.label)} ${lt(item.description)}`.toLowerCase().includes(query);
    });
  }, [hasPermission, search]);

  return (
    <PermissionGuard permission={accountingPermissions}>
      <div className="space-y-5">
        <PageHeader
          title={lt("Accounting")}
          description={lt("A single workspace for account setup, vouchers, ledger entries, reconciliation, and salary support.")}
          actions={<AuditTrailButton />}
        />

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{lt("Accounting modules")}</h2>
                <p className="text-sm text-muted-foreground">{lt("Open setup, posting, voucher, and reconciliation screens from one place.")}</p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                  placeholder={lt("Search accounting...")}
                />
              </div>
            </div>

            {visibleItems.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <AccountingCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={lt("No accounting screens found")}
                description={search ? lt("Try a different search term.") : lt("Your current role does not have access to accounting screens.")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

function AccountingCard({ item }: { item: (typeof accountingItems)[number] }) {
  const Icon = item.icon;
  const tone = getTone(item.id);

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
          <Badge tone={tone}>{lt(getCategory(item.id))}</Badge>
        </div>
        <div>
          <h3 className="break-words font-semibold text-gray-900 dark:text-gray-100">{lt(item.label)}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lt(item.description)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm font-medium text-blue-700">
        <span>{lt("Open module")}</span>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-700 group-hover:bg-blue-50">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

function getCategory(id: string) {
  if (id.includes("voucher")) return "Voucher";
  if (id === "reconciliation") return "Reconcile";
  if (id === "salary") return "Payroll";
  if (id.includes("ledger-entry")) return "Ledger";
  return "Setup";
}

function getTone(id: string): "blue" | "green" | "amber" | "red" | "slate" {
  if (id.includes("voucher")) return "green";
  if (id === "reconciliation") return "amber";
  if (id === "salary") return "slate";
  return "blue";
}
