import { useInviteToken } from "../../../lib/auth/inviteTokenManager";
import db from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false });

  const { username, password, role, token } = req.body;

  if (!username || password === undefined) {
    return res.json({
      success: false,
      message: "Missing fields",
    });
  }

  let finalRole = role;

  // If registration from TOKEN
  if (token) {
    const info = useInviteToken(token);
    if (!info)
      return res.json({
        success: false,
        message: "Invalid or used invite",
      });

    finalRole = info.role;
  }

  if (!finalRole)
    return res.json({
      success: false,
      message: "Missing role",
    });

 const newUser = await db.user.create({
  username: username.trim(),        // ✅ keep original casing
  password: String(password),       // password is case-sensitive
  role: finalRole,
});


  return res.json({
    success: true,
    role: newUser.role,
  });
}
