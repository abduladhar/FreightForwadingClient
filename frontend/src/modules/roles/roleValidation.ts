import { z } from "zod";
import { lt } from "@/modules/operationsLocalization";

export const createRoleSchema = z.object({
  name: z.string().trim().min(2, lt("Role name must contain at least 2 characters")).max(100),
  description: z.string().trim().max(300).optional().or(z.literal(""))
});

export const editRoleSchema = createRoleSchema.extend({
  isSystemRole: z.boolean()
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
export type EditRoleFormValues = z.infer<typeof editRoleSchema>;
