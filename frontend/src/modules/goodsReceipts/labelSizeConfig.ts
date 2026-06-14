export type LabelUnit = "mm" | "in" | "px";
export type LabelOrientation = "portrait" | "landscape";

export interface LabelSizeOption {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: LabelUnit;
  custom?: boolean;
}

export interface ResolvedLabelSize {
  width: number;
  height: number;
  unit: LabelUnit;
  orientation: LabelOrientation;
}

export const labelSizeOptions: LabelSizeOption[] = [
  { id: "h30c_4x6", name: "H30C Lite 4 x 6 in (Recommended)", width: 4, height: 6, unit: "in" },
  { id: "4x4_in", name: "4 x 4 inch", width: 4, height: 4, unit: "in" },
  { id: "100x100_mm", name: "100 x 100 mm", width: 100, height: 100, unit: "mm" },
  { id: "100x150_mm", name: "100 x 150 mm", width: 100, height: 150, unit: "mm" },
  { id: "a6", name: "A6", width: 105, height: 148, unit: "mm" },
  { id: "custom", name: "Custom", width: 100, height: 150, unit: "mm", custom: true }
];

