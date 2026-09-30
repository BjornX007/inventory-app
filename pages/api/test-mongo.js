import { connectDB } from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    await connectDB();
    return res.status(200).json({ success: true, message: "✅ Mongo connection success" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "❌ Mongo connection failed",
      error: err.message,
    });
  }
}
