import dbConnect from "../../../lib/mongoose";
import StockLevel from "../../../models/StockLevel";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { warehouseId } = req.query;

    if (!warehouseId) {
      return res.status(400).json({ error: "Missing warehouseId" });
    }

    const stockLevels = await StockLevel.find({ warehouse: warehouseId })
      .populate("product");

    const lowStock = stockLevels.filter(
      (item) => item.qty <= (item.product?.lowStock ?? 10)
    );

    return res.status(200).json(lowStock);

  } catch (error) {
    console.error("Low stock API error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
