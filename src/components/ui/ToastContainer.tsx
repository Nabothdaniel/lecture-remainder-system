import { FiX } from "react-icons/fi";
import { useToast } from "../../hooks/use-toast";

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 w-80 p-4 rounded-lg shadow-lg animate-slideIn text-white ${t.bg}`}
        >
          <div className="mt-1">{t.icon}</div>
          <div className="flex-1">
            <p className="font-semibold">{t.message}</p>
            {t.description && (
              <p className="text-sm text-gray-200">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 hover:opacity-80"
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
