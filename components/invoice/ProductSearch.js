import { Search } from "lucide-react";

export default function ProductSearch({
  query,
  setQuery,
  loading,
  results,
  addItem,
}) {
  return (
    <div
      className="
        bg-gray-50 dark:bg-gray-900
         border-gray-200 dark:border-gray-700
        rounded-2xl
        p-1
      "
    >
      {/* Search input */}
      <div className="flex items-center gap-3">
        <Search className="text-gray-500 dark:text-gray-400" size={19} />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or code…"
          className="
            flex-1
            bg-transparent
            text-sm md:text-base
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            outline-none
          "
        />
      </div>

      {/* Results */}
      {query && (
        <div
          className="
            mt-4
            max-h-[80vh] md:max-h-[620px]
            overflow-auto
            rounded-xl
            border border-gray-300 dark:border-gray-800
            bg-white dark:bg-gray-900
            shadow-xl
          "
        >
          {loading ? (
            <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
              No products found
            </div>
          ) : (
            <div
              className="
                grid grid-cols-1
                sm:grid-cols-2 md:grid-cols-2
                lg:grid-cols-3
                gap-2
                p-2
              "
            >
              {results.map((p) => (
                <button
                  key={p._id}
                  onClick={() => addItem(p)}
                  className="
                    text-left
                    rounded-lg
                    border border-gray-200 dark:border-gray-600
                    p-3
                    flex flex-col gap-2
                    bg-white dark:bg-gray-800
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition
                    focus:outline-none
                    focus:ring-2 focus:ring-blue-500
                  "
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {p.product_name}
                  </div>

                  {p.specification && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {p.specification}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Code: {p.code}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Brand: {p.brand_name || "-"}
                  </div>

                  <div
                    className={`
                      inline-flex items-center
                      px-2.5 py-1
                      rounded-md
                      text-xs font-semibold
                      ${
                        p.qty > 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }
                    `}
                  >
                    {p.qty > 0 ? `${p.qty} in stock` : "Out of stock"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
