"use client";

import Link from "next/link";
import { FilePlus, FileText } from "lucide-react";

export default function InvoicesHome() {
  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-b
        from-gray-100 to-gray-200
        dark:from-gray-900 dark:to-gray-950
        px-6 py-10
        flex flex-col
        items-center
        transition
      "
    >
      {/* Header */}
      <header className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Invoice Management
        </h1>

        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
          Create, browse, and manage your invoices
        </p>
      </header>

      {/* Main actions */}
      <main
        className="
          w-full max-w-2xl
          grid gap-6
          grid-cols-1
          sm:grid-cols-2
          place-items-stretch
        "
      >
        {/* Create Invoice */}
        <Link
          href="/invoices/create"
          className="
            group
            flex items-center
            gap-5
            p-6
            rounded-2xl
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            shadow-md
            transition-all
            hover:shadow-xl hover:-translate-y-[2px]
            active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-blue-500/60
          "
        >
          <div
            className="
              p-4 rounded-xl
              bg-blue-600 dark:bg-blue-700
              shadow-md
              flex items-center justify-center
              transition
              group-hover:scale-105
            "
          >
            <FilePlus className="text-white" size={32} />
          </div>

          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create Invoice
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Make a new IN / OUT invoice
            </p>
          </div>
        </Link>

        {/* View Invoices */}
        <Link
          href="/invoices/all"
          className="
            group
            flex items-center
            gap-5
            p-6
            rounded-2xl
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            shadow-md
            transition-all
            hover:shadow-xl hover:-translate-y-[2px]
            active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-blue-500/60
          "
        >
          <div
            className="
              p-4 rounded-xl
              bg-gray-700 dark:bg-gray-600
              shadow-md
              flex items-center justify-center
              transition
              group-hover:scale-105
            "
          >
            <FileText className="text-white" size={32} />
          </div>

          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              View All Invoices
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse and manage invoice history
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
