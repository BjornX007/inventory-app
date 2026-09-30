"use client";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Appearance() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold">Appearance</h2>

      <Link href="/settings">
        <button className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
          ← Back to Settings
        </button>
      </Link>

      <div className="flex items-center justify-between p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800">
        <span className="font-medium">Dark Mode</span>

        <button
          onClick={toggleTheme}
          className={`relative w-12 h-6 rounded-full ${
            theme === "dark" ? "bg-blue-600" : "bg-gray-400"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              theme === "dark" ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
