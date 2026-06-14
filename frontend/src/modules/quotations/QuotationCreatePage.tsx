import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createQuotation, generateQuotation, type GenerateQuotationRequest, type QuotationRequest } from "@/api/quotationApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { QuotationForm } from "@/modules/quotations/QuotationForm";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";

export function QuotationCreatePage() {
  const q = useQuotationI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createQuotation,
    onSuccess: async (quotation) => {
      await queryClient.invalidateQueries({ queryKey: ["quotations"] });
      navigate(`/quotations/${quotation.id}`);
    }
  });
  const generateMutation = useMutation({ mutationFn: generateQuotation });

  return (
    <div className="space-y-4">
      <PageHeader title={q("Create Quotation")} description={q("Create and price quotation using manual charges or rate master generation.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <QuotationForm
            onSubmit={async (value: QuotationRequest) => {
              await createMutation.mutateAsync(value);
            }}
            onGenerateFromRateMaster={async (value: GenerateQuotationRequest) => {
              const generated = await generateMutation.mutateAsync(value);
              return {
                rateMasterId: generated.rateMasterId ?? null,
                customerId: generated.customerId,
                agentId: generated.agentId ?? null,
                originPortGuid: generated.originPortGuid ?? null,
                originPortName: generated.originPortName ?? null,
                destinationPortGuid: generated.destinationPortGuid ?? null,
                destinationPortName: generated.destinationPortName ?? null,
                origin: generated.origin,
                destination: generated.destination,
                serviceType: generated.serviceType,
                modeOfTransport: generated.modeOfTransport,
                shipmentType: generated.shipmentType,
                cargoType: generated.cargoType ?? "",
                incoterms: generated.incoterms ?? "",
                currencyId: generated.currencyId,
                targetCurrencyId: null,
                exchangeRate: generated.exchangeRate,
                discountAmount: generated.discountAmount,
                isManualOverride: generated.isManualOverride,
                overrideReason: generated.overrideReason ?? "",
                items: generated.items.map((item) => ({
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
                manualCharges: generated.charges.map((charge) => ({
                  rateMasterChargeId: charge.rateMasterChargeId ?? null,
                  chargeHeadGuid: charge.chargeHeadGuid ?? null,
                  chargeHeadName: charge.chargeHeadName ?? null,
                  chargeCode: charge.chargeCode,
                  chargeName: charge.chargeName,
                  currencyId: generated.currencyId,
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
            }}
            isSubmitting={createMutation.isPending || generateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
