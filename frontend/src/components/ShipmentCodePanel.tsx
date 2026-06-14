import { QRCodeSVG } from "qrcode.react";
import { Barcode } from "@/components/common/Barcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ShipmentCodePanel({ shipmentNumber }: { shipmentNumber: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment identification</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[120px_1fr]">
        <div className="flex items-center justify-center rounded-lg border bg-white p-3">
          <QRCodeSVG value={shipmentNumber} size={88} />
        </div>
        <div className="overflow-hidden rounded-lg border bg-white p-3">
          <Barcode value={shipmentNumber} height={42} />
        </div>
      </CardContent>
    </Card>
  );
}
