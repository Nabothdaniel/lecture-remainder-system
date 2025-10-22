import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";
import { useUserStore } from "../store/authStore";
import { useCourseStore } from "../store/coursesStore";
import {
  FiLogOut,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBook,
  FiUsers,
  FiLoader,
  FiAlertCircle,
  FiCopy,
} from "react-icons/fi";
import { Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);
  const loadingUser = useUserStore((state) => state.loading);

  const {
    courses,
    lecturers,
    loading,
    error,
    initSync,
    addCourse,
    addLecturer,
    updateCourse,
    updateLecturer,
    deleteCourse,
    deleteLecturer,
  } = useCourseStore();

  const [activeTab, setActiveTab] = useState<"courses" | "lecturers">("courses");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingLecturer, setEditingLecturer] = useState<any>(null);

  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    faculty: "",
    department: "",
    lecturerId: "",
    lecturerName: "",
  });

  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    email: "",
    faculty: "",
    department: "",
    assignedCourses: [] as string[],
  });

  const [courseFilter, setCourseFilter] = useState({ faculty: "", department: "" });
  const [lecturerFilter, setLecturerFilter] = useState({ faculty: "", department: "" });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      const unsub = initSync();
      return () => unsub && unsub();
    }
  }, [user, initSync]);

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <FiLoader className="animate-spin mr-2" size={24} /> Loading user info...
      </div>
    );
  }

  const filteredCourses = courses.filter(
    (c) =>
      (!courseFilter.faculty || c.faculty === courseFilter.faculty) &&
      (!courseFilter.department || c.department === courseFilter.department)
  );

  const filteredLecturers = lecturers.filter(
    (l) =>
      (!lecturerFilter.faculty || l.faculty === lecturerFilter.faculty) &&
      (!lecturerFilter.department || l.department === lecturerFilter.department)
  );

  const generatePassword = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleShowPassword = (lecturerId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [lecturerId]: true }));
    setTimeout(() => {
      setVisiblePasswords((prev) => ({ ...prev, [lecturerId]: false }));
    }, 5000);
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard!");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (err) {
      toast.error("Failed to logout");
      console.error(err);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.lecturerId) return toast.error("Please assign a lecturer");

    const lecturer = lecturers.find((l) => l.id === courseForm.lecturerId);
    if (!lecturer) return toast.error("Invalid lecturer selected");

    if (editingCourse) {
      await updateCourse(editingCourse.id, {
        ...courseForm,
        lecturerName: lecturer.name,
        lecturerId: lecturer.uid || "",
      });
      toast.success("Course updated");
    } else {
      await addCourse({
        ...courseForm,
        lecturerId: lecturer.uid || "",
        lecturerName: lecturer.name,
      });
      toast.success("Course added");
    }

    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseForm({ name: "", code: "", faculty: "", department: "", lecturerId: "", lecturerName: "" });
  };

  const handleSaveLecturer = async (e: React.FormEvent) => {
    e.preventDefault();

    const password = editingLecturer ? undefined : generatePassword();
    const lecturerData = { ...lecturerForm, password };

    if (editingLecturer) {
      await updateLecturer(editingLecturer.id, lecturerForm);
      toast.success("Lecturer updated");
    } else {
      await addLecturer(lecturerData);
      if (password) handleCopyPassword(password);
    }

    setShowLecturerModal(false);
    setEditingLecturer(null);
    setLecturerForm({ name: "", email: "", faculty: "", department: "", assignedCourses: [] });
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm(course);
    setShowCourseModal(true);
  };

  const handleEditLecturer = (lecturer: any) => {
    setEditingLecturer(lecturer);
    setLecturerForm(lecturer);
    setShowLecturerModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-300">Welcome, {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-3 items-center">
        <div className="flex gap-3">
          {["courses", "lecturers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold transition ${activeTab === tab
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100 text-black"
                }`}
            >
              {tab === "courses" ? <FiBook /> : <FiUsers />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-3">
          {activeTab === "courses" && (
            <button
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <FiPlus /> Add Course
            </button>
          )}
          {activeTab === "lecturers" && (
            <button
              onClick={() => setShowLecturerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <FiPlus /> Add Lecturer
            </button>
          )}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <FiLoader className="animate-spin mr-2" /> Loading data...
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center py-4 text-red-500 gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-6 pb-4 flex flex-wrap gap-3">
          {activeTab === "courses" &&
            ["faculty", "department"].map((field) => (
              <select
                key={field}
                value={(courseFilter as any)[field]}
                onChange={(e) =>
                  setCourseFilter({ ...courseFilter, [field]: e.target.value })
                }
                className="bg-white border border-gray-300 px-3 py-2 rounded-md"
              >
                <option value="">{`All ${field.charAt(0).toUpperCase() + field.slice(1)}s`}</option>
                {[...new Set(courses.map((c) => c[field as keyof typeof c]))].map((val) => (
                  <option key={val?.toString()} value={val?.toString()}>
                    {val instanceof Timestamp ? val.toDate().toLocaleString() : val?.toString()}
                  </option>
                ))}
              </select>
            ))}
          {activeTab === "lecturers" &&
            ["faculty", "department"].map((field) => (
              <select
                key={field}
                value={(lecturerFilter as any)[field]}
                onChange={(e) =>
                  setLecturerFilter({ ...lecturerFilter, [field]: e.target.value })
                }
                className="bg-white border border-gray-300 px-3 py-2 rounded-md"
              >
                <option value="">{`All ${field.charAt(0).toUpperCase() + field.slice(1)}s`}</option>
                {[...new Set(lecturers.map((l) => l[field as keyof typeof l]))].map((val) => (
                  <option key={val?.toString()} value={val?.toString()}>
                    {val?.toString()}
                  </option>
                ))}
              </select>
            ))}

          <button
            onClick={() => {
              setCourseFilter({ faculty: "", department: "" });
              setLecturerFilter({ faculty: "", department: "" });
            }}
            className="bg-black text-white px-3 py-2 rounded-md"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-6 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "courses"
            ? filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold">{course.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Code: {course.code}</p>
                <p className="text-sm text-gray-500">Faculty: {course.faculty}</p>
                <p className="text-sm text-gray-500">Department: {course.department}</p>
                <p className="text-sm text-gray-500 mb-4">Lecturer: {course.lecturerName}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))
            : filteredLecturers.map((lecturer) => (
              <div
                key={lecturer.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all relative"
              >
                <h3 className="text-lg font-bold">{lecturer.name}</h3>
                <p className="text-sm text-gray-500">{lecturer.email}</p>
                <p className="text-sm text-gray-500">Faculty: {lecturer.faculty}</p>
                <p className="text-sm text-gray-500 mb-4">Department: {lecturer.department}</p>

                {/* Password Tooltip */}
                {visiblePasswords[lecturer.id] && lecturer.password && (
                  <div
                    className="absolute top-2 right-2 bg-black text-white px-3 py-1 rounded-md flex items-center gap-2 shadow-lg z-10 cursor-pointer"
                    onClick={() => handleCopyPassword(lecturer.password)}
                  >
                    <span>{lecturer.password}</span>
                    <FiCopy />
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditLecturer(lecturer)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => deleteLecturer(lecturer.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2"
                  >
                    <FiTrash2 /> Delete
                  </button>
                  {lecturer.password && (
                    <button
                      onMouseEnter={() => handleShowPassword(lecturer.id)}
                      className="text-sm text-blue-600 underline"
                    >
                      Show Password
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modals */}
      {showCourseModal && (
        <Modal title={editingCourse ? "Edit Course" : "Add New Course"} onClose={() => setShowCourseModal(false)} onSubmit={handleSaveCourse}>
          <div className="space-y-4">
            {["name", "code", "faculty", "department"].map((field) => (
              <Input
                key={field}
                label={`Course ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                value={(courseForm as any)[field]}
                onChange={(e) => setCourseForm({ ...courseForm, [field]: e.target.value })}
              />
            ))}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Assign Lecturer</label>
              <select
                value={courseForm.lecturerId}
                onChange={(e) => setCourseForm({ ...courseForm, lecturerId: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-black"
              >
                <option value="">Select Lecturer</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {`${lecturer.name} - ${lecturer.department}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {showLecturerModal && (
        <Modal title={editingLecturer ? "Edit Lecturer" : "Add New Lecturer"} onClose={() => setShowLecturerModal(false)} onSubmit={handleSaveLecturer}>
          <div className="space-y-4">
            {["name", "email", "faculty", "department"].map((field) => (
              <Input
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                type={field === "email" ? "email" : "text"}
                value={(lecturerForm as any)[field]}
                onChange={(e) => setLecturerForm({ ...lecturerForm, [field]: e.target.value })}
              />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;

// ─────────────────────────────
// 🧱 Reusable Components
// ─────────────────────────────
const Input = ({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full bg-white border border-black rounded-md px-3 py-2 text-black focus:ring-1 focus:ring-black"
    />
  </div>
);

const Modal = ({
  title,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-white border border-black rounded-xl p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-black">{title}</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-black text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
);
