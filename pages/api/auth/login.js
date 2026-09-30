import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });
  }

  await dbConnect();

  const { username, password } = req.body;

  if (!username || password === undefined) {
    return res.status(400).json({ message: "MISSING_FIELDS" });
  }

  const normalizedUsername = String(username).trim();

  const user = await User.findOne({ username: normalizedUsername });

  if (!user) {
    console.log("USER NOT FOUND FOR:", normalizedUsername);
    return res.status(401).json({ message: "INVALID_CREDENTIALS" });
  }

  // 🔍 DEBUG LOGS — MUST BE HERE
  console.log("RAW BODY:", req.body);
  console.log("PASSWORD TYPE:", typeof password);
  console.log("PASSWORD VALUE:", password);
  console.log("DB PASSWORD TYPE:", typeof user.password);
  console.log("DB PASSWORD VALUE:", user.password);

  if (String(user.password) !== String(password)) {
    console.log("COMPARE FAILED");
    return res.status(401).json({ message: "INVALID_CREDENTIALS" });
  }
res.setHeader(
  "Set-Cookie",
  `userId=${user._id}; Path=/; HttpOnly; SameSite=Lax`
);

  console.log("COMPARE OK");

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  });
}
