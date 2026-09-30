import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product";
import StockLevel from "../../../models/StockLevel";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { q = "", warehouse, qrToken } = req.query;

    //
    // 📌 1️⃣ QR CODE SCAN — HIGH PRIORITY
    //
    if (qrToken) {
      const product = await Product.findOne({ qrToken }).lean();

      if (!product) {
        return res.status(404).json({ message: "QR Token not registered" });
      }

      if (warehouse) {
        const stock = await StockLevel.findOne({
          product: product._id,
          warehouse,
        }).lean();

        return res.status(200).json({
          product: {
            ...product,
            qty: stock?.qty ?? 0,
          },
        });
      }

      return res.status(200).json({
        product: {
          ...product,
          qty: null,
        },
      });
    }

    //
    // 📌 2️⃣ NORMAL KEYBOARD SEARCH (fallback)
    //
    const query = q.trim();

    if (!query) {
      return res.status(200).json({ products: [] });
    }

    const products = await Product.find({
      $or: [
        { code: { $regex: `^${query}`, $options: "i" } },
        { product_name: { $regex: query, $options: "i" } },
        { brand_name: { $regex: query, $options: "i" } },
      ],
    })
      .limit(10)
      .lean();

    if (!products.length) {
      return res.status(200).json({ products: [] });
    }

    if (!warehouse) {
      return res.status(200).json({
        products: products.map(p => ({
          _id: p._id,
          product_name: p.product_name,
          brand_name: p.brand_name,
          specification: p.specification,
          code: p.code,
          qrToken: p.qrToken ?? null,
          qrImage: p.qrImage ?? null,
          qty: null,
        })),
      });
    }

    const stock = await StockLevel.find({
      warehouse,
      product: { $in: products.map(p => p._id) },
    }).lean();

    const qtyMap = Object.fromEntries(
      stock.map(s => [s.product.toString(), s.qty])
    );

    return res.status(200).json({
      products: products.map(p => ({
        _id: p._id,
        product_name: p.product_name,
        brand_name: p.brand_name,
        specification: p.specification,
        code: p.code,
        qrToken: p.qrToken ?? null,
        qrImage: p.qrImage ?? null,
        qty: qtyMap[p._id.toString()] ?? 0,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
}
