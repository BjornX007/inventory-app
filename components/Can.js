import { getCurrentUser, hasPermission } from "@/lib/auth"

export default async function Can({ permission, children }) {
  const user = await getCurrentUser()

  if (!hasPermission(user, permission)) {
    return null
  }

  return children
}
