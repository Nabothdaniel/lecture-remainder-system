import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Lecture {
  id: string;
  title: string;
  courseCode: string;
  lecturer: string;
  date: string;
  time: string;
  location: string;
  userId: string;
  createdAt: Date;
}

interface LectureState {
  lectures: Lecture[];
  setLectures: (lectures: Lecture[]) => void;
  addLecture: (lecture: Lecture) => void;
  updateLecture: (id: string, lecture: Partial<Lecture>) => void;
  deleteLecture: (id: string) => void;
  clearLectures: () => void;
}

export const useLectureStore = create<LectureState>()(
  persist(
    (set) => ({
      lectures: [],
      setLectures: (lectures) =>
        set((state) => {
          const uniqueLectures = lectures.filter(
            (l) => !state.lectures.some((existing) => existing.id === l.id)
          );
          return {
            lectures: [...state.lectures, ...uniqueLectures],
          };
        }),

      addLecture: (lecture) =>
        set((state) => {
          // Prevent duplicates by id
          const exists = state.lectures.some((l) => l.id === lecture.id);
          if (exists) return state; // ignore duplicate
          return {
            lectures: [...state.lectures, lecture],
          };
        }),

      updateLecture: (id, updatedLecture) =>
        set((state) => ({
          lectures: state.lectures.map((lecture) =>
            lecture.id === id ? { ...lecture, ...updatedLecture } : lecture
          ),
        })),
      deleteLecture: (id) =>
        set((state) => ({
          lectures: state.lectures.filter((lecture) => lecture.id !== id),
        })),
      clearLectures: () => set({ lectures: [] }),
    }),
    {
      name: 'lecture-storage',
    }
  )
);
