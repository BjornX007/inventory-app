import crypto from "crypto";

const inviteStore = {}; // { token: { role, createdAt } }

export function createInviteToken(role) {
  const token = crypto.randomBytes(20).toString("hex");

  inviteStore[token] = {
    role,
    createdAt: Date.now(),
  };

  return token;
}

export function getInviteInfo(token) {
  return inviteStore[token] || null;
}

export function useInviteToken(token) {
  const info = inviteStore[token];
  if (!info) return null;

  delete inviteStore[token]; // one-time
  return info;
}
