import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calculator } from "lucide-react";
import { getRateMaster, updateRateMaster, type RateMasterRequest } from "@/api/rateMasterApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { RateMasterForm } from "@/modules/rateMasters/RateMasterForm";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

function toRequest(dto: NonNullable<Awaited<ReturnType<typeof getRateMaster>>>) : RateMasterRequest {
  return {
    rateCode: dto.rateCode,
    rateName: dto.rateName,
    rateScope: dto.rateScope,
    customerId: dto.customerId ?? null,
    vendorId: dto.vendorId ?? null,
    agentId: dto.agentId ?? null,
    origin: dto.origin ?? "",
    destination: dto.destination ?? "",
    country: dto.country ?? "",
    city: dto.city ?? "",
    zone: dto.zone ?? "",
    serviceType: dto.serviceType,
    modeOfTransport: dto.modeOfTransport,
    shipmentType: dto.shipmentType,
    cargoType: dto.cargoType ?? "",
    incoterms: dto.incoterms ?? "",
    rateBasis: dto.rateBasis,
    baseRate: dto.baseRate,
    minimumCharge: dto.minimumCharge,
    maximumCharge: dto.maximumCharge ?? null,
    fuelSurchargeRate: dto.fuelSurchargeRate,
    handlingCharge: dto.handlingCharge,
    pickupCharge: dto.pickupCharge,
    deliveryCharge: dto.deliveryCharge,
    customsCharge: dto.customsCharge,
    documentationCharge: dto.documentationCharge,
    warehouseCharge: dto.warehouseCharge,
    destinationCharge: dto.destinationCharge,
    agentCommissionRate: dto.agentCommissionRate,
    validFromDate: dto.validFromDate,
    validToDate: dto.validToDate,
    currencyId: dto.currencyId,
    isTaxApplicable: dto.isTaxApplicable,
    taxRate: dto.taxRate,
    isActive: dto.isActive,
    slabs: dto.slabs.map((x) => ({ fromValue: x.fromValue, toValue: x.toValue, rate: x.rate, minimumCharge: x.minimumCharge ?? null, maximumCharge: x.maximumCharge ?? null })),
    charges: dto.charges.map((x) => ({
      chargeHeadGuid: x.chargeHeadGuid ?? null,
      chargeCode: x.chargeCode,
      chargeName: x.chargeName,
      chargeType: "Range",
      rangeBasis: x.rangeBasis || "ChargeableWeight",
      amount: x.amount,
      percentage: x.percentage,
      isTaxApplicable: x.isTaxApplicable,
      isActive: x.isActive,
      ranges: (x.ranges ?? []).map((range) => ({
        fromValue: range.fromValue,
        toValue: range.toValue,
        rate: range.rate,
        minimumCharge: range.minimumCharge ?? null,
        maximumCharge: range.maximumCharge ?? null
      }))
    }))
  };
}

export function RateMasterEditPage() {
  const { rateMasterId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const r = useRateMasterI18n();
  const query = useQuery({ queryKey: ["rate-master", rateMasterId], queryFn: () => getRateMaster(rateMasterId), enabled: Boolean(rateMasterId) });
  const updateCore = useMutation({
    mutationFn: (request: RateMasterRequest) => updateRateMaster(rateMasterId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rate-master", rateMasterId] });
      await queryClient.invalidateQueries({ queryKey: ["rate-masters"] });
    }
  });
  const initial = useMemo(() => query.data ? toRequest(query.data) : null, [query.data]);
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !initial) return <ErrorState onRetry={() => void query.refetch()} />;
  return <div className="space-y-4"><PageHeader title={`${r("Edit")} ${initial.rateCode}`} description={initial.rateName} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="RateMaster.Read" variant="outline"><Link to={`/rate-masters/${rateMasterId}/calculator`}><Calculator className="h-4 w-4" /> {r("Preview")}</Link></PermissionButton></>} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><RateMasterForm initialValue={initial} onSubmit={async (request) => { await updateCore.mutateAsync(request); navigate(`/rate-masters/${rateMasterId}`); }} isSubmitting={updateCore.isPending} /></CardContent></Card></div>;
}
