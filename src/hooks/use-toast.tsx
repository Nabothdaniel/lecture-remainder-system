import { useState, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { ReactNode } from "react";

// Types
export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  icon?: ReactNode;
  bg?: string;
}

type ToastOptions = {
  duration?: number;
  description?: string;
};

type ToastCreator = {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
};

let subscribers: Array<
  React.Dispatch<React.SetStateAction<ToastItem[]>>
> = [];

let toastId = 0;

function createToast(toast: Omit<ToastItem, "id">) {
  toastId += 1;
  const id = toastId;

  subscribers.forEach((cb) => cb((prev) => [...prev, { id, ...toast }]));

  setTimeout(() => {
    subscribers.forEach((cb) => cb((prev) => prev.filter((t) => t.id !== id)));
  }, toast.duration || 3000);
}

// --- Exported toast factory ---
export const toast: ToastCreator = {
  success: (message, description) =>
    createToast({
      type: "success",
      message,
      description,
      icon: <FiCheckCircle className="text-white" />,
      bg: "bg-green-600",
    }),
  error: (message, description) =>
    createToast({
      type: "error",
      message,
      description,
      icon: <FiAlertCircle className="text-white" />,
      bg: "bg-red-600",
    }),
  info: (message, description) =>
    createToast({
      type: "info",
      message,
      description,
      icon: <FiInfo className="text-white" />,
      bg: "bg-blue-600",
    }),
};

// --- Hook used by ToastContainer ---
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    subscribers.push(setToasts);
    return () => {
      subscribers = subscribers.filter((cb) => cb !== setToasts);
    };
  }, []);

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, removeToast };
}
