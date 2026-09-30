import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function StockOverviewPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  // 👉 NEW — audio ref
  const beepRef = useRef(null);

  // 👉 preload sound once
  useEffect(() => {
    if (!beepRef.current) return;
    beepRef.current.load();
  }, []);

  // 👉 NEW — sound + haptic feedback
  const playScanFeedback = () => {
    if (beepRef.current) {
      try {
        beepRef.current.currentTime = 0;
        beepRef.current
          .play()
          .catch(err => console.warn("Audio blocked:", err));
      } catch (e) {
        console.error(e);
      }
    }

    // optional vibration (mobile / PWA)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // -----------------------------
  // Fetch FULL stock overview
  // -----------------------------
  const fetchStockOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/stockOverview");
      const data = await res.json();

      setWarehouses((data.warehouses || []).map(w => ({
        ...w,
        _id: String(w._id)
      })));

      setProducts((data.products || []).map(p => ({
        ...p,
        _id: String(p._id),
        warehouseStock: p.warehouseStock || {}
      })));
    } catch (err) {
      console.error("Error fetching stock overview:", err);
      setWarehouses([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockOverview();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("inv_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ---------------------------------
  // Start QR Scanner
  // ---------------------------------
  const startScanner = async () => {
    setScanning(true);

    const { Html5QrcodeScanner } = await import("html5-qrcode");

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scannerRef.current.render(onScanSuccess);
  };

  // ---------------------------------
  // Stop Scanner
  // ---------------------------------
  const stopScanner = () => {
    setScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  };

  // ---------------------------------
  // Handle scanned QR TOKEN
  // ---------------------------------
  const onScanSuccess = async (decodedText) => {
    const qrToken = decodedText.trim();
    if (!qrToken) return;

    // 🔊 instant feedback (<= 1s sound)
    playScanFeedback();

    console.log("Scanned token:", qrToken);

    const res = await fetch("/api/products/search-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken })
    });

    const data = await res.json();

    if (!data?.products?.length) {
      console.warn("Product not found for token");
      return;
    }

    const scannedProduct = data.products[0];

    setSearch(scannedProduct.code || "");

    setWarehouses(data.warehouses.map(w => ({
      ...w,
      _id: String(w._id)
    })));

    setProducts(
      data.products.map(p => ({
        ...p,
        _id: String(p._id),
        warehouseStock: p.warehouseStock || {}
      }))
    );

    stopScanner();
  };


  // -----------------------------
  // Filtering behaves the same
  // -----------------------------
  const filteredProducts = products.filter(
    (p) =>
      p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase())
  );

  const mainWarehouse = warehouses.find(w => w.isMain);

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  return (
    <div className="p-4 sm:p-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 border-b-4 border-blue-600 pb-3">
        Stock Overview
      </h1>

      <div className="flex flex-wrap gap-3 mb-4 items-center">

        {/* Search (still works for manual filtering) */}
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:max-w-sm shadow-sm dark:bg-gray-800 dark:border-gray-700"
        />

        {!scanning && (
          <button
            onClick={startScanner}
            className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
          >
            Start QR Scanner
          </button>
        )}

        {scanning && (
          <button
            onClick={stopScanner}
            className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700"
          >
            Stop Scanner
          </button>
        )}
<audio
  ref={beepRef}
  src="/sounds/Barcode-scanner-beep-sound.mp3"
  preload="auto"
/>

        <button
          onClick={() => {
            setSearch("");
            fetchStockOverview();   // restore full stock list
          }}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Scanner frame */}
      {scanning && (
        <div
          id="qr-reader"
          className="mb-4 rounded border p-2 max-w-xs"
          style={{ width: 300 }}
        />
      )}

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="portrait-table-fix rounded-lg border shadow dark:border-gray-700 overflow-y-auto max-h-[70vh]">
          <table className="w-full table-fixed text-xs sm:text-sm dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="p-3 border">Product</th>
                <th className="p-3 border text-center">Code</th>
                <th className="p-3 border text-center">Specification</th>

                {mainWarehouse && (
                  <th className="p-3 border text-center font-semibold text-blue-600">
                    {mainWarehouse.name}
                  </th>
                )}

                {warehouses.filter(w => !w.isMain).map(w => (
                  <th key={w._id} className="p-3 border text-center">
                    {w.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td className="p-3 font-medium">{p.product_name}</td>
                  <td className="p-3 text-center">{p.code}</td>
                  <td className="p-3 text-center">{p.specification}</td>

                  {mainWarehouse && (
                    <td className="p-3 text-center font-semibold">
                      {p.warehouseStock?.[mainWarehouse._id] ?? 0}
                    </td>
                  )}

                  {warehouses.filter(w => !w.isMain).map(w => (
                    <td key={w._id} className="p-3 text-center">
                      {p.warehouseStock?.[w._id] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
