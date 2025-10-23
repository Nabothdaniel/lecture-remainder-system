// src/main.tsx (or index.tsx)
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "aos/dist/aos.css";

import ToastContainer from "./components/ui/ToastContainer";
import ProtectedRoute from "./components/ui/ProtectedRoute";

// pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },

  // ✅ Admin routes
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      { path: "/admin-dashboard", element: <AdminDashboard /> },
    ],
  },

  // ✅ Lecturer routes
  {
    element: <ProtectedRoute allowedRoles={["lecturer"]} />,
    children: [
      { path: "/lecturer-dashboard", element: <LecturerDashboard /> },
    ],
  },

  // ✅ Student routes
  {
    element: <ProtectedRoute allowedRoles={["student"]} />,
    children: [
      { path: "/student-dashboard", element: <StudentDashboard /> },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <>
    <RouterProvider router={router} />
    <ToastContainer />
  </>
);
