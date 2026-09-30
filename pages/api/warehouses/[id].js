// pages/api/warehouses/[id].js
import dbConnect from "../../../lib/mongoose";
import Warehouse from "../../../models/Warehouse";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const warehouse = await Warehouse.findById(id);
      if (!warehouse) {
        return res.status(404).json({ error: "Warehouse not found" });
      }
      return res.status(200).json(warehouse);
    } catch {
      return res.status(400).json({ error: "Invalid ID" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, isMain } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // Only one main warehouse allowed
      if (isMain === true) {
        await Warehouse.updateMany({}, { isMain: false });
      }

      const updated = await Warehouse.findByIdAndUpdate(
        id,
        { name, isMain },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: "Warehouse not found" });
      }

      return res.status(200).json(updated);
    } catch {
      return res.status(400).json({ error: "Invalid ID" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await Warehouse.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Warehouse not found" });
      }

      return res.status(200).json({ success: true });
    } catch {
      return res.status(400).json({ error: "Invalid ID" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
