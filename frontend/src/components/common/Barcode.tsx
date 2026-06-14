import { useEffect, useRef } from "react";

export function Barcode({ value, height = 48 }: { value: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let disposed = false;
    void (async () => {
      if (!canvasRef.current) return;
      if (!value?.trim()) return;
      const barcodeFactory = await getBarcodeFactory();
      if (!barcodeFactory || disposed || !canvasRef.current) return;
      barcodeFactory(canvasRef.current, value, {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        height,
        width: 1.2
      });
    })();
    return () => {
      disposed = true;
    };
  }, [value, height]);

  return (
    <div className="inline-flex rounded border bg-white p-2">
      <canvas ref={canvasRef} />
    </div>
  );
}

type JsBarcodeFactory = (element: HTMLCanvasElement, value: string, options?: Record<string, unknown>) => void;

function resolveJsBarcode(source: unknown): JsBarcodeFactory | null {
  if (typeof source === "function") return source as JsBarcodeFactory;
  if (source && typeof source === "object") {
    const obj = source as Record<string, unknown>;
    if (typeof obj.default === "function") return obj.default as JsBarcodeFactory;
    if (typeof obj.JsBarcode === "function") return obj.JsBarcode as JsBarcodeFactory;
    for (const key of Object.keys(obj)) {
      const candidate = obj[key];
      if (typeof candidate === "function") return candidate as JsBarcodeFactory;
    }
  }
  return null;
}

let barcodeFactoryPromise: Promise<JsBarcodeFactory | null> | null = null;

async function getBarcodeFactory(): Promise<JsBarcodeFactory | null> {
  if (!barcodeFactoryPromise) {
    barcodeFactoryPromise = (async () => {
      const fallback = await import("jsbarcode/dist/JsBarcode.all.min.js");
      const resolvedFallback = resolveJsBarcode(fallback);
      if (resolvedFallback) return resolvedFallback;

      if (typeof window !== "undefined") {
        const globalFactory = resolveJsBarcode((window as unknown as { JsBarcode?: unknown }).JsBarcode);
        if (globalFactory) return globalFactory;
      }

      return null;
    })().catch(() => null);
  }

  return barcodeFactoryPromise;
}
