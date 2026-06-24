import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
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
import { reportSections } from "@/layouts/navigation";
import { lt } from "@/modules/operationsLocalization";
import { cn } from "@/utils/cn";

const reportPermissions = reportSections.flatMap((section) =>
  section.items.flatMap((entry) => Array.isArray(entry.permission) ? entry.permission : entry.permission ? [entry.permission] : [])
);

export function ReportsWorkspacePage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(reportSections.map((section) => [section.id, true]))
  );

  const visibleSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reportSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!hasPermission(item.permission)) return false;
          if (!query) return true;
          return `${lt(item.label)} ${lt(item.description)}`.toLowerCase().includes(query);
        })
      }))
      .filter((section) => section.items.length > 0);
  }, [hasPermission, search]);

  const visibleCount = visibleSections.reduce((total, section) => total + section.items.length, 0);

  return (
    <PermissionGuard permission={reportPermissions}>
      <div className="space-y-5">
        <PageHeader
          title={lt("Reports")}
          description={lt("A single workspace for accounting, operational, and profit reports.")}
          actions={<AuditTrailButton />}
        />

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{lt("Report menu")}</h2>
                <p className="text-sm text-muted-foreground">{lt("Choose a report group, then open the report you need.")}</p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                  placeholder={lt("Search reports...")}
                />
              </div>
            </div>

            {visibleCount ? (
              <div className="space-y-6">
                {visibleSections.map((section) => (
                  <section key={section.id} className="space-y-3">
                    <button
                      type="button"
                      aria-expanded={expandedSections[section.id] ?? true}
                      onClick={() => setExpandedSections((current) => ({ ...current, [section.id]: !(current[section.id] ?? true) }))}
                      className="flex w-full items-center justify-between gap-3 border-b pb-2 text-start transition hover:border-slate-300"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-slate-500 transition-transform",
                            !(expandedSections[section.id] ?? true) && "-rotate-90"
                          )}
                        />
                        <span className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">{lt(section.label)}</span>
                      </span>
                      <Badge tone="slate">{section.items.length}</Badge>
                    </button>
                    {(expandedSections[section.id] ?? true) ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {section.items.map((item) => (
                          <ReportCard key={item.id} item={item} sectionLabel={section.label} />
                        ))}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                title={lt("No reports found")}
                description={search ? lt("Try a different search term.") : lt("Your current role does not have access to reports.")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

function ReportCard({ item, sectionLabel }: { item: (typeof reportSections)[number]["items"][number]; sectionLabel: string }) {
  const Icon = item.icon;

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
          <Badge tone={getTone(sectionLabel)}>{lt(sectionLabel.replace(" Reports", ""))}</Badge>
        </div>
        <div>
          <h3 className="break-words font-semibold text-gray-900 dark:text-gray-100">{lt(item.label)}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lt(item.description)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm font-medium text-blue-700">
        <span>{lt("Open report")}</span>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-700 group-hover:bg-blue-50">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

function getTone(sectionLabel: string): "blue" | "green" | "amber" | "red" | "slate" {
  if (sectionLabel === "Operational Reports") return "green";
  if (sectionLabel === "Profit Reports") return "amber";
  return "blue";
}
