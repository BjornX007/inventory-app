import { verifyOneTimeKey } from "../../../lib/auth/oneTimeKeyStore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { key } = req.body;
  const valid = verifyOneTimeKey(key);

  return res.json({ valid });
}
