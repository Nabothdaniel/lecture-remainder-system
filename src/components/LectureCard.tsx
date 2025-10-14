import { Lecture } from "@/store/useLectureStore";
import { FiCalendar, FiClock, FiMapPin, FiTrash2, FiUser } from "react-icons/fi";

interface LectureCardProps {
  lecture: Lecture;
  onDelete: (id: string) => void;
}

const LectureCard = ({ lecture, onDelete }: LectureCardProps) => {
  const lectureDate = new Date(lecture.date);
  const isUpcoming = lectureDate >= new Date();
  const formattedDate = lectureDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black dark:text-white group-hover:text-primary transition-colors">
            {lecture.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{lecture.courseCode}</p>
        </div>

        <button
          onClick={() => onDelete(lecture.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Delete lecture"
        >
          <FiTrash2 />
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <FiUser className="text-primary" />
          <span>{lecture.lecturer}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-primary" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="text-primary" />
          <span>{lecture.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiMapPin className="text-primary" />
          <span>{lecture.location}</span>
        </div>
      </div>

      {isUpcoming && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Upcoming
          </span>
        </div>
      )}
    </div>
  );
};

export default LectureCard;
