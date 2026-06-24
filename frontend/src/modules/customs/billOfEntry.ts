import type { CustomsClearanceJobDto, CustomsClearanceJobRequest, CustomsJobSearchParams } from "@/api/customsApi";

export const billOfEntrySearchDefaults: Pick<CustomsJobSearchParams, "clearanceType" | "declarationType"> = {
  clearanceType: "Import",
  declarationType: "Import"
};

export function toBillOfEntryRequest(value: CustomsClearanceJobRequest): CustomsClearanceJobRequest {
  return {
    ...value,
    clearanceType: "Import",
    declaration: {
      ...(value.declaration ?? {}),
      declarationType: "Import"
    }
  };
}

export function isBillOfEntry(job?: CustomsClearanceJobDto | null) {
  return job?.clearanceType === "Import" && job.declaration?.declarationType === "Import";
}
