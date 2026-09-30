import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";
import InviteToken from "../../../../models/InviteToken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  await dbConnect();

  const { username, password, token } = req.body;

  if (!token) {
    return res.json({ success: false, message: "Missing invite token." });
  }

  const invite = await InviteToken.findOne({ token, used: false });

  if (!invite) {
    return res.json({
      success: false,
      message: "Invalid or expired invite token.",
    });
  }

  const user = await User.create({
    username,
    password,
    role: invite.role,
    employeeName: invite.employeeName || "",
  });

  invite.used = true;
  await invite.save();

  return res.json({ success: true });
}
