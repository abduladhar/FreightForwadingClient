import { z } from "zod";

export function createQuotationSchema(t: (value: string) => string) {
  const itemSchema = z.object({
    packageTypeGuid: z.string().min(1, t("Package Type is required.")),
    packageTypeName: z.string().nullable().optional(),
    description: z.string(),
    pieces: z.number().gt(0, t("No. of Packages must be greater than 0.")),
    actualWeight: z.number().min(0),
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    distance: z.number().min(0),
    zone: z.string().nullable().optional()
  });

  const chargeSchema = z.object({
    rateMasterChargeId: z.string().nullable().optional(),
    chargeHeadGuid: z.string().min(1, t("Charge Head is required.")),
    chargeHeadName: z.string().nullable().optional(),
    chargeCode: z.string().min(1),
    chargeName: z.string().min(1),
    currencyId: z.string().nullable().optional(),
    rateBasis: z.string().min(1),
    unit: z.string().nullable().optional(),
    quantity: z.number().min(0),
    unitRate: z.number().min(0),
    discountAmount: z.number().min(0),
    isTaxApplicable: z.boolean(),
    taxRate: z.number().min(0),
    isManualOverride: z.boolean(),
    overrideReason: z.string().nullable().optional(),
    minimumAllowedAmount: z.number().nullable().optional(),
    maximumAllowedAmount: z.number().nullable().optional()
  }).superRefine((charge, context) => {
    if (!charge.rateMasterChargeId) return;
    const minimumRate = charge.minimumAllowedAmount;
    if (minimumRate != null && charge.unitRate < minimumRate) {
      context.addIssue({ code: "custom", message: `${t("Rate cannot be lower than")} ${minimumRate.toFixed(4)}.`, path: ["unitRate"] });
    }
  });

  return z.object({
    customerId: z.string().min(1, t("Customer is required.")),
    currencyId: z.string().min(1, t("Quotation Currency is required.")),
    originPortGuid: z.string().min(1, t("Origin Port is required.")),
    destinationPortGuid: z.string().min(1, t("Destination Port is required.")),
    origin: z.string().min(1),
    destination: z.string().min(1),
    serviceType: z.string().min(1, t("Service Type is required.")),
    modeOfTransport: z.string().min(1),
    shipmentType: z.string().min(1),
    exchangeRate: z.number().min(0),
    discountAmount: z.number().min(0),
    isManualOverride: z.boolean(),
    overrideReason: z.string().nullable().optional(),
    items: z.array(itemSchema).min(1, t("At least one quotation item is required.")),
    manualCharges: z.array(chargeSchema)
  }).refine((value) => value.originPortGuid !== value.destinationPortGuid, {
    message: t("Origin and Destination Port cannot be the same."),
    path: ["destinationPortGuid"]
  }).refine((value) => !value.isManualOverride || Boolean(value.overrideReason?.trim()), {
    message: t("Override reason is required when manual override is enabled."),
    path: ["overrideReason"]
  });
}
