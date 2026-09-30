// ✅ Mongoose version for /pages/api/products.js

import dbConnect from "../../lib/mongoose";
import Product from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const products = await Product.find().sort({ _id: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    console.error("❌ Error loading DB products:", error);
    return res.status(500).json({ message: "Database fetch failed" });
  }
}
