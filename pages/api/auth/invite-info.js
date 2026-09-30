import { getInviteInfo } from "../../../lib/auth/inviteTokenManager";

export default function handler(req, res) {
  const { token } = req.query;

  const data = getInviteInfo(token);

  if (!data)
    return res.json({ success: false });

  return res.json({
    success: true,
    role: data.role,
  });
}
