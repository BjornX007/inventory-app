import dbConnect from "../../../lib/mongoose";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  const products = await Product.find(
    { qrToken: { $exists: true } },
    { product_name: 1, code: 1, qrToken: 1 }
  );

  res.status(200).json(products);
}
