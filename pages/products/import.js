import { useState, useEffect } from "react";
const STORAGE_KEY = "import-products-session-v1";
export default function ImportProducts() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const [existingCodes, setExistingCodes] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  
//save session
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    setProducts(JSON.parse(saved));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}, []);

useEffect(() => {
  if (products.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}, [products]);

useEffect(() => {
  if (products.length > 0 && selectedWarehouse) {
    checkExistingProducts(products);
  }
}, [products, selectedWarehouse]);


  // ---------------------------------------------------------
  // Load warehouses
  // ---------------------------------------------------------
  useEffect(() => {
    const loadWarehouses = async () => {
      const res = await fetch("/api/warehouses");
      const data = await res.json();

      setWarehouses(data);

      const main = data.find((w) => w.isMain) || data[0];
      if (main) setSelectedWarehouse(main._id);
    };

    loadWarehouses();
  }, []);

  // ---------------------------------------------------------
  // Check existing products in warehouse
  // ---------------------------------------------------------
  const checkExistingProducts = async (parsedProducts) => {
    if (!selectedWarehouse || parsedProducts.length === 0) return;

    try {
      const res = await fetch("/api/products/checkExisting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId: selectedWarehouse,
          products: parsedProducts
        })
      });

      const data = await res.json();

      if (data.existing?.length) {
        setExistingCodes(data.existing);
        setShowWarning(true);
        setConfirmed(false);
      } else {
        setExistingCodes([]);
        setShowWarning(false);
        setConfirmed(true);
      }
    } catch (err) {
      console.error("Existing check failed", err);
    }
  };

  // ---------------------------------------------------------
  // CSV Upload
  // ---------------------------------------------------------
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const rows = reader.result
        .split("\n")
        .map((r) => r.split(";").map((v) => v.trim()))
        .filter((r) => r.length > 1 && r[0]);

      const cleanProducts = rows
        .map((cols) => ({
          product_name: cols[0] || "",
          specification: cols[1] || "",
          brand_name: cols[2] || "",
          code: cols[3] || "",
          qty: Number(cols[4]) || 0
        }))
        .filter((p) => p.product_name && p.code && p.qty > 0);

      setProducts(cleanProducts);
      setMessage("");
      checkExistingProducts(cleanProducts);
    };

    reader.readAsText(file, "ISO-8859-1");
  };

  // ---------------------------------------------------------
  // Import
  // ---------------------------------------------------------
  const handleImport = async () => {
    if (!selectedWarehouse) {
      setMessage("❗ Please select a warehouse.");
      return;
    }

    const res = await fetch("/api/products/importCSV", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseId: selectedWarehouse,
        products
      })
    });

    const data = await res.json();
    setMessage(data.message);
    setProducts([]);
    setShowWarning(false);
    setConfirmed(false);
    setExistingCodes([]);
  };

  const handleDeleteAll = () => {
    setProducts([]);
    setExistingCodes([]);
    setShowWarning(false);
    setConfirmed(false);
    setMessage("🗑️ Table cleared.");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 text-gray-900 dark:text-gray-200">

      <h1 className="text-2xl font-bold border-b-4 border-blue-600 pb-1">
        Import Products via CSV
      </h1>

      {/* Warehouse & Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl border">
        <div>
          <label className="font-medium">Select Warehouse</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full mt-1 p-2 rounded-lg border bg-white dark:bg-gray-800"
          >
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.isMain ? `${w.name} (Main)` : w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Upload CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="w-full mt-1 p-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Warning */}
      {showWarning && (
        <div className="border-l-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-900 p-4 rounded-xl space-y-3">
          <p className="font-semibold">⚠️ Attention</p>
          <p>
            Some products already exist. Importing will{" "}
            <strong>increase their quantity</strong>.
          </p>

          <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
            {existingCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={() => setConfirmed(!confirmed)}
              className="accent-yellow-600"
            />
            I understand quantities will be increased
          </label>
        </div>
      )}

      {/* Actions */}
      {products.length > 0 && (
        <div className="flex justify-between">
          <button
            onClick={handleImport}
            disabled={showWarning && !confirmed}
            className={`px-5 py-2.5 rounded-xl transition
              ${
                showWarning && !confirmed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            🚀 Import Products
          </button>

          <button
            onClick={handleDeleteAll}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl"
          >
            🗑 Clear Table
          </button>
        </div>
      )}

      {/* Table */}
      {products.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl p-6 border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-3">Name</th>
                <th className="p-3 text-center">Spec</th>
                <th className="p-3 text-center">Brand</th>
                <th className="p-3 text-center">Code</th>
                <th className="p-3 text-center">Qty</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={i}
                  className={`border-t transition
                    ${
                      existingCodes.includes(p.code)
                        ? "bg-yellow-50 dark:bg-yellow-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                  <td className="p-3 font-medium">{p.product_name}</td>
                  <td className="p-3 text-center">{p.specification}</td>
                  <td className="p-3 text-center">{p.brand_name}</td>
                  <td className="p-3 text-center">{p.code}</td>
                  <td className="p-3 text-center">{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message */}
      {message && (
        <p className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-3 rounded-xl font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
