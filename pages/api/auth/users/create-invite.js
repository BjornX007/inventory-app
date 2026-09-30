import dbConnect from "../../../../lib/mongodb";
import InviteToken from "../../../../models/InviteToken";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { employeeName, role } = req.body;
    if (!employeeName || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const token = crypto.randomBytes(24).toString("hex");

    await InviteToken.create({
      token,
      employeeName,
      role,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    });

    return res.status(200).json({ token });
  } catch (e) {
    console.error("create-invite error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
