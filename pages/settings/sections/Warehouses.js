"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Works with your Warehouse model:
 * { name: String, isMain: Boolean }
 *
 * Backend endpoints expected:
 * GET    /api/warehouses         => returns [warehouses]
 * POST   /api/warehouses         => accepts { name, isMain } returns created doc
 * PUT    /api/warehouses/:id     => accepts { name, isMain } returns updated doc
 * DELETE /api/warehouses/:id     => deletes and returns { success: true }
 */

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [name, setName] = useState("");
  const [isMain, setIsMain] = useState(false);

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIsMain, setEditIsMain] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load warehouses from API
  async function loadWarehouses() {
    setLoading(true);
    try {
      const res = await fetch("/api/warehouses");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load warehouses error:", err);
      alert("Could not load warehouses. Check console.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWarehouses();
  }, []);

  // Create new warehouse
  async function addWarehouse() {
    if (!name.trim()) {
      alert("Please enter a warehouse name.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), isMain }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Create failed (${res.status})`);
      }

      // refresh list from server (keeps main-warehouse logic in sync)
      await loadWarehouses();
      setName("");
      setIsMain(false);
      alert("Warehouse added");
    } catch (err) {
      console.error("Add warehouse error:", err);
      alert("Failed to add warehouse. See console.");
    } finally {
      setSaving(false);
    }
  }

  // Start editing a warehouse
  function startEdit(w) {
    setEditId(w._id);
    setEditName(w.name || "");
    setEditIsMain(Boolean(w.isMain));
  }

  // Cancel edit
  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditIsMain(false);
  }

  // Save edit (PUT)
  async function saveEdit() {
    if (!editName.trim()) {
      alert("Name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/warehouses/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), isMain: editIsMain }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Update failed (${res.status})`);
      }

      await loadWarehouses();
      cancelEdit();
      alert("Warehouse updated");
    } catch (err) {
      console.error("Save edit error:", err);
      alert("Failed to update warehouse. See console.");
    } finally {
      setSaving(false);
    }
  }

  // Delete with confirmation
  async function deleteWarehouse(id, name) {
    const ok = confirm(`Delete warehouse "${name}"? This cannot be undone.`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Delete failed (${res.status})`);
      }
      await loadWarehouses();
      alert("Warehouse deleted");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete warehouse. See console.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Warehouse Management</h1>
         <Link href="/settings" className="mb-6 inline-block">
  <button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition">
    Back to Settings Home
  </button>
</Link>

        </div>

        {/* Add form */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Add Warehouse</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <input
              placeholder="Warehouse name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-2 p-2 border rounded bg-gray-50 dark:bg-gray-700"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isMain}
                onChange={(e) => setIsMain(e.target.checked)}
              />
              <span className="text-sm">Set as main</span>
            </label>

            <div className="sm:col-span-3">
              <button
                onClick={addWarehouse}
                disabled={saving}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Add Warehouse"}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Existing Warehouses</h2>

          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : warehouses.length === 0 ? (
            <div className="text-sm text-gray-500">No warehouses yet.</div>
          ) : (
            <div className="space-y-3">
              {warehouses.map((w) => (
                <div
                  key={w._id}
                  className="flex items-center justify-between gap-4 p-3 rounded bg-gray-100 dark:bg-gray-700"
                >
                  <div className="flex-1">
                    {editId === w._id ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="p-2 border rounded bg-white dark:bg-gray-600 flex-1"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editIsMain}
                            onChange={(e) => setEditIsMain(e.target.checked)}
                          />
                          <span className="text-sm">Main</span>
                        </label>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">{w.name}</div>
                        {w.isMain && (
                          <div className="text-xs text-blue-600 dark:text-blue-300">
                            Main warehouse
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    {editId === w._id ? (
                      <>
                        <button
                          onClick={() => saveEdit()}
                          disabled={saving}
                          className="px-3 py-1 bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-400 text-white rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(w)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteWarehouse(w._id, w.name)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
