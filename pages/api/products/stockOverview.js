import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product";
import Warehouse from "../../../models/Warehouse";
import StockLevel from "../../../models/StockLevel";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const warehouses = await Warehouse.find().lean();
    const products = await Product.find().lean();
    const stockLevels = await StockLevel.find().lean();

    const stockMap = {};

  stockLevels.forEach((sl) => {
  if (!stockMap[sl.product]) stockMap[sl.product] = {};
  stockMap[sl.product][sl.warehouse] = sl.qty; // ← FIXED
});


    const productsWithStock = products.map((p) => ({
      ...p,
      _id: String(p._id),
      warehouseStock: stockMap[String(p._id)] || {},
    }));

    return res.status(200).json({
      warehouses: warehouses.map((w) => ({ ...w, _id: String(w._id) })), // important
      products: productsWithStock,
    });
  } catch (err) {
    console.error("Stock overview error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
