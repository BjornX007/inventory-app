// pages/api/auth/users/list.js
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const users = await User.find().lean();

    return res.json({ users });
  } catch (error) {
    console.error("list error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
