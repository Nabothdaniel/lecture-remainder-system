import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export type UserRole = "student" | "lecturer" | "admin";

export interface ExtendedUser {
  uid: string;
  email: string;
  name?: string;
  role?: UserRole | "";
}

interface UserState {
  user: ExtendedUser | null;
  loading: boolean;
  setUser: (user: ExtendedUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initAuth: () => void;
  createLecturer: (lecturer: {
    name: string;
    email: string;
    faculty: string;
    department: string;
  }) => Promise<string>;
}

const generatePassword = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const createUserState: StateCreator<UserState> = (set, get) => {
  const initAuth = () => {
    if ((window as any)._authListenerInitialized) return;
    (window as any)._authListenerInitialized = true;

    if (!get().user) set({ loading: true });

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(docRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: userData?.name || "",
              role: (userData?.role as UserRole) || "",
            },
            loading: false,
          });
        } catch (error) {
          console.error("❌ Failed to fetch user data:", error);
          set({ user: null, loading: false });
          toast.error("Failed to load user data");
        }
      } else {
        // ✅ User is fully signed out
        set({ user: null, loading: false });
        localStorage.removeItem("user-storage"); // clear persisted user
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
      }
    });
  };

  const logout = async () => {
    try {
      set({ loading: true });
      await signOut(auth);
      set({ user: null, loading: false });
      localStorage.removeItem("user-storage"); // 🧹 remove persisted data immediately
      toast.success("Logged out successfully");
      window.location.href = "/auth";
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
      set({ loading: false });
    }
  };

  const createLecturer = async (lecturer: {
    name: string;
    email: string;
    faculty: string;
    department: string;
  }): Promise<string> => {
    const password = generatePassword();

    try {
      const cred = await createUserWithEmailAndPassword(auth, lecturer.email, password);

      await setDoc(doc(db, "lecturers", cred.user.uid), {
        ...lecturer,
        role: "lecturer",
        uid: cred.user.uid,
      });

      await setDoc(doc(db, "users", cred.user.uid), {
        name: lecturer.name,
        email: lecturer.email,
        role: "lecturer",
        uid: cred.user.uid,
      });

      await navigator.clipboard.writeText(password);
      toast.success("Lecturer created successfully! Password copied to clipboard.");
      return password;
    } catch (err: any) {
      console.error("Failed to create lecturer:", err);
      toast.error("Failed to create lecturer");
      throw new Error(err.message || "Failed to create lecturer");
    }
  };

  return {
    user: null,
    loading: true,
    setUser: (user) => set({ user, loading: false }),
    setLoading: (loading) => set({ loading }),
    logout,
    initAuth,
    createLecturer,
  };
};

export const useUserStore = create<UserState>()(
  persist(createUserState, {
    name: "user-storage",
    partialize: (state) => ({ user: state.user }),
    onRehydrateStorage: () => (state) => {
      if (state) state.setLoading(false);
    },
  })
);
