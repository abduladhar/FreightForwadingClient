import { z } from "zod";
import { lt } from "@/modules/operationsLocalization";

export const employeeSchema = z.object({
  branchId: z.string().uuid().optional().or(z.literal("")),
  designationId: z.string().uuid(lt("Select a designation")),
  parentEmployeeGuid: z.string().uuid().optional().or(z.literal("")),
  employeeCode: z.string().trim().min(1, lt("Employee code is required")).max(64),
  firstName: z.string().trim().min(1, lt("First name is required")).max(128),
  lastName: z.string().trim().max(128),
  email: z.string().trim().email(lt("Enter a valid email address")).optional().or(z.literal("")),
  phone: z.string().trim().max(64),
  address: z.string().trim().max(1024),
  joiningDate: z.string().optional().or(z.literal("")),
  isSalesman: z.boolean(),
  isActive: z.boolean()
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
