import dbConnect from "../../../lib/mongoose";
import Product from "../../../models/Product";
import QRCode from "qrcode";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID missing" });
    }

    //// Generate persistent secure token
const qrToken = crypto.randomUUID();

// QR contains ONLY token
const qrPayload = qrToken;

// Generate QR
const qrImage = await QRCode.toDataURL(qrPayload, {
  margin: 1,
  width: 300,
});

// Save to product
await Product.updateOne(
  { _id: productId },
  {
    $set: {
      qrToken,
      qrImage
    }
  }
);


    return res.status(200).json({
      ok: true,
      qrToken,
      qrImage,
    });
  } catch (err) {
    console.error("assign-qr error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
