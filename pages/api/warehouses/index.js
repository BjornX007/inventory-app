// pages/api/warehouses/index.js
import dbConnect from "../../../lib/mongoose";
import Warehouse from "../../../models/Warehouse";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const warehouses = await Warehouse.find().sort({ isMain: -1 });
      return res.status(200).json(warehouses);
    } catch (e) {
      return res.status(500).json({ error: "Failed to load warehouses" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, isMain } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // If creating a main warehouse, unset all others
      if (isMain === true) {
        await Warehouse.updateMany({}, { isMain: false });
      }

      const newWarehouse = await Warehouse.create({
        name,
        isMain: isMain || false,
      });

      return res.status(201).json(newWarehouse);
    } catch (e) {
      return res.status(500).json({ error: "Failed to create warehouse" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
