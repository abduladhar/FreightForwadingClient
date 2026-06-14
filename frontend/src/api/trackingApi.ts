import { getHouseShipment } from "@/api/houseShipmentApi";
import { getDirectShipment } from "@/api/directShipmentApi";
import { getMasterShipment } from "@/api/masterShipmentApi";
import { updateHouseShipmentStatus } from "@/api/houseShipmentApi";
import { updateDirectShipmentStatus } from "@/api/directShipmentApi";
import { updateMasterShipmentStatus } from "@/api/masterShipmentApi";

export type TrackingRecord = {
  id: string;
  shipmentType: "House" | "Direct" | "Master";
  shipmentNumber: string;
  origin: string;
  destination: string;
  status: string;
  etd?: string | null;
  eta?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
};

export async function getTrackingRecord(shipmentType: TrackingRecord["shipmentType"], id: string): Promise<TrackingRecord> {
  if (shipmentType === "House") {
    const x = await getHouseShipment(id);
    return { id: x.id, shipmentType, shipmentNumber: x.houseShipmentNumber, origin: x.origin, destination: x.destination, status: x.status, etd: x.etd, eta: x.eta, actualDeparture: x.actualDeparture, actualArrival: x.actualArrival };
  }
  if (shipmentType === "Direct") {
    const x = await getDirectShipment(id);
    return { id: x.id, shipmentType, shipmentNumber: x.directShipmentNumber, origin: x.origin, destination: x.destination, status: x.status, etd: x.etd, eta: x.eta, actualDeparture: x.actualDeparture, actualArrival: x.actualArrival };
  }
  const x = await getMasterShipment(id);
  return {
    id: x.id,
    shipmentType,
    shipmentNumber: x.masterShipmentNumber,
    origin: x.originPortName || x.originPortCode,
    destination: x.destinationPortName || x.destinationPortCode,
    status: x.status,
    etd: x.etd,
    eta: x.eta,
    actualDeparture: x.actualDeparture,
    actualArrival: x.actualArrival
  };
}

export async function updateTrackingStatus(shipmentType: TrackingRecord["shipmentType"], id: string, status: string) {
  if (shipmentType === "House") return updateHouseShipmentStatus(id, { status });
  if (shipmentType === "Direct") return updateDirectShipmentStatus(id, { status });
  return updateMasterShipmentStatus(id, { status });
}
