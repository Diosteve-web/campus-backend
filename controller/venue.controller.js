import Venue from "../models/Venue.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { searchPlaces } from "../services/geocoding.service.js";

export const listVenues = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = { isActive: true };
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const venues = await Venue.find(filter)
    .select("_id name category location isVerified")
    .sort({ isVerified: -1, name: 1 })
    .limit(50);

  res.json({ success: true, count: venues.length, data: { venues } });
});

export const createVenue = asyncHandler(async (req, res) => {
  const { name, category, description, latitude, longitude } = req.body;

  const existing = await Venue.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });
  if (existing) throw new ApiError(409, `A venue named "${name}" already exists.`);

  const venue = await Venue.create({
    name,
    category,
    description,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    createdBy: req.user.id,
    isVerified: req.user.role === "admin",
  });

  res.status(201).json({ success: true, message: "Venue created.", data: { venue } });
});

export const searchPlacesForVenue = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 3) {
    throw new ApiError(400, "Search query must be at least 3 characters.");
  }

  const results = await searchPlaces(q.trim());
  res.json({ success: true, count: results.length, data: { results } });
});