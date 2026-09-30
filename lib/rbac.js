import { PERMISSIONS } from "./permissions";

export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),

  user: [
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.LOG_VIEW,

    PERMISSIONS.STOCK_VIEW,

    PERMISSIONS.SETTINGS_ACCOUNTS,
    PERMISSIONS.SETTINGS_APPEARANCE,

    PERMISSIONS.OWN_DATA_ONLY,
  ],
};

export function resolvePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}
