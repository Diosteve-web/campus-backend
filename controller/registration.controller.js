import Registration from "../models/Registration.model.js";
import Event from "../models/Event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, "Event not found.");
  if (event.isCancelled) throw new ApiError(400, "This event has been cancelled.");

  const existing = await Registration.findOne({ event: event._id, user: req.user.id });
  if (existing) throw new ApiError(409, "You are already registered for this event.");

  if (event.capacity && event.registrationCount >= event.capacity) {
    throw new ApiError(400, "This event is full.");
  }

  const registration = await Registration.create({ event: event._id, user: req.user.id });

  event.registrationCount += 1;
  await event.save();

  res.status(201).json({
    success: true,
    message: "Registered successfully!",
    data: { registration },
  });
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({ event: req.params.eventId, user: req.user.id });
  if (!registration) throw new ApiError(404, "Registration not found.");

  registration.status = "cancelled";
  await registration.save();

  await Event.findByIdAndUpdate(req.params.eventId, { $inc: { registrationCount: -1 } });

  res.json({ success: true, message: "Registration cancelled." });
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user.id, status: "registered" })
    .populate({
      path: "event",
      populate: [
        { path: "venue", select: "name category location" },
        { path: "organizer", select: "fullname" },
      ],
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: registrations.length, data: { registrations } });
});

export const getEventAttendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, "Event not found.");

  const isOwner = event.organizer.toString() === req.user.id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) throw new ApiError(403, "You can only see attendees of your own events.");

  const attendees = await Registration.find({ event: event._id, status: "registered" })
    .populate("user", "fullname matricNumber email")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: attendees.length, data: { attendees } });
});