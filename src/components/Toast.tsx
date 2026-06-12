"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-800",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-600",
    text: "text-red-800",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-800",
  },
};

export function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  const Icon = icons[type];
  const palette = colors[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
        className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 border rounded-2xl shadow-xl ${palette.bg} max-w-sm`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${palette.icon}`} />
        <p className={`text-sm font-medium ${palette.text} flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 cursor-pointer ${palette.icon}`}
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
