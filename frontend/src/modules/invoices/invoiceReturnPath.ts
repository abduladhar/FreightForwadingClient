import type { InvoiceDto } from "@/api/invoiceApi";

export function invoiceReturnPath(invoice: Pick<InvoiceDto, "sourceType" | "sourceId" | "id">) {
  if (!invoice.sourceId) return `/invoices/${invoice.id}`;
  switch (invoice.sourceType) {
    case "Pickup":
      return `/pickups/${invoice.sourceId}/invoices`;
    case "GoodsReceipt":
      return `/goods-receipts/${invoice.sourceId}/invoices`;
    case "HouseShipment":
      return `/house-shipments/${invoice.sourceId}/invoices`;
    case "MasterShipment":
      return `/master-shipments/${invoice.sourceId}/invoices`;
    case "DirectShipment":
      return `/direct-shipments/${invoice.sourceId}/invoices`;
    case "CustomsClearance":
      return `/customs/${invoice.sourceId}/invoices`;
    case "BillOfEntry":
      return `/invoices?sourceType=BillOfEntry&sourceId=${invoice.sourceId}`;
    case "BillOfExit":
      return `/invoices?sourceType=BillOfExit&sourceId=${invoice.sourceId}`;
    case "Job":
      return `/customs/jobs/${invoice.sourceId}/invoices`;
    default:
      return `/invoices/${invoice.id}`;
  }
}
