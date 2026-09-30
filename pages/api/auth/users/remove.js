import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  try {
    await dbConnect();
    await User.findByIdAndDelete(req.query.id);
    return res.json({ success: true });
  } catch (e) {
    console.error("remove error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
