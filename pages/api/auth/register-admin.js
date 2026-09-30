// /api/auth/register-admin.js

import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });

  await dbConnect();

  const { username, password } = req.body;

  if (!username || password === undefined) {
    return res.status(400).json({ message: "MISSING_FIELDS" });
  }

  await User.create({
    username: String(username).trim(), // ✅ FIX
    password: String(password),                      // ✅ FIX
    role: "admin",
  });

  return res.status(200).json({ success: true });
}
