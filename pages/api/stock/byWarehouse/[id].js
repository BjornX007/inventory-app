import { connectDB } from "../../../../lib/mongodb";
import StockLevel from "../../../../models/StockLevel";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query; // warehouseId

  try {
    const stock = await StockLevel.find({ warehouse: id })
      .populate("product", "product_name brand_name specification code") // <-- return names!
      .populate("warehouse", "name");

    return res.status(200).json(stock);
  } catch (err) {
    console.error("Fetch stock error:", err);
    return res.status(500).json({ message: "Failed to load products" });
  }
}
