import { create } from "zustand";
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, secondaryAuth } from "@/firebase";
import { useUserStore, ExtendedUser } from "./authStore";

// ─────────────────────────────
// Types
// ─────────────────────────────
export interface Course {
  id: string;
  name: string;
  code: string;
  faculty: string;
  department: string;
  lecturerId: string;
  lecturerName: string;
  createdBy?: string;
  createdAt?: Timestamp;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  password?: string;
  faculty: string;
  department: string;
  assignedCourses: string[];
  uid?: string;
  role?: "lecturer";
  createdBy?: string;
  createdAt?: Timestamp;
}

export interface Reminder {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  time: string;
  topic: string;
  notes?: string;
  createdAt?: Timestamp;
}

// ─────────────────────────────
// Helper: Get Current User
// ─────────────────────────────
const getCurrentUser = (): ExtendedUser => {
  const { user, loading } = useUserStore.getState();
  if (loading) throw new Error("User is still loading");
  if (!user) throw new Error("User not logged in");
  return user;
};

// ─────────────────────────────
// Zustand Store
// ─────────────────────────────
interface CourseState {
  courses: Course[];
  lecturers: Lecturer[];
  reminders: Reminder[];
  loading: boolean;
  error: string | null;

  // Sync
  initSync: (forLecturer?: boolean) => () => void;

  // Course CRUD
  addCourse: (course: Omit<Course, "id">) => Promise<boolean>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;

  // Lecturer CRUD (admin only)
  addLecturer: (lecturer: Omit<Lecturer, "id">) => Promise<boolean>;
  updateLecturer: (id: string, lecturer: Partial<Lecturer>) => Promise<boolean>;
  deleteLecturer: (id: string) => Promise<boolean>;

  // Reminders
  addReminder: (reminder: Omit<Reminder, "id">) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  lecturers: [],
  reminders: [],
  loading: false,
  error: null,

  // ─────────────────────────────
  // Firestore Sync
  // ─────────────────────────────
  initSync: (forLecturer = false) => {
    set({ loading: true });
    const currentUser = getCurrentUser();

    // Lecturer sees only their courses
    const courseRef = forLecturer
      ? query(collection(db, "courses"), where("lecturerId", "==", currentUser.uid))
      : collection(db, "courses");

    const unsubCourses = onSnapshot(
      courseRef,
      (snapshot) => {
        const courseList: Course[] = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            } as Course)
        );
        set({ courses: courseList, loading: false });
      },
      (error) => {
        console.error("Courses snapshot error:", error);
        set({ error: error.message, loading: false });
      }
    );

    // Admins only
    const unsubLecturers = forLecturer
      ? () => {}
      : onSnapshot(
          collection(db, "lecturers"),
          (snapshot) => {
            const lecturerList: Lecturer[] = snapshot.docs.map(
              (docSnap) =>
                ({
                  id: docSnap.id,
                  ...docSnap.data(),
                } as Lecturer)
            );
            set({ lecturers: lecturerList });
          },
          (error) => {
            console.error("Lecturers snapshot error:", error);
            set({ error: error.message });
          }
        );

    // Shared reminders
    const unsubReminders = onSnapshot(
      collection(db, "reminders"),
      (snapshot) => {
        const reminderList: Reminder[] = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            } as Reminder)
        );
        set({ reminders: reminderList });
      },
      (error) => {
        console.error("Reminders snapshot error:", error);
        set({ error: error.message });
      }
    );

    return () => {
      unsubCourses();
      unsubLecturers();
      unsubReminders();
      set({ loading: false });
    };
  },

  // ─────────────────────────────
  // COURSE CRUD
  // ─────────────────────────────
  addCourse: async (course) => {
    try {
      const user = getCurrentUser();
      await addDoc(collection(db, "courses"), {
        ...course,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error: any) {
      console.error("Add course error:", error);
      set({ error: error.message });
      return false;
    }
  },

  updateCourse: async (id, course) => {
    try {
      await updateDoc(doc(db, "courses", id), course);
      return true;
    } catch (error: any) {
      console.error("Update course error:", error);
      set({ error: error.message });
      return false;
    }
  },

  deleteCourse: async (id) => {
    try {
      await deleteDoc(doc(db, "courses", id));
      return true;
    } catch (error: any) {
      console.error("Delete course error:", error);
      set({ error: error.message });
      return false;
    }
  },

  // ─────────────────────────────
  // LECTURERS CRUD (Admin)
  // ─────────────────────────────
  addLecturer: async (lecturer) => {
    try {
      const currentUser = getCurrentUser();

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        lecturer.email,
        lecturer.password!
      );
      const firebaseUid = userCredential.user.uid;

      await addDoc(collection(db, "lecturers"), {
        ...lecturer,
        uid: firebaseUid,
        role: "lecturer",
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "users", firebaseUid), {
        name: lecturer.name,
        email: lecturer.email,
        role: "lecturer",
        uid: firebaseUid,
        createdAt: serverTimestamp(),
      });

      await secondaryAuth.signOut();

      return true;
    } catch (error: any) {
      console.error("Add lecturer error:", error);
      set({ error: error.message });
      return false;
    }
  },

  updateLecturer: async (id, lecturer) => {
    try {
      await updateDoc(doc(db, "lecturers", id), lecturer);
      return true;
    } catch (error: any) {
      console.error("Update lecturer error:", error);
      set({ error: error.message });
      return false;
    }
  },

  deleteLecturer: async (id) => {
    try {
      await deleteDoc(doc(db, "lecturers", id));
      return true;
    } catch (error: any) {
      console.error("Delete lecturer error:", error);
      set({ error: error.message });
      return false;
    }
  },

  // ─────────────────────────────
  // REMINDERS
  // ─────────────────────────────
  addReminder: async (reminder) => {
    try {
      await addDoc(collection(db, "reminders"), {
        ...reminder,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error: any) {
      console.error("Add reminder error:", error);
      set({ error: error.message });
      return false;
    }
  },

  deleteReminder: async (id) => {
    try {
      await deleteDoc(doc(db, "reminders", id));
      return true;
    } catch (error: any) {
      console.error("Delete reminder error:", error);
      set({ error: error.message });
      return false;
    }
  },
}));
