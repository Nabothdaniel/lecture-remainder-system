import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiBook, FiClock } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useUserStore } from "../store/authStore";
import { useCourseStore } from "../store/coursesStore";
import { toast } from "@/hooks/use-toast";

const LecturerDashboard = () => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // Zustand store
  const { courses, lectures, loading, initSync, addLecture } = useCourseStore();

  // Local state for lecture modal
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [lectureForm, setLectureForm] = useState({
    date: "",
    time: "",
  });

  // Sync courses + lectures for this lecturer
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = initSync(true); // true = fetch only this lecturer's courses/lectures
    return () => unsubscribe();
  }, [user?.uid, initSync]);

 const handleLogout = async () => {
  const { logout } = useUserStore.getState(); // Access Zustand logout directly
  await logout(); // Store handles toast + redirect
};

  // Create lecture
  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !user?.uid) return;

    const success = await addLecture({
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      lecturerId: user.uid,
      date: lectureForm.date,
      time: lectureForm.time,
    });

    if (success) {
      toast.success("Lecture time set successfully!");
      setLectureForm({ date: "", time: "" });
      setSelectedCourse(null);
    } else {
      toast.error("Failed to set lecture time.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading your courses...
      </div>
    );
  }

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
            {courses.map((course) => {
              // Check if lecture exists for this course
              const lecture = lectures.find(l => l.courseId === course.id);
              return (
                <div
                  key={course.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-black p-3 rounded-lg">
                      <FiBook className="text-white text-xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">Code: {course.code}</p>
                  <p className="text-gray-600 text-sm mb-2">Faculty: {course.faculty}</p>

                  {lecture ? (
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="text-gray-600" />
                      <span className="text-gray-800 text-sm">
                        Lecture: {lecture.date} at {lecture.time}
                      </span>
                    </div>
                  ) : null}

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition-all"
                  >
                    {lecture ? "Update Lecture Time" : "Set Lecture Time"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lecture Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateLecture}
            className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              {selectedCourse.name} - Set Lecture Time
            </h3>

            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
              value={lectureForm.date}
              onChange={(e) => setLectureForm({ ...lectureForm, date: e.target.value })}
              required
            />

            <input
              type="time"
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
              value={lectureForm.time}
              onChange={(e) => setLectureForm({ ...lectureForm, time: e.target.value })}
              required
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
                Save Lecture Time
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;
