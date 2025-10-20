import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  name: string;
  code: string;
  faculty: string;
  lecturerId: string;
  lecturerName: string;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  assignedCourses: string[];
}

export interface Reminder {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  time: string;
  topic: string;
  notes?: string;
}

interface CourseState {
  courses: Course[];
  lecturers: Lecturer[];
  reminders: Reminder[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addLecturer: (lecturer: Omit<Lecturer, 'id'>) => void;
  updateLecturer: (id: string, lecturer: Partial<Lecturer>) => void;
  deleteLecturer: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      courses: [],
      lecturers: [],
      reminders: [],
      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, { ...course, id: Date.now().toString() }],
        })),
      updateCourse: (id, updatedCourse) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...updatedCourse } : c
          ),
        })),
      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),
      addLecturer: (lecturer) =>
        set((state) => ({
          lecturers: [
            ...state.lecturers,
            { ...lecturer, id: Date.now().toString() },
          ],
        })),
      updateLecturer: (id, updatedLecturer) =>
        set((state) => ({
          lecturers: state.lecturers.map((l) =>
            l.id === id ? { ...l, ...updatedLecturer } : l
          ),
        })),
      deleteLecturer: (id) =>
        set((state) => ({
          lecturers: state.lecturers.filter((l) => l.id !== id),
        })),
      addReminder: (reminder) =>
        set((state) => ({
          reminders: [
            ...state.reminders,
            { ...reminder, id: Date.now().toString() },
          ],
        })),
      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'course-storage',
    }
  )
);