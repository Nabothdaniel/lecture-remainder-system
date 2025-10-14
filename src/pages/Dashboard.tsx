import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useUserStore } from "../store/useUserStore";
import { useLectureStore, Lecture } from "../store/useLectureStore";
import RequestPermissionModal from "@/components/RequestPermission";
import { toast } from "../hooks/use-toast";
import LectureCard from "@/components/LectureCard";
import AddLectureModal from "@/components/AddLectureModal";
import UpcomingReminders from "@/components/UpcomingRemainders";
import { useLectureReminders } from "@/hooks/use-lecture-remainder";
import { useReminderStore } from "../store/useRemainderStore";
import { FiPlus, FiLogOut, FiBook } from "react-icons/fi";
import {
  getPermissionStatus,
  savePermissionStatus,
} from "@/utils/notficationPermision";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const navigate = useNavigate();

  const { user, setUser, logout: clearUser } = useUserStore();
  const { lectures, setLectures, addLecture, deleteLecture } = useLectureStore();
  const { addReminder, scheduleVibrationForReminder } = useReminderStore();

  // Automatically manage reminders (frontend only)
  useLectureReminders(lectures, user?.uid, 10);

  // Handle auth + check notification permission
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) return navigate("/");

      if (!("Notification" in window)) {
        console.warn("Notifications not supported in this browser.");
        return;
      }

      const savedPermission = getPermissionStatus();
      const currentPermission = Notification.permission;

      if (savedPermission !== currentPermission) {
        savePermissionStatus(currentPermission);
      }

      const shouldShowModal =
        (!savedPermission || savedPermission !== "granted") &&
        currentPermission !== "granted";

      if (shouldShowModal) setTimeout(() => setIsPermissionModalOpen(true), 1000);
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  // Fetch lectures in real-time
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "lectures"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userLectures = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Lecture[];
        setLectures(userLectures);
        setIsLoading(false);

        // Schedule reminders for each lecture
        userLectures.forEach((lecture) => {
          addReminder({
            lectureId: lecture.id,
            reminderTime: lecture.date + "T" + lecture.time,
            message: `Lecture "${lecture.title}" is starting soon!`,
            userId: user.uid,
          });
        });
      },
      (error) => {
        console.error("Error fetching lectures:", error);
        toast.error("Failed to fetch lectures");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, setLectures, addReminder]);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      toast.info("Logged out", "See you next time!");
      navigate("/");
    } catch {
      toast.error("Error", "Failed to log out");
    }
  };

  // Add Lecture
  const handleAddLecture = async (
    lectureData: Omit<Lecture, "id" | "userId" | "createdAt">
  ) => {
    if (!user?.uid) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lectureDate = new Date(lectureData.date);
    lectureDate.setHours(0, 0, 0, 0);

    if (lectureDate < today) {
      toast.error("Invalid Date", "You can only schedule future lectures.");
      return;
    }

    try {
      const newLecture = {
        ...lectureData,
        userId: user.uid,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "lectures"), newLecture);
      addLecture({ ...newLecture, id: docRef.id });

      // Schedule reminder
      addReminder({
        lectureId: docRef.id,
        reminderTime: lectureData.date + "T" + lectureData.time,
        message: `Lecture "${lectureData.title}" is starting soon!`,
        userId: user.uid,
      });

      toast.success("Lecture added!");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error", "Failed to add lecture");
    }
  };

  // Delete Lecture
  const handleDeleteLecture = async (id: string) => {
    try {
      await deleteDoc(doc(db, "lectures", id));
      deleteLecture(id);
      toast.info("Lecture deleted");
    } catch {
      toast.error("Error", "Failed to delete lecture");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
              <FiBook className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Lecture Reminder</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-red-600 hover:text-white transition"
          >
            <FiLogOut className="inline mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading lectures...</p>
          </div>
        ) : (
          <>
            <UpcomingReminders lectures={lectures} />

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">My Lectures</h2>
                <p className="text-gray-500 text-sm">
                  {lectures.length} {lectures.length === 1 ? "lecture" : "lectures"} scheduled
                </p>
              </div>

              {lectures.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                    <FiBook className="text-4xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No upcoming lectures</h3>
                  <p className="text-gray-500">Add your first lecture to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lectures.map((lecture) => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onDelete={handleDeleteLecture}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-black text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
      >
        <FiPlus className="text-2xl" />
      </button>

      <AddLectureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLecture}
      />

      <RequestPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onPermissionGranted={() => {
          toast.success("Notifications enabled!");
          savePermissionStatus("granted");
          setIsPermissionModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
