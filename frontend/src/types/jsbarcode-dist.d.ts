declare module "jsbarcode/dist/JsBarcode.all.min.js" {
  import type { Options } from "jsbarcode";

  type BarcodeElement = SVGElement | HTMLCanvasElement | string;
  type JsBarcodeFunction = (element: BarcodeElement, text: string, options?: Options) => unknown;

  const JsBarcode: JsBarcodeFunction;
  export default JsBarcode;
}
