import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getQuotation, updateQuotation, type QuotationRequest } from "@/api/quotationApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { QuotationForm } from "@/modules/quotations/QuotationForm";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";

export function QuotationEditPage() {
  const q = useQuotationI18n();
  const { quotationId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["quotation", quotationId], queryFn: () => getQuotation(quotationId), enabled: Boolean(quotationId) });
  const mutation = useMutation({
    mutationFn: (request: QuotationRequest) => updateQuotation(quotationId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
      await queryClient.invalidateQueries({ queryKey: ["quotations"] });
      navigate(`/quotations/${quotationId}`);
    }
  });
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  const initial: QuotationRequest = {
    rateMasterId: query.data.rateMasterId ?? null,
    customerId: query.data.customerId,
    agentId: query.data.agentId ?? null,
    originPortGuid: query.data.originPortGuid ?? null,
    originPortName: query.data.originPortName ?? null,
    destinationPortGuid: query.data.destinationPortGuid ?? null,
    destinationPortName: query.data.destinationPortName ?? null,
    origin: query.data.origin,
    destination: query.data.destination,
    serviceType: query.data.serviceType,
    modeOfTransport: query.data.modeOfTransport,
    shipmentType: query.data.shipmentType,
    cargoType: query.data.cargoType ?? "",
    incoterms: query.data.incoterms ?? "",
    currencyId: query.data.currencyId,
    targetCurrencyId: null,
    exchangeRate: query.data.exchangeRate,
    discountAmount: query.data.discountAmount,
    isManualOverride: query.data.isManualOverride,
    overrideReason: query.data.overrideReason ?? "",
    items: query.data.items.map((item) => ({
      packageTypeGuid: item.packageTypeGuid ?? null,
      packageTypeName: item.packageTypeName ?? null,
      description: item.description,
      pieces: item.pieces,
      actualWeight: item.actualWeight,
      length: item.length,
      width: item.width,
      height: item.height,
      distance: item.distance,
      zone: item.zone ?? ""
    })),
    manualCharges: query.data.charges.map((charge) => ({
      rateMasterChargeId: charge.rateMasterChargeId ?? null,
      chargeHeadGuid: charge.chargeHeadGuid ?? null,
      chargeHeadName: charge.chargeHeadName ?? null,
      chargeCode: charge.chargeCode,
      chargeName: charge.chargeName,
      currencyId: query.data.currencyId,
      rateBasis: charge.rateBasis,
      unit: "Per Shipment",
      quantity: charge.quantity,
      unitRate: charge.unitRate,
      minimumAllowedAmount: charge.minimumAllowedAmount ?? null,
      maximumAllowedAmount: charge.maximumAllowedAmount ?? null,
      discountAmount: charge.discountAmount,
      isTaxApplicable: charge.isTaxApplicable,
      taxRate: charge.taxRate,
      isManualOverride: charge.isManualOverride,
      overrideReason: charge.overrideReason ?? ""
    }))
  };
  const expectedShipmentDate = query.data.quotationDate ? query.data.quotationDate.slice(0, 10) : "";

  return (
    <div className="space-y-4">
      <PageHeader title={`${q("Edit")} ${query.data.quotationNumber}`} description={q("Update quotation details and recalculation inputs.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <QuotationForm
            initialValue={initial}
            initialExpectedShipmentDate={expectedShipmentDate}
            onSubmit={async (value) => {
              await mutation.mutateAsync(value);
            }}
            isSubmitting={mutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
