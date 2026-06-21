import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface SendHtmlReportEmailRequest {
  emailTo: string;
  emailCc?: string | null;
  emailBcc?: string | null;
  subject: string;
  reportName: string;
  htmlBody: string;
  module?: string | null;
  attachments?: ReportEmailAttachmentRequest[];
}

export interface ReportEmailAttachmentRequest {
  fileName: string;
  contentType: string;
  base64Content: string;
}

export async function sendHtmlReportEmail(request: SendHtmlReportEmailRequest) {
  await httpClient.post<ApiResponse<{ sent: boolean }>>("/api/report-email/send-html", request);
}
