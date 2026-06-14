export interface ShipmentRow {
  number: string;
  customer: string;
  mode: "Air" | "Sea" | "Road" | "Courier";
  origin: string;
  destination: string;
  status: string;
  eta: string;
  profit: number;
}

export const activeShipments: ShipmentRow[] = [
  { number: "HS-HQ-2026-00428", customer: "Apex Medical Supplies", mode: "Air", origin: "JFK", destination: "DXB", status: "In Transit", eta: "2026-05-30", profit: 4200 },
  { number: "MS-HQ-2026-00112", customer: "Global Retail Group", mode: "Sea", origin: "Shanghai", destination: "Los Angeles", status: "Loaded", eta: "2026-06-14", profit: 18600 },
  { number: "DS-HQ-2026-00291", customer: "Nova Automotive", mode: "Road", origin: "Dallas", destination: "Monterrey", status: "Border Hold", eta: "2026-05-29", profit: 3100 },
  { number: "CR-HQ-2026-00874", customer: "Zenith Electronics", mode: "Courier", origin: "Chicago", destination: "Toronto", status: "Out for Delivery", eta: "2026-05-28", profit: 680 }
];
