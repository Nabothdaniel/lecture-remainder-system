import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
  }) => Promise<string>; // returns generated password
}

// Utility to generate random password
const generatePassword = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// explicitly type StateCreator
const createUserState: StateCreator<UserState> = (set, get) => {
  const initAuth = () => {
    set({ loading: true });

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
          console.error("Failed to fetch user data:", error);
          set({ user: null, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
  };

  const logout = async () => {
    set({ loading: true });
    await signOut(auth);
    set({ user: null, loading: false });
  };

 const createLecturer = async (lecturer: {
    name: string;
    email: string;
    faculty: string;
    department: string;
  }): Promise<string> => {
    const password = generatePassword();

    try {
      // 1️⃣ Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, lecturer.email, password);

      // 2️⃣ Store lecturer in 'lecturers' collection (without password for security)
      await setDoc(doc(db, "lecturers", cred.user.uid), {
        ...lecturer,
        role: "lecturer",
        uid: cred.user.uid,
      });

      // 3️⃣ Store user info in 'users' collection (used by zustand store)
      await setDoc(doc(db, "users", cred.user.uid), {
        name: lecturer.name,
        email: lecturer.email,
        role: "lecturer",
        uid: cred.user.uid,
      });

      // 4️⃣ Copy password to clipboard for immediate use
      await navigator.clipboard.writeText(password);

      return password;
    } catch (err: any) {
      console.error("Failed to create lecturer:", err);
      throw new Error(err.message || "Failed to create lecturer");
    }
  };

  // call initAuth immediately to restore user on page reload
  initAuth();

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
  })
);
