import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export default function SelectedItems({ items, updateQty, removeItem }) {

  // local editing buffer for qty fields
  const [draftQty, setDraftQty] = useState({});

  // sync when items change
  useEffect(() => {
    const map = {};
    items.forEach(it => {
      map[it._id] = it.qtyToAdd?.toString() ?? "";
    });
    setDraftQty(map);
  }, [items]);

  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div
          key={it._id}
          className="
            grid grid-cols-[1fr_auto]
            gap-3 items-start
            rounded-lg border
            border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800
            p-3
          "
        >

          {/* PRODUCT INFO */}
          <div className="min-w-0 max-w-full">

            {/* Product name (wraps, never truncated) */}
            <div className="
              font-medium text-sm
              text-gray-900 dark:text-gray-100
              whitespace-normal break-words leading-tight
            ">
              {it.product_name}
            </div>

            {/* Meta info block */}
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 space-y-0.5">

              {it.specification && (
                <div className="whitespace-normal break-words">
                  <span className="font-semibold">Specification:</span>{" "}
                  <span>{it.specification}</span>
                </div>
              )}

              <div className="whitespace-normal break-words">
                <span className="font-semibold">Code:</span>{" "}
                <span>{it.code}</span>
              </div>

            </div>
          </div>

          {/* QTY FIELD + REMOVE */}
          <div className="flex items-center gap-2 shrink-0">

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draftQty[it._id] ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                // allow empty while typing
                setDraftQty(q => ({ ...q, [it._id]: val }));
              }}
              onBlur={(e) => {
                let val = e.target.value.trim();

                // empty → fallback to 1
                if (val === "" || isNaN(val)) val = "1";

                const num = Math.max(1, Number(val));

                // commit after editing
                updateQty(idx, num);

                // sync buffer
                setDraftQty(q => ({ ...q, [it._id]: String(num) }));
              }}
              className="
                w-14
                rounded-md
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-900
                px-2 py-1
                text-sm
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />

            <button
              onClick={() => removeItem(idx)}
              className="
                inline-flex items-center justify-center
                w-9 h-9
                rounded-md
                bg-red-600 hover:bg-red-700
                text-white
                transition
              "
            >
              <Trash2 size={14} />
            </button>

          </div>

        </div>
      ))}
    </div>
  );
}
