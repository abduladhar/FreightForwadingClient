import { ArrowUpRight, FileSpreadsheet, Printer } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { primaryNavigation } from "@/layouts/navigation";
import { useAuth } from "@/auth/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useModuleWorkbenchQuery } from "@/modules/workbench/workbenchApi";

export function ModuleWorkbenchPage() {
  const { moduleId = "" } = useParams();
  const { hasPermission } = useAuth();
  const item = primaryNavigation.find((entry) => routeId(entry.path) === moduleId);
  useDocumentTitle(item?.label ?? "Module");
  const workbenchQuery = useModuleWorkbenchQuery(moduleId);
  const moduleSignals = workbenchQuery.data?.signals ?? [];
  const activityRows = workbenchQuery.data?.activityRows ?? [];

  if (!item) return <Navigate to="/" replace />;
  if (!hasPermission(item.permission)) return <Navigate to="/" replace />;

  return (
    <div className="erp-page">
      <PageHeader
        title={`${item.label} workbench`}
        description={item.description}
        actions={
          <>
            <Button variant="outline"><Printer className="h-4 w-4" /> Print preview</Button>
            <Button><FileSpreadsheet className="h-4 w-4" /> Export</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {moduleSignals.length ? (
          moduleSignals.map((signal) => (
            <Card key={signal.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">{signal.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{signal.value}</div>
                <Badge className="mt-3" tone={signal.tone}>Branch scoped</Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 xl:col-span-4">
            <CardContent className="py-8 text-sm text-muted-foreground">
              {workbenchQuery.isLoading ? "Loading module signals..." : "No module KPIs are available for this context yet."}
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Operational activity</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {activityRows.length ? (
              activityRows.map((row) => (
                <div key={row.id} className="grid gap-3 py-4 md:grid-cols-[130px_1fr_140px_120px_40px] md:items-center">
                  <span className="font-medium">{row.id}</span>
                  <span>{row.event}</span>
                  <Badge tone={row.status === "Approval" ? "amber" : "green"}>{row.status}</Badge>
                  <span className="text-sm text-muted-foreground">{row.owner}</span>
                  <Button variant="ghost" size="icon"><ArrowUpRight className="h-4 w-4" /></Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-sm text-muted-foreground">
                {workbenchQuery.isLoading ? "Loading activity..." : "No operational activity found for this module and branch."}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Module controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {(item.metrics ?? []).map((metric) => (
              <div key={metric} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                <span>{metric}</span>
                <Badge tone="blue">Tracked</Badge>
              </div>
            ))}
            <p className="pt-2">This workbench is permission-aware and tenant/branch scoped. Feature-specific CRUD screens can extend this base without changing the ERP shell.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function routeId(path: string) {
  return path.replace("/", "");
}
