import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import dbConnect from "../../lib/mongoose";

import Invoice from "../../models/Invoice";
import Product from "../../models/Product";
import Warehouse from "../../models/Warehouse";
import Link from "next/link";

// ----------------------------------------------------
// SAFE SERIALIZER FOR ALL DATES
// ----------------------------------------------------
function safe(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      value instanceof Date ? value.toISOString() : value
    )
  );
}

// ----------------------------------------------------
// SERVER SIDE
// ----------------------------------------------------
export async function getServerSideProps(context) {
  await dbConnect();

  // ----------------------------------
  // 🔐 AUTH FROM COOKIE
  // ----------------------------------
  const cookie = context.req.headers.cookie || "";
  const userId = cookie
    .split("; ")
    .find(c => c.startsWith("userId="))
    ?.split("=")[1];

  if (!userId) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const user = await (await import("../../models/User")).default
    .findById(userId)
    .select("role");

  if (!user) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  // ----------------------------------
  // QUERY PARAMS
  // ----------------------------------
  const search = context.query.search?.trim() || "";
  const type = context.query.type || "";
  const start = context.query.start || "";
  const end = context.query.end || "";

  let query = {};

  // ----------------------------------
  // 🔐 HARD ACCESS CONTROL
  // ----------------------------------
  if (user.role === "user") {
    query.createdByUserId = userId;
  }

  // ----------------------------------
  // TEXT SEARCH
  // ----------------------------------
  if (search) {
  query.$or = [
    { shortId: { $regex: search, $options: "i" } },
    { createdByUsername: { $regex: search, $options: "i" } },
    { originClient: { $regex: search, $options: "i" } },
    { destinationClient: { $regex: search, $options: "i" } },
    { person: { $regex: search, $options: "i" } },
    { message: { $regex: search, $options: "i" } },
    { "products.name": { $regex: search, $options: "i" } },
  ];
}


  // ----------------------------------
  // TYPE FILTER
  // ----------------------------------
  if (type === "IN" || type === "OUT") {
    query.type = type;
  }

  // ----------------------------------
  // DATE FILTER
  // ----------------------------------
  if (start || end) {
    query.createdAt = {};
    if (start) query.createdAt.$gte = new Date(start);
    if (end) query.createdAt.$lte = new Date(end + "T23:59:59");
  }

  // ----------------------------------
  // QUERY DB
  // ----------------------------------
  const invoices = await Invoice.find(query)
    .populate("products.productId", "product_name code")
    .populate("originWarehouse", "name")
    .populate("destinationWarehouse", "name")
    .sort({ createdAt: -1 })
    .lean();

  // ----------------------------------
  // NORMALIZE
  // ----------------------------------
  const normalized = invoices.map(inv => ({
    ...inv,
    _id: inv._id.toString(),
  }));

  return {
    props: safe({
      invoices: normalized,
      search,
      type,
      start,
      end,
    }),
  };
}

// ----------------------------------------------------
// CLIENT SIDE PAGE
// ----------------------------------------------------
export default function AllInvoices({ invoices, search, type, start, end }) {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState(search);
  const [filterType, setFilterType] = useState(type);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  // UPDATE URL ON FILTER CHANGE
  useEffect(() => {
    const debounce = setTimeout(() => {
      const params = new URLSearchParams({
        search: searchValue || "",
        type: filterType || "",
        start: startDate || "",
        end: endDate || "",
      });

      router.replace(`/invoices/all?${params.toString()}`);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchValue, filterType, startDate, endDate]);

 return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    {/* PAGE HEADER */}
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Invoices
      </h1>

      <span className="text-sm text-gray-500 dark:text-gray-400">
        {invoices.length} results
      </span>
    </div>

    {/* FILTER BAR */}
    <div className="sticky top-0 z-20 mb-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Search invoice, person, client…"
          className="md:col-span-2 rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <select
          className="rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>

        <input
          type="date"
          className="rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button
        className="mt-3 text-sm text-red-600 hover:underline"
        onClick={() => {
          setSearchValue("");
          setFilterType("");
          setStartDate("");
          setEndDate("");
          router.push("/invoices/all");
        }}
      >
        Reset filters
      </button>
    </div>

    {/* GRID */}
   {/* GRID */}
{invoices.length === 0 ? (
  <p className="text-gray-500 dark:text-gray-400">
    No invoices found
  </p>
) : (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-4">
    {invoices.map((invoice) => {
      const origin =
        invoice.originMode === "warehouse"
          ? invoice.originWarehouse?.name
          : invoice.originClient || "—";

      const dest =
        invoice.destinationMode === "warehouse"
          ? invoice.destinationWarehouse?.name
          : invoice.destinationClient || "—";

      return (
        <Link key={invoice._id} href={`/invoices/${invoice._id}`}>
          <div className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-xl transition-all duration-200">
            
            {/* TOP BAR */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-m font-mono text-blue-500">
                {invoice.shortId || "—"}
              </span>

              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  invoice.type === "IN"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {invoice.type}
              </span>
            </div>

            {/* FLOW */}
            <div className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  From:
                </span>{" "}
                {origin}
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  To:
                </span>{" "}
                {dest}
              </p>
            </div>

            {/* META */}
            <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Person:</span>{" "}
                {invoice.person || "—"}
              </p>

              {invoice.message && (
                <p className="truncate">
                  <span className="font-medium">Note:</span>{" "}
                  {invoice.message}
                </p>
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
               Created: {invoice.createdByUsername || "—"}
              </span>
              <span>
           {new Date(invoice.createdAt).toLocaleString("de-DE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})}


              </span>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
)}

  </div>
);

}










