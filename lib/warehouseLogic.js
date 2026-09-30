// lib/warehouseLogic.js
// Small wrapper helpers used by the products page.

export async function loadWarehouses() {
  try {
    const res = await fetch("/api/warehouses");
    const data = await res.json();
    // Normalize possible shapes
    const list = Array.isArray(data) ? data : data.warehouses ?? [];
    // Ensure IDs are strings
    return list.map((w) => ({ ...w, _id: String(w._id) }));
  } catch (err) {
    console.error("Load warehouses error:", err);
    return [];
  }
}

export async function fetchProductsForWarehouse(warehouseId) {
  try {
    const res = await fetch(`/api/products/by-warehouse?warehouse=${encodeURIComponent(warehouseId)}`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error("Error fetching warehouse products:", err);
    return [];
  }
}

export async function searchProducts(query, warehouseId) {
  try {
    const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&warehouse=${encodeURIComponent(warehouseId)}`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}

export async function updateQtyAPI(payload) {
  // payload: { productId, warehouse, qtyChange } or { productId, warehouse, newQty }
  try {
    const res = await fetch("/api/products/updateQty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error("Update qty error:", err);
    return null;
  }
}

export async function createWarehouse(name) {
  try {
    const res = await fetch("/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return await res.json();
  } catch (err) {
    console.error("Create warehouse error:", err);
    return null;
  }
}
