import Group from "../models/Group.model.js";
import Message from "../models/Message.model.js";
import Event from "../models/Event.model.js";
import Registration from "../models/Registration.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// ─── POST /api/groups ───────────────────────────────────────────────────────
export const createGroup = asyncHandler(async (req, res) => {
  const { name, eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found.");

  // Only the event's organizer or admin can create its group
  const isOwner = event.organizer.toString() === req.user.id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Only the event organizer can create its group.");
  }

  // Check if a group already exists for this event
  const existing = await Group.findOne({ event: eventId });
  if (existing) {
    throw new ApiError(409, "A group already exists for this event.");
  }

  const group = await Group.create({
    name,
    event: eventId,
    createdBy: req.user.id,
    members: [req.user.id],
  });

  // Link group to event
  event.group = group._id;
  await event.save();

  res.status(201).json({
    success: true,
    message: "Group created.",
    data: { group },
  });
});

// ─── GET /api/groups/event/:eventId ─────────────────────────────────────────
export const getGroupByEvent = asyncHandler(async (req, res) => {
  const group = await Group.findOne({ event: req.params.eventId })
    .populate("members", "fullname matricNumber")
    .populate("createdBy", "fullname");

  if (!group) throw new ApiError(404, "No group for this event.");

  res.json({ success: true, data: { group } });
});

// ─── GET /api/groups/:id/messages ───────────────────────────────────────────
export const listMessages = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new ApiError(404, "Group not found.");

  // Must be a member
  const isMember = group.members.some(
    (m) => m.toString() === req.user.id.toString()
  );
  if (!isMember) throw new ApiError(403, "You are not a member of this group.");

  const { limit = 50 } = req.query;

  const messages = await Message.find({
    group: group._id,
    expiresAt: { $gt: new Date() }, // safety filter (TTL is eventual)
  })
    .populate("sender", "fullname role")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json({
    success: true,
    count: messages.length,
    data: { messages: messages.reverse() },
  });
});

// ─── POST /api/groups/:id/join ──────────────────────────────────────────────
export const joinGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new ApiError(404, "Group not found.");

  // Must be registered for the event
  const registration = await Registration.findOne({
    event: group.event,
    user: req.user.id,
    status: "registered",
  });
  if (!registration) {
    throw new ApiError(403, "You must register for the event to join its group.");
  }

  // Add to members if not already there
  if (!group.members.some((m) => m.toString() === req.user.id.toString())) {
    group.members.push(req.user.id);
    await group.save();
  }

  res.json({ success: true, message: "Joined group.", data: { group } });
});