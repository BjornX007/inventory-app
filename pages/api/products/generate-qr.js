// /pages/api/products/generate-qr.js
import { dbConnect } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import QRCode from "qrcode";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  await dbConnect();

  const { search } = req.body;

  const product = await Product.findOne({
    $or: [{ code: search }, { product_name: search }],
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // only create token if not already created
  if (!product.qrToken) {
    product.qrToken = "PRD-" + crypto.randomBytes(6).toString("hex");
  }

  // build QR value (scanner will use this)
  const qrValue = JSON.stringify({
    id: product._id,
    token: product.qrToken,
  });

  // create QR image
  const qrImage = await QRCode.toDataURL(qrValue);

  product.qrImage = qrImage;
  await product.save();

  return res.status(200).json({
    message: "QR generated & saved",
    product,
  });
}
