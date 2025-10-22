import { useState } from 'react';
import { useUserStore } from '../store/authStore';
import { useCourseStore, Course, Lecture } from '../store/coursesStore';
import { FiLogOut, FiSearch,  FiPlus, FiTrash2, FiBell, FiFilter } from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const StudentDashboard = () => {
  const logout = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // Zustand store
  const { courses, lectures, reminders, addReminder, deleteReminder } = useCourseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(false);

  const [reminderForm, setReminderForm] = useState({
    date: '',
    time: '',
    topic: '',
    notes: '',
  });

  const faculties = Array.from(new Set(courses.map(c => c.faculty)));
  const departments = Array.from(new Set(courses.map(c => c.department)));

  // Filter courses by search, faculty, and department
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = !selectedFaculty || course.faculty === selectedFaculty;
    const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
    return matchesSearch && matchesFaculty && matchesDepartment;
  });

  const myReminders = reminders.filter(r => r.studentId === user?.uid);

  // Handle course selection for setting reminder
  const handleSelectCourse = (course: Course) => {
    const upcomingLecture = lectures
      .filter(l => l.courseId === course.id)
      .find(l => new Date(l.date + ' ' + l.time).getTime() > Date.now());

    if (!upcomingLecture) {
      alert("No upcoming lectures available for reminders.");
      return;
    }

    setSelectedCourse(course);
    setSelectedLecture(upcomingLecture);
    setReminderForm({
      date: upcomingLecture.date,
      time: upcomingLecture.time,
      topic: '',
      notes: '',
    });
    setShowReminderModal(true);
  };

  // Add reminder
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !user || !selectedLecture) return;

    setLoading(true);
    try {
      addReminder({
        courseId: selectedCourse.id,
        lectureId: selectedLecture.id,
        studentId: user.uid,
        ...reminderForm,
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/send-reminder-email`, {
        email: user.email,
        name: user.name,
        courseName: selectedCourse.name,
        topic: reminderForm.topic,
        date: reminderForm.date,
        time: reminderForm.time,
        notes: reminderForm.notes,
      });

      setReminderForm({ date: '', time: '', topic: '', notes: '' });
      setSelectedCourse(null);
      setSelectedLecture(null);
      setShowReminderModal(false);
    } catch (error) {
      console.error("Error setting reminder:", error);
      alert("Failed to set reminder or send email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
      try {
        await signOut(auth);
        toast.success("Logged out successfully.");
        navigate("/auth");
      } catch (err) {
        console.error("Logout error:", err);
        toast.error((err as Error).message);
      }
    };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b border-gray-200 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-gray-300 text-sm">Welcome, {user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-all"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiFilter /> Filter Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course, code, or lecturer..."
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="">All Faculties</option>
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses */}
        <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCourses.map((course) => {
            const nextLecture = lectures
              .filter(l => l.courseId === course.id)
              .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
              .find(l => new Date(l.date + ' ' + l.time).getTime() > Date.now());

            return (
              <div
                key={course.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold mb-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Code: {course.code}</p>
                <p className="text-sm text-gray-600 mb-1">Faculty: {course.faculty}</p>
                <p className="text-sm text-gray-600 mb-1">Department: {course.department}</p>
                <p className="text-sm text-gray-600 mb-2">Lecturer: {course.lecturerName}</p>
                {nextLecture ? (
                  <p className="text-sm text-gray-600 mb-2">
                    Next Lecture: {nextLecture.date} at {nextLecture.time}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mb-2 italic">No upcoming lectures</p>
                )}
                <button
                  onClick={() => handleSelectCourse(course)}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-all"
                >
                  <FiPlus /> Set Reminder
                </button>
              </div>
            );
          })}
        </div>

        {/* Reminders */}
        <h2 className="text-2xl font-bold mb-4">My Reminders</h2>
        {myReminders.length === 0 ? (
          <div className="text-center border border-gray-200 rounded-xl py-12 text-gray-500">
            <FiBell className="text-5xl mx-auto mb-4" />
            <p>No reminders set yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myReminders.map((reminder) => {
              const course = courses.find(c => c.id === reminder.courseId);
              return (
                <div
                  key={reminder.id}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold mb-1">{course?.name}</h3>
                  <p className="text-sm text-gray-600">Topic: {reminder.topic}</p>
                  <p className="text-sm text-gray-600">Date: {reminder.date}</p>
                  <p className="text-sm text-gray-600 mb-2">Time: {reminder.time}</p>
                  {reminder.notes && (
                    <p className="text-xs text-gray-500 italic mb-4">{reminder.notes}</p>
                  )}
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedCourse && selectedLecture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">Set Reminder</h2>
            <p className="text-gray-600 mb-6">{selectedCourse.name}</p>
            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={reminderForm.date}
                  onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={reminderForm.time}
                  onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <input
                  type="text"
                  value={reminderForm.topic}
                  onChange={(e) => setReminderForm({ ...reminderForm, topic: e.target.value })}
                  placeholder="e.g., Exam Revision"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={reminderForm.notes}
                  onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-all"
                >
                  {loading ? 'Saving...' : 'Set Reminder'}
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
