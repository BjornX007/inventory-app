import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product";
import StockLevel from "../../../models/StockLevel";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { products, warehouseId } = req.body;

    if (!warehouseId || !Array.isArray(products)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const codes = products.map((p) => p.code);

    const existingStock = await StockLevel.find({
      warehouse: warehouseId
    })
      .populate("product", "code")
      .lean();

    const existingCodes = new Set(
      existingStock
        .filter((s) => codes.includes(s.product.code))
        .map((s) => s.product.code)
    );

    return res.status(200).json({
      existing: [...existingCodes]
    });
  } catch (error) {
    return res.status(500).json({ message: "Check failed" });
  }
}
