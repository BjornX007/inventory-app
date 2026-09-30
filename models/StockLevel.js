import mongoose from "mongoose";
const { Schema } = mongoose;

const StockLevelSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    qty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StockLevelSchema.index({ product: 1, warehouse: 1 }, { unique: true });

export default mongoose.models.StockLevel ||
  mongoose.model("StockLevel", StockLevelSchema);
