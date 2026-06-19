import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface EmailConfiguration {
  id: string | null;
  provider: string;
  smtpHost: string;
  smtpPort: number;
  useSsl: boolean;
  userName: string;
  hasPassword: boolean;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  isEnabled: boolean;
  lastTestedAt: string | null;
}

export interface EmailConfigurationRequest {
  smtpHost: string;
  smtpPort: number;
  useSsl: boolean;
  userName?: string | null;
  password?: string | null;
  fromEmail: string;
  fromName?: string | null;
  replyToEmail?: string | null;
  isEnabled: boolean;
}

export interface EmailTestRequest {
  toEmail: string;
  subject?: string | null;
  htmlBody?: string | null;
}

export async function getEmailConfiguration() {
  const response = await axiosClient.get<ApiResponse<EmailConfiguration>>("/api/email-configuration");
  return response.data.data;
}

export async function saveEmailConfiguration(request: EmailConfigurationRequest) {
  const response = await axiosClient.put<ApiResponse<EmailConfiguration>>("/api/email-configuration", request);
  return response.data.data;
}

export async function sendEmailConfigurationTest(request: EmailTestRequest) {
  await axiosClient.post<ApiResponse<{ sent: boolean }>>("/api/email-configuration/test", request);
}
