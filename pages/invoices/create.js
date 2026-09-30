"use client";

import Link from "next/link";

// Optimized lucide imports
import ArrowDownToLine from "lucide-react/dist/esm/icons/arrow-down-to-line";
import ArrowUpFromLine from "lucide-react/dist/esm/icons/arrow-up-from-line";

export default function CreateInvoice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">

      <div className="w-full max-w-lg bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-300 dark:border-gray-700 shadow-2xl backdrop-blur-lg overflow-hidden">

        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700/60">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Create Invoice
          </h1>
        </div>

        <div className="p-6">
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Select the invoice type
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <Link
              href="/invoices/create-in"
              prefetch={false}
              className="group rounded-xl border border-green-600 dark:border-green-500 p-6 flex flex-col items-center justify-center 
                bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 
                shadow-md hover:shadow-lg transition-all"
            >
              <ArrowDownToLine className="w-10 h-10 text-green-600 dark:text-green-400 group-hover:scale-110 transition" />
              <span className="mt-4 font-semibold text-gray-800 dark:text-gray-100">
                IN Invoice
              </span>
            </Link>

            <Link
              href="/invoices/create-out"
              prefetch={false}
              className="group rounded-xl border border-red-600 dark:border-red-500 p-6 flex flex-col items-center justify-center 
                bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 
                shadow-md hover:shadow-lg transition-all"
            >
              <ArrowUpFromLine className="w-10 h-10 text-red-600 dark:text-red-400 group-hover:scale-110 transition" />
              <span className="mt-4 font-semibold text-gray-800 dark:text-gray-100">
                OUT Invoice
              </span>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
