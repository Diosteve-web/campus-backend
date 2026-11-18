import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z
      .string({ required_error: "Event title is required." })
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(150, "Title is too long."),
    description: z
      .string({ required_error: "Description is required." })
      .trim()
      .min(10, "Description must be at least 10 characters.")
      .max(5000, "Description is too long."),
    category: z
      .enum(["tech", "academic", "social", "sports", "cultural", "religious", "other"])
      .default("other"),
    venue: z
      .string({ required_error: "Venue is required." })
      .regex(/^[0-9a-f]{24}$/i, "Invalid venue ID."),
    startTime: z.coerce.date({ required_error: "Start time is required." }),
    endTime: z.coerce.date({ required_error: "End time is required." }),
    capacity: z.number().int().positive().nullable().optional(),
    coverImage: z.string().url("Invalid image URL.").nullable().optional(),
    tags: z.array(z.string().trim().max(30)).max(10).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export const updateEventSchema = createEventSchema.partial();

export const listEventsQuerySchema = z.object({
  category: z
    .enum(["tech", "academic", "social", "sports", "cultural", "religious", "other"])
    .optional(),
  upcoming: z.enum(["true", "false"]).optional(),
  search: z.string().trim().optional(),
});