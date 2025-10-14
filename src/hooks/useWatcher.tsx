// src/store/useReminderStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

// 🕒 Reminder type
export interface Reminder {
  id: string;
  lectureId: string;
  reminderTime: string; // use ISO string for serialization
  message: string;
  userId: string;
  notified?: boolean;
}

interface ReminderState {
  reminders: Reminder[];
  addReminder: (data: Omit<Reminder, "id" | "notified">) => Reminder;
  deleteReminder: (id: string) => void;
  clearReminders: () => void;
  cleanupExpiredReminders: () => void;
  markAsNotified: (id: string) => void;
  scheduleCleanup: () => void;
}

// 🧠 Zustand Store
export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],

      // ➕ Add reminder with auto ID and safe serialization
      addReminder: (data) => {
        const newReminder: Reminder = {
          id: nanoid(),
          reminderTime: new Date(data.reminderTime).toISOString(),
          notified: false,
          ...data,
        };

        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));

        return newReminder;
      },

      // ❌ Delete a reminder by ID
      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),

      // 🧹 Remove all reminders
      clearReminders: () => set({ reminders: [] }),

      // 🕒 Remove expired reminders (older than 10 minutes)
      cleanupExpiredReminders: () => {
        const now = Date.now();
        const TEN_MINUTES = 10 * 60 * 1000;

        set((state) => ({
          reminders: state.reminders.filter(
            (r) => now - new Date(r.reminderTime).getTime() < TEN_MINUTES
          ),
        }));
      },

      // ✅ Mark reminder as notified (so you don’t re-trigger same one)
      markAsNotified: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, notified: true } : r
          ),
        })),

      // ⏰ Run cleanup automatically every 5 minutes
      scheduleCleanup: () => {
        const interval = setInterval(() => {
          get().cleanupExpiredReminders();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
      },
    }),
    {
      name: "reminder-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Run cleanup after rehydration
          state.cleanupExpiredReminders();
          state.scheduleCleanup();
        }
      },
    }
  )
);
