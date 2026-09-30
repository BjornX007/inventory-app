import { useState, useEffect } from "react";

export default function StockLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("inv_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

const loadLogs = async () => {
  if (!user) return;

const params = new URLSearchParams(
  user.role === "admin"
    ? { search }
    : { search, userId: user._id }
);


  const res = await fetch(`/api/logs?${params.toString()}`);
  const data = await res.json();

  setLogs(Array.isArray(data.logs) ? data.logs : []);
};

  useEffect(() => {
    loadLogs();
  }, [search, user]);

  // ⬇️ YOUR TABLE STAYS EXACTLY THE SAME


  return (
    <div className="p-4 sm:p-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">📑 Stock Logs</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search: product / code / warehouse / note..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 mb-4 rounded-lg border bg-white dark:bg-gray-800 
        dark:border-gray-700 dark:text-gray-200 focus:outline-none"
      />

      {/* TABLE WRAPPER (identical behaviour to StockOverview) */}
      <div
        className="
          portrait-table-fix
          rounded-lg border shadow dark:border-gray-700
          overflow-x-hidden
          overflow-y-auto
          max-h-[70vh]
        "
      >
        <table
          className="
            w-full
            text-xs sm:text-sm
            dark:bg-gray-800 dark:text-gray-100
          "
        >
         <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
  <tr className="text-left text-gray-700 dark:text-gray-200">

    {/* ± */}
    <th className="p-3 border text-center text-xl dark:border-gray-600 w-[8%] sm:w-auto">
      ±
    </th>

  {/* Warehouse — medium */}
    <th className="p-3 border text-center dark:border-gray-600 w-[15%] sm:w-auto">
      Warehouse
    </th>
    {/* Product — BIGGEST in portrait */}
    <th className="p-3 border dark:border-gray-600 w-[45%] sm:w-auto">
      Product
    </th>

    
  {/* Qty */}
    <th className="p-3 border text-center dark:border-gray-600 w-[8%] sm:w-auto">
      Qty
    </th>

    {/* Before */}
    <th className="p-3 border text-center dark:border-gray-600 w-[10%] sm:w-auto">
      Before
    </th>

    {/* After */}
    <th className="p-3 border text-center dark:border-gray-600 w-[10%] sm:w-auto">
      After
    </th>

    {/* Time */}
    <th className="p-3 border text-center dark:border-gray-600 w-[20%] sm:w-auto">
      Time
    </th>

    {/* Note — SECOND biggest */}
    <th className="p-3 border dark:border-gray-600 w-[35%] sm:w-auto">
      Note
    </th>
  </tr>
</thead>

          <tbody>
            {logs.map((l, index) => (
              <tr
                key={l._id}
                className={`
                  border-b dark:border-gray-700 transition
                  ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900"
                  }
                  hover:bg-gray-100 dark:hover:bg-gray-700
                `}
              >
                <td
                  className={`
                    p-3 border text-center font-bold text-3xl dark:border-gray-700
                    ${
                      l.action === "INCREASE"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  `}
                >
                  {l.action === "INCREASE" ? "+" : "-"}
                </td>

                <td className="p-3 border text-center dark:border-gray-700">
                  {l.warehouseName}
                </td>

                <td className="p-3 border dark:border-gray-700">
                  <div className="font-medium">{l.product?.product_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 break-words">
                    {l.product?.specification}
                  </div>
                  <div className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
                    #{l.product?.code}
                  </div>
                </td>

                <td className="p-3 border text-center dark:border-gray-700">
                  {l.qty}
                </td>

                <td className="p-3 border text-center dark:border-gray-700">
                  {l.previousQty}
                </td>

                <td className="p-3 border text-center dark:border-gray-700">
                  {l.newQty}
                </td>

                <td className="p-3 border text-center text-xs text-gray-600 dark:text-gray-300 dark:border-gray-700">
                  {new Date(l.createdAt).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </td>

                <td className="p-3 border dark:border-gray-700 break-words">
                  <div>{l.note}</div>

                  {l.invoiceNr && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium break-words">
                      Invoice: {l.shortId || l.invoiceNr}
                    </div>
                  )}

                  {l.user && (
                    <div className="text-xs text-gray-700 dark:text-gray-300 break-words">
                      User: {l.user}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
