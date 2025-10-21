import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useUserStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { FiMail, FiLock, FiBook } from "react-icons/fi";
import gsap from "gsap";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "lecturer" | "admin" | "">("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  // Redirect when user is logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "lecturer":
          navigate("/lecturer-dashboard");
          break;
        default:
          navigate("/student-dashboard");
      }
    }
  }, [user, navigate]);

  // GSAP animations
  useEffect(() => {
    gsap.fromTo(
      ".auth-card",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
    gsap.fromTo(
      ".auth-icon",
      { scale: 0 },
      { scale: 1, duration: 0.5, delay: 0.3, ease: "back.out(1.7)" }
    );
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) return toast.error("Please fill in all fields");
    if (!isLogin && !role) return toast.error("Please select a role");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", userCred.user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        setUser({
          uid: userCred.user.uid,
          email: userCred.user.email || "",
          name: userData?.name || "",
          role: userData?.role || "",
        });

        toast.success("Logged in successfully");
      } else {
        // Sign up
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCred.user;

        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email,
          role,
          createdAt: new Date().toISOString(),
        });

        setUser({
          uid: newUser.uid,
          email: newUser.email || "",
          role,
        });

        toast.success("Account created successfully");
      }
    } catch (error: any) {
      let errorMessage = "An error occurred";
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password";
          break;
        case "auth/email-already-in-use":
          errorMessage = "Email already in use";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    gsap.fromTo(
      ".auth-form",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.3 }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="auth-card w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="auth-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-black to-gray-700 flex items-center justify-center mb-4 shadow-lg">
            <FiBook className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lecture Reminder</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form space-y-4">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700"
              disabled={loading}
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                Select Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "lecturer" | "admin" | "")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-gray-900"
                disabled={loading}
              >
                <option value="">Choose Role</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-md disabled:opacity-60"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            disabled={loading}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
