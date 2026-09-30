import dbConnect from "../../../lib/mongoose";
import Invoice from "../../../models/Invoice";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing invoice ID" });

    const invoice = await Invoice.findById(id)
      .populate("products.productId", "product_name brand_name code")
      .populate("originWarehouse", "name")
      .populate("destinationWarehouse", "name");

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    return res.status(200).json({ invoice });
  } catch (err) {
    console.error("GET invoice error:", err);
    res.status(500).json({ error: err.message });
  }
}
