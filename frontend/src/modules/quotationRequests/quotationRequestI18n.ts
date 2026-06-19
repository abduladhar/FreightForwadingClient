import { useI18n } from "@/app/i18n";

export function useQuotationRequestI18n() {
  const { t } = useI18n();
  return (key: string, fallback: string) => t(`QuotationRequest.${key}`, fallback);
}

type QuotationRequestText = ReturnType<typeof useQuotationRequestI18n>;

export function translateQuotationMode(qr: QuotationRequestText, value?: string | null) {
  switch (value) {
    case "Air":
      return qr("Mode.Air", "Air");
    case "Sea":
      return qr("Mode.Sea", "Sea");
    case "Road":
      return qr("Mode.Road", "Road");
    case "Courier":
      return qr("Mode.Courier", "Courier");
    default:
      return value ?? "-";
  }
}

export function translateShipmentType(qr: QuotationRequestText, value?: string | null) {
  switch (value) {
    case "General":
      return qr("ShipmentType.General", "General");
    case "Import":
      return qr("ShipmentType.Import", "Import");
    case "Export":
      return qr("ShipmentType.Export", "Export");
    case "Door to Door":
      return qr("ShipmentType.DoorToDoor", "Door to Door");
    default:
      return value ?? "-";
  }
}

export function translateAttachmentType(qr: QuotationRequestText, value?: string | null) {
  switch (value) {
    case "Video":
      return qr("Upload.Video", "Video");
    case "Audio":
      return qr("Upload.Audio", "Audio");
    case "File":
      return qr("Upload.File", "File");
    default:
      return value ?? "-";
  }
}

export function translateQuotationStatus(qr: QuotationRequestText, value?: string | null) {
  switch (value) {
    case "Open":
      return qr("Status.Open", "Open");
    case "Submitted":
      return qr("Status.Submitted", "Submitted");
    case "Closed":
      return qr("Status.Closed", "Closed");
    case "Cancelled":
      return qr("Status.Cancelled", "Cancelled");
    default:
      return value ?? "-";
  }
}
