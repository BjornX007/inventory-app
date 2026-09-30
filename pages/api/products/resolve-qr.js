import dbConnect from "../../../lib/mongoose";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    await dbConnect();

    const { token } = req.body;

    if (!token)
      return res.status(400).json({ message: "Missing token" });

    const product = await Product.findOne({ qrToken: token }).lean();

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    return res.status(200).json({
      product: {
        _id: product._id,
        product_name: product.product_name,
        brand_name: product.brand_name,
        specification: product.specification,
        code: product.code,
      },
    });
  } catch (err) {
    console.error("resolve-qr error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
