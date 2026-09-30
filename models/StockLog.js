import mongoose, { Schema } from "mongoose";

const StockLogSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    warehouseName: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      enum: ["INCREASE", "DECREASE"],
      required: true,
    },

    qty: { type: Number, required: true },

    previousQty: { type: Number, required: true },
    newQty: { type: Number, required: true },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    source: {
      type: String,
      enum: ["MANUAL", "INVOICE"],
      required: true,
      default: "MANUAL",
    },

    // 🔐 REQUIRED FOR ACCESS CONTROL
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🧾 Display only
    user: {
      type: String,
      default: null,
    },

  
    invoiceNr: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.StockLog ||
  mongoose.model("StockLog", StockLogSchema);
