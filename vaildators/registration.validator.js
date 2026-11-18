import { z } from "zod";

export const registerForEventSchema = z.object({
  eventId: z
    .string({ required_error: "Event ID is required." })
    .regex(/^[0-9a-f]{24}$/i, "Invalid event ID."),
});

export const cancelRegistrationSchema = z.object({
  eventId: z
    .string({ required_error: "Event ID is required." })
    .regex(/^[0-9a-f]{24}$/i, "Invalid event ID."),
});

export const checkInSchema = z.object({
  ticketCode: z
    .string({ required_error: "Ticket code is required." })
    .trim()
    .min(5, "Invalid ticket code."),
});