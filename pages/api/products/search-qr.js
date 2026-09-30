import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product";
import Warehouse from "../../../models/Warehouse";
import StockLevel from "../../../models/StockLevel";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await dbConnect();

  const { qrToken } = req.body;
console.log("QR Miner received token:", `"${qrToken}"`);

  if (!qrToken)
    return res.status(400).json({ error: "Missing qrToken" });

  try {
    // 🔹 Find product by QR token field
    const product = await Product.findOne({ qrToken }).lean();

    if (!product)
      return res.status(404).json({ error: "Product not found" });

    const warehouses = await Warehouse.find().lean();

    // 🔹 Get stock only for this product
    const stockLevels = await StockLevel
      .find({ product: product._id })
      .lean();

    const stockMap = {};

    stockLevels.forEach(sl => {
      if (!stockMap[sl.product]) stockMap[sl.product] = {};
      stockMap[sl.product][sl.warehouse] = sl.qty;
    });

    const productWithStock = {
      ...product,
      _id: String(product._id),
      warehouseStock: stockMap[String(product._id)] || {},
    };

    return res.status(200).json({
      warehouses: warehouses.map(w => ({
        ...w,
        _id: String(w._id)
      })),
      products: [productWithStock]   // 🔹 single-item array = same UI shape
    });

  } catch (err) {
    console.error("QR Miner API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
