import dbConnect from "../../../lib/mongoose";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  const { warehouse } = req.query;

  let products = [];

  if (!warehouse || warehouse === "main") {
    products = await Product.find().select("product_name brand_name specification code qty");
  } else {
    const found = await Product.find({
      "warehouses.warehouse": warehouse
    }).select("product_name brand_name specification code warehouses");

    products = found.map(p => {
      const entry = p.warehouses.find(w => w.warehouse.toString() === warehouse);
      return {
        _id: p._id,
        product_name: p.product_name,
        brand_name: p.brand_name,
        specification: p.specification,
        code: p.code,
        qty: entry ? entry.qty : 0
      };
    });
  }

  res.status(200).json({ products });
}
