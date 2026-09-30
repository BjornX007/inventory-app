"use client";

export default function InvoiceLayout({ title, children }) {
  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* MAIN CONTAINER */}
      <div className="flex flex-col w-full h-full">

        {/* HEADER – COMPACT */}
        <header
          className="
            h-14
            flex items-center justify-between
            px-4
            border-b
            bg-white dark:bg-gray-800
            border-gray-200 dark:border-gray-700
            shrink-0
          "
        >
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Inventory movement
            </p>
          </div>

          <span
            className="
              text-xs font-medium
              px-3 py-1
              rounded-full
              bg-gray-100 dark:bg-gray-700
              text-gray-600 dark:text-gray-300
            "
          >
            Inventory • Pro
          </span>
        </header>

        {/* CONTENT – FULL HEIGHT */}
        <main
          className="
            flex-1
            overflow-hidden
            px-3 py-3
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
