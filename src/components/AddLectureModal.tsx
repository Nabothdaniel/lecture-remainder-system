import { useState } from "react";
import { Lecture } from "@/store/useLectureStore";
import { toast } from "@/hooks/use-toast"; 

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lecture: Omit<Lecture, "id" | "userId" | "createdAt">) => void;
}

const AddLectureModal = ({ isOpen, onClose, onSubmit }: AddLectureModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    lecturer: "",
    date: "",
    time: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();

    if (selectedDateTime < now) {
      toast.success("Please select a future date and time for the lecture.");
      return;
    }

    onSubmit(formData);
    setFormData({
      title: "",
      courseCode: "",
      lecturer: "",
      date: "",
      time: "",
      location: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Lecture
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Fill in the details below to schedule a new lecture.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="title"
            name="title"
            label="Lecture Title"
            placeholder="Introduction to CS101"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <InputField
            id="courseCode"
            name="courseCode"
            label="Course Code"
            placeholder="CS101"
            value={formData.courseCode}
            onChange={handleChange}
            required
          />
          <InputField
            id="lecturer"
            name="lecturer"
            label="Lecturer"
            placeholder="Dr. Smith"
            value={formData.lecturer}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="date"
              name="date"
              label="Date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <InputField
              id="time"
              name="time"
              label="Time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <InputField
            id="location"
            name="location"
            label="Location"
            placeholder="Room 101, Main Building"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 transition"
            >
              Add Lecture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    />
  </div>
);

export default AddLectureModal;
