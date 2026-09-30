import { useEffect, useState } from "react";

export default function LowStockPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load warehouses
  useEffect(() => {
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((data) => {
        setWarehouses(data);
        if (data.length > 0) setSelectedWarehouse(data[0]._id);
      });
  }, []);

  // Load low stock items
  useEffect(() => {
    if (!selectedWarehouse) return;

    setLoading(true);

    fetch(`/api/products/low-stock?warehouseId=${selectedWarehouse}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [selectedWarehouse]);

  // Export Excel via backend
  const exportToExcel = () => {
    window.location.href = `/api/products/export-low-stock?warehouseId=${selectedWarehouse}`;
  };

  return (
    <div className="p-4 sm:p-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 border-b-4 border-blue-600 pb-1">Low Stock</h1>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch sm:items-center">
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 
          dark:border-gray-700 dark:text-gray-200 focus:outline-none w-full sm:w-auto"
        >
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        <button
          onClick={exportToExcel}
          disabled={items.length === 0}
          className={`
            px-4 py-2 rounded-lg text-white w-full sm:w-auto transition 
            ${
              items.length === 0
                ? "bg-blue-500/40 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          Export Excel
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No low-stock items in this warehouse.</p>
      ) : (
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
              w-full table-fixed
              text-xs sm:text-sm
              dark:bg-gray-800 dark:text-gray-100
              min-w-[600px]
            "
          >
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
              <tr className="text-left text-gray-700 dark:text-gray-200">
                <th className="p-3 border dark:border-gray-600 w-[40%]">
                  Name
                </th>
                <th className="p-3 border text-center dark:border-gray-600 w-[20%]">
                  Spec
                </th>
                <th className="p-3 border text-center dark:border-gray-600 w-[14%]">
                  Brand
                </th>
                <th className="p-3 border text-center dark:border-gray-600 w-[14%]">
                  Code
                </th>
                <th className="p-3 border text-center dark:border-gray-600 w-[12%]">
                  Qty
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item._id}
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
                  <td className="p-3 font-medium">{item.product?.product_name}</td>
                  <td className="p-3 text-center">{item.product?.specification}</td>
                  <td className="p-3 text-center">{item.product?.brand_name}</td>
                  <td className="p-3 text-center">{item.product?.code}</td>

                  <td
                    className={`p-3 text-center font-semibold 
                      ${
                        item.qty === 0
                          ? "text-red-500"
                          : "text-gray-900 dark:text-gray-100"
                      }
                    `}
                  >
                    {item.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
