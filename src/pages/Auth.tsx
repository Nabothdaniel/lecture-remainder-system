import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/firebase/index';
import { useUserStore } from '@/store/useUserStore';
import { toast } from '@/hooks/use-toast';
import { FiMail, FiLock, FiBook } from 'react-icons/fi';
import gsap from 'gsap';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useUserStore();

  useEffect(() => {
    if (user) navigate('/dashboard');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) navigate('/dashboard');
    });

    return () => unsubscribe();
  }, [user, navigate, setUser]);

  useEffect(() => {
    gsap.fromTo(
      '.auth-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    gsap.fromTo(
      '.auth-icon',
      { scale: 0 },
      { scale: 1, duration: 0.5, delay: 0.3, ease: 'back.out(1.7)' }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
  
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('logged in successfully');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully');

      }
      navigate('/dashboard');
    } catch (error: any) {
      let errorMessage = 'An error occurred';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }

      toast.error('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    gsap.fromTo(
      '.auth-form',
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
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form space-y-4">
          {/* Email Field */}
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

          {/* Password Field */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-md disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            disabled={loading}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
