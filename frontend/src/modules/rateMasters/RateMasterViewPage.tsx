import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Calculator, Pencil } from "lucide-react";
import { getRateMaster } from "@/api/rateMasterApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { RateMasterChargesTab } from "@/modules/rateMasters/RateMasterChargesTab";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function RateMasterViewPage() {
  const { rateMasterId } = useParams();
  const r = useRateMasterI18n();
  const query = useQuery({ queryKey: ["rate-master", rateMasterId], queryFn: () => getRateMaster(rateMasterId!), enabled: Boolean(rateMasterId) });
  if (!rateMasterId) return <Navigate to="/rate-masters" replace />;
  const rate = query.data;
  return (
    <div className="space-y-4">
      <PageHeader title={rate?.rateCode ?? r("Rate Master")} description={rate?.rateName ?? ""} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="RateMaster.Read" variant="outline"><Link to={`/rate-masters/${rateMasterId}/calculator`}><Calculator className="h-4 w-4" /> {r("Calculator")}</Link></PermissionButton><PermissionButton className={masterDataButtonClass} asChild permission="RateMaster.Update"><Link to={`/rate-masters/${rateMasterId}/edit`}><Pencil className="h-4 w-4" /> {r("Edit")}</Link></PermissionButton></>} />
      {rate ? <>
        <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} grid gap-3 md:grid-cols-3`}>
          <Field label={r("Scope")} value={r(rate.rateScope)} />
          <Field label={r("Mode")} value={r(rate.modeOfTransport)} />
          <Field label={r("Shipment Type")} value={r(rate.shipmentType)} />
          <Field label={r("Rate Basis")} value={r(rate.rateBasis)} />
          <Field label={r("Min Charge")} value={String(rate.minimumCharge)} />
          <Field label={r("Max Charge")} value={rate.maximumCharge == null ? "-" : String(rate.maximumCharge)} />
          <Field label={r("Tax")} value={rate.isTaxApplicable ? `${rate.taxRate}%` : r("Not Applicable")} />
          <Field label={r("Valid From")} value={rate.validFromDate} />
          <Field label={r("Valid To")} value={rate.validToDate} />
          <Field label={r("Status")} value={r(rate.isActive ? "Active" : "Inactive")} />
        </CardContent></Card>
        <Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><h3 className="mb-3 font-medium">{r("Charges")}</h3><RateMasterChargesTab readOnly value={rate.charges.map((x) => ({ chargeHeadGuid: x.chargeHeadGuid ?? null, chargeCode: x.chargeCode, chargeName: x.chargeName, chargeType: x.chargeType, rangeBasis: x.rangeBasis || "ChargeableWeight", amount: x.amount, percentage: x.percentage, isTaxApplicable: x.isTaxApplicable, isActive: x.isActive, ranges: (x.ranges ?? []).map((range) => ({ fromValue: range.fromValue, toValue: range.toValue, rate: range.rate, minimumCharge: range.minimumCharge ?? null, maximumCharge: range.maximumCharge ?? null })) }))} onChange={() => undefined} /></CardContent></Card>
      </> : <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} text-sm text-muted-foreground`}>{r("Loading rate master...")}</CardContent></Card>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
