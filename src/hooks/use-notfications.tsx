// src/hooks/useNotifications.ts
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("Browser does not support notifications");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const showNotification = (title: string, body?: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/lecture-icon.png", // optional custom icon
      vibrate: [200, 100, 200],
    });
  }
};
