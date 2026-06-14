import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export type DocumentModule = "HouseShipment" | "DirectShipment" | "MasterShipment" | "CustomsClearance" | "Pickup" | "GoodsReceipt" | string;

export type DocumentRecord = {
  id: string;
  serialNo: number;
  module: DocumentModule;
  ownerId: string;
  documentCategory: string;
  documentName: string;
  originalFileName: string;
  storedFileName: string;
  contentType: string;
  fileSizeBytes: number;
  storageProvider: string;
  bucketName: string;
  objectKey: string;
  storagePath: string;
  status: string;
  uploadedDate?: string | null;
  remarks: string;
  documentReference: string;
};

export type CreateDocumentUploadRequest = {
  moduleName: string;
  entityId: string;
  documentCategory: string;
  documentName: string;
  originalFileName: string;
  contentType?: string | null;
  fileSizeBytes: number;
  remarks?: string | null;
};

export type SignedDocumentUploadDto = {
  document: DocumentRecord;
  uploadUrl: string;
  httpMethod: "PUT";
  expiresAt: string;
};

export type SignedDocumentDownloadDto = {
  documentId: string;
  originalFileName: string;
  downloadUrl: string;
  expiresAt: string;
};

export async function getShipmentDocuments(module: DocumentModule, ownerId: string): Promise<DocumentRecord[]> {
  const response = await httpClient.get<ApiResponse<PagedResponse<DocumentRecord>>>("/api/documents", {
    params: { moduleName: module, entityId: ownerId, pageNumber: 1, pageSize: 200 }
  });
  return (response.data.data.items ?? []).map(normalizeDocument);
}

export async function createSignedDocumentUpload(request: CreateDocumentUploadRequest) {
  const response = await httpClient.post<ApiResponse<SignedDocumentUploadDto>>("/api/documents/signed-upload", request);
  return { ...response.data.data, document: normalizeDocument(response.data.data.document) };
}

export async function completeDocumentUpload(documentId: string, fileSizeBytes?: number) {
  const response = await httpClient.post<ApiResponse<DocumentRecord>>(`/api/documents/${documentId}/complete`, { fileSizeBytes: fileSizeBytes ?? null });
  return normalizeDocument(response.data.data);
}

export async function getDocumentDownloadUrl(documentId: string) {
  const response = await httpClient.get<ApiResponse<SignedDocumentDownloadDto>>(`/api/documents/${documentId}/download-url`);
  return response.data.data;
}

export async function deleteDocument(documentId: string) {
  await httpClient.delete<ApiResponse<unknown>>(`/api/documents/${documentId}`);
}

export async function uploadDocumentToSignedUrl(uploadUrl: string, file: File, onProgress?: (progress: number) => void) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}.`));
      }
    };
    xhr.onerror = () => reject(new Error("S3 upload failed. Check bucket CORS and network access."));
    xhr.send(file);
  });
}

function normalizeDocument(document: DocumentRecord): DocumentRecord {
  return {
    ...document,
    module: document.module ?? (document as unknown as { moduleName: string }).moduleName,
    ownerId: document.ownerId ?? (document as unknown as { entityId: string }).entityId,
    documentReference: document.originalFileName || document.objectKey
  };
}
