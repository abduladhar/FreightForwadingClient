import { z } from "zod";

type Translate = (value: string) => string;

const rateMasterSlabSchema = z.object({
  fromValue: z.number().min(0),
  toValue: z.number().min(0),
  rate: z.number().min(0),
  minimumCharge: z.number().min(0).nullable().optional(),
  maximumCharge: z.number().min(0).nullable().optional()
});

function createRateMasterChargeSchema(t: Translate) {
  return z.object({
  chargeHeadGuid: z.string().uuid(),
  chargeCode: z.string().min(1),
  chargeName: z.string().min(1),
  chargeType: z.literal("Range"),
  rangeBasis: z.enum(["Weight", "Volume", "Pieces", "ChargeableWeight", "Distance"]),
  amount: z.number().min(0),
  percentage: z.number().min(0).max(100),
  isTaxApplicable: z.boolean(),
  isActive: z.boolean(),
  ranges: z.array(z.object({
    fromValue: z.number().min(0),
    toValue: z.number().positive().nullable(),
    rate: z.number().min(0),
    minimumCharge: z.number().min(0).nullable().optional(),
    maximumCharge: z.number().min(0).nullable().optional()
  }))
  }).superRefine((charge, context) => {
  if (charge.ranges.length === 0) {
    context.addIssue({ code: "custom", message: t("Every charge head requires at least one slab."), path: ["ranges"] });
  }
  const ranges = [...charge.ranges].sort((a, b) => a.fromValue - b.fromValue);
  ranges.forEach((range, index) => {
    if (range.toValue != null && range.toValue <= range.fromValue) context.addIssue({ code: "custom", message: t("Slab To must be greater than From."), path: ["ranges", index, "toValue"] });
    if (range.maximumCharge != null && range.minimumCharge != null && range.maximumCharge < range.minimumCharge) context.addIssue({ code: "custom", message: t("Maximum cannot be lower than minimum."), path: ["ranges", index, "maximumCharge"] });
    if (index > 0 && ranges[index - 1].toValue == null) context.addIssue({ code: "custom", message: t("Only the final charge slab can be open-ended."), path: ["ranges", index - 1, "toValue"] });
    if (index > 0 && ranges[index - 1].toValue != null && range.fromValue < ranges[index - 1].toValue!) context.addIssue({ code: "custom", message: t("Charge slabs cannot overlap."), path: ["ranges", index, "fromValue"] });
  });
  });
}

export function createRateMasterSchema(t: Translate) {
  return z.object({
  rateCode: z.string().min(1),
  rateName: z.string().min(1),
  rateScope: z.string().min(1),
  serviceType: z.string().min(1),
  modeOfTransport: z.string().min(1),
  shipmentType: z.string().min(1),
  rateBasis: z.string().min(1),
  baseRate: z.number().min(0),
  minimumCharge: z.number().min(0),
  maximumCharge: z.number().min(0).nullable().optional(),
  fuelSurchargeRate: z.number().min(0),
  handlingCharge: z.number().min(0),
  pickupCharge: z.number().min(0),
  deliveryCharge: z.number().min(0),
  customsCharge: z.number().min(0),
  documentationCharge: z.number().min(0),
  warehouseCharge: z.number().min(0),
  destinationCharge: z.number().min(0),
  agentCommissionRate: z.number().min(0),
  validFromDate: z.string().min(1),
  validToDate: z.string().min(1),
  currencyId: z.string().min(1),
  isTaxApplicable: z.boolean(),
  taxRate: z.number().min(0),
  isActive: z.boolean(),
  slabs: z.array(rateMasterSlabSchema),
  charges: z.array(createRateMasterChargeSchema(t))
  }).refine((v) => new Date(v.validToDate) >= new Date(v.validFromDate), {
    message: t("Valid To Date must be on or after Valid From Date."),
    path: ["validToDate"]
  });
}
