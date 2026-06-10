"use client";

import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-2xl text-sm">
      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl shrink-0">
        <AlertCircle className="h-5 w-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-800">Bir hata olustu</p>
        <p className="text-red-600 mt-1 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 text-xs font-medium shrink-0 cursor-pointer transition-colors duration-200"
      >
        Kapat
      </button>
    </div>
  );
}
