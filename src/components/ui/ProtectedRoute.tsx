// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: ("student" | "lecturer" | "admin")[];
  redirectTo?: string;
}

const ProtectedRoute = ({ allowedRoles, redirectTo = "/auth" }: ProtectedRouteProps) => {
  const { user, loading } = useUserStore();

  // ⚡ Instant check: if persisted user exists, skip long "loading" screen
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 animate-pulse">
        Loading...
      </div>
    );
  }

  // ❌ No user logged in → redirect to auth page
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // 🚫 Role not authorized → redirect to not-found page
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <Navigate to="/not-found" replace />;
  }

  // ✅ User authorized → render children
  return <Outlet />;
};

export default ProtectedRoute;
