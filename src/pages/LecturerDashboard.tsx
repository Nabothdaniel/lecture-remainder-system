import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiBook } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth, db } from "@/firebase";
import { useUserStore } from "../store/authStore";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  code: string;
  faculty: string;
  department: string;
  lecturerId: string;
  lecturerName: string;
}

const LecturerDashboard = () => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderForm, setReminderForm] = useState({
    date: "",
    time: "",
    topic: "",
    notes: "",
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // ✅ Fetch courses for the logged-in lecturer
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, "courses"),
          where("lecturerId", "==", user.uid) // ✅  field name
        );
        const querySnapshot = await getDocs(q);
        const coursesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Course),
        }));
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error('Failed to load courses.",');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.uid]);

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully.");
      navigate("/auth");
    } catch (err) {
      toast.error((err as Error).message);  
       
      console.error(err);
    }
  };

  // ✅ Create Reminder
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await addDoc(collection(db, "reminders"), {
        ...reminderForm,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        lecturerId: user?.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Reminder created successfully!");
      setReminderForm({ date: "", time: "", topic: "", notes: "" });
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast.error("Failed to create reminder.");
        
    }
  };

  // ✅ Loading state
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading your courses...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>

        {courses.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <FiBook className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-gray-800 text-lg">No courses assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-black p-3 rounded-lg">
                    <FiBook className="text-white text-xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.name}
                </h3>
                <p className="text-gray-600 text-sm mb-1">Code: {course.code}</p>
                <p className="text-gray-600 text-sm mb-4">
                  Faculty: {course.faculty}
                </p>
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Set Lecture Reminder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateReminder}
            className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Set Reminder for {selectedCourse.name}
            </h3>

            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
              value={reminderForm.date}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, date: e.target.value })
              }
              required
            />

            <input
              type="time"
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
              value={reminderForm.time}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, time: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Topic (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
              value={reminderForm.topic}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, topic: e.target.value })
              }
            />

            <textarea
              placeholder="Notes (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
              value={reminderForm.notes}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, notes: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;
