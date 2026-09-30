// pages/products/index.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  loadWarehouses,
  fetchProductsForWarehouse,
  searchProducts,
  updateQtyAPI,
  createWarehouse,
} from "../../lib/warehouseLogic";

export default function ProductsPage() {
  const router = useRouter();

  // data
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [mainWarehouseId, setMainWarehouseId] = useState("");

  const [lastResults, setLastResults] = useState([]); // products shown in table
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // new warehouse modal
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState("");

  // debounce
  const searchTimer = useRef(null);

  // --- load warehouses on mount ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await loadWarehouses();
      setWarehouses(list);
      // pick main or first
      const main = list.find((w) => w.isMain) || list[0];
      if (main) {
        setSelectedWarehouse(main._id);
        setMainWarehouseId(main._id);
      }
      setLoading(false);
    })();
  }, []);

  // --- when warehouse changes, load its products ---
  useEffect(() => {
    if (!selectedWarehouse) {
      setLastResults([]);
      return;
    }
    setSearch("");
    setShowAll(false);
    loadProductsForSelectedWarehouse(selectedWarehouse);
  }, [selectedWarehouse]);

  const loadProductsForSelectedWarehouse = async (warehouseId) => {
    setLoading(true);
    const prods = await fetchProductsForWarehouse(warehouseId);
    // ensure qty exists and _id is string
    const clean = prods.map((p) => ({ ...p, _id: String(p._id), qty: Number(p.qty || 0) }));
    setLastResults(clean);
    setLoading(false);
  };

  // --- search (debounced) ---
  useEffect(() => {
    if (search.length < 2) {
      // if not showing all then clear results; if showing all keep them
      if (!showAll) setLastResults([]);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      if (!selectedWarehouse) {
        setMessage("Select a warehouse first");
        return;
      }
      setLoading(true);
      const results = await searchProducts(search, selectedWarehouse);
      const clean = results.map((p) => ({ ...p, _id: String(p._id), qty: Number(p.qty || 0) }));
      setLastResults(clean);
      setLoading(false);
    }, 300);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, selectedWarehouse, showAll]);

  // --- toggle show all for current warehouse ---
  const toggleShowAll = async () => {
    if (!selectedWarehouse) {
      setMessage("Please select a warehouse first.");
      return;
    }
    if (showAll) {
      setShowAll(false);
      setLastResults([]);
      return;
    }
    setLoading(true);
    const prods = await fetchProductsForWarehouse(selectedWarehouse);
    setLastResults(prods.map((p) => ({ ...p, _id: String(p._id), qty: Number(p.qty || 0) })));
    setShowAll(true);
    setLoading(false);
  };

  // --- update qty by + / - buttons ---
  const handleChangeQty = async (productId, change) => {
    if (!selectedWarehouse) {
      setMessage("Select a warehouse to edit quantities.");
      return;
    }
    setLoading(true);
    const resp = await updateQtyAPI({ productId, warehouse: selectedWarehouse, qtyChange: change });
    if (!resp) {
      setMessage("Update failed");
      setLoading(false);
      return;
    }
    // update UI
    const newQty = Number(resp.qty ?? 0);
    setLastResults((prev) => prev.map((p) => (p._id === productId ? { ...p, qty: newQty } : p)));
    setMessage(resp.message || "Qty updated");
    setLoading(false);
  };

  // --- set qty manually ---
  const handleSetQtyManual = async (productId, newQty) => {
    if (!selectedWarehouse) {
      setMessage("Select a warehouse to edit quantities.");
      return;
    }
    if (isNaN(newQty)) return;
    setLoading(true);
    const resp = await updateQtyAPI({ productId, warehouse: selectedWarehouse, newQty: Number(newQty) });
    if (!resp) {
      setMessage("Update failed");
      setLoading(false);
      return;
    }
    setLastResults((prev) => prev.map((p) => (p._id === productId ? { ...p, qty: Number(resp.qty ?? newQty) } : p)));
    setMessage(resp.message || "Qty set");
    setLoading(false);
  };

  // --- add warehouse helper ---
  const handleAddWarehouse = async () => {
    if (!newWarehouseName.trim()) return;
    setLoading(true);
    const created = await createWarehouse(newWarehouseName.trim());
    // reload list
    const list = await loadWarehouses();
    setWarehouses(list);
    // pick created if returned id
    if (created && created._id) setSelectedWarehouse(created._id);
    setNewWarehouseName("");
    setShowAddWarehouse(false);
    setLoading(false);
  };

  // inline edit of product name / code locally (you may want a backend endpoint to persist)
  const handleLocalEdit = (productId, field, value) => {
    setLastResults((prev) => prev.map((p) => (p._id === productId ? { ...p, [field]: value } : p)));
  };

  // OPTIONAL: call backend to update product fields (name/code). Add endpoint /api/products/updateProduct to persist.
  const saveProductFields = async (productId) => {
    // Example stub: implement /api/products/updateProduct on backend to accept { productId, updates }
    // await fetch("/api/products/updateProduct", { method: "POST", body: JSON.stringify({ productId, updates }) })
    // then handle response and update UI accordingly
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-gray-800 shadow p-4 rounded-lg mb-4">
        <div>
          <h1 className="text-xl font-semibold border-b-4 border-blue-600 pb-1">Inventory Manager</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">Selected warehouse controls product view & edits</div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="border dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-700 text-sm"
          >
            {warehouses.length === 0 && <option>Loading...</option>}
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.isMain ? `⭐ ${w.name}` : w.name}
              </option>
            ))}
          </select>

          <button onClick={() => setShowAddWarehouse(true)} className="bg-gray-700 text-white px-3 py-2 rounded text-sm">
            + Warehouse
          </button>

          <button onClick={() => router.push("/products/import")} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">
            Import CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          placeholder="Search by name, code or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded bg-white dark:bg-gray-800 text-sm"
        />
        <button onClick={toggleShowAll} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
          {showAll ? "Hide" : "Show All"}
        </button>
      </div>

      {message && <div className="mb-3 text-sm text-green-600 dark:text-green-400">{message}</div>}

      <div className="table-wrapper bg-white dark:bg-gray-800 rounded shadow p-2">
        {loading ? (
          <div className="p-4 text-sm">Loading...</div>
        ) : lastResults.length === 0 ? (
          <div className="p-4 text-sm text-gray-600 dark:text-gray-300">No products to show for selected warehouse.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Spec</th>
                  <th className="p-2 text-left">Brand</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lastResults.map((p) => (
                  <tr key={p._id} className="border-t dark:border-gray-700">
                    <td className="p-2">
                      <input
                        value={p.product_name || ""}
                        onChange={(e) => handleLocalEdit(p._id, "product_name", e.target.value)}
                        onBlur={() => saveProductFields(p._id)}
                        className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={p.specification || ""}
                        onChange={(e) => handleLocalEdit(p._id, "specification", e.target.value)}
                        onBlur={() => saveProductFields(p._id)}
                        className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={p.brand_name || ""}
                        onChange={(e) => handleLocalEdit(p._id, "brand_name", e.target.value)}
                        onBlur={() => saveProductFields(p._id)}
                        className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={p.code || ""}
                        onChange={(e) => handleLocalEdit(p._id, "code", e.target.value)}
                        onBlur={() => saveProductFields(p._id)}
                        className="w-full border rounded px-2 py-1 text-sm font-mono bg-white dark:bg-gray-800"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={typeof p.qty === "number" ? p.qty : Number(p.qty || 0)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          handleLocalEdit(p._id, "qty", v);
                        }}
                        onBlur={(e) => handleSetQtyManual(p._id, Number(e.target.value || 0))}
                        className="w-20 text-center rounded border px-1 py-0.5 bg-white dark:bg-gray-800"
                      />
                    </td>

                    <td className="p-2 text-center flex gap-2 justify-center">
                      <button onClick={() => handleChangeQty(p._id, +1)} className="px-2 py-1 bg-green-600 text-white rounded">+</button>
                      <button onClick={() => handleChangeQty(p._id, -1)} className="px-2 py-1 bg-red-600 text-white rounded">-</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Warehouse Modal */}
      {showAddWarehouse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80">
            <h2 className="text-lg font-semibold mb-3">Add Warehouse</h2>
            <input value={newWarehouseName} onChange={(e) => setNewWarehouseName(e.target.value)} placeholder="Warehouse name" className="w-full p-2 border rounded mb-4 dark:bg-gray-700" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddWarehouse(false)} className="px-3 py-2 rounded bg-gray-300 dark:bg-gray-700">Cancel</button>
              <button onClick={handleAddWarehouse} className="px-3 py-2 rounded bg-blue-600 text-white">Add</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .table-wrapper { max-height: 70vh; }
      `}</style>
    </div>
  );
}
