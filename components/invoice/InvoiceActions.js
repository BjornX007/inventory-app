"use client";

export default function InvoiceActions({ invoiceId, onPrint, onClose }) {
  if (!invoiceId) return null;

  return (
    <div
      className="
        fixed z-30
        w-[360px] max-w-[90vw]
        bottom-6 left-1/2 -translate-x-1/2
        md:top-6 md:bottom-auto md:right-6 md:left-auto md:translate-x-0
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-2xl
        px-5 py-4
        shadow-[0_20px_40px_rgba(0,0,0,0.25)]
        flex flex-col gap-4
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-medium">ⓘ Invoice generated</div>

        {/* Close */}
        <button
          onClick={onClose}
          className="
            text-gray-400 hover:text-black
            text-sm font-medium
            px-2
          "
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onPrint(invoiceId)}
          className="
            flex-1 px-3 py-2 rounded-lg
            bg-gray-200 hover:bg-gray-300
            text-sm font-medium text-black
          "
        >
          🖨 Print
        </button>

        <button
          onClick={() => (window.location.href = `/invoices/${invoiceId}`)}
          className="
            flex-1 px-3 py-2 rounded-lg
            bg-blue-600 text-white
            text-sm font-medium
            hover:bg-blue-700
          "
        >
          View
        </button>
      </div>
    </div>
  );
}
