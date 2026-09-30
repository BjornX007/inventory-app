// pages/api/products/by-warehouse.js
import dbConnect from "../../../lib/mongodb";
import StockLevel from "../../../models/StockLevel";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  try {
    await dbConnect(); // ✅ FIXED

    const { warehouse } = req.query;

    if (!warehouse) {
      return res.status(400).json({ message: "Warehouse ID required" });
    }

    const stock = await StockLevel.find({ warehouse })
      .populate("product")
      .lean();

    const products = stock.map((s) => ({
      _id: s.product?._id,
      product_name: s.product?.product_name || "",
      specification: s.product?.specification || "",
      brand_name: s.product?.brand_name || "",
      code: s.product?.code || "",
      qty: s.qty ?? 0,
    }));

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Warehouse fetch error:", error);
    return res.status(500).json({ message: "Failed to load warehouse products" });
  }
}
