// src/utils/permissionStorage.ts
const PERMISSION_KEY = "notification_permission_status";
const EXPIRY_DAYS = 1000 * 60 * 60 * 24 * 30; //
;

interface PermissionData {
  status: NotificationPermission;
  timestamp: number;
}

/**
 * Save the user's notification permission status with a timestamp
 */
export function savePermissionStatus(status: NotificationPermission): void {
  const data: PermissionData = { status, timestamp: Date.now() };
  localStorage.setItem(PERMISSION_KEY, JSON.stringify(data));
}

/**
 * Retrieve saved permission status if still valid (not expired)
 */
export function getPermissionStatus(): NotificationPermission | null {
  const data = localStorage.getItem(PERMISSION_KEY);
  if (!data) return null;

  try {
    const { status, timestamp }: PermissionData = JSON.parse(data);
    const now = Date.now();
    const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (now - timestamp > expiryMs) {
      localStorage.removeItem(PERMISSION_KEY);
      return null;
    }

    return status;
  } catch {
    localStorage.removeItem(PERMISSION_KEY);
    return null;
  }
}
