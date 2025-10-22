import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import "aos/dist/aos.css";

import ToastContainer from './components/ui/ToastContainer';

//pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import NotFound from './pages/NotFound'

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Landing/>
        },
        {
            path:'/auth',
            element:<Auth/>
        },
         {
            path:'/admin-dashboard',
            element:<AdminDashboard/>
        },
        {
            path:'/lecturer-dashboard',
            element:<LecturerDashboard/>
        },
        {
            path:'/student-dashboard',
            element:<StudentDashboard/>
        },
        {
            path:'*',
            element:<NotFound/>
        }

    ]
)

createRoot(document.getElementById("root")!).render(
    <>
        <RouterProvider router={router} />
        <ToastContainer />
    </>
);
