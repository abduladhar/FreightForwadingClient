import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export const notificationChannels = ["Email", "SMS", "WhatsApp", "InApp"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export const notificationEvents = [
  "QuotationSent",
  "QuotationApproved",
  "QuotationRejected",
  "PickupAssigned",
  "GoodsReceived",
  "ShipmentDeparted",
  "ShipmentArrived",
  "ShipmentDelivered",
  "InvoiceGenerated",
  "PaymentReceived",
  "InvoiceOverdue",
  "ApprovalPending",
  "PodUploaded",
  "PasswordReset",
  "UserCreated"
] as const;
export type NotificationEvent = (typeof notificationEvents)[number];

export interface NotificationTemplateSearchRequest {
  pageNumber?: number;
  pageSize?: number;
  eventName?: string;
  channel?: string;
  languageId?: string;
  isActive?: boolean;
}

export interface NotificationTemplateRequest {
  templateCode: string;
  eventName: string;
  channel: string;
  languageId?: string | null;
  cultureCode?: string | null;
  subjectTemplate: string;
  bodyTemplate: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface NotificationTemplateDto extends NotificationTemplateRequest {
  id: string;
}

export interface NotificationRecipientRequest {
  recipientType: string;
  recipientId?: string | null;
  userId?: string | null;
  recipientName?: string | null;
  address?: string | null;
}

export interface SendNotificationRequest {
  eventName: string;
  channel: string;
  languageId?: string | null;
  templateId?: string | null;
  placeholders: Record<string, string>;
  recipients: NotificationRecipientRequest[];
  scheduledDate?: string | null;
  sourceModule?: string | null;
  sourceEntityType?: string | null;
  sourceEntityId?: string | null;
}

export interface NotificationSearchRequest {
  pageNumber?: number;
  pageSize?: number;
  eventName?: string;
  channel?: string;
  status?: string;
  recipientUserId?: string;
}

export interface NotificationRecipientDto {
  id: string;
  recipientType: string;
  recipientId?: string | null;
  userId?: string | null;
  recipientName?: string | null;
  address?: string | null;
  deliveryStatus: string;
  isRead: boolean;
  readDate?: string | null;
  failureReason?: string | null;
}

export interface NotificationDto {
  id: string;
  eventName: string;
  channel: string;
  subject: string;
  body: string;
  status: string;
  queuedDate: string;
  scheduledDate?: string | null;
  sentDate?: string | null;
  retryCount: number;
  maxRetryCount: number;
  failureReason?: string | null;
  sourceModule?: string | null;
  sourceEntityType?: string | null;
  sourceEntityId?: string | null;
  recipients: NotificationRecipientDto[];
}

const base = "/api/notifications";

export async function searchNotificationTemplates(params: NotificationTemplateSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<NotificationTemplateDto>>>(`${base}/templates`, { params });
  return response.data.data;
}

export async function getNotificationTemplate(id: string) {
  const response = await httpClient.get<ApiResponse<NotificationTemplateDto>>(`${base}/templates/${id}`);
  return response.data.data;
}

export async function createNotificationTemplate(request: NotificationTemplateRequest) {
  const response = await httpClient.post<ApiResponse<NotificationTemplateDto>>(`${base}/templates`, request);
  return response.data.data;
}

export async function updateNotificationTemplate(id: string, request: NotificationTemplateRequest) {
  const response = await httpClient.put<ApiResponse<NotificationTemplateDto>>(`${base}/templates/${id}`, request);
  return response.data.data;
}

export async function deleteNotificationTemplate(id: string) {
  await httpClient.delete(`${base}/templates/${id}`);
}

export async function sendNotification(request: SendNotificationRequest) {
  const response = await httpClient.post<ApiResponse<NotificationDto>>(`${base}/send`, request);
  return response.data.data;
}

export async function getNotificationHistory(params: NotificationSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<NotificationDto>>>(`${base}/history`, { params });
  return response.data.data;
}

export async function getUserNotifications(params: NotificationSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<NotificationDto>>>(`${base}/me`, { params });
  return response.data.data;
}

export async function markNotificationAsRead(recipientId: string) {
  await httpClient.post(`${base}/recipients/${recipientId}/read`, {});
}

export async function retryNotification(notificationId: string) {
  const response = await httpClient.post<ApiResponse<NotificationDto>>(`${base}/${notificationId}/retry`, {});
  return response.data.data;
}
