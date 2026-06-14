import type { VendorBillDto } from "@/api/vendorBillApi";

export function vendorBillReturnPath(bill: Pick<VendorBillDto, "sourceType" | "sourceId" | "id">) {
  if (!bill.sourceId) return `/vendor-bills/${bill.id}`;
  switch (bill.sourceType) {
    case "Pickup":
      return `/pickups/${bill.sourceId}/bills`;
    case "GoodsReceipt":
      return `/goods-receipts/${bill.sourceId}/bills`;
    case "HouseShipment":
      return `/house-shipments/${bill.sourceId}/bills`;
    case "MasterShipment":
      return `/master-shipments/${bill.sourceId}/bills`;
    case "DirectShipment":
      return `/direct-shipments/${bill.sourceId}/bills`;
    case "CustomsClearance":
      return `/customs/${bill.sourceId}/bills`;
    case "Job":
      return `/customs/jobs/${bill.sourceId}/bills`;
    default:
      return `/vendor-bills/${bill.id}`;
  }
}
