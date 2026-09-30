import dbConnect from "../../../../lib/mongodb";
import InviteToken from "../../../../models/InviteToken";

export default async function handler(req, res) {
  await dbConnect();

  const { token } = req.query;

  const invite = await InviteToken.findOne({ token, used: false });

  return res.json({ valid: !!invite });
}
