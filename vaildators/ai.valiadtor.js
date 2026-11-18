import { z } from "zod";

export const aiSearchSchema = z.object({
  query: z
    .string({ required_error: "Search query is required." })
    .trim()
    .min(3, "Search query must be at least 3 characters.")
    .max(300, "Search query is too long."),
});

export const aiDescribeSchema = z.object({
  title: z
    .string({ required_error: "Event title is required." })
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(150, "Title is too long."),
  notes: z
    .string({ required_error: "Organizer notes are required." })
    .trim()
    .min(5, "Notes must be at least 5 characters.")
    .max(1000, "Notes are too long."),
  category: z
    .enum(["tech", "academic", "social", "sports", "cultural", "religious", "other"])
    .default("other"),
  venueName: z.string().trim().max(150).optional(),
});