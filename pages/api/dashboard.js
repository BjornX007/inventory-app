import dbConnect from "../../lib/mongoose";
import Product from "../../models/Product";
import Warehouse from "../../models/Warehouse";
import StockLevel from "../../models/StockLevel";
import StockLog from "../../models/StockLog";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const totalProducts = await Product.countDocuments();
    const totalWarehouses = await Warehouse.countDocuments();

    // 1. Aggregate total stock per product from stockLevel collection
    const stockAgg = await StockLevel.aggregate([
      {
        $group: {
          _id: "$product",       // group by product ID
          totalQty: { $sum: "$qty" },
        },
      },
      {
        $match: {
          totalQty: { $lt: 7 }, // LOW STOCK THRESHOLD
        },
      },
    ]);

    // 2. Populate product details for each low-stock product
    const lowStock = await Promise.all(
      stockAgg.map(async (item) => {
        const product = await Product.findById(item._id).lean();
        return {
          _id: product._id,
          product_name: product.product_name,
          code: product.code,
          qty: item.totalQty,
        };
      })
    );

    // 3. Total stock across all warehouses
    const totalStockAgg = await StockLevel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$qty" },
        },
      },
    ]);

    const totalStock = totalStockAgg[0]?.total || 0;

    const recentLogs = await StockLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      stats: {
        totalProducts,
        totalWarehouses,
        lowStockCount: lowStock.length,
        totalStock,
      },
      lowStock,
      recentLogs,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
}
