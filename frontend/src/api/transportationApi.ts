import { searchPickups, type PickupDto, updatePickupStatus, assignPickup } from "@/api/pickupApi";
import { searchDirectShipments, type DirectShipmentDto, updateDirectShipmentStatus } from "@/api/directShipmentApi";
import { searchHouseShipments, type HouseShipmentDto, updateHouseShipmentStatus } from "@/api/houseShipmentApi";

export type TransportationRecord = {
  id: string;
  type: "Pickup" | "DirectShipment" | "HouseShipment";
  number: string;
  origin: string;
  destination: string;
  status: string;
};

export async function searchTransportationRecords(params: { pageNumber?: number; pageSize?: number; search?: string }) {
  const [pickups, directs, houses] = await Promise.all([
    searchPickups({ pageNumber: 1, pageSize: 50, search: params.search }),
    searchDirectShipments({ pageNumber: 1, pageSize: 50, search: params.search }),
    searchHouseShipments({ pageNumber: 1, pageSize: 50, search: params.search })
  ]);

  const records: TransportationRecord[] = [
    ...(pickups?.items ?? []).map((x: PickupDto) => ({ id: x.id, type: "Pickup" as const, number: x.pickupNumber, origin: x.customerLocation, destination: x.customerLocation, status: x.status })),
    ...(directs?.items ?? []).map((x: DirectShipmentDto) => ({ id: x.id, type: "DirectShipment" as const, number: x.directShipmentNumber, origin: x.origin, destination: x.destination, status: x.status })),
    ...(houses?.items ?? []).map((x: HouseShipmentDto) => ({ id: x.id, type: "HouseShipment" as const, number: x.houseShipmentNumber, origin: x.origin, destination: x.destination, status: x.status }))
  ];

  return {
    items: records,
    totalCount: records.length,
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? records.length
  };
}

export async function updateTransportationStatus(record: TransportationRecord, status: string) {
  if (record.type === "Pickup") return updatePickupStatus(record.id, { status });
  if (record.type === "DirectShipment") return updateDirectShipmentStatus(record.id, { status });
  return updateHouseShipmentStatus(record.id, { status });
}

export async function assignTransportationPickup(pickupId: string, driverName: string, vehicleNumber: string, transporterVendorId?: string) {
  return assignPickup(pickupId, { driverName, vehicleNumber, transporterVendorId: transporterVendorId ?? null });
}
