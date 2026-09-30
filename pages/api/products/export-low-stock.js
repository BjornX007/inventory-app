import dbConnect from "../../../lib/mongoose";
import StockLevel from "../../../models/StockLevel";
import ExcelJS from "exceljs";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { warehouseId } = req.query;

    if (!warehouseId) {
      return res.status(400).json({ error: "Missing warehouseId" });
    }

    // Fetch stock levels
    const stockLevels = await StockLevel.find({ warehouse: warehouseId })
      .populate("product")
      .populate("warehouse");

    const lowStock = stockLevels.filter(
      (item) => item.qty <= (item.product?.lowStock ?? 10)
    );

    // 👉 Get warehouse name
    const warehouseName = stockLevels[0]?.warehouse?.name || "warehouse";
    const date = new Date().toISOString().slice(0, 10);

    // 👉 Dynamic filename
    const fileName = `low_stock_${warehouseName}_${date}.xlsx`;

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Low Stock");

    worksheet.addRow(["Name", "Spec", "Brand", "Code", "Qty"]);

    lowStock.forEach((item) => {
      worksheet.addRow([
        item.product?.product_name || "",
        item.product?.specification || "",
        item.product?.brand_name || "",
        item.product?.code || "",
        item.qty,
      ]);
    });

    // Column widths
    worksheet.columns = [
      { width: 90 },
      { width: 20 },
      { width: 15 },
      { width: 25 },
      { width: 10 },
    ];

    // Set download headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
