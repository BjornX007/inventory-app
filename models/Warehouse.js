import mongoose from "mongoose";
const { Schema } = mongoose;

const WarehouseSchema = new Schema(
  {
    name: { type: String, required: true },
    isMain: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Warehouse ||
  mongoose.model("Warehouse", WarehouseSchema);
