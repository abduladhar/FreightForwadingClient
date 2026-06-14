import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { getBranchById } from "@/api/branchApi";
import { getMasterShipmentProfitLossReport, type MasterShipmentProfitLossRowDto, type MasterShipmentProfitLossSectionDto } from "@/api/reportApi";
import { getTenantById } from "@/api/tenantApi";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/hooks/useWorkspace";
import { exportMasterProfitLossPdf } from "@/utils/masterProfitLossPdf";
import { lt } from "@/modules/operationsLocalization";

export function MasterShipmentProfitLossReportPage() {
  const { masterShipmentId } = useParams();
  const workspace = useWorkspace();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["master-shipment-profit-loss", masterShipmentId],
    queryFn: () => getMasterShipmentProfitLossReport(masterShipmentId!),
    enabled: Boolean(masterShipmentId),
    staleTime: 0,
    refetchOnMount: "always"
  });
  const tenant = useQuery({
    queryKey: ["master-profit-loss-tenant", session?.tenantId],
    queryFn: () => getTenantById(session!.tenantId!),
    enabled: Boolean(session?.tenantId)
  });
  const branch = useQuery({
    queryKey: ["master-profit-loss-branch", session?.branchId],
    queryFn: () => getBranchById(session!.branchId!),
    enabled: Boolean(session?.branchId)
  });

  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;

  const report = query.data?.data;
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchAddress = branch.data?.address?.trim() || lt("Sample Address Line 1, City, Country");

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Master Shipment Profit & Loss")}
        description={report ? `${report.masterShipmentNumber}${report.masterWaybillNumber ? ` | ${report.masterWaybillNumber}` : ""} | ${report.origin} -> ${report.destination}` : lt("Allocated invoice and bill profitability by source.")}
        actions={
          <>
            <AuditTrailButton />
            <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>
              <RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
            {report ? (
              <Button
                variant="outline"
                onClick={() => void exportMasterProfitLossPdf({
                  fileName: `${report.masterShipmentNumber}-profit-loss.pdf`,
                  tenantName: workspace.tenantCode,
                  branchName: workspace.branchName ?? lt("Branch"),
                  branchAddress,
                  logoUrl,
                  report
                })}
              >
                <Download className="h-4 w-4" />{lt("PDF Export")}</Button>
            ) : null}
            <Button asChild variant="outline">
              <Link to={`/master-shipments/${masterShipmentId}`}>
                <ArrowLeft className="h-4 w-4" />{lt("Back")}</Link>
            </Button>
          </>
        }
      />

      {query.isLoading ? <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading profit and loss report...")}</CardContent></Card> : null}
      {query.isError ? <Card><CardContent className="pt-6 text-sm text-red-600">{lt("Unable to load master shipment profit and loss report.")}</CardContent></Card> : null}

      {report ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard title={lt("Total Invoice")} value={report.invoiceAmount} />
            <SummaryCard title={lt("Total Bill")} value={report.billAmount} />
            <SummaryCard title={lt("Total Profit")} value={report.profitAmount} tone={report.profitAmount < 0 ? "danger" : "success"} />
          </div>

          <Card>
            <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
              <Field label={lt("Master No")}>{report.masterShipmentNumber}</Field>
              <Field label={lt("Master Waybill")}>{report.masterWaybillNumber || "-"}</Field>
              <Field label={lt("Mode")}>{report.modeOfTransport}</Field>
              <Field label={lt("Route")}>{report.origin} {"->"} {report.destination}</Field>
            </CardContent>
          </Card>

          {report.sections.map((section) => (
            <ProfitLossSection key={section.sectionName} section={section} />
          ))}
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ title, value, tone = "neutral" }: { title: string; value: number; tone?: "neutral" | "success" | "danger" }) {
  const color = tone === "success" ? "text-emerald-700" : tone === "danger" ? lt("text-red-700") : lt("text-slate-900");
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className={`mt-2 text-2xl font-semibold ${color}`}><CurrencyAmount value={value} /></p>
      </CardContent>
    </Card>
  );
}

function ProfitLossSection({ section }: { section: MasterShipmentProfitLossSectionDto }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">{section.sectionName}</CardTitle>
          <div className="grid gap-2 text-sm md:grid-cols-3">
            <TotalPill label={lt("Invoice")} value={section.invoiceAmount} />
            <TotalPill label={lt("Bill")} value={section.billAmount} />
            <TotalPill label={lt("Profit")} value={section.profitAmount} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {section.rows.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No records available for this section.</div>
        ) : (
          <div className="overflow-auto rounded-lg border">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-center text-xs uppercase tracking-wide text-slate-600">
                  <th className="p-2">{lt("Source Type")}</th>
                  <th className="p-2">{lt("Reference No")}</th>
                  <th className="p-2 text-right">{lt("Loaded Pieces")}</th>
                  <th className="p-2 text-right">{lt("Total Pieces")}</th>
                  <th className="p-2 text-right">{lt("Ratio")}</th>
                  <th className="p-2 text-right">{lt("Invoice")}</th>
                  <th className="p-2 text-right">{lt("Bill")}</th>
                  <th className="p-2 text-right">{lt("Profit")}</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => <ProfitLossRow key={`${row.sourceType}-${row.sourceId}`} row={row} />)}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfitLossRow({ row }: { row: MasterShipmentProfitLossRowDto }) {
  return (
    <tr className="border-t">
      <td className="p-2 font-medium">{labelSource(row.sourceType)}</td>
      <td className="p-2">{row.sourceNumber}</td>
      <td className="p-2 text-right">{row.loadedPieces.toFixed(2)}</td>
      <td className="p-2 text-right">{row.totalPieces.toFixed(2)}</td>
      <td className="p-2 text-right">{(row.allocationRatio * 100).toFixed(2)}%</td>
      <td className="p-2 text-right"><CurrencyAmount value={row.invoiceAmount} /></td>
      <td className="p-2 text-right"><CurrencyAmount value={row.billAmount} /></td>
      <td className="p-2 text-right font-semibold"><CurrencyAmount value={row.profitAmount} /></td>
    </tr>
  );
}

function TotalPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2 text-right">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="font-semibold"><CurrencyAmount value={value} /></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><div className="font-medium">{children}</div></div>;
}

function labelSource(sourceType: string) {
  if (sourceType === "MasterShipment") return "Master Shipment";
  if (sourceType === "HouseShipment") return "House Shipment";
  if (sourceType === "GoodsReceipt") return "Goods Receipt Note";
  return sourceType;
}
