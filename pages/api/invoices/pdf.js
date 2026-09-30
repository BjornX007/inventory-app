import puppeteer from "puppeteer";
import mongoose from "mongoose";
import dbConnect from "../../../lib/mongoose";
import Invoice from "../../../models/Invoice";
import toShortId from "../../../lib/shortId";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing invoice ID" });
    }

    // ✅ IMPORTANT FIX: resolve by _id OR shortId
    const invoice = await Invoice.findOne({
      $or: [
        { shortId: id },
        ...(mongoose.isValidObjectId(id)
          ? [{ _id: id }]
          : [])
      ]
    })
      .populate("products.productId")
      .populate("originWarehouse")
      .populate("destinationWarehouse");

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // ---------------------------
    // NORMALIZE TYPE
    // ---------------------------
    const normalizedType = invoice.type?.toString().trim().toLowerCase();

    const typeClass =
      normalizedType === "in"
        ? "in"
        : normalizedType === "out"
        ? "out"
        : "";

    // ------------------------------
    //         HTML TEMPLATE
    // ------------------------------
 const html = `
<html>
<head>
  <style>
  body {
    background: #f5f6f8;
    margin: 0;
    padding: 32px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #333;
    font-size: 17px;
  }

  .sheet {
    background: #fff;
    width: 210mm;
    min-height: 297mm;
    margin: auto;
    padding: 30mm;
    border-radius: 12px;
    box-shadow: 0 4px 25px rgba(0,0,0,0.1);
    font-size: 18px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 3px solid #e7e7e7;
  }

  .header h1 {
    margin: 0;
    font-size: 34px;
    font-weight: 800;
    color: #111;
    letter-spacing: -0.5px;
  }

  .meta {
    font-size: 18px;
    color: #666;
    margin-top: 6px;
  }

  .type-box .type {
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    display: inline-block;
  }

.type.in {
  background: #d1f7d8 !important;
  color: #0f6a1d !important;
}

.type.out {
  background: #f8d7da !important;
  color: #a00012 !important;
}




  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 22px;
    margin-bottom: 32px;
  }

  .card {
    background: #fafafa;
    border-radius: 10px;
    padding: 18px 20px;
    border: 2px solid #e1e1e1;
  }

  .card h3 {
    margin-top: 0;
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin-bottom: 12px;
  }

  .card p {
    margin: 4px 0;
    font-size: 17px;
    color: #444;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    font-size: 18px;
  }

  th {
    text-align: left;
    background: #f1f1f1;
    padding: 12px;
    font-weight: 700;
    border-bottom: 3px solid #ddd;
    font-size: 19px;
  }

  td {
    padding: 12px;
    border-bottom: 2px solid #eee;
    font-size: 18px;
  }

  .qty {
    text-align: center;
    font-weight: 700;
    font-size: 19px;
  }

  .footer {
    text-align: center;
    margin-top: 50px;
    font-size: 16px;
    color: #888;
  }
</style>

</head>

<body>
  <div class="sheet">

    <div class="header">
      <div>
        <h1>Invoice ${toShortId(invoice._id)}</h1>
        <div class="meta">${new Date(invoice.createdAt).toLocaleString()}</div>
        <div class="meta">Created by ${invoice.createdByUsername || "Unknown"}</div>
      </div>
     <div class="type-box">
  <span class="type ${typeClass}">${invoice.type.toUpperCase()}</span>
</div>

    </div>

    <div class="grid">
      <div class="card">
        <h3>Origin</h3>
        <p><strong>Mode:</strong> ${invoice.originMode}</p>
        <p><strong>Location:</strong> ${
          invoice.originMode === "warehouse"
            ? invoice.originWarehouse?.name
            : invoice.originClient
        }</p>
      </div>

      <div class="card">
        <h3>Destination</h3>
        <p><strong>Mode:</strong> ${invoice.destinationMode}</p>
        <p><strong>Location:</strong> ${
          invoice.destinationMode === "warehouse"
            ? invoice.destinationWarehouse?.name
            : invoice.destinationClient
        }</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Responsible</h3>
        <p>${invoice.person || "-"}</p>
      </div>

      <div class="card">
        <h3>Message</h3>
        <p>${invoice.message || "-"}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Brand</th>
          <th>Code</th>
          <th style="text-align:center;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.products
          .map(
            (p) => `
            <tr>
              <td>${p.productId?.product_name || p.name}</td>
              <td>${p.productId?.brand_name || "-"}</td>
              <td>${p.productId?.code || "-"}</td>
              <td class="qty">${p.qty}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>

    <div class="footer">
      Generated by Inventory System
    </div>

  </div>
</body>
</html>
`;


    // ------------------------------
    //          PDF creation
    // ------------------------------
const browser = await puppeteer.launch({
    headless: "new",
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  // ------------------------------
  // Correct Headers (ONLY ONCE)
  // ------------------------------
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice-${id}.pdf`
  );
    return res.end(pdf);

  } catch (err) {
    console.error("PDF error:", err);
    return res.status(500).json({ error: err.message });
  }
}
