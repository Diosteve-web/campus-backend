import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string({ required_error: "Group name is required." })
    .trim()
    .min(2, "Group name must be at least 2 characters.")
    .max(100, "Group name is too long."),
  eventId: z
    .string({ required_error: "Event ID is required." })
    .regex(/^[0-9a-f]{24}$/i, "Invalid event ID."),
});

export const sendMessageSchema = z.object({
  content: z
    .string({ required_error: "Message content is required." })
    .trim()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message is too long."),
  type: z.enum(["text", "announcement", "system"]).default("text"),
  expiryHours: z
    .number()
    .int()
    .min(1, "Expiry must be at least 1 hour.")
    .max(168, "Expiry cannot exceed 168 hours (7 days).")
    .default(24),
});

export const listMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
});