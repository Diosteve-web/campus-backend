import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.enum(["student", "organizer", "admin"], {
    errorMap: () => ({ message: "Role must be student, organizer, or admin." }),
  }),
});

export const banUserSchema = z.object({
  banned: z.boolean({ required_error: "Banned status is required." }),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(["student", "organizer", "admin"]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});