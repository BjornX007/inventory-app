import dbConnect from "../../../lib/mongodb";
import Invoice from "../../../models/Invoice";
import StockLevel from "../../../models/StockLevel";
import StockLog from "../../../models/StockLog";
import Warehouse from "../../../models/Warehouse";
import User from "../../../models/User";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    /* ---------------- AUTH ---------------- */
    const cookie = req.headers.cookie || "";
    const userId = cookie
      .split("; ")
      .find(c => c.startsWith("userId="))
      ?.split("=")[1];

    let userObjectId = null;
    let username = "system";

    if (userId && mongoose.isValidObjectId(userId)) {
      userObjectId = userId;
      const user = await User.findById(userId).select("username");
      if (user) username = user.username;
    }

    /* ---------------- BODY ---------------- */
    const {
      type,
      originMode,
      destinationMode,
      originWarehouse,
      destinationWarehouse,
      originClient,
      destinationClient,
      person,
      message,
      products,
    } = req.body;

    if (!type || !products || !products.length) {
      return res.status(400).json({ error: "Missing invoice data" });
    }

    /* ---------------- RESOLVE WAREHOUSE NAMES ---------------- */
    const originWh = originWarehouse
      ? await Warehouse.findById(originWarehouse).select("name")
      : null;

    const destWh = destinationWarehouse
      ? await Warehouse.findById(destinationWarehouse).select("name")
      : null;

    /* ---------------- BUILD SEARCH TEXT ---------------- */
    const searchText = [
      person,
      message,
      originClient,
      destinationClient,
      originWh?.name,
      destWh?.name,
      username,
      ...products.map(p => p.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    /* ---------------- CREATE INVOICE ---------------- */
    const invoice = await Invoice.create({
      type,
      originMode,
      destinationMode,
      originWarehouse: originMode === "warehouse" ? originWarehouse : null,
      destinationWarehouse:
        destinationMode === "warehouse" ? destinationWarehouse : null,
      originClient: originClient || "",
      destinationClient: destinationClient || "",
      person: person || "",
      message: message || "",
      products,
      createdByUserId: userObjectId,
      createdByUsername: username,
      searchText,
    });

    const invoiceNr = invoice.shortId;

    /* ---------------- STOCK OPS ---------------- */
    const applyStock = async (warehouseId, productId, qty, inc) => {
      const existing = await StockLevel.findOne({ warehouse: warehouseId, product: productId });
      const previousQty = existing?.qty || 0;
      const newQty = inc ? previousQty + qty : previousQty - qty;

      const updated = await StockLevel.findOneAndUpdate(
        { warehouse: warehouseId, product: productId },
        { qty: newQty },
        { upsert: true, new: true }
      );

      await StockLog.create({
        product: productId,
        warehouse: warehouseId,
        warehouseName: (await Warehouse.findById(warehouseId))?.name,
        qty,
        previousQty,
        newQty: updated.qty,
        action: inc ? "INCREASE" : "DECREASE",
        source: "INVOICE",
        invoiceNr,
        userId: userObjectId,
        user: username,
      });
    };

    await Promise.all(
      products.flatMap(item => {
        const qty = Number(item.qty);
        const ops = [];
        if (originMode === "warehouse") {
          ops.push(applyStock(originWarehouse, item.productId, qty, false));
        }
        if (destinationMode === "warehouse") {
          ops.push(applyStock(destinationWarehouse, item.productId, qty, true));
        }
        return ops;
      })
    );

    return res.status(200).json({
      message: "Invoice created",
      invoiceId: invoice._id,
      invoiceNr,
    });
  } catch (err) {
    console.error("Invoice create error:", err);
    return res.status(500).json({ error: err.message });
  }
}
