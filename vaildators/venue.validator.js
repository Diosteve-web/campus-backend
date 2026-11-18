import { z } from "zod";

export const createVenueSchema = z.object({
  name: z
    .string({ required_error: "Venue name is required." })
    .trim()
    .min(2, "Venue name must be at least 2 characters.")
    .max(150, "Venue name is too long."),
  category: z
    .enum([
      "lecture_hall",
      "event_center",
      "faculty",
      "library",
      "hostel",
      "cafeteria",
      "sports",
      "other",
    ])
    .default("other"),
  description: z.string().trim().max(500, "Description is too long.").optional(),
  latitude: z
    .number({ required_error: "Latitude is required." })
    .min(-90, "Latitude must be between -90 and 90.")
    .max(90, "Latitude must be between -90 and 90."),
  longitude: z
    .number({ required_error: "Longitude is required." })
    .min(-180, "Longitude must be between -180 and 180.")
    .max(180, "Longitude must be between -180 and 180."),
});

export const searchPlacesQuerySchema = z.object({
  q: z
    .string({ required_error: "Search query is required." })
    .trim()
    .min(3, "Search query must be at least 3 characters."),
});