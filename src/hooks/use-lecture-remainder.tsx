// src/hooks/useLectureReminders.ts
import { useEffect } from "react";
import { useReminderStore } from "@/store/useRemainderStore";
import { toast } from "@/hooks/use-toast";

export function useLectureReminders(
  lectures: any[] = [],
  userId?: string,
  reminderMinutes: number = 10
) {
  const {
    reminders,
    addReminder,
    deleteReminder,
    markAsNotified,
    cleanupExpiredReminders,
  } = useReminderStore();

  // 🧠 Ask for Notification Permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 🧩 Create reminders from lectures
  useEffect(() => {
    if (!lectures.length || !userId) return;

    const now = new Date();

    lectures.forEach((lecture) => {
      const lectureTime = new Date(`${lecture.date} ${lecture.time}`);
      const reminderTime = new Date(
        lectureTime.getTime() - reminderMinutes * 60 * 1000
      );

      // Only schedule future reminders
      if (reminderTime > now) {
        addReminder({
          lectureId: lecture.id,
          reminderTime: reminderTime.toISOString(),
          message: `Your lecture "${lecture.title}" starts soon!`,
          userId,
        });
      }
    });

    cleanupExpiredReminders();
  }, [lectures, userId, reminderMinutes, addReminder, cleanupExpiredReminders]);

  // ⏰ Schedule notification + pre-vibration
  useEffect(() => {
    if (!reminders.length) return;

    const now = new Date();

    const timers = reminders.map((r) => {
      const reminderTime = new Date(r.reminderTime);
      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      // Skip old or already notified ones
      if (timeUntilReminder <= 0 || r.notified) return null;

      // 🌀 Start gentle vibration loop 5–10 minutes before
      const preAlertStart = reminderTime.getTime() - 10 * 60 * 1000; // 10 min before
      const preAlertEnd = reminderTime.getTime() - 5 * 60 * 1000; // 5 min before

      if (now.getTime() < preAlertEnd) {
        const delayUntilPreAlert = preAlertStart - now.getTime();
        if (delayUntilPreAlert > 0) {
          setTimeout(() => {
            const intervalId = setInterval(() => {
              if (navigator.vibrate) {
                navigator.vibrate([300, 150, 300]);
              }
            }, 60_000); // every minute

            // Stop after 5 minutes
            setTimeout(() => clearInterval(intervalId), 5 * 60 * 1000);
          }, delayUntilPreAlert);
        }
      }

      // 🛎️ Final reminder
      const mainTimer = setTimeout(() => {
        triggerReminder(r);
        markAsNotified(r.id);
        deleteReminder(r.id);
      }, timeUntilReminder);

      return mainTimer;
    });

    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [reminders, markAsNotified, deleteReminder]);
}

// 🔔 Handles actual alert logic
function triggerReminder(reminder: any) {
  // Desktop notification
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Lecture Reminder", {
      body: reminder.message,
      icon: "/lecture-icon.png",
    });
  }

  // Vibrate pattern
  if (navigator.vibrate) {
    navigator.vibrate([500, 200, 500, 200, 500]);
  }

  // Play sound
  const audio = new Audio("/alert.mp3");
  audio.play().catch(() => {
    console.warn("Sound requires user interaction first.");
  });

  // Toast fallback
  toast.info("Reminder Active", reminder.message);
}
