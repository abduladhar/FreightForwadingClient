import { z } from "zod";

export const branchSchema = z.object({
  branchCode: z.string().trim().min(2).max(50),
  branchName: z.string().trim().min(2).max(200),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  contactPerson: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email(),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  defaultWarehouseId: z.string().uuid().optional().or(z.literal("")),
  isActive: z.boolean()
});

export type BranchFormValues = z.infer<typeof branchSchema>;

export const branchSettingsSchema = z.object({
  localTimeZone: z.string().trim().max(100).optional().or(z.literal("")),
  workingDays: z.string().trim().max(100).optional().or(z.literal("")),
  openingTime: z.string().trim().max(20).optional().or(z.literal("")),
  closingTime: z.string().trim().max(20).optional().or(z.literal("")),
  configurationJson: z.string().trim().optional().or(z.literal(""))
});

export type BranchSettingsFormValues = z.infer<typeof branchSettingsSchema>;
