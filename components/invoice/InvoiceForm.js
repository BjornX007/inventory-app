"use client";

import { useEffect, useRef, useState } from "react";

import WarehouseSection from "./WarehouseSection";
import MetaSection from "./MetaSection";
import ProductSearch from "./ProductSearch";
import SelectedItems from "./SelectedItems";
import Snackbar from "./Snackbar";

const INVOICE_DRAFT_KEY = "invoice-draft-v1";

export default function InvoiceForm({ invoiceType = "OUT" }) {

  const movementType = invoiceType === "IN" ? "IN" : "OUT";

  /* ===================== CORE STATE ===================== */

  const [warehouses, setWarehouses] = useState([]);

  const [sourceMode, setSourceMode] = useState("warehouse");
  const [destMode, setDestMode] = useState("warehouse");

  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destWarehouse, setDestWarehouse] = useState("");

  const [sourceText, setSourceText] = useState("");
  const [destText, setDestText] = useState("");

  const [person, setPerson] = useState("");
  const [note, setNote] = useState("");

  const [query, setQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);

  const searchTimer = useRef(null);

  /* ===================== UI STATE ===================== */

  // mobile focus mode — hides meta & header while searching
  const [searchMode, setSearchMode] = useState(false);

  // bottom drawer for selected items
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerSnap, setDrawerSnap] = useState("60"); // 30 / 60 / 90

  const snapHeights = {
    "30": "h-[30vh]",
    "60": "h-[60vh]",
    "90": "h-[90vh]",
  };

  const cycleSnap = () =>
    setDrawerSnap(prev => (prev === "30" ? "60" : prev === "60" ? "90" : "30"));

  /* ===================== SNACKBAR ===================== */

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3500);
  };

  /* ===================== PRINT ===================== */

  const printInvoicePDF = async (invoiceId) => {
    try {
      const res = await fetch(`/api/invoices/pdf?id=${invoiceId}`);
      if (!res.ok) throw new Error("PDF fetch failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    } catch (err) {
      console.error("Print failed", err);
      alert("Failed to print invoice");
    }
  };

  /* ===================== WAREHOUSE LOADING ===================== */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/warehouses");
        const data = await res.json();

        const list = Array.isArray(data.warehouses)
          ? data.warehouses
          : Array.isArray(data)
          ? data
          : [];

        const normalized = list
          .filter(w => w && w._id)
          .map(w => ({
            _id: w._id,
            name: w.name || "Unnamed warehouse",
            isMain: !!w.isMain,
          }));

        setWarehouses(normalized);

        const main = normalized.find(w => w.isMain);
        const other = normalized.find(w => !w.isMain);

        if (!main) return;

        // sensible defaults
        if (movementType === "OUT") {
          setSourceWarehouse(main._id);
          setDestWarehouse(other ? other._id : "");
        } else {
          setSourceWarehouse(other ? other._id : "");
          setDestWarehouse(main._id);
        }

      } catch (err) {
        console.error("Failed to load warehouses", err);
      }
    }

    load();
  }, [movementType]);

  /* ===================== SAFE WAREHOUSE SELECTORS ===================== */

  const safeSetSourceWarehouse = (id) => {
    if (sourceMode === "warehouse" && destMode === "warehouse" && id === destWarehouse) {
      alert("Source and destination cannot be the same warehouse.");
      return;
    }
    setSourceWarehouse(id);
  };

  const safeSetDestWarehouse = (id) => {
    if (sourceMode === "warehouse" && destMode === "warehouse" && id === sourceWarehouse) {
      alert("Source and destination cannot be the same warehouse.");
      return;
    }
    setDestWarehouse(id);
  };

  /* ===================== SEARCH WAREHOUSE CONTEXT ===================== */

  const getSearchWarehouseId = () => {
    if (movementType === "IN" && sourceMode === "client") return null;
    return sourceMode === "warehouse" ? sourceWarehouse : null;
  };

  /* ===================== PRODUCT SEARCH ===================== */

  useEffect(() => {
    if (!query) {
      setProductResults([]);
      setLoading(false);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const warehouseId = getSearchWarehouseId();

        const url = warehouseId
          ? `/api/products/search?q=${encodeURIComponent(query)}&warehouse=${warehouseId}`
          : `/api/products/search?q=${encodeURIComponent(query)}`;

        const res = await fetch(url);
        const data = await res.json();

        setProductResults(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error("Search failed", err);
        setProductResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => searchTimer.current && clearTimeout(searchTimer.current);

  }, [query, sourceWarehouse, sourceMode, movementType]);

  /* ===================== RESTORE DRAFT ===================== */

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(INVOICE_DRAFT_KEY));
      if (!saved) return;

      setSourceMode(saved.sourceMode ?? "warehouse");
      setDestMode(saved.destMode ?? "warehouse");

      setSourceWarehouse(saved.sourceWarehouse ?? "");
      setDestWarehouse(saved.destWarehouse ?? "");

      setSourceText(saved.sourceText ?? "");
      setDestText(saved.destText ?? "");

      setPerson(saved.person ?? "");
      setNote(saved.note ?? "");

      setItems(Array.isArray(saved.items) ? saved.items : []);

    } catch (err) {
      console.warn("Failed to restore draft", err);
    }
  }, []);

  /* ===================== AUTO-SAVE DRAFT ===================== */

  useEffect(() => {
    const draft = {
      sourceMode,
      destMode,
      sourceWarehouse,
      destWarehouse,
      sourceText,
      destText,
      person,
      note,
      items,
    };

    localStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify(draft));

  }, [
    sourceMode,
    destMode,
    sourceWarehouse,
    destWarehouse,
    sourceText,
    destText,
    person,
    note,
    items,
  ]);

  /* ===================== RESET ===================== */

  const resetForm = () => {
    setItems([]);
    setQuery("");
    setProductResults([]);
    setPerson("");
    setNote("");
    setSourceText("");
    setDestText("");
    setSavedInvoiceId(null);
    localStorage.removeItem(INVOICE_DRAFT_KEY);
  };

  /* ===================== SAVE ===================== */

  const saveInvoice = async () => {
    if (movementType === "OUT" && !sourceWarehouse) return alert("Select source warehouse");
    if (movementType === "IN" && !destWarehouse) return alert("Select destination warehouse");
    if (!items.length) return alert("Add items");

    const payload = {
      type: movementType,

      originMode: sourceMode,
      originWarehouse: sourceMode === "warehouse" ? sourceWarehouse : null,
      originClient: sourceMode === "client" ? sourceText : null,

      destinationMode: destMode,
      destinationWarehouse: destMode === "warehouse" ? destWarehouse : null,
      destinationClient: destMode === "client" ? destText : null,

      person,
      message: note,

      products: items.map(it => ({
        productId: it._id,
        name: it.product_name,
        qty: Number(it.qtyToAdd),
      })),
    };

    try {
      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Save failed");

      resetForm();
      showSnackbar("Invoice saved successfully");
      setSavedInvoiceId(data.invoiceId);

    } catch (err) {
      console.error("Save invoice error", err);
      showSnackbar("Failed to save invoice", "error");
    }
  };

  /* ===================== SEARCH FOCUS MODE ===================== */

  const onSearchFocus = () => {
    if (window.innerWidth < 1024) {
      setSearchMode(true);
      setDrawerOpen(false);
    }
  };

  const onSearchBlur = () => {
    if (window.innerWidth < 1024) {
      setSearchMode(false);
      setDrawerOpen(true);
    }
  };

  /* ===================== PROPS ===================== */

  const warehouseProps = {
    movementType,
    warehouses,
    sourceMode,
    setSourceMode,
    destMode,
    setDestMode,
    sourceWarehouse,
    setSourceWarehouse: safeSetSourceWarehouse,
    destWarehouse,
    setDestWarehouse: safeSetDestWarehouse,
    sourceText,
    setSourceText,
    destText,
    setDestText,
  };

  const metaProps = { person, setPerson, note, setNote };

  const searchProps = {
    query,
    setQuery,
    loading,
    results: productResults,
    addItem: p => {
      if (!items.some(i => i._id === p._id)) {
        setItems(prev => [...prev, { ...p, qtyToAdd: 1 }]);
        setQuery("");
        setProductResults([]);
      }
    },
    onSearchFocus,
    onSearchBlur,
  };

  const itemsProps = {
    items,
    updateQty: (idx, qty) =>
      setItems(prev =>
        prev.map((it, i) =>
          i === idx ? { ...it, qtyToAdd: Math.max(1, Number(qty)) } : it
        )
      ),
    removeItem: idx =>
      setItems(prev => prev.filter((_, i) => i !== idx)),
  };

 const handleSaveAndCollapse = async () => {
  setDrawerOpen(true);
  setDrawerSnap("30");   // <-- VALID, drawer shrinks safely

  try {
    await saveInvoice();
  } catch (err) {
    console.error("Save failed", err);
  }
};



  /* ===================== RENDER ===================== */

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-gray-50 dark:bg-gray-900">

      {/* LEFT — FORM AREA */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 lg:pb-10 lg:px-8">

        {!searchMode && (
          <div className="pt-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {movementType === "OUT" ? "Create OUT Invoice" : "Create IN Invoice"}
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select warehouses and add products
            </p>
          </div>
        )}

        {!searchMode && (
          <>
            <WarehouseSection {...warehouseProps} />
            <div className="mt-4">
              <MetaSection {...metaProps} />
            </div>
          </>
        )}

        <div className={`mt-4 ${searchMode ? "pb-20" : ""}`}>
          <ProductSearch {...searchProps} />
        </div>

        {savedInvoiceId && (
          <div className="mt-6 p-4 rounded-2xl bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-700">
            <p className="font-semibold mb-2 text-green-800 dark:text-green-200">
              Invoice saved successfully
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = `/invoices/${savedInvoiceId}`}
                className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600"
              >
                View Invoice
              </button>

              <button
                onClick={() => printInvoicePDF(savedInvoiceId)}
                className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
              >
                Print PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP PANEL */}
      <div className="hidden lg:flex w-[420px] flex-col border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">

        <h2 className="px-5 pt-5 pb-2 text-lg font-semibold">Selected Items</h2>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <SelectedItems {...itemsProps} />
        </div>

        <div className="px-4 py-4 border-t bg-gray-50 dark:bg-gray-900 flex gap-3">
          <button
            onClick={resetForm}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-400 dark:border-gray-600"
          >
            Reset
          </button>

          <button
            onClick={saveInvoice}
            disabled={!items.length}
            className={`flex-1 px-4 py-2 rounded-xl font-semibold ${
              items.length
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-white opacity-60 cursor-not-allowed"
            }`}
          >
            Save Invoice
          </button>
        </div>
      </div>

{/* MOBILE SNAP DRAWER */}
<div
  className={`
    lg:hidden
    fixed bottom-0 inset-x-0
    bg-white dark:bg-gray-800
    border-t border-gray-300 dark:border-gray-700
    shadow-2xl
    transition-all duration-300
    flex flex-col
    ${drawerOpen ? snapHeights[drawerSnap] : "h-[34px]"}
  `}
>

  {/* HANDLE BAR / TOGGLE */}
  <button
    onClick={() => (drawerOpen ? cycleSnap() : setDrawerOpen(true))}
    className="w-full py-2 text-sm font-medium"
  >
    {drawerOpen
      ? `Selected Items (${items.length}) — tap to resize`
      : `Show Selected Items (${items.length})`}
  </button>

  {drawerOpen && (
    <>
      <div className="px-4 pb-1">
        <h2 className="text-base font-semibold">Selected Items</h2>
      </div>

      {/* SCROLL AREA — padded so buttons do NOT overlap */}
      <div className="flex-1 overflow-y-auto px-4 pb-[120px]">
        <SelectedItems {...itemsProps} />
      </div>

      {/* FIXED ACTION BAR — SAFE AREA AWARE */}
      <div
        className="
          fixed inset-x-0
          bottom-0
          pb-[calc(env(safe-area-inset-bottom)+83px)]
          bg-white dark:bg-gray-900
          border-t border-gray-300 dark:border-gray-700
          flex gap-3 px-4 pt-2
        "
      >
        <button
          onClick={resetForm}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-400 dark:border-gray-600"
        >
          Reset
        </button>

        <button
  onClick={handleSaveAndCollapse}
  disabled={!items.length}
  className={`
    flex-1 px-4 py-2 rounded-xl font-semibold
    ${
      items.length
        ? "bg-blue-600 text-white"
        : "bg-gray-400 text-white opacity-60 cursor-not-allowed"
    }
  `}
>
  Save Invoice
</button>

      </div>
    </>
  )}
</div>





      <Snackbar {...snackbar} />
    </div>
  );
}
