import { z } from "zod";

export const registerSchema = z.object({
  fullname: z
    .string({ required_error: "Full name is required." })
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name is too long."),
  matricNumber: z
    .string({ required_error: "Matric number is required." })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,4}\/\d{2}\/\d{3,4}$/, "Invalid matric number. Format: EES/20/001"),
  email: z
    .union([z.string().email("Invalid email address."), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  password: z
    .string({ required_error: "Password is required." })
    .min(6, "Password must be at least 6 characters.")
    .max(72, "Password is too long."),
});

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Email or matric number is required." })
    .trim()
    .min(1, "Email or matric number is required."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

export const becomeOrganizerSchema = z.object({
  organizationName: z.string().trim().max(100).optional(),
  description: z.string().trim().max(500).optional(),
  socialHandle: z.string().trim().max(50).optional(),
});