import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
      default: "registered",
    },
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate registration (one user per event)
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Generate ticket code before save
registrationSchema.pre("save", function (next) {
  if (!this.ticketCode) {
    this.ticketCode = `OAU-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
  }
  next();
});

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;