import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore, Course } from '../store/courseStore';
import { FiLogOut, FiSearch, FiCalendar, FiClock, FiPlus, FiTrash2, FiBell } from 'react-icons/fi';

const StudentDashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { courses, reminders, addReminder, deleteReminder } = useCourseStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [reminderForm, setReminderForm] = useState({
    date: '',
    time: '',
    topic: '',
    notes: '',
  });

  const faculties = Array.from(new Set(courses.map(c => c.faculty)));
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = !selectedFaculty || course.faculty === selectedFaculty;
    return matchesSearch && matchesFaculty;
  });

  const myReminders = reminders.filter(r => r.studentId === user?.id);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse) {
      addReminder({
        courseId: selectedCourse.id,
        studentId: user?.id || '',
        ...reminderForm,
      });
      setReminderForm({ date: '', time: '', topic: '', notes: '' });
      setShowReminderModal(false);
      setSelectedCourse(null);
    }
  };

  const openReminderModal = (course: Course) => {
    setSelectedCourse(course);
    setShowReminderModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
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
                <FiBell className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Active Reminders</p>
                <p className="text-white text-3xl font-bold">{myReminders.length}</p>
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
                <FiClock className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Upcoming</p>
                <p className="text-white text-3xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Search Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course, code, or lecturer..."
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="" className="bg-purple-900">All Faculties</option>
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty} className="bg-purple-900">
                  {faculty}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Available Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
              >
                <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
                <p className="text-white/80 text-sm mb-1">Code: {course.code}</p>
                <p className="text-white/80 text-sm mb-1">Faculty: {course.faculty}</p>
                <p className="text-white/80 text-sm mb-4">Lecturer: {course.lecturerName}</p>
                <button
                  onClick={() => openReminderModal(course)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  <FiPlus /> Set Reminder
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Reminders */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Reminders</h2>
          {myReminders.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <FiBell className="text-white/50 text-6xl mx-auto mb-4" />
              <p className="text-white text-lg">No reminders set yet</p>
              <p className="text-white/60 text-sm mt-2">Search for courses above and set your first reminder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReminders.map((reminder) => {
                const course = courses.find(c => c.id === reminder.courseId);
                return (
                  <div
                    key={reminder.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{course?.name}</h3>
                    <p className="text-white/80 text-sm mb-1">Topic: {reminder.topic}</p>
                    <p className="text-white/80 text-sm mb-1">Date: {reminder.date}</p>
                    <p className="text-white/80 text-sm mb-4">Time: {reminder.time}</p>
                    {reminder.notes && (
                      <p className="text-white/60 text-sm mb-4 italic">{reminder.notes}</p>
                    )}
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showReminderModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Reminder</h2>
            <p className="text-gray-600 mb-6">{selectedCourse.name}</p>
            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={reminderForm.date}
                  onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={reminderForm.time}
                  onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Topic</label>
                <input
                  type="text"
                  value={reminderForm.topic}
                  onChange={(e) => setReminderForm({ ...reminderForm, topic: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Final Exam, Assignment Due"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={reminderForm.notes}
                  onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReminderModal(false);
                    setSelectedCourse(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Set Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;