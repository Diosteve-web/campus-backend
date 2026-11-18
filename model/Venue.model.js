import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required."],
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      enum: ["lecture_hall", "event_center", "faculty", "library", "hostel", "cafeteria", "sports", "other"],
      default: "other",
    },
    description: { type: String, trim: true, maxlength: 500 },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

venueSchema.index({ location: "2dsphere" });
venueSchema.index({ name: "text" });

const Venue = mongoose.model("Venue", venueSchema);
export default Venue;