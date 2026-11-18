import { z } from "zod";

const coordinateSchema = z.object({
  lat: z.number().min(-90, "Invalid latitude.").max(90, "Invalid latitude."),
  lng: z.number().min(-180, "Invalid longitude.").max(180, "Invalid longitude."),
});

export const getRouteSchema = z.object({
  from: coordinateSchema,
  eventId: z
    .string({ required_error: "Event ID is required." })
    .regex(/^[0-9a-f]{24}$/i, "Invalid event ID."),
});

export const getRouteToVenueSchema = z.object({
  from: coordinateSchema,
  venueId: z
    .string({ required_error: "Venue ID is required." })
    .regex(/^[0-9a-f]{24}$/i, "Invalid venue ID."),
});