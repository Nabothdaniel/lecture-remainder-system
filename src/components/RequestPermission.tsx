// src/components/RequestPermissionModal.tsx
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { savePermissionStatus } from "@/utils/notficationPermision";

const RequestPermissionModal = ({ isOpen, onClose, onPermissionGranted }) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setIsRequesting(true);
      const permission = await Notification.requestPermission();

      // Store in localStorage
      savePermissionStatus(permission);

      if (permission === "granted") {
        toast.success("Notifications enabled successfully!");
        navigator.vibrate?.([100, 50, 100]);
        onPermissionGranted?.();
        onClose();
      } else {
        toast.error("You need to allow notifications to receive alerts.");
      }
    } catch (error) {
      toast.error("Failed to request permission.");
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Allow Notifications
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Enable reminders and alerts for your upcoming lectures.
        </p>

        <button
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 transition w-full"
        >
          {isRequesting ? "Requesting..." : "Allow Notifications"}
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default RequestPermissionModal;
