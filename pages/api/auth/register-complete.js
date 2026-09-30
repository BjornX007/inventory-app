import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/User";
import Invite from "../../../../models/Invite";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });

  await dbConnect();

  const { username, password, token } = req.body;

  if (!username || !password || !token) {
    return res.status(400).json({ message: "MISSING_FIELDS" });
  }

  const invite = await Invite.findOne({ token });

  if (!invite) {
    return res.status(401).json({ message: "INVALID_TOKEN" });
  }

  // Create real user
  await User.create({
    username: username.trim(),
    password: password.trim(),
    role: invite.role
  });

  // Delete invite (one-time use)
  await Invite.deleteOne({ token });

  res.json({ success: true, role: invite.role });
}
