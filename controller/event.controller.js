import Event from "../models/Event.model.js";
import Venue from "../models/Venue.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, venue, startTime, endTime, capacity, coverImage, tags } = req.body;

  const venueExists = await Venue.findById(venue);
  if (!venueExists) throw new ApiError(400, "Invalid venue. Please select an existing venue.");

  const event = await Event.create({
    title, description, category, venue, startTime, endTime,
    capacity, coverImage, tags,
    organizer: req.user.id,
    isPublished: true,
  });

  await event.populate("venue", "name category location");
  await event.populate("organizer", "fullname");

  res.status(201).json({
    success: true,
    message: "Event created and published!",
    data: { event },
  });
});

export const listEvents = asyncHandler(async (req, res) => {
  const { category, upcoming, search } = req.query;
  const filter = { isPublished: true, isCancelled: false };

  if (category) filter.category = category;
  if (upcoming === "true") filter.startTime = { $gte: new Date() };
  if (search) filter.title = { $regex: search, $options: "i" };

  const events = await Event.find(filter)
    .populate("venue", "name category location")
    .populate("organizer", "fullname")
    .sort({ startTime: 1 })
    .limit(50);

  res.json({ success: true, count: events.length, data: { events } });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug, isPublished: true })
    .populate("venue", "name category location")
    .populate("organizer", "fullname email");

  if (!event) throw new ApiError(404, "Event not found.");
  res.json({ success: true, data: { event } });
});

export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user.id })
    .populate("venue", "name category")
    .sort({ startTime: -1 });

  res.json({ success: true, count: events.length, data: { events } });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found.");

  const isOwner = event.organizer.toString() === req.user.id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) throw new ApiError(403, "You can only edit your own events.");

  Object.assign(event, req.body);
  await event.save();

  res.json({ success: true, data: { event } });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found.");

  const isOwner = event.organizer.toString() === req.user.id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) throw new ApiError(403, "You can only delete your own events.");

  await event.deleteOne();
  res.json({ success: true, message: "Event deleted." });
});