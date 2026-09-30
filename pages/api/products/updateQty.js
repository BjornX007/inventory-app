// pages/api/products/updateQty.js
import dbConnect from "../../../lib/mongodb";
import StockLevel from "../../../models/StockLevel";
import StockLog from "../../../models/StockLog";
import Warehouse from "../../../models/Warehouse";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { productId, warehouse, qtyChange, newQty, note } = req.body;

    if (!productId || !warehouse) {
      return res.status(400).json({ message: "Missing product or warehouse" });
    }

    // -------------------------------------------------------
    // Get warehouse name for the log
    // -------------------------------------------------------
    const wh = await Warehouse.findById(warehouse);
    if (!wh) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    // -------------------------------------------------------
    // Determine the update action
    // -------------------------------------------------------
    let update;

    if (newQty !== undefined && newQty !== null) {
      update = { qty: newQty };
    } else if (qtyChange !== undefined && qtyChange !== null) {
      update = { $inc: { qty: qtyChange } };
    } else {
      return res.status(400).json({ message: "No update value provided" });
    }

    // -------------------------------------------------------
    // Get previous qty BEFORE update
    // -------------------------------------------------------
    const existing = await StockLevel.findOne({ product: productId, warehouse });
    const previousQty = existing ? existing.qty : 0;

    // -------------------------------------------------------
    // Update or create stock level
    // -------------------------------------------------------
    const stock = await StockLevel.findOneAndUpdate(
      { product: productId, warehouse },
      update,
      { new: true, upsert: true }
    );

    // -------------------------------------------------------
    // Determine action for log
    // -------------------------------------------------------
    let action = "INCREASE";
    if (newQty !== undefined) {
      action = newQty > previousQty ? "INCREASE" : "DECREASE";
    } else if (qtyChange < 0) {
      action = "DECREASE";
    }

    // -------------------------------------------------------
    // Create stock log entry
    // -------------------------------------------------------
    await StockLog.create({
      product: productId,
      warehouse,
      warehouseName: wh.name,  // <-- required + now included
      action,
      qty: qtyChange ?? newQty,
      previousQty,
      newQty: stock.qty,
      note: note || "Manual stock adjustment",
      source: "MANUAL",
      user: req.body.user || null,
    });

    return res.status(200).json({
      message: "Quantity updated",
      qty: stock.qty,
    });

  } catch (error) {
    console.error("Update qty error:", error);
    return res.status(500).json({ message: "Failed to update qty", error: error.message });
  }
}
