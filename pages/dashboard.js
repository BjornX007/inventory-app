"use client";
import { resolvePermissions } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Package,
  Warehouse,
  FileText,
  AlertTriangle,
  IdCardIcon,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    totalStock: 0,
    lowStock: 0,
    invoicesCount: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("inv_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();

      setStats({
        totalProducts: data.stats?.totalProducts || 0,
        totalWarehouses: data.stats?.totalWarehouses || 0,
        totalStock: data.stats?.totalStock || 0,
        lowStock: data.stats?.lowStockCount || 0,
        invoicesCount: data.stats?.invoicesCount || 0,
      });

      setRecentLogs(data.recentLogs || []);
      setLowStock(data.lowStock || []);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        Loading dashboard…
      </div>
    );
  }
const isUser = user?.role === "user";

  return (
    <div
      className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto transition-colors duration-300"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >  {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight border-b-4 border-blue-600 pb-1">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Inventory insights and recent activity
        </p>
       <div>
      <Link href="/products/generate-qr">
        <button
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Go to Generate QR Page
        </button>
      </Link>
    </div>
     <Link href="/test-qr-scan">
      <button
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #444",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Open QR Scanner
      </button>
    </Link>
      </div>
      {/* Identity */}
<div className="flex items-center justify-between mb-4 text-gray-500">
  {/* Left side */}
  <div className="flex items-center gap-2">
    <IdCardIcon size={18} />
    <span>
      Welcome back{" "}
      <strong className="text-gray-800 dark:text-gray-200 uppercase">
        {user?.username}
      </strong>
    </span>
  </div>

  {/* Right side */}
  <span className="text-sm font-medium px-3 py-1 rounded-full
    bg-gray-100 text-gray-700
    dark:bg-gray-800 dark:text-gray-300 uppercase">
    {user?.role}
  </span>
</div>


    

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ">

      {!isUser && (
  <StatCard
    label="Total Products"
    value={stats.totalProducts}
    color="text-green-600"
    Icon={Package}
    href="/products/stock-overview"
  />
)}

{!isUser && (
  <StatCard
    label="Warehouses"
    value={stats.totalWarehouses}
    color="text-blue-600"
    Icon={Warehouse}
    href="/products"
  />
)}

{!isUser && (
  <StatCard
    label="Total Quantity"
    value={stats.totalStock}
    color="text-indigo-600"
    Icon={FileText}
    href="/products/stock-overview"
  />
)}

{!isUser && (
  <StatCard
    label="Low Stock Items"
    value={stats.lowStock}
    color="text-red-600"
    Icon={AlertTriangle}
    href="/products/low-stock"
  />
)}<StatCard
  label="Invoices"
  color="text-yellow-600"
  Icon={IdCardIcon}
  href="/invoices/all"
/>

<StatCard
  label="Create Invoice"
  value="+"
  color="text-yellow-600"
  Icon={IdCardIcon}
  href="/invoices/create"
/>



      </div>

{/* Low Stock Section */}
{user?.role !== "user" && (
  <SectionCard
    title="Low Stock Alerts"
    linkText="Manage Products →"
    linkHref="/products/low-stock"
    className="overflow-hidden"
  >
    <div className="max-h-56 overflow-y-auto pr-1 custom-scroll">
      {lowStock.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No low-stock items — all good ✅
        </p>
      ) : (
        <ResponsiveTable
          headers={["Product", "Code", "Warehouse", "Qty"]}
          data={lowStock.map((p) => ({
            Product: p.product_name,
            Code: p.code,
            Warehouse: p.warehouse || "Main",
            Qty: p.qty,
          }))}
          qtyColor={(qty) => (qty < 5 ? "text-red-600 font-semibold" : "")}
        />
      )}
    </div>
  </SectionCard>
)}


{/* Logs Section */}
<SectionCard
  title="Recent Logs"
  linkText="View All →"
  linkHref="/products/logs"
  className="overflow-hidden"
>
  <div className="max-h-56 overflow-y-auto pr-1 custom-scroll">
    {recentLogs.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No recent logs found.
      </p>
    ) : (
      <ResponsiveTable
        headers={["Product", "Action", "Qty", "Warehouse", "Date"]}
        data={recentLogs.map((log) => ({
          Product: log.product_name,
          Action: log.action,
          Qty: log.qty,
          Warehouse: log.warehouse,
          Date: new Date(log.createdAt).toLocaleString(),
        }))}
        actionColor={(action) =>
          action === "INCREASE" ? "text-green-600" : "text-red-600"
        }
      />
    )}
  </div>
</SectionCard>
    </div>
  );
}

/* ===== CLICKABLE StatCard (uses Link) ===== */
function StatCard({ label, value, color, Icon, href }) {
  return (
    <Link
  href={href}
  className="
    group flex flex-col items-center justify-center text-center p-6
    rounded-2xl border border-gray-200/60 dark:border-white/10

    /* Light mode glass */
    bg-gradient-to-br from-white/85 to-white/60 
    backdrop-blur-xl

    /* Dark mode glass */
    dark:from-[#232c3a]/70 dark:to-[#1a202c]/40

    /* Shadows */
    shadow-[0_6px_25px_rgba(0,0,0,0.12)]
    hover:shadow-[0_10px_35px_rgba(0,0,0,0.18)]

    /* Dark mode shadows */
    dark:shadow-[0_4px_25px_rgba(0,0,0,0.45)]
    dark:hover:shadow-[0_6px_35px_rgba(0,0,0,0.6)]

    hover:-translate-y-1 transition-all duration-300
  "
>
  <div
    className="
      flex items-center justify-center h-12 w-12 rounded-xl 
      bg-gray-100/90 dark:bg-gray-700/60
      border border-gray-200/60 dark:border-white/10

      /* Hover glow */
      group-hover:bg-gray-200 dark:group-hover:bg-gray-600/60
      group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
      dark:group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.35)]

      transition-all duration-300
    "
  >
    <Icon className={`h-6 w-6 ${color}`} />
  </div>

  <h2 className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
    {label}
  </h2>

  <p className={`text-3xl font-bold mt-1 ${color}`}>
    {value}
  </p>
</Link>

  );
}

/* ===== Section Card ===== */
function SectionCard({ title, linkText, linkHref, children }) {
  return (
    <section className="mb-10 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-lg transition-all p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>

        {linkText && (
          <Link
            href={linkHref}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {linkText}
          </Link>
        )}
      </div>

      <div className="overflow-hidden">{children}</div>
    </section>
  );
}

/* ===== Responsive Table ===== */
function ResponsiveTable({ headers, data, qtyColor, actionColor }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              {headers.map((h) => (
                <th key={h} className="p-2 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-100 dark:border-gray-700"
              >
                {headers.map((key) => {
                  const value = row[key];

                  const colorClass =
                    key === "Qty"
                      ? qtyColor?.(value)
                      : key === "Action"
                      ? actionColor?.(value)
                      : "";

                  return (
                    <td
                      key={key}
                      className={`p-2 text-left text-gray-700 dark:text-gray-300 ${colorClass}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white/70 dark:bg-gray-800/70 text-sm shadow-sm"
          >
            {headers.map((key) => {
              const value = row[key];

              const colorClass =
                key === "Qty"
                  ? qtyColor?.(value)
                  : key === "Action"
                  ? actionColor?.(value)
                  : "";

              return (
                <div key={key} className="flex justify-between py-0.5">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {key}:
                  </span>

                  <span className={`text-gray-800 dark:text-gray-200 ${colorClass}`}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
