import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toShortId from "../../lib/shortId";

export default function InvoicePage() {
  const router = useRouter();
  const { id } = router.query;

  // ---- Hooks ----
  const [invoice, setInvoice] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(true);

  // ---- Load Invoice ----
  useEffect(() => {
    if (!id) return;

    async function load() {
      const res = await fetch(`/api/invoices/get?id=${id}`);
      const data = await res.json();
      setInvoice(data.invoice);
    }

    load();
  }, [id]);

  // ---- Download PDF file (like Excel) ----
  const downloadPDF = async () => {
    const url = `${window.location.origin}/api/invoices/pdf?id=${invoice.shortId}`;

    const res = await fetch(url);
    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoice-${invoice.shortId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ---- Load PDF for sharing ----
  useEffect(() => {
    if (!invoice?._id) return;

    const loadPDF = async () => {
      try {
        const url = `${window.location.origin}/api/invoices/pdf?INVOICE.id=${invoice.shortId}`;
        const res = await fetch(url);
        const blob = await res.blob();

        const file = new File([blob], `invoice-${invoice.shortId}.pdf`, {
          type: "application/pdf",
        });

        setPdfFile(file);
      } catch (err) {
        console.error("PDF loading error:", err);
      } finally {
        setLoadingPDF(false);
      }
    };

    loadPDF();
  }, [invoice?._id]);

  // ---- Early return if loading ----
  if (!invoice) {
    return <div className="loading">Loading…</div>;
  }

  // ---- Helper ----
  const renderLocation = (mode, warehouse, client) => {
    if (mode === "warehouse") return warehouse?.name || "-";
    if (mode === "client") return client || "-";
    return "-";
  };
//print(invoice);
const printInvoicePDF = async () => {
  try {
    const res = await fetch(`/api/invoices/pdf?id=${invoice.shortId}`);
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

  // ---- Share PDF ----
  const sharePDF = async () => {
    const url = `${window.location.origin}/api/invoices/pdf?id=${invoice.shortId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Invoice PDF",
          text: "Here is your invoice.",
          url: url,
        });
      } catch (err) {
        console.log("Share canceled", err);
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  // ---- Open PDF in new tab ----
  const openPDF = () => {
    const url = `${window.location.origin}/api/invoices/pdf?id=${invoice.shortId}`;
    window.open(url, "_blank");
  };

  // ---- UI ----
  return (
    <div className="container">
    <div className="flex gap-3 mb-4">
  <button
    onClick={printInvoicePDF}
    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
  >
    Print
  </button>

  <button
    onClick={downloadPDF}
    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white"
  >
    Download PDF
  </button>

  <button
    disabled={loadingPDF}
    onClick={sharePDF}
    className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
  >
    {loadingPDF ? "Preparing…" : "Share"}
  </button>
</div>

      <div className="sheet">
        <header className="header">
          <div>
            <h1>INVOICE {toShortId(invoice._id) || "—"}</h1>
            <p className="date">
              {new Date(invoice.createdAt).toLocaleString("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})}
            </p>
            <h3 className="created-by">Created By: {invoice.createdByUsername || "-"}</h3>
          </div>

          <div className="type-box">
            {invoice.type === "IN" && <span className="type in">IN</span>}
            {invoice.type === "OUT" && <span className="type out">OUT</span>}
            {invoice.type === "TRANSFER" && (
              <span className="type transfer">TRANSFER</span>
            )}
          </div>
        </header>

        <section className="block-grid">
          <div className="block">
            <h3>Origin</h3>
            <p>
              <strong>Mode:</strong> {invoice.originMode}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {renderLocation(
                invoice.originMode,
                invoice.originWarehouse,
                invoice.originClient
              )}
            </p>
          </div>

          <div className="block">
            <h3>Destination</h3>
            <p>
              <strong>Mode:</strong> {invoice.destinationMode}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {renderLocation(
                invoice.destinationMode,
                invoice.destinationWarehouse,
                invoice.destinationClient
              )}
            </p>
          </div>

          <div className="block">
            <h3>Responsible Person</h3>
            <p>{invoice.person || "-"}</p>
          </div>

          <div className="block">
            <h3>Message / Note</h3>
            <p>{invoice.message || "-"}</p>
          </div>
          
        </section>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Code</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((p) => (
                <tr key={p._id}>
                  <td>{p.productId?.product_name || p.name}</td>
                  <td>{p.productId?.brand_name || "-"}</td>
                  <td>{p.productId?.code || "-"}</td>
                  <td className="qty">{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="footer">
          <p>Generated by Inventory System</p>
        </footer>
      </div>

      {/* ---- Styles ---- */}
      <style jsx>{`
        .container {
          background: #222831;
          min-height: 100vh;
          padding: 20px;
        }

        .print-btn {
          background: #000;
          color: white;
          padding: 10px 18px;
          border: 1px solid #444;
          border-radius: 4px;
          margin-bottom: 20px;
          font-weight: bold;
        }

      /* =========================
   A4 SHEET
========================= */
.sheet {
  background: #ffffff;
  color: #111;
  width: 210mm;
  min-height: 297mm;
  margin: auto;
  padding: 18mm;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
}

/* =========================
   HEADER
========================= */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.3px;
  font-weight: 700;
}
.created-by {
  margin: 4px 0 0 0;
  font-size: 13px;
}
.header .date {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* =========================
   TYPE BADGE
========================= */
.type-box {
  text-align: right;
}

.type {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  letter-spacing: 0.3px;
}

.type.in {
  background: #e6f9ee;
  color: #047857;
}

.type.out {
  background: #fee2e2;
  color: #b91c1c;
}

.type.transfer {
  background: #fff7ed;
  color: #c2410c;
}

/* =========================
   INFO GRID
========================= */
.block-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.block {
  padding: 12px 14px;
  background: #E6E6E6;
  border-radius: 10px;
}

.block h3 {
  margin: 0 0 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.block p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

/* =========================
   TABLE
========================= */
.table-wrap {
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f3f4f6;
}

th {
  text-align: left;
  padding: 10px 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 10px 8px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:last-child td {
  border-bottom: none;
}

.qty {
  text-align: center;
  font-weight: 700;
}

/* =========================
   FOOTER
========================= */
.footer {
  margin-top: 30px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

/* =========================
   PRINT
========================= */
@media print {
  .print-btn {
    display: none !important;
  }

  body,
  html,
  .container {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .sheet {
    width: 100% !important;
    min-height: 100% !important;
    margin: 0 !important;
    padding: 18mm !important;
    border: none !important;
    box-shadow: none !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    size: A4;
    margin: 0;
  }
}

/* =========================
   MOBILE VIEW
========================= */
@media (max-width: 900px) {
  .sheet {
    width: 100%;
    padding: 16px;
  }

  .block-grid {
    grid-template-columns: 1fr;
  }
}
`}</style>
    </div>
  );
}
