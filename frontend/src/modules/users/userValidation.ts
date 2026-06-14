import { z } from "zod";
import { lt } from "@/modules/operationsLocalization";

export const createUserSchema = z.object({
  email: z.string().trim().email(lt("Enter a valid email address")),
  userName: z.string().trim().min(3, lt("Username must contain at least 3 characters")).max(100),
  firstName: z.string().trim().min(1, lt("First name is required")).max(100),
  lastName: z.string().trim().min(1, lt("Last name is required")).max(100),
  branchId: z.string().uuid().optional().or(z.literal("")),
  employeeId: z.string().uuid().optional().or(z.literal("")),
  password: z.string().min(6, lt("Password must contain at least 6 characters")).max(100),
  isActive: z.boolean()
});

export const editUserSchema = createUserSchema.omit({ password: true });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;
