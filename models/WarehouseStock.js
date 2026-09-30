import mongoose from "mongoose";

const WarehouseStockSchema = new mongoose.Schema(
  {
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.WarehouseStock ||
  mongoose.model("WarehouseStock", WarehouseStockSchema);
