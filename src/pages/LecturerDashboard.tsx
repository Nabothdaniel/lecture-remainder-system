import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { FiLogOut, FiBook, FiCalendar } from 'react-icons/fi';

const LecturerDashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { courses } = useCourseStore();
  
  const myCourses = courses.filter(course => course.lecturerName === user?.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Lecturer Dashboard</h1>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <FiBook className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Total Courses</p>
                <p className="text-white text-3xl font-bold">{myCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="bg-pink-500 p-3 rounded-lg">
                <FiCalendar className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm">This Week</p>
                <p className="text-white text-3xl font-bold">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <FiBook className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Active Students</p>
                <p className="text-white text-3xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
          
          {myCourses.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <FiBook className="text-white/50 text-6xl mx-auto mb-4" />
              <p className="text-white text-lg">No courses assigned yet</p>
              <p className="text-white/60 text-sm mt-2">Contact admin to get courses assigned to you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <FiBook className="text-white text-xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
                  <p className="text-white/80 text-sm mb-1">Code: {course.code}</p>
                  <p className="text-white/80 text-sm mb-4">Faculty: {course.faculty}</p>
                  <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;