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
import { lt } from "@/modules/operationsLocalization";
import type { NavigationItem, NavigationSection } from "@/types/navigation";
import { cn } from "@/utils/cn";

type BadgeTone = "blue" | "green" | "amber" | "red" | "slate";

interface SectionedWorkspacePageProps {
  title: string;
  description: string;
  menuTitle: string;
  menuDescription: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  sections: NavigationSection[];
  openLabel: string;
  getTone?: (section: NavigationSection) => BadgeTone;
  getBadgeLabel?: (section: NavigationSection) => string;
}

export function SectionedWorkspacePage({
  title,
  description,
  menuTitle,
  menuDescription,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  sections,
  openLabel,
  getTone,
  getBadgeLabel
}: SectionedWorkspacePageProps) {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((section) => [section.id, true]))
  );
  const permissions = useMemo(() => sections.flatMap((section) => section.items.flatMap((item) => permissionList(item))), [sections]);

  const visibleSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!hasPermission(item.permission)) return false;
          if (!query) return true;
          return `${lt(item.label)} ${lt(item.description)}`.toLowerCase().includes(query);
        })
      }))
      .filter((section) => section.items.length > 0);
  }, [hasPermission, search, sections]);

  const visibleCount = visibleSections.reduce((total, section) => total + section.items.length, 0);

  return (
    <PermissionGuard permission={permissions}>
      <div className="space-y-5">
        <PageHeader title={lt(title)} description={lt(description)} actions={<AuditTrailButton />} />

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{lt(menuTitle)}</h2>
                <p className="text-sm text-muted-foreground">{lt(menuDescription)}</p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder={lt(searchPlaceholder)} />
              </div>
            </div>

            {visibleCount ? (
              <div className="space-y-6">
                {visibleSections.map((section) => {
                  const expanded = expandedSections[section.id] ?? true;
                  return (
                    <section key={section.id} className="space-y-3">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setExpandedSections((current) => ({ ...current, [section.id]: !expanded }))}
                        className="flex w-full items-center justify-between gap-3 border-b pb-2 text-start transition hover:border-slate-300"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", !expanded && "-rotate-90")} />
                          <span className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">{lt(section.label)}</span>
                        </span>
                        <Badge tone="slate">{section.items.length}</Badge>
                      </button>
                      {expanded ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {section.items.map((item) => (
                            <WorkspaceCard
                              key={item.id}
                              item={item}
                              badgeLabel={getBadgeLabel?.(section) ?? section.label}
                              openLabel={openLabel}
                              tone={getTone?.(section) ?? "blue"}
                            />
                          ))}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            ) : (
              <EmptyState title={lt(emptyTitle)} description={search ? lt("Try a different search term.") : lt(emptyDescription)} />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

function WorkspaceCard({ item, badgeLabel, openLabel, tone }: { item: NavigationItem; badgeLabel: string; openLabel: string; tone: BadgeTone }) {
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
          <Badge tone={tone}>{lt(badgeLabel)}</Badge>
        </div>
        <div>
          <h3 className="break-words font-semibold text-gray-900 dark:text-gray-100">{lt(item.label)}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lt(item.description)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm font-medium text-blue-700">
        <span>{lt(openLabel)}</span>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-700 group-hover:bg-blue-50">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

function permissionList(item: NavigationItem) {
  return Array.isArray(item.permission) ? item.permission : item.permission ? [item.permission] : [];
}
