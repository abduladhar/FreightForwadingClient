import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface AirShipmentDetailRequest {
  shipmentId: string;
  shipmentType: string;
  airlineId?: string | null;
  flightNumber: string;
  mawb?: string | null;
  hawb?: string | null;
  airportOfDeparture: string;
  airportOfArrival: string;
  etd?: string | null;
  eta?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  iataDetails?: string | null;
  manifestNumber?: string | null;
}
export interface AirShipmentDetailDto extends AirShipmentDetailRequest { id: string }

export interface ContainerItemRequest {
  shipmentItemId?: string | null;
  description: string;
  pieces: number;
  weight: number;
  volume: number;
}
export interface ContainerItemDto extends ContainerItemRequest { id: string }

export interface ContainerRequest {
  seaShipmentDetailId: string;
  containerNumber: string;
  sealNumber?: string | null;
  containerType: string;
  freeDays: number;
  demurrage: number;
  detention: number;
}
export interface ContainerDto extends ContainerRequest {
  id: string;
  items: ContainerItemDto[];
}

export interface SeaShipmentDetailRequest {
  shipmentId: string;
  shipmentType: string;
  shippingLineId?: string | null;
  vessel: string;
  voyageNumber: string;
  mbl?: string | null;
  hbl?: string | null;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfReceipt?: string | null;
  placeOfDelivery?: string | null;
  loadType: string;
  freeDays: number;
  demurrage: number;
  detention: number;
}
export interface SeaShipmentDetailDto extends SeaShipmentDetailRequest {
  id: string;
  containers: ContainerDto[];
}

export interface RoadShipmentDetailRequest {
  shipmentId: string;
  shipmentType: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  transporterId?: string | null;
  route: string;
  origin: string;
  destination: string;
  borderCrossingDetails?: string | null;
  tripSheetNumber?: string | null;
  loadingPoint?: string | null;
  deliveryPoint?: string | null;
  proofOfDeliveryDocumentId?: string | null;
}
export interface RoadShipmentDetailDto extends RoadShipmentDetailRequest { id: string }

export interface CourierShipmentDetailRequest {
  shipmentId: string;
  shipmentType: string;
  bagNumber?: string | null;
  manifestNumber?: string | null;
  isReturnShipment: boolean;
  isCodRequired: boolean;
  codAmount: number;
  deliveryProofDocumentId?: string | null;
}
export interface CourierPieceTrackingRequest { pieceNumber: string; barcode: string; remarks?: string | null }
export interface CourierPieceScanRequest { scanStatus: string; lastScanLocation?: string | null; remarks?: string | null }
export interface CourierPieceTrackingDto extends CourierPieceTrackingRequest {
  id: string;
  scanStatus: string;
  lastScanTime?: string | null;
  lastScanLocation?: string | null;
}
export interface CourierShipmentDetailDto extends CourierShipmentDetailRequest {
  id: string;
  pieces: CourierPieceTrackingDto[];
}

export async function getAirFreight(id: string) {
  const response = await httpClient.get<ApiResponse<AirShipmentDetailDto>>(`/api/air-freight/${id}`);
  return response.data.data;
}
export async function createAirFreight(request: AirShipmentDetailRequest) {
  const response = await httpClient.post<ApiResponse<AirShipmentDetailDto>>("/api/air-freight", request);
  return response.data.data;
}
export async function updateAirFreight(id: string, request: AirShipmentDetailRequest) {
  const response = await httpClient.put<ApiResponse<AirShipmentDetailDto>>(`/api/air-freight/${id}`, request);
  return response.data.data;
}

export async function getSeaFreight(id: string) {
  const response = await httpClient.get<ApiResponse<SeaShipmentDetailDto>>(`/api/sea-freight/${id}`);
  return response.data.data;
}
export async function createSeaFreight(request: SeaShipmentDetailRequest) {
  const response = await httpClient.post<ApiResponse<SeaShipmentDetailDto>>("/api/sea-freight", request);
  return response.data.data;
}
export async function updateSeaFreight(id: string, request: SeaShipmentDetailRequest) {
  const response = await httpClient.put<ApiResponse<SeaShipmentDetailDto>>(`/api/sea-freight/${id}`, request);
  return response.data.data;
}

export async function createContainer(request: ContainerRequest) {
  const response = await httpClient.post<ApiResponse<ContainerDto>>("/api/sea-freight/containers", request);
  return response.data.data;
}
export async function updateContainer(id: string, request: ContainerRequest) {
  const response = await httpClient.put<ApiResponse<ContainerDto>>(`/api/sea-freight/containers/${id}`, request);
  return response.data.data;
}
export async function deleteContainer(id: string) { await httpClient.delete(`/api/sea-freight/containers/${id}`); }
export async function addContainerItem(containerId: string, request: ContainerItemRequest) {
  const response = await httpClient.post<ApiResponse<ContainerDto>>(`/api/sea-freight/containers/${containerId}/items`, request);
  return response.data.data;
}
export async function deleteContainerItem(containerId: string, itemId: string) {
  await httpClient.delete(`/api/sea-freight/containers/${containerId}/items/${itemId}`);
}

export async function getRoadFreight(id: string) {
  const response = await httpClient.get<ApiResponse<RoadShipmentDetailDto>>(`/api/road-freight/${id}`);
  return response.data.data;
}
export async function createRoadFreight(request: RoadShipmentDetailRequest) {
  const response = await httpClient.post<ApiResponse<RoadShipmentDetailDto>>("/api/road-freight", request);
  return response.data.data;
}
export async function updateRoadFreight(id: string, request: RoadShipmentDetailRequest) {
  const response = await httpClient.put<ApiResponse<RoadShipmentDetailDto>>(`/api/road-freight/${id}`, request);
  return response.data.data;
}

export async function getCourier(id: string) {
  const response = await httpClient.get<ApiResponse<CourierShipmentDetailDto>>(`/api/courier/${id}`);
  return response.data.data;
}
export async function createCourier(request: CourierShipmentDetailRequest) {
  const response = await httpClient.post<ApiResponse<CourierShipmentDetailDto>>("/api/courier", request);
  return response.data.data;
}
export async function updateCourier(id: string, request: CourierShipmentDetailRequest) {
  const response = await httpClient.put<ApiResponse<CourierShipmentDetailDto>>(`/api/courier/${id}`, request);
  return response.data.data;
}
export async function addCourierPiece(id: string, request: CourierPieceTrackingRequest) {
  const response = await httpClient.post<ApiResponse<CourierShipmentDetailDto>>(`/api/courier/${id}/pieces`, request);
  return response.data.data;
}
export async function updateCourierPieceScan(id: string, pieceId: string, request: CourierPieceScanRequest) {
  const response = await httpClient.post<ApiResponse<CourierShipmentDetailDto>>(`/api/courier/${id}/pieces/${pieceId}/scan`, request);
  return response.data.data;
}
