// /models/InviteToken.js
import mongoose from "mongoose";

const InviteTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  role: { type: String, enum: ["admin", "user"], required: true },
  employeeName: { type: String, required: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => Date.now() + 1000 * 60 * 60 * 24 } // 24 hours
});

export default mongoose.models.InviteToken ||
  mongoose.model("InviteToken", InviteTokenSchema);
