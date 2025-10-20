import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore, Course, Lecturer } from '../store/courseStore';
import { FiLogOut, FiPlus, FiEdit2, FiTrash2, FiBook, FiUsers } from 'react-icons/fi';

const AdminDashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { courses, lecturers, addCourse, addLecturer, deleteCourse, deleteLecturer } = useCourseStore();
  
  const [activeTab, setActiveTab] = useState<'courses' | 'lecturers'>('courses');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    faculty: '',
    lecturerId: '',
    lecturerName: '',
  });
  
  const [lecturerForm, setLecturerForm] = useState({
    name: '',
    email: '',
    assignedCourses: [] as string[],
  });

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const lecturer = lecturers.find(l => l.id === courseForm.lecturerId);
    if (lecturer) {
      addCourse({
        ...courseForm,
        lecturerName: lecturer.name,
      });
      setCourseForm({ name: '', code: '', faculty: '', lecturerId: '', lecturerName: '' });
      setShowCourseModal(false);
    }
  };

  const handleAddLecturer = (e: React.FormEvent) => {
    e.preventDefault();
    addLecturer(lecturerForm);
    setLecturerForm({ name: '', email: '', assignedCourses: [] });
    setShowLecturerModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/80 text-sm">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'courses'
                ? 'bg-white text-purple-700 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FiBook /> Courses
          </button>
          <button
            onClick={() => setActiveTab('lecturers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'lecturers'
                ? 'bg-white text-purple-700 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FiUsers /> Lecturers
          </button>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Courses</h2>
              <button
                onClick={() => setShowCourseModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <FiPlus /> Add Course
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
                  <p className="text-white/80 text-sm mb-1">Code: {course.code}</p>
                  <p className="text-white/80 text-sm mb-1">Faculty: {course.faculty}</p>
                  <p className="text-white/80 text-sm mb-4">Lecturer: {course.lecturerName}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all">
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <FiTrash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lecturers Tab */}
        {activeTab === 'lecturers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Lecturers</h2>
              <button
                onClick={() => setShowLecturerModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <FiPlus /> Add Lecturer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lecturers.map((lecturer) => (
                <div
                  key={lecturer.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{lecturer.name}</h3>
                  <p className="text-white/80 text-sm mb-4">{lecturer.email}</p>
                  <p className="text-white/80 text-sm mb-4">
                    Courses: {courses.filter(c => c.lecturerId === lecturer.id).length}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all">
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => deleteLecturer(lecturer.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <FiTrash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Course</h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Course Name</label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Course Code</label>
                <input
                  type="text"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Faculty</label>
                <input
                  type="text"
                  value={courseForm.faculty}
                  onChange={(e) => setCourseForm({ ...courseForm, faculty: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Assign Lecturer</label>
                <select
                  value={courseForm.lecturerId}
                  onChange={(e) => setCourseForm({ ...courseForm, lecturerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lecturer Modal */}
      {showLecturerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Lecturer</h2>
            <form onSubmit={handleAddLecturer} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Lecturer Name</label>
                <input
                  type="text"
                  value={lecturerForm.name}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={lecturerForm.email}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLecturerModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Add Lecturer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;