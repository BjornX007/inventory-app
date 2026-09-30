import { resolvePermissions } from "./rbac"

export async function getCurrentUser() {
  // replace with real DB / auth later
  const userFromDb = {
    id: "42",
    role: "user",
  }

  return {
    ...userFromDb,
    permissions: resolvePermissions(userFromDb),
  }
}

export function hasPermission(user, permission) {
  return user.permissions.includes(permission)
}
