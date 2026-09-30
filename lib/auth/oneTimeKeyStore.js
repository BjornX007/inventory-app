let activeKey = null;

export function generateOneTimeKey() {
  const key = crypto.randomUUID(); // secure random key
  activeKey = key;
  return key;
}

export function verifyOneTimeKey(key) {
  if (key === activeKey) {
    activeKey = null; // Invalidate after use
    return true;
  }
  return false;
}
