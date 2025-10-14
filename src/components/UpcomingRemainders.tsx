import { useMemo } from "react";
import { Lecture } from "@/store/useLectureStore";
import { FiBell, FiClock } from "react-icons/fi";

interface UpcomingRemindersProps {
  lectures: Lecture[];
}

const UpcomingReminders = ({ lectures }: UpcomingRemindersProps) => {
  const upcomingLectures = useMemo(() => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return lectures.filter((lecture) => {
      const lectureDate = new Date(`${lecture.date} ${lecture.time}`);
      return lectureDate >= now && lectureDate <= next24Hours;
    });
  }, [lectures]);

  if (upcomingLectures.length === 0) return null;

  return (
    <div className="mb-8 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-black/5 to-white/5 dark:from-neutral-800 dark:to-neutral-900 shadow-md">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
          <FiBell className="text-2xl text-black dark:text-white animate-bounce" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2 flex items-center gap-2">
            <FiClock className="text-primary" />
            Upcoming in 24 Hours
          </h3>

          <div className="space-y-2">
            {upcomingLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/70 transition-colors"
              >
                <div>
                  <p className="font-semibold text-black dark:text-white">{lecture.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lecture.courseCode} • {lecture.time}
                  </p>
                </div>

                <span className="text-xs font-medium text-primary px-3 py-1 rounded-full bg-primary/10">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingReminders;
