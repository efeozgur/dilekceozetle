"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "./actions";
import { Save, CheckCircle } from "lucide-react";

interface Setting {
  key: string;
  value: string;
  category: string;
  label: string;
}

interface SettingsFormProps {
  settings: Record<string, Setting[]>;
}

const categoryIcons: Record<string, string> = {
  pricing: "💰",
  general: "🌐",
  email: "📧",
  ai: "🤖",
};

const categoryLabels: Record<string, string> = {
  pricing: "Fiyatlandırma",
  general: "Genel",
  email: "E-posta",
  ai: "Yapay Zeka",
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const data: Record<string, string> = {};
    for (const category of Object.values(settings)) {
      for (const setting of category) {
        data[setting.key] = setting.value;
      }
    }
    return data;
  });

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const settingsArray = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
      }));
      const result = await updateSettings(settingsArray);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(settings).map(([category, categorySettings]) => (
        <div
          key={category}
          className="bg-white border border-border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">{categoryIcons[category] || "⚙️"}</span>
            <h2 className="text-lg font-semibold text-foreground">
              {categoryLabels[category] || category}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categorySettings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {setting.label}
                </label>
                <input
                  type={setting.key.includes("price") || setting.key.includes("limit") ? "number" : "text"}
                  value={formData[setting.key] || ""}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl hover:opacity-90 transition-all shadow-sm shadow-primary/25 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>

        {success && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Kaydedildi
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </form>
  );
}
