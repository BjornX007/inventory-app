import { generateOneTimeKey } from "../../../lib/auth/oneTimeKeyStore";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const key = generateOneTimeKey();
  res.json({ key });
}
