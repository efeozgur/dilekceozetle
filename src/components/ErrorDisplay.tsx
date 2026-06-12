"use client";

import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ErrorDisplayProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-2xl text-sm"
      >
        <motion.div
          animate={{ x: [0, -4, 4, -2, 2, 0] }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl shrink-0"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-red-800">Bir hata oluştu</p>
          <p className="text-red-600 mt-1 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 text-xs font-medium shrink-0 cursor-pointer transition-colors duration-200"
        >
          Kapat
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
