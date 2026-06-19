import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";
import type { DocumentRecord, SignedDocumentDownloadDto } from "@/api/documentApi";

export type PublicQuotationRequestCreateRequest = {
  customerName: string;
  email: string;
  phone: string;
  companyName?: string | null;
  origin: string;
  destination: string;
  modeOfTransport: string;
  shipmentType: string;
  cargoDescription?: string | null;
};

export type PublicQuotationRequestAttachment = {
  id: string;
  documentFileId: string;
  attachmentType: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
};

export type PublicQuotationRequest = {
  id: string;
  requestNumber: string;
  customerName: string;
  email: string;
  phone: string;
  companyName: string;
  origin: string;
  destination: string;
  modeOfTransport: string;
  shipmentType: string;
  cargoDescription: string;
  status: string;
  tokenExpiresAt: string;
  attachments: PublicQuotationRequestAttachment[];
};

export type PublicQuotationRequestCreated = {
  request: PublicQuotationRequest;
  uploadToken: string;
  uploadPath: string;
};

export type PublicQuotationRequestSignedUpload = {
  document: DocumentRecord;
  uploadUrl: string;
  httpMethod: "PUT";
  expiresAt: string;
};

export async function createPublicQuotationRequest(request: PublicQuotationRequestCreateRequest) {
  const response = await httpClient.post<ApiResponse<PublicQuotationRequestCreated>>("/api/public/quotation-requests", request);
  return response.data.data;
}

export async function searchQuotationRequests(params: { pageNumber: number; pageSize: number }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<PublicQuotationRequest>>>("/api/quotation-requests", { params });
  return response.data.data;
}

export async function getQuotationRequest(id: string) {
  const response = await httpClient.get<ApiResponse<PublicQuotationRequest>>(`/api/quotation-requests/${id}`);
  return response.data.data;
}

export async function updateQuotationRequest(id: string, request: PublicQuotationRequestCreateRequest & { status: string }) {
  const response = await httpClient.put<ApiResponse<PublicQuotationRequest>>(`/api/quotation-requests/${id}`, request);
  return response.data.data;
}

export async function getQuotationRequestAttachmentDownloadUrl(requestId: string, documentId: string) {
  const response = await httpClient.get<ApiResponse<SignedDocumentDownloadDto>>(`/api/quotation-requests/${requestId}/attachments/${documentId}/download-url`);
  return response.data.data;
}

export async function getPublicQuotationRequest(token: string) {
  const response = await httpClient.get<ApiResponse<PublicQuotationRequest>>(`/api/public/quotation-requests/${encodeURIComponent(token)}`);
  return response.data.data;
}

export async function createPublicQuotationRequestUpload(token: string, file: File, attachmentType: "Video" | "Audio" | "File") {
  const response = await httpClient.post<ApiResponse<PublicQuotationRequestSignedUpload>>(`/api/public/quotation-requests/${encodeURIComponent(token)}/signed-upload`, {
    attachmentType,
    documentName: attachmentType,
    originalFileName: file.name,
    contentType: file.type || "application/octet-stream",
    fileSizeBytes: file.size,
    remarks: ""
  });
  return response.data.data;
}

export async function completePublicQuotationRequestUpload(token: string, documentId: string, fileSizeBytes?: number) {
  const response = await httpClient.post<ApiResponse<PublicQuotationRequest>>(
    `/api/public/quotation-requests/${encodeURIComponent(token)}/documents/${documentId}/complete`,
    { fileSizeBytes: fileSizeBytes ?? null }
  );
  return response.data.data;
}
