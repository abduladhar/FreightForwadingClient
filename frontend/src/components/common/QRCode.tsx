import { QRCodeSVG } from "qrcode.react";

export function QRCode({ value, size = 96 }: { value: string; size?: number }) {
  return (
    <div className="inline-flex rounded border bg-white p-2">
      <QRCodeSVG value={value} size={size} includeMargin />
    </div>
  );
}
