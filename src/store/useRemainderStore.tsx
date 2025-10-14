import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { toast } from "@/hooks/use-toast";

export interface Reminder {
  id: string;
  lectureId: string;
  reminderTime: string; // ISO string
  message: string;
  userId: string;
  notified?: boolean;
  vibrating?: boolean;
}

interface ReminderState {
  reminders: Reminder[];
  addReminder: (data: Omit<Reminder, "id" | "notified" | "vibrating">) => Reminder;
  deleteReminder: (id: string) => void;
  clearReminders: () => void;
  cleanupExpiredReminders: () => void;
  markAsNotified: (id: string) => void;
  scheduleCleanup: () => void;

  triggerVibration: (pattern?: number[]) => void;
  triggerNotification: (message: string) => void;
  scheduleVibrationForReminder: (reminderId: string) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (data) => {
        const reminders = get().reminders;
        const isoTime = new Date(data.reminderTime).toISOString();

        // Prevent duplicates
        const existing = reminders.find(
          (r) =>
            r.lectureId === data.lectureId &&
            r.reminderTime === isoTime &&
            r.userId === data.userId
        );
        if (existing) return existing;

        const newReminder: Reminder = {
          id: nanoid(),
          reminderTime: isoTime,
          notified: false,
          ...data,
        };

        set((state) => ({ reminders: [...state.reminders, newReminder] }));

        // Schedule vibration + notification for this reminder
        setTimeout(() => get().scheduleVibrationForReminder(newReminder.id), 0);

        return newReminder;
      },

      deleteReminder: (id) =>
        set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) })),

      clearReminders: () => set({ reminders: [] }),

      cleanupExpiredReminders: () => {
        const now = Date.now();
        const TEN_MINUTES = 10 * 60 * 1000;
        set((state) => ({
          reminders: state.reminders.filter(
            (r) => now - new Date(r.reminderTime).getTime() < TEN_MINUTES
          ),
        }));
      },

      markAsNotified: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, notified: true, vibrating: false } : r
          ),
        })),

      triggerVibration: (pattern = [300, 150, 300]) => {
        if ("vibrate" in navigator) {
          navigator.vibrate(pattern);
        }
      },

      triggerNotification: (message) => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Lecture Reminder", { body: message });
        }
        toast.info("Reminder", message);
      },

      scheduleVibrationForReminder: (reminderId) => {
        const reminder = get().reminders.find((r) => r.id === reminderId);
        if (!reminder || reminder.notified) return;

        const now = Date.now();
        const reminderTime = new Date(reminder.reminderTime).getTime();
        const diff = reminderTime - now;

        if (diff <= 0) {
          // Already due → notify immediately
          get().triggerVibration([400, 200, 400]);
          get().triggerNotification(reminder.message);
          get().markAsNotified(reminderId);
          return;
        }

        const TEN_MINUTES = 10 * 60 * 1000;

        if (diff <= TEN_MINUTES) {
          // Vibrate every 2 minutes until reminder
          const interval = setInterval(() => {
            const r = get().reminders.find((r) => r.id === reminderId);
            if (!r?.notified) get().triggerVibration([200, 100, 200]);
            else clearInterval(interval);
          }, 2 * 60 * 1000);

          // Final trigger at exact reminder time
          setTimeout(() => {
            clearInterval(interval);
            get().triggerVibration([400, 200, 400]);
            get().triggerNotification(reminder.message);
            get().markAsNotified(reminderId);
          }, diff);
        } else {
          // Schedule closer to 10 mins before
          setTimeout(() => get().scheduleVibrationForReminder(reminderId), diff - TEN_MINUTES);
        }
      },

      scheduleCleanup: () => {
        const interval = setInterval(() => get().cleanupExpiredReminders(), 5 * 60 * 1000);
        return () => clearInterval(interval);
      },
    }),
    {
      name: "reminder-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.cleanupExpiredReminders();
          state.scheduleCleanup();

          // Schedule vibrations + notifications for unnotified reminders
          state.reminders.forEach((r) => {
            if (!r.notified) state.scheduleVibrationForReminder(r.id);
          });
        }
      },
    }
  )
);
